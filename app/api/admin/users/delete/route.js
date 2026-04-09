import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

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

export async function POST(request) {
  const auth = await assertMaster();
  if (auth.error) return auth.error;

  try {
    const body = await request.json();
    const targetId = String(body?.targetId || "").trim();
    const hardDelete = body?.hardDelete !== false;
    if (!targetId) return NextResponse.json({ error: "targetId is required" }, { status: 400 });
    if (targetId === auth.user.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    if (hardDelete) {
      // Best-effort cleanup for tables not linked by FK to auth.users.
      await admin.from("profiles").delete().eq("id", targetId);
      const { error } = await admin.auth.admin.deleteUser(targetId);
      if (error) return NextResponse.json({ error: error.message }, { status: 400 });
      return NextResponse.json({ ok: true, mode: "hard-delete" });
    }

    const { error } = await admin.from("profiles").update({ role: "disabled" }).eq("id", targetId);
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    return NextResponse.json({ ok: true, mode: "disabled" });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Failed to remove user" }, { status: 500 });
  }
}
