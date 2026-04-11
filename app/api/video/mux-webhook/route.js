import { NextResponse } from "next/server";
import { createMuxClient } from "@/lib/mux.js";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
export const runtime = "nodejs";

function parsePassthrough(raw) {
  if (!raw || typeof raw !== "string") return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function publicPlaybackId(asset) {
  const ids = asset?.playback_ids || asset?.playbackIds || [];
  const pub = ids.find((p) => p.policy === "public" || p.policy === "signed");
  return pub?.id || ids[0]?.id || null;
}

export async function POST(request) {
  const rawBody = await request.text();
  let event;
  try {
    const secret = (process.env.MUX_WEBHOOK_SECRET || "").trim();
    if (secret) {
      const mux = createMuxClient();
      const headers = Object.fromEntries(request.headers.entries());
      event = mux.webhooks.unwrap(rawBody, headers);
    } else {
      event = JSON.parse(rawBody);
    }
  } catch (e) {
    console.error("mux webhook verify", e);
    return NextResponse.json({ error: "invalid signature" }, { status: 400 });
  }

  const type = event?.type || event?.event;
  const asset = event?.data?.id ? event.data : event?.data?.object?.id ? event.data.object : event?.data;
  if (!asset?.id) {
    return NextResponse.json({ ok: true });
  }

  const admin = createSupabaseAdminClient();
  const pt = parsePassthrough(asset.passthrough);

  if (type === "video.asset.ready") {
    const playbackId = publicPlaybackId(asset);

    if (pt?.k === "i" && pt?.uid) {
      const { error } = await admin
        .from("profiles")
        .update({
          intro_video_id: asset.id,
          intro_video_playback_id: playbackId,
          intro_video_provider: "mux",
          intro_video_status: playbackId ? "ready" : "failed",
        })
        .eq("id", pt.uid);
      if (error) console.error("profile video ready", error);
      return NextResponse.json({ ok: true });
    }

    if (pt?.k === "l" && pt?.lid) {
      const listingId = pt.lid;
      const { data: listing, error: le } = await admin.from("listings").select("id, details").eq("id", listingId).single();
      if (le || !listing) {
        return NextResponse.json({ ok: true });
      }

      const details = listing.details && typeof listing.details === "object" ? { ...listing.details } : {};
      delete details.muxPendingUploadId;

      const patch = {
        video_id: asset.id,
        video_playback_id: playbackId,
        video_provider: "mux",
        video_status: playbackId ? "ready" : "failed",
        details,
      };

      /*
       * Reserved for AI frame selection — not active.
       * Video-only listings no longer auto-fill photos; PDF uses a video QR callout instead.
       *
       * if (pt.pe === 1 && photosNow.length === 0 && playbackId && duration > 0) {
       *   const times = [0.1, 0.2, 0.35, 0.5, 0.65, 0.8].map((p) => Math.min(duration * p, Math.max(duration - 0.5, 0)));
       *   const urls = times.map((t) => videoProvider.getThumbnailUrl(playbackId, t));
       *   patch.photos = urls;
       *   details.videoFramePhotos = true;
       *   patch.details = details;
       * }
       */

      const { error: up } = await admin.from("listings").update(patch).eq("id", listingId);
      if (up) console.error("listing video ready", up);
      return NextResponse.json({ ok: true });
    }
  }

  if (type === "video.asset.errored") {
    if (pt?.k === "i" && pt?.uid) {
      await admin
        .from("profiles")
        .update({ intro_video_status: "failed", intro_video_playback_id: null })
        .eq("id", pt.uid);
    } else if (pt?.k === "l" && pt?.lid) {
      await admin.from("listings").update({ video_status: "failed", video_playback_id: null }).eq("id", pt.lid);
    }
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ ok: true });
}
