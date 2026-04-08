/**
 * Server/client: who may create a new listing (role, verification, seller cap).
 */
export async function canCreateListing(supabase, userId) {
  const { data: p, error } = await supabase.from("profiles").select("role, agent_verified, plan").eq("id", userId).maybeSingle();
  if (error || !p) return { ok: false, message: "Could not verify your profile." };

  if (p.role === "user") {
    return {
      ok: false,
      message: "Buyers cannot create listings. Register as a Seller or Agent to list properties.",
    };
  }

  // Treat missing column / null as unverified (must be explicitly true).
  if (p.role === "agent" && p.agent_verified !== true) {
    return {
      ok: false,
      message: "Your agent account must be approved by Northing before you can create listings.",
    };
  }

  if (p.role === "seller") {
    const { count, error: cErr } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", userId)
      .eq("status", "Active");
    if (cErr) return { ok: false, message: "Could not check your listing count." };
    if ((count || 0) >= 2) {
      return {
        ok: false,
        message: "You've reached your free limit of 2 listings. Contact us to upgrade your plan.",
      };
    }
  }

  return { ok: true };
}
