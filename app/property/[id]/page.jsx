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
  };
}

export default async function PropertyPage({ params }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();
  return <PropertyPublicPageClient id={params.id} initialListing={listing} />;
}
