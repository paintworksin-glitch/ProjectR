"use client";

import { readVideoFileMetadata } from "@/lib/clientVideoMetadata";
import { MAX_VIDEO_UPLOAD_BYTES } from "@/lib/videoUploadLimits.js";
import { formatVideoUploadError } from "@/lib/videoUploadUserMessages.js";

function formatErr(msg) {
  return formatVideoUploadError(String(msg || ""));
}

async function postRegisterUpload(body, signal) {
  let lastErr = null;
  for (let attempt = 0; attempt < 3; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 400));
    try {
      const res = await fetch("/api/video/register-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        signal,
      });
      const j = await res.json().catch(() => ({}));
      if (res.ok) return;
      lastErr = formatErr(j.error || res.statusText || `HTTP ${res.status}`);
    } catch (e) {
      lastErr = formatErr(e?.message || e);
    }
  }
  throw new Error(lastErr || "Could not register upload");
}

/**
 * Cloudflare Stream direct upload: POST multipart form (field name `file`) to uploadUrl.
 */
function postFileToStreamUpload(uploadUrl, file, _contentType, { onUploadProgress, signal } = {}) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const fd = new FormData();
    fd.append("file", file, file.name || "video.mp4");
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
    xhr.open("POST", uploadUrl);
    xhr.send(fd);
  });
}

async function cleanupOrphanListingVideo(listingId, videoId) {
  try {
    await fetch("/api/video/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, orphanStreamVideoId: videoId }),
    });
  } catch {
    /* ignore */
  }
}

async function cleanupOrphanIntroVideo(videoId) {
  try {
    await fetch("/api/video/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ introVideo: true, orphanStreamVideoId: videoId }),
    });
  } catch {
    /* ignore */
  }
}

/**
 * @param {string} listingId
 * @param {File} file
 * @param {{ onUploadProgress?: (n: number) => void, signal?: AbortSignal }} [opts]
 */
export async function uploadListingTourVideo(listingId, file, opts = {}) {
  if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
    throw new Error("Video must be under 500MB");
  }
  let probe;
  try {
    probe = await readVideoFileMetadata(file);
  } catch (e) {
    throw new Error(formatErr(e?.message || ""));
  }
  const mime = (file.type || "video/mp4").toLowerCase();
  let pendingCfVideoId = null;
  try {
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
        fileSizeBytes: file.size,
      }),
      signal: opts.signal,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(formatErr(j.error || res.statusText || `HTTP ${res.status}`));
    const uploadUrl = j.uploadUrl;
    const videoId = j.videoId != null ? String(j.videoId).trim() : null;
    if (!uploadUrl || !videoId) throw new Error("No upload URL returned");
    pendingCfVideoId = videoId;
    await postFileToStreamUpload(uploadUrl, file, mime, opts);
    pendingCfVideoId = null;
    await postRegisterUpload({ listingId, videoId }, opts.signal);
  } catch (e) {
    if (pendingCfVideoId) await cleanupOrphanListingVideo(listingId, pendingCfVideoId);
    throw e;
  }
}

/**
 * @param {File} file
 * @param {{ onUploadProgress?: (n: number) => void, signal?: AbortSignal }} [opts]
 */
export async function uploadIntroVideo(file, opts = {}) {
  if (file.size > MAX_VIDEO_UPLOAD_BYTES) {
    throw new Error("Video must be under 500MB");
  }
  let probe;
  try {
    probe = await readVideoFileMetadata(file);
  } catch (e) {
    throw new Error(formatErr(e?.message || ""));
  }
  const mime = (file.type || "video/mp4").toLowerCase();
  let pendingCfVideoId = null;
  try {
    const res = await fetch("/api/video/direct-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        kind: "intro",
        contentType: mime,
        durationSec: probe.durationSec,
        videoWidth: probe.videoWidth,
        videoHeight: probe.videoHeight,
        fileSizeBytes: file.size,
      }),
      signal: opts.signal,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(formatErr(j.error || res.statusText || `HTTP ${res.status}`));
    const uploadUrl = j.uploadUrl;
    const videoId = j.videoId != null ? String(j.videoId).trim() : null;
    if (!uploadUrl || !videoId) throw new Error("No upload URL returned");
    pendingCfVideoId = videoId;
    await postFileToStreamUpload(uploadUrl, file, mime, opts);
    pendingCfVideoId = null;
    await postRegisterUpload({ intro: true, videoId }, opts.signal);
  } catch (e) {
    if (pendingCfVideoId) await cleanupOrphanIntroVideo(pendingCfVideoId);
    throw e;
  }
}
