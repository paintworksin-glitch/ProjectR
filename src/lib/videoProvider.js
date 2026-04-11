/**
 * Video provider abstraction — all app/server code uses this module, not @mux/mux-node directly
 * (except mux.js bootstrap). Swap implementation here to change providers.
 */
import { createMuxClient } from "./mux.js";
import { muxThumbnailUrl } from "./muxThumbnailUrl.js";
import { getStaticMuxWatermarkImageUrl } from "./watermarkUrl.js";
import { muxErrorForLog } from "./muxClientError.js";

function getClient() {
  return createMuxClient();
}

const WATERMARK_OVERLAY_SETTINGS = {
  vertical_align: "bottom",
  vertical_margin: "0px",
  horizontal_align: "left",
  horizontal_margin: "0px",
  width: "100%",
  height: "15%",
  opacity: 1,
};

/**
 * Base Mux `new_asset_settings` for direct upload (no `inputs` = no overlay).
 * @param {string} passthrough
 */
export function muxDirectUploadBaseNewAssetSettings(passthrough) {
  const videoQuality = (process.env.MUX_VIDEO_QUALITY || "plus").trim() || "plus";
  return {
    playback_policies: ["public"],
    passthrough,
    video_quality: videoQuality,
    max_resolution_tier: "1080p",
    /** 720p MP4 encodes faster than full “highest” for download / WhatsApp share (separate job from HLS streaming). */
    static_renditions: [{ resolution: "720p" }],
  };
}

/**
 * Same as production direct-upload asset settings for a resolved watermark HTTPS URL.
 * @param {string} passthrough
 * @param {string | null | undefined} watermarkUrl absolute URL or falsy for no overlay
 */
export function muxDirectUploadNewAssetSettings(passthrough, watermarkUrl) {
  const base = muxDirectUploadBaseNewAssetSettings(passthrough);
  const url = watermarkUrl && String(watermarkUrl).trim();
  if (!url) return base;
  base.inputs = [
    {},
    {
      url,
      overlay_settings: { ...WATERMARK_OVERLAY_SETTINGS },
    },
  ];
  return base;
}

function buildNewAssetSettings(passthrough, watermarkImageUrl) {
  const watermarkUrl = (watermarkImageUrl && String(watermarkImageUrl).trim()) || getStaticMuxWatermarkImageUrl();
  return muxDirectUploadNewAssetSettings(passthrough, watermarkUrl || null);
}

function hadWatermarkInputs(settings) {
  return Array.isArray(settings.inputs) && settings.inputs.length > 1;
}

export const videoProvider = {
  /**
   * Create a Mux direct upload URL only (browser PUTs the file — avoids Vercel body limits).
   * @param {{ passthrough: string, corsOrigin?: string, watermarkImageUrl?: string }} metadata
   * @returns {Promise<{ uploadUrl: string, muxUploadId: string, watermarkSkipped?: boolean }>}
   */
  async createDirectUpload(metadata) {
    const mux = getClient();
    const cors = metadata.corsOrigin || "*";
    const newAssetSettings = buildNewAssetSettings(metadata.passthrough, metadata.watermarkImageUrl);

    const payload = { cors_origin: cors, new_asset_settings: newAssetSettings };
    console.log("[videoProvider] Mux createDirectUpload payload (full)", JSON.stringify(payload, null, 2));

    try {
      const upload = await mux.video.uploads.create({
        cors_origin: cors,
        new_asset_settings: newAssetSettings,
      });
      return { uploadUrl: upload.url, muxUploadId: upload.id };
    } catch (e) {
      if (!hadWatermarkInputs(newAssetSettings)) {
        throw e;
      }
      console.warn(
        "[videoProvider] createDirectUpload failed with watermark overlay; retrying without overlay",
        muxErrorForLog(e),
      );
      const minimal = muxDirectUploadBaseNewAssetSettings(metadata.passthrough);
      const retryPayload = { cors_origin: cors, new_asset_settings: minimal };
      console.log("[videoProvider] Mux createDirectUpload retry (no overlay)", JSON.stringify(retryPayload, null, 2));
      const upload = await mux.video.uploads.create({
        cors_origin: cors,
        new_asset_settings: minimal,
      });
      console.warn(
        "[videoProvider] createDirectUpload succeeded without watermark — check watermark URL reachability from Mux",
      );
      return { uploadUrl: upload.url, muxUploadId: upload.id, watermarkSkipped: true };
    }
  },

  /**
   * Create upload and PUT from server (small files only; prefer createDirectUpload on Vercel).
   * @param {Buffer} buffer raw video bytes
   * @param {{ passthrough: string, contentType: string, corsOrigin?: string, watermarkImageUrl?: string }} metadata
   */
  async upload(buffer, metadata) {
    const { uploadUrl, muxUploadId, watermarkSkipped } = await this.createDirectUpload({
      passthrough: metadata.passthrough,
      corsOrigin: metadata.corsOrigin,
      watermarkImageUrl: metadata.watermarkImageUrl,
    });
    if (watermarkSkipped) {
      console.warn("[videoProvider] server upload continuing without watermark overlay");
    }
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
      ...(watermarkSkipped ? { watermarkSkipped: true } : {}),
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
