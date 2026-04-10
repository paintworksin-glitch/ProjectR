/**
 * Server-only: normalize aspect ratio, optional downscale, Northing text watermark, light audio normalize.
 */
import { execFile, spawnSync } from "child_process";
import { promisify } from "util";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

const execFileAsync = promisify(execFile);

const FFMPEG = ffmpegInstaller.path;

const WATERMARK_TEXT = "northing.in";

function escapeDrawText(text) {
  return text.replace(/\\/g, "\\\\").replace(/:/g, "\\:").replace(/'/g, "\\'");
}

/**
 * Parse duration and video size from `ffmpeg -i` stderr (no separate ffprobe dependency).
 * @param {string} inputPath
 * @returns {Promise<{ durationSec: number, width: number, height: number }>}
 */
export async function probeVideo(inputPath) {
  const r = spawnSync(FFMPEG, ["-hide_banner", "-i", inputPath], {
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
  });
  const stderr = r.stderr || "";
  const durM = stderr.match(/Duration:\s*(\d{2}):(\d{2}):(\d{2}\.\d+)/);
  let durationSec = 0;
  if (durM) {
    durationSec =
      Number(durM[1]) * 3600 + Number(durM[2]) * 60 + Number.parseFloat(durM[3]);
  }
  const sizeM = stderr.match(/Stream\s+#\d+:\d+(?:\([^)]*\))?:\s*Video:[^\n]*,\s*(\d{3,})x(\d{3,})/);
  const width = sizeM ? Number(sizeM[1]) : 0;
  const height = sizeM ? Number(sizeM[2]) : 0;
  return { durationSec, width, height };
}

/**
 * Minimum short side >= 480 (before our transcode).
 */
export function meetsMinResolution(width, height) {
  if (!width || !height) return false;
  return Math.min(width, height) >= 480;
}

/**
 * @param {string} inputPath
 * @param {string} outputPath
 * @param {{ mode: 'listing' | 'intro' }} opts
 */
export async function transcodeWithWatermark(inputPath, outputPath, opts) {
  const { mode } = opts;
  const targetW = mode === "intro" ? 1080 : 1920;
  const targetH = mode === "intro" ? 1920 : 1080;
  const escaped = escapeDrawText(WATERMARK_TEXT);
  const vf = [
    `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease`,
    `pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:black`,
    `drawtext=text='${escaped}':fontcolor=white@0.62:fontsize=h*0.028:x=w-tw-24:y=h-th-24:borderw=2:bordercolor=black@0.35`,
  ].join(",");

  const args = [
    "-y",
    "-i",
    inputPath,
    "-vf",
    vf,
    "-af",
    "dynaudnorm=f=200",
    "-c:v",
    "libx264",
    "-preset",
    "fast",
    "-crf",
    "23",
    "-c:a",
    "aac",
    "-b:a",
    "128k",
    "-movflags",
    "+faststart",
    outputPath,
  ];

  await execFileAsync(FFMPEG, args, { maxBuffer: 20 * 1024 * 1024 });
}
