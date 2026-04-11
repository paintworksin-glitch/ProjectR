import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { videoProvider } from "@/lib/videoProvider";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { bufferLooksLikeSupportedVideo, parseAndValidateClientVideoMeta } from "@/lib/videoUploadValidation";
import { getAgentMuxWatermarkImageUrl } from "@/lib/watermarkUrl.js";

export const runtime = "nodejs";
export const maxDuration = 300;

const MAX_BYTES = 500 * 1024 * 1024;
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

    const form = await request.formData();
    const file = form.get("file");
    const kind = String(form.get("kind") || "listing");
    const listingId = form.get("listingId") ? String(form.get("listingId")).trim() : null;

    if (!(file instanceof Blob)) return err(400, "Missing file");
    if (kind !== "listing" && kind !== "intro") return err(400, "Invalid kind");

    if (kind === "listing" && !listingId) {
      return err(400, "listingId is required for property videos. Save the listing once, then add a video tour from Edit.");
    }

    const meta = parseAndValidateClientVideoMeta(form, { kind });
    if (!meta.ok) return err(400, meta.error);

    const mime = (file.type || "").toLowerCase();
    if (!ALLOWED.has(mime)) {
      return err(400, "Please upload mp4, mov or webm");
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.length > MAX_BYTES) return err(400, "Video must be under 500MB");
    if (buf.length < 1024) return err(400, "Upload failed. Please try again.");

    if (!bufferLooksLikeSupportedVideo(buf)) {
      return err(400, "File does not look like a supported video. Please upload mp4, mov, webm or avi.");
    }

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
      try {
        const wm = getAgentMuxWatermarkImageUrl(user.id);
        const up = await videoProvider.upload(buf, { passthrough, contentType: mime, watermarkImageUrl: wm });
        muxUploadId = up.muxUploadId;
      } catch (e) {
        console.error("mux upload", e);
        return err(502, "Upload failed. Please try again.");
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
        muxUploadId,
        status: "processing",
        message: "Processing video...",
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
    try {
      const wm = getAgentMuxWatermarkImageUrl(user.id);
      const up = await videoProvider.upload(buf, { passthrough, contentType: mime, watermarkImageUrl: wm });
      muxUploadId = up.muxUploadId;
    } catch (e) {
      console.error("mux upload intro", e);
      return err(502, "Upload failed. Please try again.");
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
      muxUploadId,
      status: "processing",
      message: "Processing your video... usually 2-3 minutes",
    });
  } catch (e) {
    console.error("video upload route", e);
    const msg = e?.message || "";
    if (/network|fetch|ECONNRESET/i.test(msg)) {
      return err(503, "Connection error. Please check your internet and try again.");
    }
    return err(500, "Upload failed. Please try again.");
  }
}
