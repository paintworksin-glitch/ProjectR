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

function cleanRole(role) {
  const r = String(role || "user").toLowerCase();
  return ["user", "seller", "agent", "master", "disabled"].includes(r) ? r : "user";
}

function digits10(phone) {
  const d = String(phone || "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : "";
}

export async function POST(request) {
  const auth = await assertMaster();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const name = String(body?.name || "").trim();
    const email = String(body?.email || "").trim().toLowerCase();
    const phone = String(body?.phone || "").trim();
    const role = cleanRole(body?.role);
    const password = String(body?.password || "").trim();
    const createListing = body?.createListing === true;
    const listing = body?.listing || {};

    if (!email || !password || password.length < 6) {
      return NextResponse.json({ error: "Email and password (min 6 chars) are required" }, { status: 400 });
    }

    let admin;
    try {
      admin = createSupabaseAdminClient();
    } catch (e) {
      return NextResponse.json({ error: adminApiErrorMessage(e) }, { status: 500 });
    }

    let phone10 = null;
    if (String(phone || "").trim()) {
      try {
        phone10 = parseMobile10StrictOrNull(phone);
      } catch {
        return NextResponse.json({ error: PHONE_SERVER_ERROR }, { status: 400 });
      }
      const { data: avail, error: phoneErr } = await admin.rpc("phone_is_available", {
        p_digits: phone10,
        p_exclude: null,
      });
      if (phoneErr) return NextResponse.json({ error: adminApiErrorMessage(phoneErr) }, { status: 400 });
      if (avail === false) {
        return NextResponse.json({ error: "This mobile number is already registered to another account." }, { status: 400 });
      }
    }

    const { data: created, error: createErr } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name },
    });
    if (createErr) return NextResponse.json({ error: adminApiErrorMessage(createErr) }, { status: 400 });
    const newUserId = created?.user?.id;
    if (!newUserId) return NextResponse.json({ error: "User creation failed" }, { status: 400 });

    const { error: profErr } = await admin.from("profiles").upsert(
      {
        id: newUserId,
        name: name || email.split("@")[0],
        email,
        phone: phone10,
        mobile_number: phone10,
        role,
      },
      { onConflict: "id" }
    );
    if (profErr) return NextResponse.json({ error: adminApiErrorMessage(profErr) }, { status: 400 });

    let createdListingId = null;
    if (createListing) {
      const title = String(listing?.title || "").trim();
      const city = String(listing?.city || "").trim();
      const listingType = String(listing?.listingType || "Sale").trim() || "Sale";
      const propertyType = String(listing?.propertyType || "Apartment").trim() || "Apartment";
      const price = Number(listing?.price) || 0;
      if (!title || !city || price <= 0) {
        return NextResponse.json(
          { error: "Listing needs title, city, and valid price" },
          { status: 400 }
        );
      }
      const { data: inserted, error: listingErr } = await admin
        .from("listings")
        .insert({
          agent_id: newUserId,
          title,
          location: city,
          property_type: propertyType,
          listing_type: listingType,
          price,
          status: "Active",
          description: "Listing created by admin dashboard",
          highlights: [],
          photos: [],
          agent_name: name || email.split("@")[0],
          agent_phone: phone10,
          agent_email: email,
          details: {},
        })
        .select("id")
        .single();
      if (listingErr) return NextResponse.json({ error: adminApiErrorMessage(listingErr) }, { status: 400 });
      createdListingId = inserted?.id || null;
    }

    return NextResponse.json({ ok: true, userId: newUserId, listingId: createdListingId });
  } catch (e) {
    return NextResponse.json({ error: adminApiErrorMessage(e) }, { status: 500 });
  }
}
