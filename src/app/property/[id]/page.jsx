import { createSupabaseServerClient } from "@/lib/supabaseServer.js";
import PropertyPageClient from "./PropertyPageClient.jsx";

export async function generateMetadata({ params }) {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("listings").select("title, description, photos").eq("id", params.id).single();
  if (!data) {
    return { title: "Property | Northing", description: "View listings on Northing." };
  }
  const title = data.title ? `${data.title} | Northing` : "Property | Northing";
  const raw = (data.description || "").trim();
  const description = raw ? raw.slice(0, 160) + (raw.length > 160 ? "…" : "") : `View ${data.title || "this property"} on Northing.`;
  const image = Array.isArray(data.photos) && data.photos[0] ? data.photos[0] : null;
  return {
    title,
    description,
    openGraph: {
      title: data.title || "Northing",
      description,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title: data.title || "Northing",
      description,
      images: image ? [image] : [],
    },
  };
}

export default function PropertyPage({ params }) {
  return <PropertyPageClient id={params.id} />;
}
