import { createMuxClient } from "@/lib/mux.js";
import { MUX_MP4_CANDIDATES, muxTourMp4Url } from "@/lib/muxTourMp4Fetch.js";

function rankMp4CandidateName(name) {
  const idx = MUX_MP4_CANDIDATES.indexOf(name);
  return idx === -1 ? 999 : idx;
}

/**
 * Use Mux Video API to find a **ready** static MP4 filename (source of truth).
 * Avoids relying on CDN probes alone (which can 404 briefly after Mux reports ready).
 */
export async function findMuxMp4UrlViaMuxApi(playbackId) {
  let mux;
  try {
    mux = createMuxClient();
  } catch {
    return null;
  }
  try {
    const pb = await mux.video.playbackIds.retrieve(playbackId);
    if (pb?.object?.type !== "asset" || !pb.object?.id) return null;
    const asset = await mux.video.assets.retrieve(pb.object.id);
    const files = asset?.static_renditions?.files;
    if (!Array.isArray(files) || files.length === 0) return null;
    const ready = files
      .filter((f) => f && f.status === "ready" && f.ext === "mp4" && typeof f.name === "string")
      .sort((a, b) => rankMp4CandidateName(a.name) - rankMp4CandidateName(b.name));
    if (!ready.length) return null;
    return muxTourMp4Url(playbackId, ready[0].name);
  } catch {
    return null;
  }
}

/**
 * Find first working Mux static MP4 URL (server-side; no CORS).
 * Prefer Mux API (ready renditions), then small Range GET — some CDNs mishandle HEAD.
 */
export async function findMuxMp4Url(playbackId) {
  const fromApi = await findMuxMp4UrlViaMuxApi(playbackId);
  if (fromApi) return fromApi;

  for (const name of MUX_MP4_CANDIDATES) {
    const url = muxTourMp4Url(playbackId, name);
    try {
      const r = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        redirect: "follow",
        cache: "no-store",
      });
      if (r.ok || r.status === 206) return url;
    } catch {
      /* next */
    }
    try {
      const head = await fetch(url, { method: "HEAD", redirect: "follow", cache: "no-store" });
      if (head.ok) return url;
    } catch {
      /* next */
    }
  }
  return null;
}

/** Mux playback IDs are usually alphanumeric; allow common variants. */
export function isLikelyMuxPlaybackId(id) {
  if (!id || typeof id !== "string") return false;
  const s = id.trim();
  return s.length >= 4 && s.length <= 80 && /^[a-zA-Z0-9_-]+$/.test(s);
}
