/**
 * PostgREST returns raw messages when `enquiries` is missing from the schema cache.
 */
export function parseEnquiriesTableError(err) {
  const raw = String(err?.message ?? err?.error ?? err ?? "");
  const lower = raw.toLowerCase();
  const missing =
    (lower.includes("could not find the table") && lower.includes("enquiries")) ||
    (lower.includes("schema cache") && lower.includes("enquiries"));

  if (missing) {
    return {
      isMissingTable: true,
      message:
        "Enquiries aren’t available yet—the database table isn’t deployed on this project. Ask your administrator to run the Northing Supabase migrations, then reload.",
    };
  }
  return { isMissingTable: false, message: raw || "Could not load enquiries." };
}
