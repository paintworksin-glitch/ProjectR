/**
 * Canonical origin for server-generated links (emails, etc.).
 * Does not use the Origin header (spoofable).
 */
export function getCanonicalOrigin(request) {
  const envPrimary = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.trim();
  const envAlt = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  for (const raw of [envPrimary, envAlt]) {
    if (!raw) continue;
    try {
      const url = raw.startsWith("http://") || raw.startsWith("https://") ? raw : `https://${raw}`;
      return new URL(url).origin;
    } catch {
      /* continue */
    }
  }
  if (process.env.VERCEL_URL) {
    const host = process.env.VERCEL_URL.replace(/^https?:\/\//, "");
    return `https://${host}`;
  }
  try {
    return new URL(request.url).origin;
  } catch {
    return "";
  }
}
