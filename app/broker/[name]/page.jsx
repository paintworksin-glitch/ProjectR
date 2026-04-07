import { BrokerPublicPage } from "@/modules/NorthingApp";
import { fetchBrokerProfileForMetadata } from "@/lib/fetchBrokerProfileServer";

export const runtime = "nodejs";

export async function generateMetadata({ params }) {
  const profile = await fetchBrokerProfileForMetadata(params.name);
  const fallbackLabel = decodeURIComponent(String(params.name || "")).replace(/-/g, " ");
  const label = profile?.name?.trim() || fallbackLabel || "Broker";
  const title = profile ? `${label} — Broker on Northing` : "Broker — Northing";
  const description = profile
    ? `Property listings and contact for ${label}${profile.agency_name ? ` · ${profile.agency_name}` : ""} on Northing — Mumbai, Thane & Navi Mumbai.`
    : "Independent broker profiles and listings on Northing.";
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      siteName: "Northing",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default function BrokerRoutePage({ params }) {
  return <BrokerPublicPage name={params.name} />;
}
