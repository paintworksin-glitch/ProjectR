"use client";

import { useEffect, useRef, useState } from "react";
import { muxTourMp4ApiPath, muxTourThumbnailDownloadApiPath } from "@/lib/muxTourMp4Fetch.js";
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

async function ensureListingMp4(listingId, playbackId, signal) {
  if (!listingId) return;
  try {
    await fetch("/api/video/ensure-mp4", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, playbackId }),
      signal,
    });
  } catch {
    /* non-fatal */
  }
}

/**
 * Premium action bar below the Mux player: download MP4 + share to WhatsApp with caption.
 */
export function PropertyVideoTourActions({ listing }) {
  const [waBusy, setWaBusy] = useState(false);
  const [downloadPhase, setDownloadPhase] = useState("idle");
  const [downloadError, setDownloadError] = useState("");
  const [downloadInfo, setDownloadInfo] = useState("");
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

  const downloadBusy = downloadPhase === "saving_preview" || downloadPhase === "preparing" || downloadPhase === "ready";

  const downloadVideo = async () => {
    if (downloadBusy) return;
    setDownloadError("");
    setDownloadInfo("");

    const base = tourFileBaseName(listing);
    const mp4Name = `${base}.mp4`;
    const previewName = `${base}-hd-preview.jpg`;
    const probeUrl = muxTourMp4ApiPath(listing.videoPlaybackId, mp4Name, { probe: "1" });
    const mp4Href = muxTourMp4ApiPath(listing.videoPlaybackId, mp4Name);
    const thumbHref = muxTourThumbnailDownloadApiPath(listing.videoPlaybackId, previewName, { w: 1920, time: 1 });

    const ac = new AbortController();
    downloadPollAbortRef.current = ac;
    setDownloadPhase("saving_preview");

    const thumbA = document.createElement("a");
    thumbA.href = thumbHref;
    thumbA.download = previewName;
    thumbA.rel = "noopener";
    document.body.appendChild(thumbA);
    thumbA.click();
    thumbA.remove();

    await ensureListingMp4(listing.id, listing.videoPlaybackId, ac.signal);

    if (ac.signal.aborted) return;
    setDownloadPhase("preparing");
    setDownloadInfo("An HD JPG from this tour is saving now (instant, like a photo). The full MP4 downloads next when encoding finishes.");

    const started = Date.now();

    try {
      while (Date.now() - started < DOWNLOAD_MAX_WAIT_MS) {
        if (ac.signal.aborted) return;
        const probe = await fetch(probeUrl, { signal: ac.signal, cache: "no-store" });
        if (probe.ok) {
          downloadPollAbortRef.current = null;
          setDownloadInfo("");
          setDownloadPhase("ready");
          const a = document.createElement("a");
          a.href = mp4Href;
          a.download = mp4Name;
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
      setDownloadError("The MP4 is still encoding on Mux (the player above uses a faster stream). Try again in a few minutes.");
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
      await ensureListingMp4(listing.id, listing.videoPlaybackId, undefined);
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
    downloadPhase === "saving_preview"
      ? "Saving HD preview…"
      : downloadPhase === "preparing"
        ? "Preparing MP4…"
        : downloadPhase === "ready"
          ? "Ready to download"
          : "Download tour";

  return (
    <div className="property-detail-video-actions" aria-label="Video tour actions">
      <p className="property-detail-video-actions__eyebrow">Save or share</p>
      <p className="property-detail-video-actions__sub">
        Get an HD still from the tour instantly, then the full video file — streaming is always fastest; MP4 encoding can take a minute.
      </p>
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
      {downloadInfo ? <p className="property-detail-video-actions__hint">{downloadInfo}</p> : null}
      {downloadError ? <p className="property-detail-video-actions__hint property-detail-video-actions__hint--error">{downloadError}</p> : null}
    </div>
  );
}
