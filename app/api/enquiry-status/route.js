import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";
import { escapeHtml, safeEmailSubject } from "@/lib/escapeHtml";

const ALLOWED_STATUSES = new Set(["new", "replied", "closed"]);

export async function POST(request) {
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const rate = await checkRateLimit(`enquiry-status:${ip}`, 60_000, 40);
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

  const enquiryId = String(body?.enquiry_id || "");
  const status = String(body?.status || "");
  if (!enquiryId || !ALLOWED_STATUSES.has(status)) {
    return NextResponse.json({ error: "enquiry_id and valid status are required" }, { status: 400 });
  }

  const { data: enquiry, error: enquiryError } = await supabase
    .from("enquiries")
    .select("id, buyer_id, seller_id, listing_id, status")
    .eq("id", enquiryId)
    .single();
  if (enquiryError || !enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });
  if (enquiry.seller_id !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { error: updateError } = await supabase.from("enquiries").update({ status }).eq("id", enquiryId);
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 400 });

  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const [{ data: buyer }, { data: listing }] = await Promise.all([
      supabase.from("profiles").select("name,email").eq("id", enquiry.buyer_id).single(),
      supabase.from("listings").select("title").eq("id", enquiry.listing_id).single(),
    ]);
    if (buyer?.email) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: process.env.RESEND_FROM || "Northing <onboarding@resend.dev>",
            to: [buyer.email],
            subject: safeEmailSubject(`Enquiry update: ${listing?.title || "your property enquiry"}`),
            html: `<p>Hi ${escapeHtml(buyer.name || "there")},</p>
<p>Your enquiry status has been updated to <strong>${escapeHtml(status)}</strong>.</p>
<p>Listing: <strong>${escapeHtml(listing?.title || "Property")}</strong></p>
<p>You can sign in to Northing to view details.</p>`,
          }),
        });
      } catch {
        /* non-fatal */
      }
    }
  }

  return NextResponse.json({ ok: true, status });
}
