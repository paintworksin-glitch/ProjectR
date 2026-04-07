import { cache } from "react";
import { notFound } from "next/navigation";
import { fetchListingByIdServer } from "@/lib/fetchListingServer";
import { buildListingPageMetadata, getSiteBaseUrl } from "@/lib/listingMetadata";
import ShareListingPageClient from "@/modules/ShareListingPageClient";

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

export default async function ShareRoutePage({ params }) {
  const listing = await getListing(params.id);
  if (!listing) notFound();
  const site = getSiteBaseUrl();
  const fullListingUrl = site ? `${site}/property/${params.id}` : `/property/${params.id}`;
  return <ShareListingPageClient initialListing={listing} fullListingUrl={fullListingUrl} />;
}
