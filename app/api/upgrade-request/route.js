import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

export async function POST(request) {
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const rate = checkRateLimit(`upgrade-request:${ip}`, 60_000, 10);
  if (!rate.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,name,email,role,plan,agency_name,phone,mobile_number")
    .eq("id", user.id)
    .single();
  if (error || !profile) return NextResponse.json({ error: "Profile not found" }, { status: 404 });

  if (!["seller", "agent"].includes(profile.role)) {
    return NextResponse.json({ error: "Only sellers and agents can request upgrades" }, { status: 400 });
  }

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ error: "Email notifications are not configured" }, { status: 503 });
  }

  const toEmail = process.env.SALES_EMAIL || "hello@northing.in";
  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.RESEND_FROM || "Northing <onboarding@resend.dev>",
      to: [toEmail],
      subject: `Upgrade request from ${profile.name || "Northing user"}`,
      html: `<p>A plan upgrade was requested.</p>
<p><strong>Name:</strong> ${profile.name || "—"}<br/>
<strong>Email:</strong> ${profile.email || "—"}<br/>
<strong>Role:</strong> ${profile.role}<br/>
<strong>Current plan:</strong> ${profile.plan || "free"}<br/>
<strong>Agency:</strong> ${profile.agency_name || "—"}<br/>
<strong>Phone:</strong> ${profile.mobile_number || profile.phone || "—"}<br/>
<strong>User ID:</strong> ${profile.id}</p>`,
    }),
  });

  return NextResponse.json({ ok: true });
}
