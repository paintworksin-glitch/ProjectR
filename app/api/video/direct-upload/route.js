import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { videoProvider } from "@/lib/videoProvider";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { validateVideoMetaJson } from "@/lib/videoUploadValidation";

export const runtime = "nodejs";
export const maxDuration = 60;

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

/**
 * Small JSON body only: creates Mux direct-upload URL so the browser PUTs the file (bypasses Vercel ~4.5MB limit).
 */
export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) return err(401, "Sign in required");

    const rl = await checkRateLimit(`video-upload:${user.id}`, 60 * 60 * 1000, 10);
    if (!rl.ok) return err(429, "Too many uploads. Try again later.");

    let body;
    try {
      body = await request.json();
    } catch {
      return err(400, "Invalid JSON");
    }

    const kind = String(body?.kind || "listing").toLowerCase();
    const listingId = body?.listingId ? String(body.listingId).trim() : null;
    const contentType = String(body?.contentType || "").toLowerCase();

    if (kind !== "listing" && kind !== "intro") return err(400, "Invalid kind");
    if (kind === "listing" && !listingId) {
      return err(400, "listingId is required for property videos.");
    }
    if (!ALLOWED.has(contentType)) {
      return err(400, "Please upload mp4, mov or webm");
    }

    const meta = validateVideoMetaJson(body, { kind });
    if (!meta.ok) return err(400, meta.error);

    const corsOrigin = request.headers.get("origin") || "*";
    const admin = createSupabaseAdminClient();

    if (kind === "listing") {
      const { data: row, error: le } = await admin.from("listings").select("id, agent_id, photos, video_id, details").eq("id", listingId).single();
      if (le || !row) return err(404, "Listing not found");
      if (row.agent_id !== user.id) return err(403, "Not allowed");

      if (row.video_id) {
        try {
          await videoProvider.delete(row.video_id);
        } catch {
          /* ignore */
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
      try {
        const up = await videoProvider.createDirectUpload({ passthrough, corsOrigin });
        muxUploadId = up.muxUploadId;
        uploadUrl = up.uploadUrl;
      } catch (e) {
        console.error("mux createDirectUpload listing", e);
        return err(502, "Could not start upload. Try again.");
      }

      const nextDetails = { ...(row.details && typeof row.details === "object" ? row.details : {}) };
      delete nextDetails.muxPendingUploadId;
      nextDetails.muxPendingUploadId = muxUploadId;

      const { error: upErr } = await admin
        .from("listings")
        .update({
          video_id: null,
          video_playback_id: null,
          video_provider: "mux",
          video_status: "processing",
          details: nextDetails,
        })
        .eq("id", listingId);
      if (upErr) return err(500, upErr.message);

      return NextResponse.json({
        uploadUrl,
        muxUploadId,
        status: "processing",
        message: "PUT your file to uploadUrl, then wait for processing.",
      });
    }

    /* intro */
    const { data: prof, error: pe } = await admin.from("profiles").select("id, intro_video_id").eq("id", user.id).single();
    if (pe || !prof) return err(404, "Profile not found");

    if (prof.intro_video_id) {
      try {
        await videoProvider.delete(prof.intro_video_id);
      } catch {
        /* ignore */
      }
    }

    const passthrough = JSON.stringify({ k: "i", uid: user.id });

    let muxUploadId;
    let uploadUrl;
    try {
      const up = await videoProvider.createDirectUpload({ passthrough, corsOrigin });
      muxUploadId = up.muxUploadId;
      uploadUrl = up.uploadUrl;
    } catch (e) {
      console.error("mux createDirectUpload intro", e);
      return err(502, "Could not start upload. Try again.");
    }

    const { error: pErr } = await admin
      .from("profiles")
      .update({
        intro_video_id: null,
        intro_video_playback_id: null,
        intro_video_provider: "mux",
        intro_video_status: "processing",
      })
      .eq("id", user.id);
    if (pErr) return err(500, pErr.message);

    return NextResponse.json({
      uploadUrl,
      muxUploadId,
      status: "processing",
      message: "PUT your file to uploadUrl.",
    });
  } catch (e) {
    console.error("video direct-upload route", e);
    return err(500, "Upload setup failed. Try again.");
  }
}
