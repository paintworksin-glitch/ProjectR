import { cache } from "react";
import { notFound } from "next/navigation";
import { fetchListingByIdServer } from "@/lib/fetchListingServer";
import { buildListingPageMetadata } from "@/lib/listingMetadata";
import PropertyPublicPageClient from "@/modules/PropertyPublicPageClient";

export const runtime = "nodejs";

const getListing = cache(async (id) => fetchListingByIdServer(id));

export async function generateMetadata({ params }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();
  const meta = buildListingPageMetadata(listing);
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      siteName: "Northing",
    },
    alternates: {
      canonical: `/property/${params.id}`,
    },
  };
}

export default async function PropertyPage({ params }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title || "Property",
    description: listing.description || `Property listing in ${listing.location || "India"}`,
    image: Array.isArray(listing.photos) ? listing.photos.filter(Boolean).slice(0, 5) : [],
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: listing.price || 0,
      availability: "https://schema.org/InStock",
    },
    brand: {
      "@type": "Brand",
      name: "Northing",
    },
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <PropertyPublicPageClient id={params.id} initialListing={listing} />
    </>
  );
}
