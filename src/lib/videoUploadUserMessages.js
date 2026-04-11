/**
 * Map API / XHR / probe errors to short UI copy. Avoid regex that matches
 * dimension substrings (e.g. width 3840 contains "400") or unrelated "exceeds limit" text.
 * @param {string} msg
 */
export function formatVideoUploadError(msg) {
  const m = String(msg || "").toLowerCase();
  const raw = String(msg || "");
  try {
    const j = JSON.parse(raw);
    if (j.error) return formatVideoUploadError(String(j.error));
  } catch {
    /* not JSON */
  }

  if (/\b413\b|payload too large|entity too large|body exceeded|request body|too large for|request entity too large|content length exceeded/i.test(m)) {
    return "The upload was blocked by the network. If this persists, try a shorter clip or lower quality export.";
  }
  if (
    /\b500\s*mb\b|under 500mb|max 500|larger than 500|over 500mb|exceeds.{0,48}500|file.{0,32}500|upload.{0,32}500/i.test(m)
  ) {
    return "Video must be under 500MB";
  }

  if (/\b400\b|\b403\b/.test(raw) && /video|upload|mux|listing|forbidden|not allowed/i.test(m)) {
    return raw.length < 200 ? raw : "Upload was rejected. Check format, size, and permissions.";
  }

  if (/format|mp4|mov|webm|avi/i.test(m)) return "Please upload mp4, mov or webm";
  if (/5 seconds|least 5|at least 5/i.test(m)) return "Video must be at least 5 seconds";
  if (/5 minutes|under 5 min|five minutes|must be under 5|longer than 5\s*min|\b300\s*seconds?\b/i.test(m)) {
    return "Video must be under 5 minutes";
  }
  if (/60 seconds|introduction video/i.test(m)) return "Introduction video must be 60 seconds or less";
  if (/360|resolution too low|quality too low|480p|short edge/i.test(m)) {
    return "Video resolution too low (short edge at least 360px).";
  }
  if (/read video|video metadata|video length|video size|could not read/i.test(m)) {
    return "Could not read this video in your browser. Try another file or browser.";
  }
  if (/network|connection|econnreset/i.test(m)) return "Connection error. Please check your internet and try again.";
  if (/\b429\b|too many uploads/i.test(m)) return "Too many uploads. Try again later.";

  return raw.length < 220 ? raw : "Upload failed. Please try again.";
}
