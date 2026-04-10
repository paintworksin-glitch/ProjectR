/**
 * Canonical site origin for links (WhatsApp, QR, OG). Uses env only — never the request Host (spoofable).
 */

export function normalizeSiteOrigin(raw) {
  if (raw == null || !String(raw).trim()) return "";
  const t = String(raw).trim().replace(/\/$/, "");
  const withProto = t.startsWith("http://") || t.startsWith("https://") ? t : `https://${t}`;
  try {
    return new URL(withProto).origin;
  } catch {
    return "";
  }
}

/** Server / build: NEXT_PUBLIC_SITE_URL or NEXT_PUBLIC_PUBLIC_SITE_URL */
export function getServerSiteOrigin() {
  return normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "");
}

/** Client: prefer env; fallback to window.location.origin for local dev */
export function getBrowserSiteOrigin() {
  const fromEnv = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || "");
  if (typeof window !== "undefined" && !fromEnv) return window.location.origin;
  return fromEnv;
}

export function propertyPagePath(listingId) {
  if (!listingId) return "/";
  return `/property/${listingId}`;
}

export function propertyPageUrl(origin, listingId, query) {
  const base = origin || getBrowserSiteOrigin() || getServerSiteOrigin();
  const path = propertyPagePath(listingId);
  const q = query && typeof query === "object" ? new URLSearchParams(query).toString() : "";
  return q ? `${base}${path}?${q}` : `${base}${path}`;
}
