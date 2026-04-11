import { NextResponse } from "next/server";
import { muxThumbnailUrl } from "@/lib/muxThumbnailUrl.js";
import { isLikelyMuxPlaybackId } from "@/lib/muxMp4Resolve.js";

export const runtime = "nodejs";

function safeFilename(raw, fallback) {
  const base = (raw || fallback).split(/[/\\]/).pop() || fallback;
  const cleaned = base.replace(/[^\w.\-]+/g, "_").slice(0, 120);
  if (/\.jpe?g$/i.test(cleaned)) return cleaned;
  const stem = cleaned.replace(/\.[^.]+$/, "") || "preview";
  return `${stem}.jpg`;
}

/**
 * Proxies Mux Image thumbnail as attachment (same-origin) so ?download works reliably.
 */
export async function GET(request) {
  const playbackId = request.nextUrl.searchParams.get("playbackId")?.trim() || "";
  const filename = safeFilename(request.nextUrl.searchParams.get("filename"), "northing-tour-preview.jpg");
  const timeRaw = request.nextUrl.searchParams.get("time");
  const timeSec = timeRaw != null && timeRaw !== "" ? Number(timeRaw) : 1;
  const wRaw = request.nextUrl.searchParams.get("w") || request.nextUrl.searchParams.get("width");
  const widthPx = wRaw != null && wRaw !== "" ? Number(wRaw) : 1920;

  if (!isLikelyMuxPlaybackId(playbackId)) {
    return NextResponse.json({ error: "Invalid playbackId" }, { status: 400 });
  }

  const muxUrl = muxThumbnailUrl(playbackId, Number.isFinite(timeSec) ? timeSec : 1, Number.isFinite(widthPx) ? widthPx : 1920);
  let upstream;
  try {
    upstream = await fetch(muxUrl, { redirect: "follow", cache: "no-store" });
  } catch {
    return NextResponse.json({ error: "Thumbnail fetch failed" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    return NextResponse.json({ error: "Thumbnail not available" }, { status: upstream.status === 404 ? 404 : 502 });
  }

  const contentType = upstream.headers.get("content-type") || "image/jpeg";

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, max-age=300",
    },
  });
}
