/**
 * Fetch a public Mux tour as MP4 for download / Web Share.
 * Tries new static_rendition names first, then legacy mp4_support filenames.
 */
export const MUX_MP4_CANDIDATES = ["highest.mp4", "capped-1080p.mp4", "high.mp4", "medium.mp4", "low.mp4"];

export function muxTourMp4Url(playbackId, fileName) {
  if (!playbackId || !fileName) return "";
  return `https://stream.mux.com/${encodeURIComponent(playbackId)}/${fileName}`;
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

/**
 * Lightweight check so the UI can show “MP4 still preparing” before the user clicks download.
 * HEAD first; if that fails (some browsers / CORS), tries GET with Range bytes=0-0.
 *
 * @param {string} playbackId
 * @param {AbortSignal} [signal]
 * @returns {Promise<{ status: "ready" | "unavailable"; fileName?: string }>}
 */
export async function probeMuxTourMp4Availability(playbackId, signal) {
  for (const name of MUX_MP4_CANDIDATES) {
    const url = muxTourMp4Url(playbackId, name);
    try {
      const head = await fetch(url, { method: "HEAD", mode: "cors", signal });
      if (head.ok) return { status: "ready", fileName: name };
    } catch {
      /* HEAD not allowed or network */
    }
    try {
      const res = await fetch(url, {
        method: "GET",
        mode: "cors",
        signal,
        headers: { Range: "bytes=0-0" },
      });
      if (res.ok || res.status === 206) return { status: "ready", fileName: name };
    } catch {
      /* continue */
    }
  }
  return { status: "unavailable" };
}
