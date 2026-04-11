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

function buildNewAssetSettings(passthrough, watermarkImageUrl) {
  const videoQuality = (process.env.MUX_VIDEO_QUALITY || "plus").trim() || "plus";
  const watermarkUrl = (watermarkImageUrl && String(watermarkImageUrl).trim()) || getMuxWatermarkImageUrl();

  const newAssetSettings = {
    playback_policies: ["public"],
    passthrough,
    video_quality: videoQuality,
    max_resolution_tier: "1080p",
    /** 720p MP4 encodes faster than full “highest” for download / WhatsApp share (separate job from HLS streaming). */
    static_renditions: [{ resolution: "720p" }],
  };

  /**
   * Direct upload: first input omits url (Mux uses the uploaded file as primary).
   * Second input: full-width bottom-aligned PNG strip (transparent outside strip).
   */
  if (watermarkUrl) {
    newAssetSettings.inputs = [
      {},
      {
        url: watermarkUrl,
        overlay_settings: {
          vertical_align: "bottom",
          vertical_margin: "0%",
          horizontal_align: "center",
          horizontal_margin: "0%",
          width: "100%",
          opacity: "100%",
        },
      },
    ];
  }
  return newAssetSettings;
}

export const videoProvider = {
  /**
   * Create a Mux direct upload URL only (browser PUTs the file — avoids Vercel body limits).
   * @param {{ passthrough: string, corsOrigin?: string, watermarkImageUrl?: string }} metadata
   * @returns {Promise<{ uploadUrl: string, muxUploadId: string }>}
   */
  async createDirectUpload(metadata) {
    const mux = getClient();
    const cors = metadata.corsOrigin || "*";
    const newAssetSettings = buildNewAssetSettings(metadata.passthrough, metadata.watermarkImageUrl);
    const upload = await mux.video.uploads.create({
      cors_origin: cors,
      new_asset_settings: newAssetSettings,
    });
    return { uploadUrl: upload.url, muxUploadId: upload.id };
  },

  /**
   * Create upload and PUT from server (small files only; prefer createDirectUpload on Vercel).
   * @param {Buffer} buffer raw video bytes
   * @param {{ passthrough: string, contentType: string, corsOrigin?: string, watermarkImageUrl?: string }} metadata
   */
  async upload(buffer, metadata) {
    const { uploadUrl, muxUploadId } = await this.createDirectUpload({
      passthrough: metadata.passthrough,
      corsOrigin: metadata.corsOrigin,
      watermarkImageUrl: metadata.watermarkImageUrl,
    });
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

  /**
   * Ask Mux to generate a 720p MP4 if none was requested at upload (or encoding was never kicked).
   * Safe to call repeatedly; duplicates are ignored.
   */
  async ensure720pStaticRendition(assetId) {
    if (!assetId) return { ok: false, reason: "no_asset" };
    const mux = getClient();
    try {
      await mux.video.assets.createStaticRendition(assetId, { resolution: "720p" });
      return { ok: true, requested: true };
    } catch (e) {
      const status = e?.status ?? e?.response?.status;
      const body = String(e?.message ?? e ?? "");
      if (status === 409 || /already|exist|duplicate|in progress|conflict/i.test(body)) {
        return { ok: true, requested: false };
      }
      return { ok: true, requested: false, note: body.slice(0, 200) };
    }
  },
};
