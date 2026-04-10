"use client";

import { readVideoFileMetadata } from "@/lib/clientVideoMetadata";

function formatErr(msg) {
  const m = String(msg || "");
  try {
    const j = JSON.parse(m);
    if (j.error) return String(j.error);
  } catch {
    /* ignore */
  }
  if (/40[03]|Too large|500MB/i.test(m)) return "Video must be under 500MB";
  if (/format|mp4|mov|webm/i.test(m)) return "Please upload mp4, mov or webm";
  if (/5 seconds|least 5/i.test(m)) return "Video must be at least 5 seconds";
  if (/5 minutes|under 5 min|300/i.test(m)) return "Video must be under 5 minutes";
  if (/480|quality too low/i.test(m)) return "Video quality too low (minimum 480p)";
  if (/read video|video metadata|video length|video size/i.test(m)) return "Could not read this video in your browser.";
  return m || "Upload failed";
}

/**
 * POST listing tour video to /api/video/upload (XHR for progress).
 * @param {string} listingId
 * @param {File} file
 * @param {{ onUploadProgress?: (pct0to100: number) => void, signal?: AbortSignal }} [opts]
 * @returns {Promise<void>}
 */
export function uploadListingTourVideo(listingId, file, opts = {}) {
  const { onUploadProgress, signal } = opts;
  return new Promise((resolve, reject) => {
    (async () => {
      let probe;
      try {
        probe = await readVideoFileMetadata(file);
      } catch (e) {
        reject(new Error(formatErr(e?.message || "")));
        return;
      }
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "listing");
      fd.append("listingId", listingId);
      fd.append("durationSec", String(probe.durationSec));
      fd.append("videoWidth", String(probe.videoWidth));
      fd.append("videoHeight", String(probe.videoHeight));

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
      xhr.open("POST", "/api/video/upload");
      xhr.send(fd);
    })().catch(reject);
  });
}
