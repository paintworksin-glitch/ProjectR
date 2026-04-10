"use client";

import { readVideoFileMetadata } from "@/lib/clientVideoMetadata";

function formatErr(msg) {
  const m = String(msg || "").toLowerCase();
  const raw = String(msg || "");
  try {
    const j = JSON.parse(raw);
    if (j.error) return String(j.error);
  } catch {
    /* ignore */
  }
  if (/\b413\b|payload too large|entity too large|body exceeded|request body|too large for/i.test(m)) {
    return "The upload was blocked by the network. If this persists, try a shorter clip or lower quality export.";
  }
  if (/\b400\b|\b403\b/.test(raw) && /video|upload|mux/i.test(raw)) {
    return raw.length < 200 ? raw : "Upload was rejected. Check format and size.";
  }
  if (/500mb|exceeds.*limit/i.test(m)) return "Video must be under 500MB";
  if (/format|mp4|mov|webm/i.test(m)) return "Please upload mp4, mov or webm";
  if (/5 seconds|least 5/i.test(m)) return "Video must be at least 5 seconds";
  if (/5 minutes|under 5 min|300/i.test(m)) return "Video must be under 5 minutes";
  if (/360|resolution too low|quality too low|480p/i.test(m)) return "Video resolution too low (short edge at least 360px).";
  if (/read video|video metadata|video length|video size/i.test(m)) return "Could not read this video in your browser.";
  return raw.length < 220 ? raw : "Upload failed. Please try again.";
}

/**
 * 1) POST /api/video/direct-upload (small JSON)
 * 2) PUT file to Mux uploadUrl (full size — not through Vercel)
 */
function putFileToMux(uploadUrl, file, contentType, { onUploadProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const onAbort = () => {
      try {
        xhr.abort();
      } catch {
        /* ignore */
      }
    };
    if (signal) {
      if (signal.aborted) {
        reject(new Error("aborted"));
        return;
      }
      signal.addEventListener("abort", onAbort);
    }
    xhr.upload.addEventListener("progress", (ev) => {
      if (!ev.lengthComputable || !onUploadProgress) return;
      onUploadProgress(Math.min(99, Math.round((ev.loaded / ev.total) * 100)));
    });
    xhr.addEventListener("load", () => {
      if (signal) signal.removeEventListener("abort", onAbort);
      if (xhr.status >= 200 && xhr.status < 300) {
        if (onUploadProgress) onUploadProgress(100);
        resolve();
      } else {
        reject(new Error(formatErr(xhr.responseText || `HTTP ${xhr.status}`)));
      }
    });
    xhr.addEventListener("error", () => {
      if (signal) signal.removeEventListener("abort", onAbort);
      reject(new Error("Connection error. Try again."));
    });
    xhr.addEventListener("abort", () => {
      if (signal) signal.removeEventListener("abort", onAbort);
      reject(new Error("aborted"));
    });
    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", contentType || file.type || "application/octet-stream");
    xhr.send(file);
  });
}

/**
 * @param {string} listingId
 * @param {File} file
 * @param {{ onUploadProgress?: (n: number) => void, signal?: AbortSignal }} [opts]
 */
export async function uploadListingTourVideo(listingId, file, opts = {}) {
  let probe;
  try {
    probe = await readVideoFileMetadata(file);
  } catch (e) {
    throw new Error(formatErr(e?.message || ""));
  }
  const mime = (file.type || "video/mp4").toLowerCase();
  const res = await fetch("/api/video/direct-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "listing",
      listingId,
      contentType: mime,
      durationSec: probe.durationSec,
      videoWidth: probe.videoWidth,
      videoHeight: probe.videoHeight,
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatErr(j.error || res.statusText || `HTTP ${res.status}`));
  const uploadUrl = j.uploadUrl;
  if (!uploadUrl) throw new Error("No upload URL returned");
  await putFileToMux(uploadUrl, file, mime, opts);
}

/**
 * @param {File} file
 * @param {{ onUploadProgress?: (n: number) => void, signal?: AbortSignal }} [opts]
 */
export async function uploadIntroVideo(file, opts = {}) {
  let probe;
  try {
    probe = await readVideoFileMetadata(file);
  } catch (e) {
    throw new Error(formatErr(e?.message || ""));
  }
  const mime = (file.type || "video/mp4").toLowerCase();
  const res = await fetch("/api/video/direct-upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      kind: "intro",
      contentType: mime,
      durationSec: probe.durationSec,
      videoWidth: probe.videoWidth,
      videoHeight: probe.videoHeight,
    }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(formatErr(j.error || res.statusText || `HTTP ${res.status}`));
  const uploadUrl = j.uploadUrl;
  if (!uploadUrl) throw new Error("No upload URL returned");
  await putFileToMux(uploadUrl, file, mime, opts);
}
