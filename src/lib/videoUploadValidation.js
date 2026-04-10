/**
 * Server-side checks for video uploads without FFmpeg (Vercel-safe).
 * Duration/dimensions come from the client (HTMLVideoElement); we sanity-check and verify container magic bytes.
 */

const MAX_REASONABLE_DURATION_SEC = 6 * 60 * 60; // reject absurd spoof values

/**
 * @param {Buffer} buf
 * @returns {boolean}
 */
export function bufferLooksLikeSupportedVideo(buf) {
  if (!buf || buf.length < 12) return false;
  if (buf[0] === 0x1a && buf[1] === 0x45 && buf[2] === 0xdf && buf[3] === 0xa3) return true;
  if (buf.slice(0, 4).toString("ascii") === "RIFF" && buf.slice(8, 12).toString("ascii") === "AVI ") return true;
  if (buf.slice(4, 8).toString("ascii") === "ftyp") return true;
  return false;
}

/**
 * @param {number} width
 * @param {number} height
 */
export function meetsMinResolution(width, height) {
  if (!width || !height) return false;
  return Math.min(width, height) >= 480;
}

/**
 * @param {FormData} form
 * @param {{ kind: 'listing' | 'intro' }} opts
 * @returns {{ ok: true, durationSec: number, width: number, height: number } | { ok: false, error: string }}
 */
export function parseAndValidateClientVideoMeta(form, opts) {
  const rawD = form.get("durationSec");
  const rawW = form.get("videoWidth");
  const rawH = form.get("videoHeight");
  const durationSec = typeof rawD === "string" ? Number.parseFloat(rawD) : Number.NaN;
  const width = typeof rawW === "string" ? Number.parseInt(rawW, 10) : Number.NaN;
  const height = typeof rawH === "string" ? Number.parseInt(rawH, 10) : Number.NaN;

  if (!Number.isFinite(durationSec) || durationSec <= 0) {
    return { ok: false, error: "Could not read video length. Try another file or browser." };
  }
  if (!Number.isFinite(width) || !Number.isFinite(height) || width < 16 || height < 16) {
    return { ok: false, error: "Could not read video size. Try another file or browser." };
  }
  if (durationSec > MAX_REASONABLE_DURATION_SEC) {
    return { ok: false, error: "Video appears invalid. Please try another file." };
  }

  if (durationSec < 5) {
    return { ok: false, error: "Video must be at least 5 seconds" };
  }

  if (opts.kind === "listing") {
    if (durationSec > 300) return { ok: false, error: "Video must be under 5 minutes" };
  } else if (durationSec > 60) {
    return { ok: false, error: "Introduction video must be 60 seconds or less" };
  }

  if (!meetsMinResolution(width, height)) {
    return { ok: false, error: "Video quality too low. Please upload a clearer video (minimum 480p)" };
  }

  return { ok: true, durationSec, width, height };
}
