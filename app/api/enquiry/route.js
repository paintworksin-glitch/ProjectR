import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

/**
 * POST: create enquiry (authenticated buyer) + optional owner email via Resend.
 */
export async function POST(request) {
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const rate = checkRateLimit(`enquiry:${ip}`, 60_000, 20);
  if (!rate.ok) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const listingId = body?.listing_id;
  const message = String(body?.message || "").trim();
  if (!listingId || !message) return NextResponse.json({ error: "listing_id and message required" }, { status: 400 });

  const { data: listing, error: le } = await supabase.from("listings").select("id, title, agent_id, agent_name").eq("id", listingId).single();
  if (le || !listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

  const sellerId = listing.agent_id;
  if (!sellerId) return NextResponse.json({ error: "Invalid listing" }, { status: 400 });
  if (sellerId === user.id) return NextResponse.json({ error: "Cannot enquire on your own listing" }, { status: 400 });

  const { data: buyerProfile } = await supabase.from("profiles").select("name, mobile_number, phone, email").eq("id", user.id).single();
  const { data: sellerProfile } = await supabase.from("profiles").select("email, name").eq("id", sellerId).single();

  const { data: inserted, error: insErr } = await supabase
    .from("enquiries")
    .insert({
      listing_id: listingId,
      buyer_id: user.id,
      seller_id: sellerId,
      message,
      status: "new",
    })
    .select("id")
    .single();

  if (insErr) return NextResponse.json({ error: insErr.message }, { status: 400 });

  const origin = process.env.NEXT_PUBLIC_SITE_URL || (request.headers.get("origin") || "").replace(/\/$/, "") || "";
  const listingUrl = origin ? `${origin}/property/${listingId}` : `/property/${listingId}`;

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey && sellerProfile?.email) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.RESEND_FROM || "Northing <onboarding@resend.dev>",
          to: [sellerProfile.email],
          subject: `New enquiry on ${listing.title || "your Northing listing"}`,
          html: `<p>You have a new enquiry on <strong>${listing.title || "your listing"}</strong>.</p>
<p><strong>From:</strong> ${buyerProfile?.name || "Buyer"}<br/>
<strong>Mobile:</strong> ${buyerProfile?.mobile_number || buyerProfile?.phone || "—"}<br/>
<strong>Message:</strong></p><p>${message.replace(/</g, "&lt;")}</p>
<p><a href="${listingUrl}">View listing</a></p>`,
        }),
      });
    } catch {
      /* non-fatal */
    }
  }

  return NextResponse.json({ ok: true, id: inserted?.id });
}
