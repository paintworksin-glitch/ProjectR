"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react").then((m) => m.default), { ssr: false });

/**
 * Optional on-video overlay: agent logo + phone on top (logo slot empty if missing), Northing mark bottom-right.
 * Does not change playback; pointer-events none so controls stay usable.
 *
 * MuxPlayer is `ssr: false`; rendering it during SSR would not match the client tree and can crash hydration.
 * We show a stable placeholder until after mount, then render the player.
 */
export function NorthingMuxPlayer({
  playbackId,
  onPlay,
  aspectRatio = "16 / 9",
  watermark,
  style,
  ...rest
}) {
  const [mounted, setMounted] = useState(false);
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

  const player = (
    <MuxPlayer
      playbackId={playbackId}
      streamType="on-demand"
      autoPlay="muted"
      thumbnailTime={0}
      accentColor="#1a1a1a"
      style={{
        width: "100%",
        aspectRatio,
        borderRadius: 12,
        minHeight: 200,
        ...(style || {}),
      }}
      onPlay={onPlay}
      {...rest}
    />
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
