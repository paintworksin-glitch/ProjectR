import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin.js";
import { videoProvider } from "@/lib/videoProvider.js";
import { isLikelyMuxPlaybackId } from "@/lib/muxMp4Resolve.js";

export const runtime = "nodejs";

function isUuidLike(id) {
  return typeof id === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id.trim());
}

/**
 * Ensures Mux is generating a 720p static MP4 for this listing’s asset (idempotent).
 * Public callers only need listing id + playback id shown on the property page.
 */
export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const listingId = typeof body?.listingId === "string" ? body.listingId.trim() : "";
  const playbackId = typeof body?.playbackId === "string" ? body.playbackId.trim() : "";

  if (!isUuidLike(listingId) || !isLikelyMuxPlaybackId(playbackId)) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch {
    return NextResponse.json({ ok: false, error: "Server misconfigured" }, { status: 503 });
  }

  const { data: row, error } = await admin.from("listings").select("id, video_id, video_playback_id").eq("id", listingId).maybeSingle();

  if (error || !row?.video_id) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }
  if (row.video_playback_id !== playbackId) {
    return NextResponse.json({ ok: false }, { status: 403 });
  }

  try {
    const result = await videoProvider.ensure720pStaticRendition(row.video_id);
    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e?.message || e).slice(0, 200) }, { status: 502 });
  }
}
