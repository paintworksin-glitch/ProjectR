import { MUX_MP4_CANDIDATES, muxTourMp4Url } from "@/lib/muxTourMp4Fetch.js";

/**
 * Find first working Mux static MP4 URL (server-side; no CORS).
 * Prefer small Range GET — some CDNs mishandle HEAD.
 */
export async function findMuxMp4Url(playbackId) {
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
