/**
 * Listing AI calls a server-side endpoint (e.g. Supabase Edge Function).
 * Do not put Anthropic or other LLM API keys in VITE_* — they ship in the browser bundle.
 *
 * Set NEXT_PUBLIC_LISTING_AI_URL (Next.js) or VITE_LISTING_AI_URL (Vite) to the function URL, e.g.
 * https://<project>.supabase.co/functions/v1/listing-ai
 */

const listingAiBaseUrl = () => {
  try {
    const u = String(
      (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LISTING_AI_URL) ||
        (typeof import.meta !== "undefined" && import.meta.env?.VITE_LISTING_AI_URL) ||
        ""
    ).trim();
    return u ? u.replace(/\/$/, "") : "";
  } catch {
    return "";
  }
};

export const listingAiConfigured = () => Boolean(listingAiBaseUrl());

const anonKey = () => {
  try {
    return String(
      (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) ||
        (typeof import.meta !== "undefined" && import.meta.env?.VITE_SUPABASE_ANON_KEY) ||
        ""
    ).trim();
  } catch {
    return "";
  }
};

async function postListingAi(supabase, body) {
  const base = listingAiBaseUrl();
  if (!base) return { ok: false, error: "not_configured" };
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers = {
    "Content-Type": "application/json",
  };
  const key = anonKey();
  if (key) headers.apikey = key;
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  const res = await fetch(base, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }
  if (!res.ok) {
    return {
      ok: false,
      error: data?.error || data?.message || text || `HTTP ${res.status}`,
    };
  }
  return { ok: true, data };
}

const defaultScores = () => ({
  overall: 5,
  lighting: 5,
  angle: 5,
  appeal: 5,
  clarity: 5,
  reason: listingAiConfigured()
    ? "Could not score"
    : "Set NEXT_PUBLIC_LISTING_AI_URL and deploy listing-ai edge function",
});

export async function scorePhotoWithListingAi(supabase, base64, mediaType) {
  if (!listingAiConfigured()) return defaultScores();
  const { ok, data, error } = await postListingAi(supabase, {
    action: "score_photo",
    base64,
    media_type: mediaType,
  });
  if (!ok || !data?.scores) {
    return { ...defaultScores(), reason: error || data?.reason || "Could not score" };
  }
  return data.scores;
}

export async function generateListingAiDescription(supabase, form) {
  if (!listingAiConfigured()) return null;
  const payload = {
    title: form.title,
    location: form.location,
    propertyType: form.propertyType,
    listingType: form.listingType,
    price: form.price,
    sizesqft: form.sizesqft,
    bedrooms: form.bedrooms,
    bathrooms: form.bathrooms,
    furnishingStatus: form.furnishingStatus,
    parkingType: form.parkingType,
    highlights: form.highlights || [],
    description: form.description,
  };
  const { ok, data, error } = await postListingAi(supabase, {
    action: "describe",
    form: payload,
  });
  if (!ok) {
    console.warn("listing-ai describe:", error);
    return null;
  }
  const text = (data?.text || "").trim();
  return text || null;
}
