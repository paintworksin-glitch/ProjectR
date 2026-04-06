import { fmtP } from "./formatPrice";

/** Absolute URL for OG/Twitter when photo may be a site-relative path. */
export function absoluteOgImageUrl(url) {
  if (!url || typeof url !== "string") return undefined;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  const base =
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!base) return undefined;
  return u.startsWith("/") ? `${base}${u}` : `${base}/${u}`;
}

export function getSiteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "") ||
    ""
  );
}

function keyDetailsLine(listing) {
  const parts = [];
  if (listing.bedrooms) parts.push(`${listing.bedrooms} BHK`);
  if (listing.sizesqft) parts.push(`${listing.sizesqft} sqft`);
  if (listing.listingType) parts.push(listing.listingType);
  return parts.filter(Boolean).join(" · ");
}

/**
 * Metadata for /property/[id] and /share/[id] — title: title + location; description: type, price, key details.
 */
export function buildListingPageMetadata(listing) {
  const title = (listing.title || "Property").trim();
  const loc = (listing.location || "").trim();
  const pageTitle = loc ? `${title} — ${loc}` : `${title} | Northing`;
  const priceStr = fmtP(listing.price);
  const typeStr = listing.propertyType || "";
  const keys = keyDetailsLine(listing);
  const description = [typeStr, priceStr, keys].filter(Boolean).join(" · ");

  const ogImage = absoluteOgImageUrl(listing.photos?.[0]);

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      ...(ogImage ? { images: [{ url: ogImage, alt: title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}
