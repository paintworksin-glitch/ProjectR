"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";

const StreamLazy = dynamic(
  () => import("@cloudflare/stream-react").then((m) => m.Stream),
  { ssr: false },
);

function getCustomerCode() {
  return (process.env.NEXT_PUBLIC_CLOUDFLARE_STREAM_CUSTOMER_CODE || "").trim();
}

/**
 * Optional on-video overlay: agent logo + phone on top (logo slot empty if missing), Northing mark bottom-right.
 * Player is `ssr: false`; rendering during SSR would not match the client tree and can crash hydration.
 * We show a stable placeholder until after mount, then render the player.
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
  const [mounted, setMounted] = useState(false);
  const customerCode = useMemo(() => getCustomerCode(), []);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!playbackId) return null;

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
    ...rest,
    src: playbackId,
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
      <StreamLazy {...streamProps} />
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
