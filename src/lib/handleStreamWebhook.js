import { NextResponse } from "next/server";
import { verifyStreamWebhookSignature } from "@/lib/cloudflare.js";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { parseStreamPassthroughMeta } from "@/lib/streamVideoPassthrough.js";

/**
 * @param {{ uid?: string, status?: { state?: string }, readyToStream?: boolean, meta?: Record<string, unknown> }} video
 */
async function handleCloudflareStreamVideo(video) {
  const admin = createSupabaseAdminClient();
  const meta = video.meta && typeof video.meta === "object" ? video.meta : {};
  const pt = parseStreamPassthroughMeta(meta);

  const state = video.status?.state;
  const uid = video.uid;

  console.log("[stream-webhook] video event", {
    uid,
    state,
    readyToStream: video.readyToStream,
    hasPassthroughKey: Boolean(meta.passthrough),
    metaName: meta.name,
    ptKind: pt?.k,
  });

  if (state === "ready") {
    if (!uid) {
      console.warn("[stream-webhook] ready but missing uid");
      return NextResponse.json({ ok: true });
    }

    if (pt?.k === "i" && pt?.uid) {
      const { error } = await admin
        .from("profiles")
        .update({
          intro_video_id: uid,
          intro_video_playback_id: uid,
          intro_video_provider: "cloudflare",
          intro_video_status: "ready",
        })
        .eq("id", pt.uid);
      if (error) console.error("[stream-webhook] profile ready update", error);
      return NextResponse.json({ ok: true });
    }

    if (pt?.k === "l" && pt?.lid) {
      const listingId = pt.lid;
      const { data: listing, error: le } = await admin.from("listings").select("id, details").eq("id", listingId).single();
      if (le || !listing) {
        console.warn("[stream-webhook] listing not found for ready", listingId, le?.message);
        return NextResponse.json({ ok: true });
      }

      const details = listing.details && typeof listing.details === "object" ? { ...listing.details } : {};
      delete details.muxPendingUploadId;

      const patch = {
        video_id: uid,
        video_playback_id: uid,
        video_provider: "cloudflare",
        video_status: "ready",
        details,
      };

      const { error: up } = await admin.from("listings").update(patch).eq("id", listingId);
      if (up) console.error("[stream-webhook] listing ready update", up);
      return NextResponse.json({ ok: true });
    }

    console.warn("[stream-webhook] ready video with no matching passthrough", { uid, meta });
    return NextResponse.json({ ok: true });
  }

  if (state === "error") {
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

export async function handleStreamWebhookPost(request) {
  const rawBody = await request.text();

  const cfSecret = (
    process.env.CLOUDFLARE_STREAM_WEBHOOK_SECRET ||
    process.env.CLOUDFLARE_WEBHOOK_SECRET ||
    ""
  ).trim();
  const sigHeader = request.headers.get("Webhook-Signature");
  if (cfSecret) {
    if (!verifyStreamWebhookSignature(rawBody, sigHeader, cfSecret)) {
      console.error("[stream-webhook] invalid Webhook-Signature");
      return NextResponse.json({ error: "invalid signature" }, { status: 400 });
    }
  }

  let data;
  try {
    data = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  if (data?.uid && data?.status) {
    return handleCloudflareStreamVideo(data);
  }

  return NextResponse.json({ ok: true });
}
