/**
 * Video provider abstraction — all app/server code uses this module, not @mux/mux-node directly
 * (except mux.js bootstrap). Swap implementation here to change providers.
 */
import { createReadStream } from "fs";
import { stat } from "fs/promises";
import { createMuxClient } from "./mux.js";
import { muxThumbnailUrl } from "./muxThumbnailUrl.js";

function getClient() {
  return createMuxClient();
}

export const videoProvider = {
  /**
   * Create a Mux direct upload, stream processed file to it, return mux upload id + asset id when available.
   * @param {string} filePath absolute path to processed mp4
   * @param {{ passthrough: string, corsOrigin?: string }} metadata
   */
  async upload(filePath, metadata) {
    const mux = getClient();
    const cors = metadata.corsOrigin || "*";
    const upload = await mux.video.uploads.create({
      cors_origin: cors,
      new_asset_settings: {
        playback_policies: ["public"],
        passthrough: metadata.passthrough,
      },
    });
    const { url: uploadUrl, id: uploadId } = upload;
    const st = await stat(filePath);
    const body = createReadStream(filePath);
    const putRes = await fetch(uploadUrl, {
      method: "PUT",
      body,
      headers: {
        "Content-Type": "video/mp4",
        "Content-Length": String(st.size),
      },
    });
    if (!putRes.ok) {
      const t = await putRes.text().catch(() => "");
      throw new Error(`Mux upload failed: ${putRes.status} ${t}`);
    }
    return {
      muxUploadId: uploadId,
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
