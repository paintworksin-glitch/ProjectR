import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { videoProvider } from "@/lib/videoProvider";
import { createSupabaseAdminClient, adminApiErrorMessage } from "@/lib/supabaseAdmin";
import { bufferLooksLikeSupportedVideo, parseAndValidateClientVideoMeta } from "@/lib/videoUploadValidation";
import { MAX_VIDEO_UPLOAD_BYTES } from "@/lib/videoUploadLimits.js";

export const runtime = "nodejs";
export const maxDuration = 300;

const TAG = "video-upload";
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
    supabaseUrlSet: Boolean((process.env.NEXT_PUBLIC_SUPABASE_URL || "").trim()),
    serviceRoleSet: Boolean(
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_KEY || "").trim(),
    ),
  });
}

function logErr(e) {
  return { message: e?.message, stack: e?.stack, name: e?.name };
}

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

    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "listing");
    const listingId = form.get("listingId") ? String(form.get("listingId")).trim() : null;

    console.log(`[${TAG}] form`, { kind, listingId, fileIsBlob: file instanceof Blob });

    if (!(file instanceof Blob)) return err(400, "Missing file");
    if (kind !== "listing" && kind !== "intro") return err(400, "Invalid kind");

    if (kind === "listing" && !listingId) {
      return err(400, "listingId is required for property videos. Save the listing once, then add a video tour from Edit.");
    }

    const meta = parseAndValidateClientVideoMeta(form, { kind });
    if (!meta.ok) {
      console.warn(`[${TAG}] meta validation failed`, meta.error);
      return err(400, meta.error);
    }

    const mime = (file.type || "").toLowerCase();
    if (!ALLOWED.has(mime)) {
      return err(400, "Please upload mp4, mov or webm");
    }

    const buf = Buffer.from(await file.arrayBuffer());
    console.log(`[${TAG}] buffer`, { bytes: buf.length, mime });

    if (buf.length > MAX_VIDEO_UPLOAD_BYTES) return err(400, "Video must be under 500MB");
    if (buf.length < 1024) return err(400, "Upload failed. Please try again.");

    if (!bufferLooksLikeSupportedVideo(buf)) {
      console.warn(`[${TAG}] buffer magic bytes failed validation`);
      return err(400, "File does not look like a supported video. Please upload mp4, mov, webm or avi.");
    }

    const maxDurationSeconds = kind === "intro" ? 60 : 300;

    if (kind === "listing") {
      console.log(`[${TAG}] listing flow`, listingId);
      const { data: row, error: le } = await admin.from("listings").select("id, agent_id, photos, video_id, details").eq("id", listingId).single();
      if (le || !row) {
        console.warn(`[${TAG}] listing not found`, listingId, le?.message);
        return err(404, "Listing not found");
      }
      if (row.agent_id !== user.id) {
        console.warn(`[${TAG}] forbidden`, listingId);
        return err(403, "Not allowed");
      }

      if (row.video_id) {
        try {
          console.log(`[${TAG}] deleting previous asset`, row.video_id);
          await videoProvider.delete(row.video_id);
        } catch (e) {
          console.warn(`[${TAG}] delete previous (ignored)`, logErr(e));
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
      try {
        console.log(`[${TAG}] Stream upload (listing) starting`, { maxDurationSeconds });
        const up = await videoProvider.upload(buf, {
          passthrough,
          contentType: mime,
          maxDurationSeconds,
        });
        muxUploadId = up.muxUploadId;
        console.log(`[${TAG}] Stream upload (listing) done`, muxUploadId);
      } catch (e) {
        console.error(`[${TAG}] Stream upload failed (listing)`, logErr(e));
        return err(502, String(e?.message || "Video upload failed."));
      }

      const nextDetails = { ...(row.details && typeof row.details === "object" ? row.details : {}) };
      delete nextDetails.muxPendingUploadId;
      nextDetails.muxPendingUploadId = muxUploadId;

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
        console.error(`[${TAG}] listing update failed`, upErr);
        return err(500, upErr.message);
      }

      return NextResponse.json({
        muxUploadId,
        videoId: muxUploadId,
        status: "processing",
        message: "Processing video...",
      });
    }

    /* intro */
    console.log(`[${TAG}] intro flow`);
    const { data: prof, error: pe } = await admin.from("profiles").select("id, intro_video_id").eq("id", user.id).single();
    if (pe || !prof) {
      console.warn(`[${TAG}] profile not found`, pe?.message);
      return err(404, "Profile not found");
    }

    if (prof.intro_video_id) {
      try {
        console.log(`[${TAG}] deleting previous intro`, prof.intro_video_id);
        await videoProvider.delete(prof.intro_video_id);
      } catch (e) {
        console.warn(`[${TAG}] delete intro (ignored)`, logErr(e));
      }
    }

    const passthrough = JSON.stringify({ k: "i", uid: user.id });

    let muxUploadId;
    try {
      console.log(`[${TAG}] Stream upload (intro) starting`, { maxDurationSeconds });
      const up = await videoProvider.upload(buf, {
        passthrough,
        contentType: mime,
        maxDurationSeconds,
      });
      muxUploadId = up.muxUploadId;
      console.log(`[${TAG}] Stream upload (intro) done`, muxUploadId);
    } catch (e) {
      console.error(`[${TAG}] Stream upload failed (intro)`, logErr(e));
      return err(502, String(e?.message || "Video upload failed."));
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
      console.error(`[${TAG}] profile update failed`, pErr);
      return err(500, pErr.message);
    }

    return NextResponse.json({
      muxUploadId,
      videoId: muxUploadId,
      status: "processing",
      message: "Processing your video... usually 2-3 minutes",
    });
  } catch (e) {
    console.error(`[${TAG}] unhandled`, logErr(e));
    const msg = e?.message || "";
    if (/Missing NEXT_PUBLIC_SUPABASE_URL|SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_KEY/i.test(String(msg))) {
      return err(500, adminApiErrorMessage(e));
    }
    if (/Missing CLOUDFLARE_ACCOUNT_ID|CLOUDFLARE_STREAM_API_TOKEN/i.test(String(msg))) {
      return err(500, String(msg));
    }
    if (/network|fetch|ECONNRESET/i.test(String(msg))) {
      return err(503, "Connection error. Please check your internet and try again.");
    }
    return err(500, String(msg) || "Upload failed. Please try again.");
  }
}
