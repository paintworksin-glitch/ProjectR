import { getMuxAssetOrigin } from "@/lib/publicSiteUrl.js";

/** Absolute URL Mux can fetch for per-agent bottom-strip overlay PNG. */
export function getAgentMuxWatermarkImageUrl(agentId) {
  const id = typeof agentId === "string" ? agentId.trim() : "";
  const origin = getMuxAssetOrigin();
  if (!id || !origin) return undefined;
  return `${origin}/api/video/watermark-image?agentId=${encodeURIComponent(id)}`;
}

/** Static strip PNG when no per-agent URL (MUX_WATERMARK_IMAGE_URL or /mux-watermark/northing-in.png). */
export function getStaticMuxWatermarkImageUrl() {
  const explicit = (process.env.MUX_WATERMARK_IMAGE_URL || "").trim();
  if (explicit) return explicit;
  const origin = getMuxAssetOrigin();
  if (origin) return `${origin}/mux-watermark/northing-in.png`;
  return null;
}

/** Resolved overlay URL passed to Mux for a given agent (agent-specific or static fallback). */
export function getEffectiveMuxWatermarkImageUrl(agentId) {
  return getAgentMuxWatermarkImageUrl(agentId) || getStaticMuxWatermarkImageUrl();
}
