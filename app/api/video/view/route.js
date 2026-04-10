import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export const runtime = "nodejs";

/** Increment listing or intro video view count (best-effort analytics). */
export async function POST(request) {
  try {
    const body = await request.json().catch(() => ({}));
    const listingId = body.listingId ? String(body.listingId) : null;
    const introUserId = body.introUserId ? String(body.introUserId) : null;

    const admin = createSupabaseAdminClient();

    if (listingId) {
      const { data: cur } = await admin.from("listings").select("video_view_count, video_playback_id").eq("id", listingId).single();
      if (!cur?.video_playback_id) return NextResponse.json({ ok: false });
      const n = (cur.video_view_count || 0) + 1;
      await admin.from("listings").update({ video_view_count: n }).eq("id", listingId);
      return NextResponse.json({ ok: true });
    }

    if (introUserId) {
      const { data: cur } = await admin.from("profiles").select("intro_video_view_count, intro_video_playback_id").eq("id", introUserId).single();
      if (!cur?.intro_video_playback_id) return NextResponse.json({ ok: false });
      const n = (cur.intro_video_view_count || 0) + 1;
      await admin.from("profiles").update({ intro_video_view_count: n }).eq("id", introUserId);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "listingId or introUserId" }, { status: 400 });
  } catch (e) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
