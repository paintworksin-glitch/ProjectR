"use client";

import { useEffect, useRef, useState } from "react";
import { muxTourMp4ApiPath } from "@/lib/muxTourMp4Fetch.js";
import { buildVideoTourShareText } from "@/lib/videoTourShareText.js";
import { WALogo } from "@/modules/NorthingApp.jsx";

function DownloadIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function tourFileBaseName(listing) {
  const slug = (listing.title || "property")
    .replace(/\s+/g, "-")
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "")
    .slice(0, 72);
  return `northing-tour-${slug || "property"}`;
}

const DOWNLOAD_POLL_MS = 2000;
const DOWNLOAD_MAX_WAIT_MS = 5 * 60 * 1000;
const DOWNLOAD_READY_SHOW_MS = 2800;

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Premium action bar below the Mux player: download MP4 + share to WhatsApp with caption.
 */
export function PropertyVideoTourActions({ listing }) {
  const [waBusy, setWaBusy] = useState(false);
  const [downloadPhase, setDownloadPhase] = useState("idle");
  const [downloadError, setDownloadError] = useState("");
  const downloadPollAbortRef = useRef(null);
  const downloadReadyTimerRef = useRef(null);

  useEffect(
    () => () => {
      downloadPollAbortRef.current?.abort();
      if (downloadReadyTimerRef.current) clearTimeout(downloadReadyTimerRef.current);
    },
    []
  );

  if (!listing?.videoPlaybackId) return null;

  const downloadBusy = downloadPhase === "preparing" || downloadPhase === "ready";

  const downloadVideo = async () => {
    if (downloadBusy) return;
    setDownloadError("");
    const name = `${tourFileBaseName(listing)}.mp4`;
    const probeUrl = muxTourMp4ApiPath(listing.videoPlaybackId, name, { probe: "1" });
    const href = muxTourMp4ApiPath(listing.videoPlaybackId, name);

    const ac = new AbortController();
    downloadPollAbortRef.current = ac;
    setDownloadPhase("preparing");
    const started = Date.now();

    try {
      while (Date.now() - started < DOWNLOAD_MAX_WAIT_MS) {
        if (ac.signal.aborted) return;
        const probe = await fetch(probeUrl, { signal: ac.signal, cache: "no-store" });
        if (probe.ok) {
          downloadPollAbortRef.current = null;
          setDownloadPhase("ready");
          const a = document.createElement("a");
          a.href = href;
          a.download = name;
          a.rel = "noopener";
          document.body.appendChild(a);
          a.click();
          a.remove();
          if (downloadReadyTimerRef.current) clearTimeout(downloadReadyTimerRef.current);
          downloadReadyTimerRef.current = setTimeout(() => {
            downloadReadyTimerRef.current = null;
            setDownloadPhase("idle");
          }, DOWNLOAD_READY_SHOW_MS);
          return;
        }
        if (probe.status !== 404) {
          setDownloadError("Could not prepare the download. Try again in a moment.");
          setDownloadPhase("idle");
          return;
        }
        await sleep(DOWNLOAD_POLL_MS);
      }
      setDownloadError("The file is still being prepared. Try again in a few minutes — the player above works now.");
      setDownloadPhase("idle");
    } catch (e) {
      if (e?.name === "AbortError") return;
      setDownloadError("Could not prepare the download. Check your connection and try again.");
      setDownloadPhase("idle");
    }
  };

  const shareOnWhatsApp = async () => {
    setWaBusy(true);
    try {
      const outName = `${tourFileBaseName(listing)}.mp4`;
      const href = muxTourMp4ApiPath(listing.videoPlaybackId, outName);
      const res = await fetch(href);
      if (!res.ok) {
        if (res.status === 404) {
          window.alert(
            "The file for WhatsApp is still being prepared — the player above works now. Try again in a minute, or open the WhatsApp tab to copy your message."
          );
        } else {
          window.alert("Could not load the video file. Try again in a moment.");
        }
        return;
      }
      const blob = await res.blob();
      const file = new File([blob], outName, { type: blob.type || "video/mp4" });
      const text = buildVideoTourShareText(listing);
      if (navigator.share && typeof navigator.canShare === "function" && navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], title: listing.title, text });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.download = outName;
        a.href = url;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setTimeout(() => window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank"), 400);
      }
    } catch {
      window.alert("Could not share the video. Try Download, then attach the file in WhatsApp.");
    } finally {
      setWaBusy(false);
    }
  };

  const downloadLabel =
    downloadPhase === "preparing" ? "Preparing file…" : downloadPhase === "ready" ? "Ready to download" : "Download video";

  return (
    <div className="property-detail-video-actions" aria-label="Video tour actions">
      <p className="property-detail-video-actions__eyebrow">Save or share</p>
      <p className="property-detail-video-actions__sub">Download the tour file or send it with a ready-to-send message.</p>
      <div className="property-detail-video-actions__row">
        <button
          type="button"
          className="property-detail-video-actions__btn property-detail-video-actions__btn--secondary"
          disabled={downloadBusy}
          onClick={downloadVideo}
        >
          <span className="property-detail-video-actions__btn-icon" aria-hidden>
            <DownloadIcon size={18} />
          </span>
          {downloadLabel}
        </button>
        <button type="button" className="property-detail-video-actions__btn property-detail-video-actions__btn--wa" disabled={waBusy} onClick={shareOnWhatsApp}>
          <span className="property-detail-video-actions__btn-icon property-detail-video-actions__btn-icon--light" aria-hidden>
            <WALogo size={16} />
          </span>
          {waBusy ? "Working…" : "Share on WhatsApp"}
        </button>
      </div>
      {downloadError ? <p className="property-detail-video-actions__hint property-detail-video-actions__hint--error">{downloadError}</p> : null}
    </div>
  );
}
