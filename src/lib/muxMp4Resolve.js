import { createMuxClient } from "@/lib/mux.js";
import { cloudflareStreamSignedDownloadUrl } from "@/lib/videoProvider.js";
import { MUX_MP4_CANDIDATES, muxTourMp4Url } from "@/lib/muxTourMp4Fetch.js";

function rankMp4CandidateName(name) {
  const idx = MUX_MP4_CANDIDATES.indexOf(name);
  return idx === -1 ? 999 : idx;
}

/** First candidate that responds to Range/HEAD on stream.mux.com (parallel). */
async function probeMuxStaticCandidatesParallel(playbackId) {
  const checks = MUX_MP4_CANDIDATES.map(async (name) => {
    const url = muxTourMp4Url(playbackId, name);
    try {
      const r = await fetch(url, {
        method: "GET",
        headers: { Range: "bytes=0-0" },
        redirect: "follow",
        cache: "no-store",
      });
      if (r.ok || r.status === 206) return url;
    } catch {
      /* next */
    }
    try {
      const head = await fetch(url, { method: "HEAD", redirect: "follow", cache: "no-store" });
      if (head.ok) return url;
    } catch {
      /* next */
    }
    return null;
  });
  const hits = await Promise.all(checks);
  return hits.find(Boolean) || null;
}

/**
 * Temporary signed master MP4 URL (24h) when static renditions are missing or still preparing.
 */
async function resolveMuxMasterTemporaryDownloadUrl(mux, assetId) {
  try {
    let asset = await mux.video.assets.retrieve(assetId);
    if (asset.master?.status === "ready" && asset.master?.url) {
      return asset.master.url;
    }
    if (asset.master_access === "none") {
      await mux.video.assets.updateMasterAccess(assetId, { master_access: "temporary" });
      asset = await mux.video.assets.retrieve(assetId);
    }
    if (asset.master?.status === "ready" && asset.master?.url) {
      return asset.master.url;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Resolves a URL the server can fetch to stream a full MP4 to the browser.
 * Order: Mux API static files → legacy / CDN names → temporary master access.
 */
export async function resolveMuxTourVideoDownload(playbackId) {
  const cfUrl = await cloudflareStreamSignedDownloadUrl(playbackId);
  if (cfUrl) {
    return { url: cfUrl, source: "cloudflare" };
  }

  let mux;
  try {
    mux = createMuxClient();
  } catch {
    mux = null;
  }

  if (mux) {
    try {
      const pb = await mux.video.playbackIds.retrieve(playbackId);
      if (pb?.object?.type === "asset" && pb.object.id) {
        const assetId = pb.object.id;
        const asset = await mux.video.assets.retrieve(assetId);
        const files = asset?.static_renditions?.files;
        const sr = asset?.static_renditions;

        if (Array.isArray(files) && files.length > 0) {
          const ready = files
            .filter((f) => f && f.status === "ready" && f.ext === "mp4" && typeof f.name === "string")
            .sort((a, b) => rankMp4CandidateName(a.name) - rankMp4CandidateName(b.name));
          if (ready.length) {
            return { url: muxTourMp4Url(playbackId, ready[0].name), source: "static" };
          }
        }

        const legacyMp4 =
          asset.mp4_support && asset.mp4_support !== "none"
            ? true
            : sr?.status === "ready" && (!Array.isArray(files) || files.length === 0);
        if (legacyMp4) {
          const hit = await probeMuxStaticCandidatesParallel(playbackId);
          if (hit) return { url: hit, source: "static" };
        }

        const masterUrl = await resolveMuxMasterTemporaryDownloadUrl(mux, assetId);
        if (masterUrl) return { url: masterUrl, source: "master" };
      }
    } catch {
      /* fall through */
    }
  }

  const hit = await probeMuxStaticCandidatesParallel(playbackId);
  if (hit) return { url: hit, source: "static" };
  return null;
}

/** Backwards-compatible: returns any downloadable video URL (static CDN or master). */
export async function findMuxMp4Url(playbackId) {
  const r = await resolveMuxTourVideoDownload(playbackId);
  return r?.url ?? null;
}

/** Mux playback IDs are usually alphanumeric; allow common variants. */
export function isLikelyMuxPlaybackId(id) {
  if (!id || typeof id !== "string") return false;
  const s = id.trim();
  return s.length >= 4 && s.length <= 80 && /^[a-zA-Z0-9_-]+$/.test(s);
}
