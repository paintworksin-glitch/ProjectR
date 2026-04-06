import { cache } from "react";
import { fetchListingByIdServer } from "@/lib/fetchListingServer";
import { fmtP } from "@/lib/formatPrice";
import PropertyPublicPageClient from "@/modules/PropertyPublicPageClient";

const getListing = cache(async (id) => fetchListingByIdServer(id));

function absoluteOgImageUrl(url) {
  if (!url || typeof url !== "string") return undefined;
  const u = url.trim();
  if (/^https?:\/\//i.test(u)) return u;
  const base =
    process.env.NEXT_PUBLIC_PUBLIC_SITE_URL?.replace(/\/$/, "") ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "");
  if (!base) return undefined;
  return u.startsWith("/") ? `${base}${u}` : `${base}/${u}`;
}

export async function generateMetadata({ params }) {
  const id = params.id;
  const listing = await getListing(id);

  if (!listing) {
    return {
      title: "Property | Northing",
      description: "Property listing on Northing.",
    };
  }

  const title = listing.title || "Property";
  const priceStr = fmtP(listing.price);
  const description = [listing.propertyType, listing.location, priceStr].filter(Boolean).join(" · ");
  const ogImage = absoluteOgImageUrl(listing.photos?.[0]);
  const pageTitle = `${title} | Northing`;

  return {
    title: pageTitle,
    description,
    openGraph: {
      title: pageTitle,
      description,
      type: "website",
      ...(ogImage
        ? {
            images: [{ url: ogImage, alt: title }],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
  };
}

export default async function PropertyPage({ params }) {
  const listing = await getListing(params.id);
  return <PropertyPublicPageClient id={params.id} initialListing={listing} />;
}
