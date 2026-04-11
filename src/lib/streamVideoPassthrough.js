/**
 * Cloudflare Stream stores our JSON in meta.passthrough; meta.name is a fallback (listing-{uuid}, intro-{uuid}).
 * @param {Record<string, unknown> | null | undefined} meta
 * @returns {{ k?: string, lid?: string, uid?: string } | null}
 */
export function parseStreamPassthroughMeta(meta) {
  if (!meta || typeof meta !== "object") return null;
  const rawPt = meta.passthrough;
  if (rawPt != null && typeof rawPt === "string" && rawPt.trim()) {
    try {
      const pt = JSON.parse(rawPt);
      if (pt && typeof pt === "object") return pt;
    } catch {
      /* fall through */
    }
  }
  const name = meta.name;
  if (typeof name === "string") {
    if (name.startsWith("listing-")) {
      const lid = name.slice("listing-".length).trim();
      if (lid) return { k: "l", lid };
    }
    if (name.startsWith("intro-")) {
      const uid = name.slice("intro-".length).trim();
      if (uid) return { k: "i", uid };
    }
  }
  return null;
}
