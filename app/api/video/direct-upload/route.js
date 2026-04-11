import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { videoProvider } from "@/lib/videoProvider";
import { createSupabaseAdminClient, adminApiErrorMessage } from "@/lib/supabaseAdmin";
import { validateVideoMetaJson } from "@/lib/videoUploadValidation";

export const runtime = "nodejs";
export const maxDuration = 60;

const TAG = "video-direct-upload";

const ALLOWED = new Set([
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/msvideo",
  "video/avi",
]);

function err(status, message) {
  return NextResponse.json({ error: message }, { status });
}

function logEnvSnapshot() {
  console.log(`[${TAG}] env snapshot`, {
    cloudflareAccountSet: Boolean((process.env.CLOUDFLARE_ACCOUNT_ID || "").trim()),
    cloudflareTokenSet: Boolean((process.env.CLOUDFLARE_STREAM_API_TOKEN || "").trim()),
    cloudflareCustomerSet: Boolean(
      (process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE || process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE || "").trim(),
    ),
    supabaseUrlSet: Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim()),
    serviceRoleSet: Boolean(
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "").trim(),
    ),
  });
}

function logErr(e) {
  return { message: e?.message, stack: e?.stack, name: e?.name };
}

/**
 * JSON body only: Cloudflare Stream direct creator upload URL; client POSTs multipart file to uploadUrl.
 */
