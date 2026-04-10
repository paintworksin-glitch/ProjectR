/** Mux image CDN base — override with NEXT_PUBLIC_MUX_IMAGE_ORIGIN if Mux changes host. */
export function muxImageOrigin() {
  const raw = (process.env.NEXT_PUBLIC_MUX_IMAGE_ORIGIN || "https://image.mux.com").trim();
  return raw.replace(/\/$/, "");
}

export function muxThumbnailUrl(playbackId, timeSec = 1) {
  if (!playbackId) return "";
  const t = Number(timeSec) || 0;
  return `${muxImageOrigin()}/${encodeURIComponent(playbackId)}/thumbnail.jpg?time=${encodeURIComponent(String(t))}`;
}
