"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { normalizeCloudflareStreamCustomerCode } from "@/lib/cloudflareStreamCustomerCode.js";

const Stream = dynamic(() => import("@cloudflare/stream-react").then((m) => m.Stream), { ssr: false });

/**
 * Optional on-video overlay: agent logo + phone on top (logo slot empty if missing), Northing mark bottom-right.
 * Stream is loaded with `dynamic(..., { ssr: false })` and only after mount to avoid hydration mismatch (#425).
 *
 * @param {{ playbackId?: string, onPlay?: () => void, aspectRatio?: string, watermark?: { logoUrl?: string, phone?: string }, style?: import("react").CSSProperties }} props
 */
export function NorthingVideoPlayer({
  playbackId,
  onPlay,
  aspectRatio = "16 / 9",
  watermark,
  style,
  ...rest
}) {
  const { customerCode: _ignoreCustomerCode, src: _ignoreSrc, ...streamRest } = rest;

  const [mounted, setMounted] = useState(false);
  const customerCode = useMemo(
    () => normalizeCloudflareStreamCustomerCode(process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE || ""),
    [],
  );

  const videoUid = useMemo(() => {
    const s = playbackId != null ? String(playbackId).trim() : "";
    if (!s) return "";
    if (s.includes("cloudflarestream.com") || s.includes("videodelivery.net")) {
      try {
        const u = new URL(s.startsWith("http") ? s : `https://${s}`);
        const parts = u.pathname.split("/").filter(Boolean);
        return parts[0] || s;
      } catch {
        return s;
      }
    }
    return s;
  }, [playbackId]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") return;
    if (!mounted || !videoUid) return;
    // eslint-disable-next-line no-console -- intentional dev-only Stream debug
    console.log("[NorthingVideoPlayer]", {
      playbackIdProp: playbackId,
      videoUidForStreamSrc: videoUid,
      customerCodeProp: customerCode || "(empty — Stream uses iframe.cloudflarestream.com fallback)",
      expectedIframeHost: customerCode ? `customer-${customerCode}.cloudflarestream.com` : "iframe.cloudflarestream.com",
    });
  }, [mounted, playbackId, videoUid, customerCode]);

  if (!playbackId || !videoUid) return null;

  if (!mounted) {
    return (
      <div
        style={{
          width: "100%",
          aspectRatio,
          borderRadius: 12,
          minHeight: 200,
          background: "linear-gradient(160deg, #0f0f0f 0%, #262626 55%, #141414 100%)",
        }}
        aria-hidden
      />
    );
  }

  const streamProps = {
    ...streamRest,
    src: videoUid,
    controls: true,
    autoplay: true,
    muted: true,
    startTime: 0,
    primaryColor: "#1a1a1a",
    letterboxColor: "#1a1a1a",
    responsive: true,
    ...(customerCode ? { customerCode } : {}),
    onPlay: onPlay
      ? () => {
          onPlay();
        }
      : undefined,
  };

  const player = (
    <div
      style={{
        width: "100%",
        aspectRatio,
        borderRadius: 12,
        minHeight: 200,
        overflow: "hidden",
        ...(style || {}),
      }}
    >
      <Stream {...streamProps} />
    </div>
  );

  if (!watermark) return player;

  const { logoUrl, phone } = watermark;

  return (
    <div className="northing-mux-watermark-wrap">
      {player}
      <div className="northing-mux-watermark-top" aria-hidden>
        <div className="northing-mux-watermark-top__inner">
          <div className="northing-mux-watermark-logo-slot">
            {logoUrl ? <img src={logoUrl} alt="" className="northing-mux-watermark-logo" /> : null}
          </div>
          {phone != null && String(phone).trim() !== "" ? (
            <span className="northing-mux-watermark-phone">{String(phone)}</span>
          ) : (
            <span className="northing-mux-watermark-phone northing-mux-watermark-phone--empty" />
          )}
        </div>
      </div>
      <div className="northing-mux-watermark-brand" aria-hidden>
        <span className="northing-mux-watermark-brand__text">Northing</span>
      </div>
    </div>
  );
}

/** @deprecated Use NorthingVideoPlayer; kept for existing imports. */
export const NorthingMuxPlayer = NorthingVideoPlayer;
