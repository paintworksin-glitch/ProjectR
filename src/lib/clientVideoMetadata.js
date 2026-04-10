/**
 * Read duration and display dimensions using the browser decoder (no FFmpeg).
 * @param {File} file
 * @returns {Promise<{ durationSec: number, videoWidth: number, videoHeight: number }>}
 */
export function readVideoFileMetadata(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.muted = true;
    v.playsInline = true;
    const cleanup = () => {
      URL.revokeObjectURL(url);
    };
    v.onloadedmetadata = () => {
      const durationSec = v.duration;
      const videoWidth = v.videoWidth;
      const videoHeight = v.videoHeight;
      cleanup();
      if (!Number.isFinite(durationSec) || durationSec <= 0) {
        reject(new Error("Could not read video length"));
        return;
      }
      if (!videoWidth || !videoHeight) {
        reject(new Error("Could not read video size"));
        return;
      }
      resolve({ durationSec, videoWidth, videoHeight });
    };
    v.onerror = () => {
      cleanup();
      reject(new Error("Could not read video file"));
    };
    v.src = url;
  });
}
