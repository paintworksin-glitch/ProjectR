import { NextResponse } from "next/server";
import { findMuxMp4Url, isLikelyMuxPlaybackId } from "@/lib/muxMp4Resolve.js";

export const runtime = "nodejs";
/** Large tours may take a while to stream through the app (Hobby ~60s). */
export const maxDuration = 300;

function safeFilename(raw) {
  const base = (raw || "tour.mp4").split(/[/\\]/).pop() || "tour.mp4";
  const cleaned = base.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  return cleaned.endsWith(".mp4") ? cleaned : `${cleaned || "tour"}.mp4`;
}

/**
 * Same-origin proxy for Mux static MP4s so the browser can download / build a File
 * without stream.mux.com CORS blocking fetch().
 *
 * Query: probe=1 → JSON { ok: true } if an MP4 exists (avoids flaky HEAD from the browser).
 */
export async function GET(request) {
  const playbackId = request.nextUrl.searchParams.get("playbackId")?.trim() || "";
  const filename = safeFilename(request.nextUrl.searchParams.get("filename") || "northing-tour.mp4");
  const probe = request.nextUrl.searchParams.get("probe");

  if (!isLikelyMuxPlaybackId(playbackId)) {
    return NextResponse.json({ error: "Invalid playbackId" }, { status: 400 });
  }

  if (probe === "1") {
    const muxUrl = await findMuxMp4Url(playbackId);
    if (!muxUrl) return NextResponse.json({ ok: false }, { status: 404 });
    return NextResponse.json({ ok: true });
  }

  const muxUrl = await findMuxMp4Url(playbackId);
  if (!muxUrl) {
    return NextResponse.json({ error: "MP4 not available yet" }, { status: 404 });
  }

  let upstream;
  try {
    upstream = await fetch(muxUrl, { redirect: "follow", cache: "no-store" });
  } catch (e) {
    return NextResponse.json({ error: "Upstream fetch failed" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Mux returned an error" }, { status: 502 });
  }

  const contentType = upstream.headers.get("content-type") || "video/mp4";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}

export async function HEAD(request) {
  const playbackId = request.nextUrl.searchParams.get("playbackId")?.trim() || "";
  if (!isLikelyMuxPlaybackId(playbackId)) {
    return new NextResponse(null, { status: 400 });
  }
  const muxUrl = await findMuxMp4Url(playbackId);
  if (!muxUrl) return new NextResponse(null, { status: 404 });
  return new NextResponse(null, { status: 200 });
}
