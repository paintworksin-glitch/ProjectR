import { getServerSiteOrigin } from "@/lib/publicSiteUrl.js";

/** Absolute URL Mux can fetch for per-agent bottom-strip overlay PNG. */
export function getAgentMuxWatermarkImageUrl(agentId) {
  const id = typeof agentId === "string" ? agentId.trim() : "";
  const origin = getServerSiteOrigin();
  if (!id || !origin) return undefined;
  return `${origin}/api/video/watermark-image?agentId=${encodeURIComponent(id)}`;
}
