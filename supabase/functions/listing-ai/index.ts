// Supabase Edge Function: set ANTHROPIC_API_KEY as a secret (never in the frontend).
// Deploy: supabase functions deploy listing-ai
// Secrets: supabase secrets set ANTHROPIC_API_KEY=sk-ant-api03-...

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const anthropicKey = Deno.env.get("ANTHROPIC_API_KEY") ?? "";

  if (!anthropicKey) {
    return new Response(
      JSON.stringify({ error: "ANTHROPIC_API_KEY not set on function" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userErr,
  } = await supabase.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const action = body.action as string;

  if (action === "score_photo") {
    const base64 = body.base64 as string;
    const mediaType = (body.media_type as string) || "image/jpeg";
    if (!base64) {
      return new Response(JSON.stringify({ error: "Missing base64" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
              {
                type: "text",
                text: `You are a real estate photography expert. Score this property photo for use as a listing cover image. Rate each from 1-10: lighting, angle, appeal, clarity. Respond ONLY with valid JSON no markdown: {"lighting":7,"angle":8,"appeal":9,"clarity":8,"overall":8,"reason":"one sentence"}`,
              },
            ],
          },
        ],
      }),
    });

    const data = await res.json();
    const text = (data as { content?: { text?: string }[] })?.content?.[0]?.text || "{}";
    let scores: Record<string, unknown>;
    try {
      scores = JSON.parse(String(text).replace(/```json|```/g, "").trim());
    } catch {
      scores = {};
    }
    return new Response(JSON.stringify({ scores }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (action === "describe") {
    const form = body.form as Record<string, unknown> | undefined;
    if (!form) {
      return new Response(JSON.stringify({ error: "Missing form" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const priceLabel =
      form.listingType === "Rent"
        ? `₹${form.price}/month (rent)`
        : `₹${form.price} (sale)`;
    const facts = [
      `Title: ${form.title || "—"}`,
      `Location: ${form.location || "—"}`,
      `Property: ${form.propertyType || "—"}, Listing: ${form.listingType || "—"}`,
      `Price: ${priceLabel}`,
      `Size: ${form.sizesqft ? `${form.sizesqft} sqft` : "—"}`,
      `Beds/Baths: ${form.bedrooms || "—"} / ${form.bathrooms || "—"}`,
      `Furnishing: ${form.furnishingStatus || "—"}`,
      `Parking: ${form.parkingType || "—"}`,
      `Highlights: ${Array.isArray(form.highlights) ? form.highlights.slice(0, 6).join("; ") : "—"}`,
    ].join("\n");

    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": anthropicKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `You write concise, trustworthy property blurbs for an Indian real estate marketplace (Northing).\n\nListing facts:\n${facts}\n\nAgent description (use only as context; do not contradict stated facts):\n${String(form.description || "").slice(0, 2000)}\n\nWrite 2–3 short paragraphs (under 130 words total) for buyers: lifestyle, location context, and why this listing matters. Professional plain English. No markdown, no bullet symbols, no invented amenities or legal claims. If facts are thin, stay general and honest.`,
          },
        ],
      }),
    });

    const data = await res.json();
    const text = ((data as { content?: { text?: string }[] })?.content?.[0]?.text || "").trim();
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ error: "Unknown action" }), {
    status: 400,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
