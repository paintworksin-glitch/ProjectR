"use client";

import dynamic from "next/dynamic";

const MuxPlayer = dynamic(() => import("@mux/mux-player-react").then((m) => m.default), { ssr: false });

/**
 * Mux playback — theme matches light Northing surfaces (monochrome controls).
 */
export function NorthingMuxPlayer({ playbackId, onPlay, aspectRatio = "16 / 9", ...rest }) {
  if (!playbackId) return null;
  return (
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
        ...(rest.style || {}),
      }}
      onPlay={onPlay}
      {...rest}
    />
  );
}
