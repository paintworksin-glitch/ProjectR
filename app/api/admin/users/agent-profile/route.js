import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { adminApiErrorMessage, createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { PHONE_SERVER_ERROR, parseMobile10StrictOrNull } from "@/lib/phoneDigits";

async function assertMaster() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const { data: me } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
  if (!me || me.role !== "master") return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { user };
}

function trimOrNull(v) {
  const s = String(v ?? "").trim();
  return s === "" ? null : s;
}

export async function POST(request) {
  const auth = await assertMaster();
  if (auth.error) return auth.error;

  let admin;
  try {
    admin = createSupabaseAdminClient();
  } catch (e) {
    return NextResponse.json({ error: adminApiErrorMessage(e) }, { status: 500 });
  }

  try {
    const body = await request.json();
    const targetId = String(body?.targetId || "").trim();
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(targetId)) {
      return NextResponse.json({ error: "Invalid target user id" }, { status: 400 });
    }

    const { data: target, error: fetchErr } = await admin.from("profiles").select("id,role").eq("id", targetId).maybeSingle();
    if (fetchErr) return NextResponse.json({ error: adminApiErrorMessage(fetchErr) }, { status: 400 });
    if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (target.role !== "agent") {
      return NextResponse.json({ error: "Only agent profiles can be edited here" }, { status: 400 });
    }

    const update = {
      agency_name: trimOrNull(body.agencyName),
      address: trimOrNull(body.address),
      website: trimOrNull(body.website),
      logo_url: trimOrNull(body.logoUrl),
      rera_number: trimOrNull(body.reraNumber),
    };

    if (typeof body.agentVerified === "boolean") {
      update.agent_verified = body.agentVerified;
    }

    if (Object.prototype.hasOwnProperty.call(body, "phone")) {
      let phone10;
      try {
        phone10 = parseMobile10StrictOrNull(body.phone);
      } catch {
        return NextResponse.json({ error: PHONE_SERVER_ERROR }, { status: 400 });
      }
      if (phone10) {
        const { data: avail, error: phoneErr } = await admin.rpc("phone_is_available", {
          p_digits: phone10,
          p_exclude: targetId,
        });
        if (phoneErr) return NextResponse.json({ error: adminApiErrorMessage(phoneErr) }, { status: 400 });
        if (avail === false) {
          return NextResponse.json({ error: "This mobile number is already registered to another account." }, { status: 400 });
        }
      }
      update.phone = phone10;
      update.mobile_number = phone10;
    }

    const { error: upErr } = await admin.from("profiles").update(update).eq("id", targetId);
    if (upErr) return NextResponse.json({ error: adminApiErrorMessage(upErr) }, { status: 400 });

    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: adminApiErrorMessage(e) }, { status: 500 });
  }
}
