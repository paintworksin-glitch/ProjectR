import { createSupabaseServerClient } from "./supabaseServer";

/** Server-only: resolve broker slug for /broker/[name] metadata (matches client ilike query). */
export async function fetchBrokerProfileForMetadata(nameParam) {
  if (!nameParam) return null;
  const supabase = await createSupabaseServerClient();
  const slug = decodeURIComponent(String(nameParam)).replace(/-/g, " ");
  const { data, error } = await supabase
    .from("profiles")
    .select("id,name,agency_name")
    .ilike("name", slug)
    .limit(1);
  if (error || !data?.length) return null;
  return data[0];
}
