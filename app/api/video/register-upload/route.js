import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient, adminApiErrorMessage } from "@/lib/supabaseAdmin";
import { videoProvider } from "@/lib/videoProvider";
import { parseStreamPassthroughMeta } from "@/lib/streamVideoPassthrough.js";

export const runtime = "nodejs";

const TAG = "video-register-upload";

/**
 * After the browser POSTs the file to Cloudflare's direct upload URL, call this so
 * Supabase has video_id / video_playback_id immediately (webhook meta can omit passthrough).
 */
export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    const videoId = body?.videoId != null ? String(body.videoId).trim() : "";
    if (!videoId) {
      return NextResponse.json({ error: "videoId is required" }, { status: 400 });
    }

    const intro = body?.intro === true || body?.kind === "intro";
    const listingId = body?.listingId != null ? String(body.listingId).trim() : "";

    let admin;
    try {
      admin = createSupabaseAdminClient();
    } catch (e) {
      return NextResponse.json({ error: adminApiErrorMessage(e) }, { status: 500 });
    }

    if (intro) {
      let asset = null;
      for (let attempt = 0; attempt < 6; attempt++) {
        asset = await videoProvider.retrieveAsset(videoId);
        if (asset?.meta && typeof asset.meta === "object") break;
        await new Promise((r) => setTimeout(r, 500));
      }
      const meta = asset?.meta && typeof asset.meta === "object" ? asset.meta : {};
      const pt = parseStreamPassthroughMeta(meta);
      console.log(`[${TAG}] intro verify asset`, { videoId, hasAsset: Boolean(asset), pt });
      if (!pt || pt.k !== "i" || String(pt.uid) !== user.id) {
        return NextResponse.json({ error: "Video does not match this account" }, { status: 403 });
      }

      const { error: up } = await admin
        .from("profiles")
        .update({
          intro_video_id: videoId,
          intro_video_playback_id: videoId,
          intro_video_provider: "cloudflare",
          intro_video_status: "processing",
        })
        .eq("id", user.id);
      if (up) {
        console.error(`[${TAG}] profile update failed`, up);
        return NextResponse.json({ error: up.message }, { status: 500 });
      }
      console.log(`[${TAG}] intro registered`, { userId: user.id, videoId });
      return NextResponse.json({ ok: true, videoId });
    }

    if (!listingId) {
      return NextResponse.json({ error: "listingId is required for listing videos" }, { status: 400 });
    }

    const { data: row, error: le } = await admin
      .from("listings")
      .select("id, agent_id, details")
      .eq("id", listingId)
      .single();
    if (le || !row) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }
    if (row.agent_id !== user.id) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    const details = row.details && typeof row.details === "object" ? { ...row.details } : {};
    const pending = details.muxPendingUploadId != null ? String(details.muxPendingUploadId).trim() : "";
    console.log(`[${TAG}] listing pending check`, { listingId, pending, videoId, match: pending === videoId });

    if (pending !== videoId) {
      const asset = await videoProvider.retrieveAsset(videoId);
      const meta = asset?.meta && typeof asset.meta === "object" ? asset.meta : {};
      const pt = parseStreamPassthroughMeta(meta);
      if (!pt || pt.k !== "l" || String(pt.lid) !== listingId) {
        return NextResponse.json({ error: "Upload session does not match this listing" }, { status: 403 });
      }
    }

    delete details.muxPendingUploadId;

    const { error: upErr } = await admin
      .from("listings")
      .update({
        video_id: videoId,
        video_playback_id: videoId,
        video_provider: "cloudflare",
        video_status: "processing",
        details,
      })
      .eq("id", listingId);

    if (upErr) {
      console.error(`[${TAG}] listing update failed`, upErr);
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    console.log(`[${TAG}] listing registered`, { listingId, videoId });
    return NextResponse.json({ ok: true, videoId });
  } catch (e) {
    console.error(`[${TAG}] error`, e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
