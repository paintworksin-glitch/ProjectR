/** Mux image CDN base — override with NEXT_PUBLIC_MUX_IMAGE_ORIGIN if Mux changes host. */
export function muxImageOrigin() {
  const raw = (process.env.NEXT_PUBLIC_MUX_IMAGE_ORIGIN || "https://image.mux.com").trim();
  return raw.replace(/\/$/, "");
}

export function muxThumbnailUrl(playbackId, timeSec = 1, widthPx) {
  if (!playbackId) return "";
  const t = Number(timeSec) || 0;
  const u = new URL(`${muxImageOrigin()}/${encodeURIComponent(playbackId)}/thumbnail.jpg`);
  u.searchParams.set("time", String(t));
  const w = Number(widthPx);
  if (w > 0 && w <= 4096) u.searchParams.set("width", String(Math.floor(w)));
  return u.toString();
}
