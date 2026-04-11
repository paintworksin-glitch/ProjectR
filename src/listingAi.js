/**
 * Listing AI calls this app at `/api/listing-ai`, which forwards to your Supabase Edge Function.
 * Set **LISTING_AI_URL** (server-only, recommended) or **NEXT_PUBLIC_LISTING_AI_URL** on Vercel, e.g.
 * https://<project>.supabase.co/functions/v1/listing-ai
 *
 * Do not put Anthropic keys in the Next app — only on the edge function (ANTHROPIC_API_KEY).
 */

/**
 * In the browser we always route via `/api/listing-ai` (server may use LISTING_AI_URL only).
 * On the server, true only if either env is set (SSR / tests).
 */
export const listingAiConfigured = () => {
  if (typeof window !== "undefined") return true;
  try {
    const server =
      String((typeof process !== "undefined" && process.env?.LISTING_AI_URL) || "").trim() ||
      String((typeof process !== "undefined" && process.env?.NEXT_PUBLIC_LISTING_AI_URL) || "").trim();
    return Boolean(server);
  } catch {
    return false;
  }
};

const anonKey = () => {
  try {
    return String((typeof process !== "undefined" && process.env?.NEXT_PUBLIC_SUPABASE_ANON_KEY) || "").trim();
  } catch {
    return "";
  }
};

async function postListingAi(supabase, body) {
  if (typeof window === "undefined") {
    return { ok: false, error: "not_configured" };
  }
  const {
    data: { session },
  } = await supabase.auth.getSession();
  const headers = {
    "Content-Type": "application/json",
  };
  const key = anonKey();
  if (key) headers.apikey = key;
  if (session?.access_token) headers.Authorization = `Bearer ${session.access_token}`;
  const res = await fetch("/api/listing-ai", {
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
    if (res.status === 503 && (data?.error === "not_configured" || data?.message?.includes("LISTING_AI_URL"))) {
      return { ok: false, error: "not_configured" };
    }
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
  reason: "Could not score",
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

