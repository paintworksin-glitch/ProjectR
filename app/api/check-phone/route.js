import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rateLimit";
import { adminApiErrorMessage, createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { digits10From } from "@/lib/phoneDigits";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request) {
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const rate = await checkRateLimit(`check-phone:${ip}`, 60_000, 5);
  if (!rate.ok) {
    console.warn("[check-phone] rate limit exceeded", { ip });
    return NextResponse.json({ error: "Too many requests" }, { status: 429 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const digits = digits10From(body?.digits ?? body?.p_digits ?? "");
  const excludeRaw = body?.excludeUserId ?? body?.p_exclude ?? null;
  const excludeUserId =
    excludeRaw != null && String(excludeRaw).length > 0 && UUID_RE.test(String(excludeRaw))
      ? String(excludeRaw)
      : null;

  if (!digits || digits.length !== 10) {
    return NextResponse.json({ error: "Invalid digits" }, { status: 400 });
  }

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    console.error("[check-phone] admin client", e?.message || e);
    return NextResponse.json({ error: adminApiErrorMessage(e) }, { status: 500 });
  }

  const { data, error } = await admin.rpc("phone_is_available", {
    p_digits: digits,
    p_exclude: excludeUserId,
  });

  if (error) {
    console.error("[check-phone] rpc error", error.message);
    return NextResponse.json({ error: "Could not verify" }, { status: 503 });
  }

  return NextResponse.json({ available: data === true });
}
