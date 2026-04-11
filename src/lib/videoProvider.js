/**
 * Video provider — Cloudflare Stream (direct creator uploads + webhooks).
 */
import { cfStreamApi, cloudflareStreamHlsUrl, cloudflareStreamThumbnailUrl } from "./cloudflare.js";

/**
 * @param {string} passthrough
 * @returns {Record<string, string>}
 */
function streamMetaFromPassthrough(passthrough) {
  const meta = { passthrough: String(passthrough).slice(0, 1024) };
  try {
    const pt = JSON.parse(String(passthrough));
    if (pt.lid) meta.name = `listing-${pt.lid}`;
    else if (pt.k === "i" && pt.uid) meta.name = `intro-${pt.uid}`;
    else meta.name = "northing-video";
  } catch {
    meta.name = "northing-video";
  }
  return meta;
}

export const videoProvider = {
  /**
   * @param {{ passthrough: string, corsOrigin?: string, watermarkImageUrl?: string, maxDurationSeconds?: number }} metadata
   * @returns {Promise<{ uploadUrl: string, muxUploadId: string, videoId: string }>}
   */
  async createDirectUpload(metadata) {
    const maxDurationSeconds = Math.min(
      Math.max(1, Number(metadata.maxDurationSeconds) || 300),
      21600,
    );
    const body = {
      maxDurationSeconds,
      meta: streamMetaFromPassthrough(metadata.passthrough),
    };
    const wm = (process.env.CLOUDFLARE_WATERMARK_UID || "").trim();
    if (wm) {
      body.watermark = {
        uid: wm,
        position: "bottom-left",
        opacity: 0.8,
        scale: 0.1,
      };
    }

    const inputsLog = [{ note: "primary from direct upload POST (multipart file)" }, body.watermark ? { watermark: body.watermark } : null].filter(
      Boolean,
    );
    console.log("[videoProvider] Cloudflare direct_upload request summary", JSON.stringify({ maxDurationSeconds, meta: body.meta, watermark: body.watermark || null }, null, 2));
    console.log("[videoProvider] Cloudflare logical inputs / overlay", JSON.stringify(inputsLog, null, 2));

    const result = await cfStreamApi("direct_upload", { method: "POST", body });
    const uploadUrl = result.uploadURL || result.uploadUrl;
    const uid = result.uid;
    if (!uploadUrl || !uid) {
      throw new Error("Cloudflare direct_upload missing uploadURL or uid");
    }
    return { uploadUrl, muxUploadId: uid, videoId: uid };
  },

  /**
   * @param {Buffer} buffer
   * @param {{ passthrough: string, contentType: string, corsOrigin?: string, watermarkImageUrl?: string, maxDurationSeconds?: number }} metadata
   */
  async upload(buffer, metadata) {
    const { uploadUrl, muxUploadId, videoId } = await this.createDirectUpload({
      passthrough: metadata.passthrough,
      corsOrigin: metadata.corsOrigin,
      watermarkImageUrl: metadata.watermarkImageUrl,
      maxDurationSeconds: metadata.maxDurationSeconds ?? 300,
    });
    const fd = new FormData();
    const blob = new Blob([buffer], { type: metadata.contentType || "application/octet-stream" });
    fd.append("file", blob, "video.bin");
    const putRes = await fetch(uploadUrl, { method: "POST", body: fd });
    if (!putRes.ok) {
      const t = await putRes.text().catch(() => "");
      throw new Error(`Cloudflare upload failed: ${putRes.status} ${t}`);
    }
    return { muxUploadId, videoId, status: "processing" };
  },

  /** @param {string} videoUid Cloudflare Stream video uid (stored as video_playback_id) */
  getPlaybackUrl(videoUid) {
    return cloudflareStreamHlsUrl(videoUid);
  },

  getThumbnailUrl(videoUid, timestampSec) {
    return cloudflareStreamThumbnailUrl(videoUid, timestampSec ?? 1);
  },

  async delete(videoUid) {
    if (!videoUid) return;
    await cfStreamApi(encodeURIComponent(String(videoUid).trim()), { method: "DELETE" });
  },

  async retrieveAsset(videoUid) {
    if (!videoUid) return null;
    try {
      return await cfStreamApi(encodeURIComponent(String(videoUid).trim()));
    } catch {
      return null;
    }
  },

  /** Cloudflare encodes ladder automatically; kept for API compatibility. */
  async ensure720pStaticRendition(_videoUid) {
    return { ok: true, requested: false, note: "cloudflare_stream" };
  },
};

/** @returns {string | null} Download URL when downloads are enabled for the asset in Stream */
export async function cloudflareStreamSignedDownloadUrl(videoUid) {
  if (!videoUid) return null;
  try {
    const v = await cfStreamApi(encodeURIComponent(String(videoUid).trim()));
    const d = v?.download;
    return typeof d === "string" ? d : d?.url || null;
  } catch {
    return null;
  }
}
