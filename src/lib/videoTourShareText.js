import { getBrowserSiteOrigin, propertyPageUrl } from "@/lib/publicSiteUrl.js";

/** WhatsApp caption for sharing the listing video + tour link (matches prior VideoShareCardModal copy). */
export function buildVideoTourShareText(listing) {
  const lines = [];
  lines.push("*" + listing.title + "*");
  lines.push("📍 " + listing.location);
  lines.push("");
  const desc = (listing.description || "").trim();
  if (desc) {
    const short = desc.length > 520 ? desc.slice(0, 517).trim() + "…" : desc;
    lines.push(short);
    lines.push("");
  }
  const siteBase = getBrowserSiteOrigin() || (typeof window !== "undefined" ? window.location.origin : "");
  if (siteBase && listing.id) {
    lines.push("🎥 Watch the tour:");
    lines.push(propertyPageUrl(siteBase, listing.id, { tab: "video" }));
  }
  lines.push("");
  lines.push("Contact:");
  lines.push("  " + (listing.agentName || "Agent"));
  if (listing.agentPhone) lines.push("  📞 " + listing.agentPhone);
  lines.push("");
  lines.push("_Powered by Northing_");
  return lines.join("\n");
}
