/**
 * Fetch a public Mux tour as MP4 for download / Web Share.
 * Tries new static_rendition names first, then legacy mp4_support filenames.
 */
export const MUX_MP4_CANDIDATES = [
  "720p.mp4",
  "1080p.mp4",
  "highest.mp4",
  "capped-1080p.mp4",
  "high.mp4",
  "medium.mp4",
  "low.mp4",
];

export function muxTourMp4Url(playbackId, fileName) {
  if (!playbackId || !fileName) return "";
  return `https://stream.mux.com/${encodeURIComponent(playbackId)}/${fileName}`;
}

/** Same-origin URL that proxies the MP4 (avoids stream.mux.com CORS on fetch / download). */
export function muxTourMp4ApiPath(playbackId, filename, extra = {}) {
  const params = new URLSearchParams({
    playbackId: String(playbackId),
    filename: filename || "northing-tour.mp4",
  });
  Object.entries(extra).forEach(([k, v]) => {
    if (v != null && v !== "") params.set(k, String(v));
  });
  return `/api/video/mp4?${params}`;
}

/**
 * @param {string} playbackId
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ blob: Blob; sourceName: string }>}
 */
export async function fetchMuxTourMp4Blob(playbackId, signal) {
  let lastStatus = 0;
  for (const name of MUX_MP4_CANDIDATES) {
    const url = muxTourMp4Url(playbackId, name);
    const res = await fetch(url, { mode: "cors", signal });
    if (res.ok) {
      const blob = await res.blob();
      return { blob, sourceName: name };
    }
    lastStatus = res.status;
  }
  const err = new Error("MUX_MP4_UNAVAILABLE");
  err.status = lastStatus;
  throw err;
}
