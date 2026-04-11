/**
 * @cloudflare/stream-react expects customerCode = subdomain token only (e.g. "e9revcog8gbunv5t").
 * It builds: https://customer-{customerCode}.cloudflarestream.com/{uid}/iframe
 * If env contains "customer-..." or a full host, normalize so we do not get "customer-customer-..." (404).
 */
export function normalizeCloudflareStreamCustomerCode(raw) {
  let s = String(raw || "").trim();
  if (!s) return "";
  s = s.replace(/^https?:\/\//i, "");
  const slash = s.indexOf("/");
  if (slash !== -1) s = s.slice(0, slash);
  s = s.replace(/\.cloudflarestream\.com\.?$/i, "");
  s = s.replace(/^customer-/i, "");
  return s.trim();
}
