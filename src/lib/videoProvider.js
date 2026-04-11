/**
 * Video provider abstraction — all app/server code uses this module, not @mux/mux-node directly
 * (except mux.js bootstrap). Swap implementation here to change providers.
 */
import { createMuxClient } from "./mux.js";
import { muxThumbnailUrl } from "./muxThumbnailUrl.js";
import { getServerSiteOrigin } from "./publicSiteUrl.js";

function getClient() {
  return createMuxClient();
}

/** Mux overlays use a PNG/JPG URL (not raw text). Optional override for staging/CDN. */
function getMuxWatermarkImageUrl() {
  const explicit = process.env.MUX_WATERMARK_IMAGE_URL?.trim();
  if (explicit) return explicit;
  const origin = getServerSiteOrigin();
  if (origin) return `${origin}/mux-watermark/northing-in.png`;
  return null;
}

function buildNewAssetSettings(passthrough) {
  const videoQuality = (process.env.MUX_VIDEO_QUALITY || "plus").trim() || "plus";
  const watermarkUrl = getMuxWatermarkImageUrl();

  const newAssetSettings = {
    playback_policies: ["public"],
    passthrough,
    video_quality: videoQuality,
    max_resolution_tier: "1080p",
    /** 720p MP4 encodes faster than full “highest” for download / WhatsApp share (separate job from HLS streaming). */
    static_renditions: [{ resolution: "720p" }],
  };

  if (watermarkUrl) {
    newAssetSettings.inputs = [
      {
        url: watermarkUrl,
        overlay_settings: {
          vertical_align: "bottom",
          vertical_margin: "2%",
          horizontal_align: "right",
          horizontal_margin: "2%",
          width: "22%",
          opacity: "62%",
        },
      },
    ];
  }
  return newAssetSettings;
}

export const videoProvider = {
  /**
   * Create a Mux direct upload URL only (browser PUTs the file — avoids Vercel body limits).
   * @param {{ passthrough: string, corsOrigin?: string }} metadata
   * @returns {Promise<{ uploadUrl: string, muxUploadId: string }>}
   */
  async createDirectUpload(metadata) {
    const mux = getClient();
    const cors = metadata.corsOrigin || "*";
    const newAssetSettings = buildNewAssetSettings(metadata.passthrough);
    const upload = await mux.video.uploads.create({
      cors_origin: cors,
      new_asset_settings: newAssetSettings,
    });
    return { uploadUrl: upload.url, muxUploadId: upload.id };
  },

  /**
   * Create upload and PUT from server (small files only; prefer createDirectUpload on Vercel).
   * @param {Buffer} buffer raw video bytes
   * @param {{ passthrough: string, contentType: string, corsOrigin?: string }} metadata
   */
  async upload(buffer, metadata) {
    const { uploadUrl, muxUploadId } = await this.createDirectUpload(metadata);
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      body: buffer,
      headers: {
        "Content-Type": metadata.contentType || "application/octet-stream",
        "Content-Length": String(buffer.length),
      },
    });
    if (!putRes.ok) {
      const t = await putRes.text().catch(() => "");
      throw new Error(`Mux upload failed: ${putRes.status} ${t}`);
    }
    return {
      muxUploadId,
      status: "processing",
    };
  },

  getPlaybackUrl(playbackId) {
    if (!playbackId) return "";
    return `https://stream.mux.com/${playbackId}.m3u8`;
  },

  getThumbnailUrl(playbackId, timestampSec) {
    return muxThumbnailUrl(playbackId, timestampSec);
  },

  async delete(assetId) {
    if (!assetId) return;
    const mux = getClient();
    await mux.video.assets.delete(assetId);
  },

  async retrieveAsset(assetId) {
    if (!assetId) return null;
    const mux = getClient();
    try {
      return await mux.video.assets.retrieve(assetId);
    } catch {
      return null;
    }
  },
};
