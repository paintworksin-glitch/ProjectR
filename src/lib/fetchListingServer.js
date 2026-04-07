import { createSupabaseServerClient } from "./supabaseServer";
import { mapListing } from "./mapListing";

/** Server-only: load listing for /property/[id] (SSR + metadata). Uses Supabase SSR client + cookies. */
export async function fetchListingByIdServer(id) {
  if (!id) return null;
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("listings").select("*").eq("id", id).single();
  if (error || !data) return null;
  let verified = false;
  if (data.agent_id) {
    const { data: op } = await supabase.from("profiles").select("agent_verified").eq("id", data.agent_id).maybeSingle();
    verified = op?.agent_verified === true;
  }
  return mapListing({ ...data, _ownerAgentVerified: verified });
}
