/**
 * Server/client: who may create a new listing (role, verification, seller cap).
 * Uses JWT user id from getUser() so eligibility always matches the active session (avoids stale context).
 */
/**
 * @param {{ ignoreSellerActiveCap?: boolean }} [options] - Set for draft-only inserts so sellers at 2 Active can still save a draft.
 */
export async function canCreateListing(supabase, userIdHint, options = {}) {
  const {
    data: { user },
    error: authErr,
  } = await supabase.auth.getUser();
  if (authErr || !user?.id) {
    return {
      ok: false,
      message: "Could not verify your login. Please sign out and sign in again.",
    };
  }
  const uid = user.id;
  if (userIdHint && userIdHint !== uid) {
    console.warn("[canCreateListing] Session user id does not match context; using session id.");
  }

  const { data: p, error } = await supabase
    .from("profiles")
    .select("role, agent_verified, plan")
    .eq("id", uid)
    .maybeSingle();

  if (error) {
    console.warn("[canCreateListing] profiles select error:", error.message, error);
    const denied =
      error.message?.includes("permission") ||
      error.code === "42501" ||
      /permission denied/i.test(String(error.message || ""));
    return {
      ok: false,
      message: denied
        ? "Could not load your profile (permission denied). In Supabase, run the migration that adds SELECT on profiles for authenticated users (see repo: supabase/migrations/*profiles_select_own_rls.sql)."
        : "Could not verify your profile. Try refreshing the page or signing out and back in.",
    };
  }
  if (!p) {
    return {
      ok: false,
      message:
        "No profile row found for your account. Sign out and sign in again, or contact support so we can link your profile.",
    };
  }

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

  if (p.role === "seller" && !options.ignoreSellerActiveCap) {
    const { count, error: cErr } = await supabase
      .from("listings")
      .select("*", { count: "exact", head: true })
      .eq("agent_id", uid)
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