export async function POST(request) {
  try {
    console.log(`[${TAG}] POST begin`);
    logEnvSnapshot();

    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      console.warn(`[${TAG}] auth failed`, authErr?.message || "no user");
      return err(401, "Sign in required");
    }
    console.log(`[${TAG}] authenticated user`, user.id);

    const rl = await checkRateLimit(`video-upload:${user.id}`, 60 * 60 * 1000, 10);
    if (!rl.ok) {
      console.warn(`[${TAG}] rate limited`, user.id);
      return err(429, "Too many uploads. Try again later.");
    }

    let admin;
    try {
      console.log(`[${TAG}] creating Supabase admin client`);
      admin = createSupabaseAdminClient();
    } catch (e) {
      console.error(`[${TAG}] Supabase admin client failed`, e?.message, e?.stack);
      return err(500, adminApiErrorMessage(e));
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      console.warn(`[${TAG}] invalid JSON`, e?.message);
      return err(400, "Invalid JSON");
    }

    const kind = String(body?.kind || "listing").toLowerCase();
    const listingId = body?.listingId ? String(body.listingId).trim() : null;
    const contentType = String(body?.contentType || "").toLowerCase();

    console.log(`[${TAG}] request body`, { kind, listingId, contentType });

    if (kind !== "listing" && kind !== "intro") return err(400, "Invalid kind");
    if (kind === "listing" && !listingId) {
      return err(400, "listingId is required for property videos.");
    }
    if (!ALLOWED.has(contentType)) {
      return err(400, "Please upload mp4, mov or webm");
    }

    const meta = validateVideoMetaJson(body, { kind });
    if (!meta.ok) {
      console.warn(`[${TAG}] meta validation failed`, meta.error);
      return err(400, meta.error);
    }

    const corsOrigin = request.headers.get("origin") || "*";
    console.log(`[${TAG}] browser origin (logged for CORS debugging)`, corsOrigin);

    const maxDurationSeconds = kind === "intro" ? 60 : 300;

    if (kind === "listing") {
      console.log(`[${TAG}] loading listing`, listingId);
      const { data: row, error: le } = await admin
        .from("listings")
        .select("id, agent_id, photos, video_id, details")
        .eq("id", listingId)
        .single();
      if (le || !row) {
        console.warn(`[${TAG}] listing not found`, listingId, le?.message);
        return err(404, "Listing not found");
      }
      if (row.agent_id !== user.id) {
        console.warn(`[${TAG}] forbidden listing`, listingId, user.id);
        return err(403, "Not allowed");
      }

      if (row.video_id) {
        try {
          console.log(`[${TAG}] deleting previous Stream video`, row.video_id);
          await videoProvider.delete(row.video_id);
        } catch (e) {
          console.warn(`[${TAG}] delete previous video (ignored)`, logErr(e));
        }
      }

      const photos = Array.isArray(row.photos) ? row.photos : [];
      const passthrough = JSON.stringify({
        lid: listingId,
        k: "l",
        pe: photos.length === 0 ? 1 : 0,
        uid: user.id,
      });

      let muxUploadId;
      let uploadUrl;
      let videoId;
      try {
        console.log(`[${TAG}] Cloudflare createDirectUpload (listing)`, { maxDurationSeconds });
        const up = await videoProvider.createDirectUpload({
          passthrough,
          corsOrigin,
          maxDurationSeconds,
        });
        muxUploadId = up.muxUploadId;
        videoId = up.videoId;
        uploadUrl = up.uploadUrl;
        console.log(`[${TAG}] direct upload URL created`, { videoId });
      } catch (e) {
        console.error(`[${TAG}] createDirectUpload failed (listing)`, logErr(e));
        return err(502, String(e?.message || "Could not start video upload."));
      }

      const nextDetails = { ...(row.details && typeof row.details === "object" ? row.details : {}) };
      delete nextDetails.muxPendingUploadId;
      nextDetails.muxPendingUploadId = muxUploadId;

      console.log(`[${TAG}] updating listing row`, listingId);
      const { error: upErr } = await admin
        .from("listings")
        .update({
          video_id: null,
          video_playback_id: null,
          video_provider: "cloudflare",
          video_status: "processing",
          details: nextDetails,
        })
        .eq("id", listingId);
      if (upErr) {
        console.error(`[${TAG}] listing update failed`, upErr.message, upErr);
        return err(500, upErr.message);
      }

      return NextResponse.json({
        uploadUrl,
        muxUploadId,
        videoId,
        status: "processing",
        message: "POST multipart form with field `file` to uploadUrl, then wait for processing.",
      });
    }

    /* intro */
    console.log(`[${TAG}] intro flow for user`, user.id);
    const { data: prof, error: pe } = await admin.from("profiles").select("id, intro_video_id").eq("id", user.id).single();
    if (pe || !prof) {
      console.warn(`[${TAG}] profile not found`, pe?.message);
      return err(404, "Profile not found");
    }

    if (prof.intro_video_id) {
      try {
        console.log(`[${TAG}] deleting previous intro video`, prof.intro_video_id);
        await videoProvider.delete(prof.intro_video_id);
      } catch (e) {
        console.warn(`[${TAG}] delete intro video (ignored)`, logErr(e));
      }
    }

    const passthrough = JSON.stringify({ k: "i", uid: user.id });

    let muxUploadId;
    let uploadUrl;
    let videoId;
    try {
      console.log(`[${TAG}] Cloudflare createDirectUpload (intro)`, { maxDurationSeconds });
      const up = await videoProvider.createDirectUpload({
        passthrough,
        corsOrigin,
        maxDurationSeconds,
      });
      muxUploadId = up.muxUploadId;
      videoId = up.videoId;
      uploadUrl = up.uploadUrl;
      console.log(`[${TAG}] direct upload URL created (intro)`, { videoId });
    } catch (e) {
      console.error(`[${TAG}] createDirectUpload failed (intro)`, logErr(e));
      return err(502, String(e?.message || "Could not start video upload."));
    }

    const { error: pErr } = await admin
      .from("profiles")
      .update({
        intro_video_id: null,
        intro_video_playback_id: null,
        intro_video_provider: "cloudflare",
        intro_video_status: "processing",
      })
      .eq("id", user.id);
    if (pErr) {
      console.error(`[${TAG}] profile update failed`, pErr.message, pErr);
      return err(500, pErr.message);
    }

    return NextResponse.json({
      uploadUrl,
      muxUploadId,
      videoId,
      status: "processing",
      message: "POST multipart form with field `file` to uploadUrl.",
    });
  } catch (e) {
    console.error(`[${TAG}] unhandled error`, logErr(e));
    const msg = String(e?.message || "");
    if (/Missing NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_KEY/i.test(msg)) {
      return err(500, adminApiErrorMessage(e));
    }
    if (/Missing CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_STREAM_API_TOKEN/i.test(msg)) {
      return err(500, msg);
    }
    if (/network|fetch|ECONNRESET/i.test(msg)) {
      return err(503, "Connection error. Please check your internet and try again.");
    }
    return err(500, msg || "Upload setup failed. Try again.");
  }
}
