/** Customer subdomain for Stream thumbnails/HLS (public bundle may only see NEXT_PUBLIC_*). */
function streamCustomerCode() {
  return (
    (process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE || process.env.CLOUDFLARE_STREAM_CUSTOMER_CODE || "").trim()
  );
}

/** Mux image CDN base — legacy thumbnails when Stream is not configured. */
export function muxImageOrigin() {
  const raw = (process.env.NEXT_PUBLIC_MUX_IMAGE_ORIGIN || "https://image.mux.com").trim();
  return raw.replace(/\/$/, "");
}

export function muxThumbnailUrl(playbackId, timeSec = 1, widthPx) {
  if (!playbackId) return "";
  const code = streamCustomerCode();
  if (code) {
    const u = new URL(
      `https://customer-${code}.cloudflarestream.com/${encodeURIComponent(playbackId)}/thumbnails/thumbnail.jpg`,
    );
    u.searchParams.set("time", `${Number(timeSec) || 0}s`);
    const w = Number(widthPx);
    if (w > 0 && w <= 4096) u.searchParams.set("width", String(Math.floor(w)));
    return u.toString();
  }
  const t = Number(timeSec) || 0;
  const u = new URL(`${muxImageOrigin()}/${encodeURIComponent(playbackId)}/thumbnail.jpg`);
  u.searchParams.set("time", String(t));
  const w = Number(widthPx);
  if (w > 0 && w <= 4096) u.searchParams.set("width", String(Math.floor(w)));
  return u.toString();
}
