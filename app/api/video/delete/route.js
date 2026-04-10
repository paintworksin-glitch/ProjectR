import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { videoProvider } from "@/lib/videoProvider";

export const runtime = "nodejs";

export async function POST(request) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();
    if (authErr || !user) return NextResponse.json({ error: "Sign in required" }, { status: 401 });

    const body = await request.json().catch(() => ({}));
    const listingId = body.listingId ? String(body.listingId) : null;
    const intro = Boolean(body.introVideo);
    const master = Boolean(body.master);
    const targetUserId = body.targetUserId ? String(body.targetUserId) : null;

    const admin = createSupabaseAdminClient();

    if (master) {
      const { data: prof, error: pe } = await supabase.from("profiles").select("role").eq("id", user.id).single();
      if (pe || prof?.role !== "master") {
        return NextResponse.json({ error: "Not allowed" }, { status: 403 });
      }
    }

    if (intro) {
      const uid = master && targetUserId ? targetUserId : user.id;
      const { data: row, error } = await admin.from("profiles").select("intro_video_id").eq("id", uid).single();
      if (error || !row) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
      if (!master && uid !== user.id) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

      if (row.intro_video_id) {
        try {
          await videoProvider.delete(row.intro_video_id);
        } catch (e) {
          console.warn("mux delete intro", e);
        }
      }
      await admin
        .from("profiles")
        .update({
          intro_video_id: null,
          intro_video_playback_id: null,
          intro_video_status: "processing",
          intro_video_view_count: 0,
        })
        .eq("id", uid);
      return NextResponse.json({ ok: true });
    }

    if (!listingId) return NextResponse.json({ error: "listingId required" }, { status: 400 });

    const { data: listing, error: le } = await admin.from("listings").select("id, agent_id, video_id, photos, details").eq("id", listingId).single();
    if (le || !listing) return NextResponse.json({ error: "Listing not found" }, { status: 404 });

    if (!master && listing.agent_id !== user.id) {
      return NextResponse.json({ error: "Not allowed" }, { status: 403 });
    }

    if (listing.video_id) {
      try {
        await videoProvider.delete(listing.video_id);
      } catch (e) {
        console.warn("mux delete listing", e);
      }
    }

    const details = listing.details && typeof listing.details === "object" ? { ...listing.details } : {};
    delete details.videoFramePhotos;
    delete details.muxPendingUploadId;

    let nextPhotos = Array.isArray(listing.photos) ? [...listing.photos] : [];
    nextPhotos = nextPhotos.filter((u) => typeof u !== "string" || !u.includes("image.mux.com"));

    await admin
      .from("listings")
      .update({
        video_id: null,
        video_playback_id: null,
        video_status: "processing",
        video_view_count: 0,
        photos: nextPhotos,
        details,
      })
      .eq("id", listingId);

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("video delete", e);
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 500 });
  }
}
