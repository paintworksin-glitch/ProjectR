import { NextResponse } from "next/server";

export const runtime = "nodejs";

function upstreamListingAiUrl() {
  const direct = String(process.env.LISTING_AI_URL || process.env.NEXT_PUBLIC_LISTING_AI_URL || "").trim();
  return direct ? direct.replace(/\/$/, "") : "";
}

/**
 * Proxies listing AI requests to your Supabase Edge Function (or any POST JSON endpoint).
 * Use LISTING_AI_URL on the server so you don't need NEXT_PUBLIC_LISTING_AI_URL in the browser bundle.
 * Example: https://<project>.supabase.co/functions/v1/listing-ai
 */
export async function POST(request) {
  const base = upstreamListingAiUrl();
  if (!base) {
    return NextResponse.json(
      {
        error: "not_configured",
        message:
          "Set LISTING_AI_URL or NEXT_PUBLIC_LISTING_AI_URL to your listing-ai function URL, then redeploy.",
      },
      { status: 503 }
    );
  }

  let body;
  try {
    body = await request.text();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const auth = request.headers.get("authorization");
  const apikey = request.headers.get("apikey");

  const headers = {
    "Content-Type": "application/json",
  };
  if (auth) headers.Authorization = auth;
  if (apikey) headers.apikey = apikey;

  let upstream;
  try {
    upstream = await fetch(base, {
      method: "POST",
      headers,
      body: body || "{}",
    });
  } catch (e) {
    return NextResponse.json({ error: "Upstream unreachable", detail: String(e?.message || e) }, { status: 502 });
  }

  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") || "application/json";

  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": ct.startsWith("application/json") ? "application/json" : ct },
  });
}

/** Lightweight check for dashboards (optional). */
export async function GET() {
  const ok = Boolean(upstreamListingAiUrl());
  return NextResponse.json({ configured: ok });
}
