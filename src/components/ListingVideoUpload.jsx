"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { NorthingMuxPlayer } from "@/components/NorthingMuxPlayer";
import { readVideoFileMetadata } from "@/lib/clientVideoMetadata";
import { uploadListingTourVideo } from "@/lib/listingVideoUploadClient";

function formatErr(msg) {
  const m = String(msg || "");
  if (/40[03]|Too large|500MB/i.test(m)) return "Video must be under 500MB";
  if (/format|mp4|mov|webm/i.test(m)) return "Please upload mp4, mov or webm";
  if (/5 seconds|least 5/i.test(m)) return "Video must be at least 5 seconds";
  if (/5 minutes|under 5 min|300/i.test(m)) return "Video must be under 5 minutes";
  if (/360|resolution too low|quality too low|480p/i.test(m)) return "Video resolution too low (short edge at least 360px).";
  if (/read video|video metadata|video length|video size/i.test(m)) return "Could not read this video in your browser. Try another file or browser.";
  if (/network|connection|ECONNRESET/i.test(m)) return "Connection error. Please check your internet and try again.";
  if (/429|Too many uploads/i.test(m)) return "Too many uploads. Try again later.";
  return m || "Upload failed. Please try again.";
}

export function ListingVideoUpload({ listingId, form, setForm, showToast, isEdit, pendingVideoFile, onPendingVideoChange }) {
  const [pct, setPct] = useState(0);
  const [stage, setStage] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const uploadAbortRef = useRef(null);

  const refreshForm = useCallback(async () => {
    if (!listingId) return;
    const { data, error } = await supabase.from("listings").select("*").eq("id", listingId).single();
    if (error || !data) return;
    const d = data.details && typeof data.details === "object" ? data.details : {};
    setForm((f) => ({
      ...f,
      photos: data.photos || [],
      muxVideoAssetId: data.video_id || null,
      videoPlaybackId: data.video_playback_id || null,
      videoStatus: data.video_status || "processing",
      videoViewCount: data.video_view_count ?? 0,
      videoFramePhotos: d.videoFramePhotos === true,
    }));
  }, [listingId, setForm]);

  useEffect(() => {
    if (!isEdit || !listingId) return undefined;
    if (form.videoStatus !== "processing" || form.videoPlaybackId) return undefined;
    const id = setInterval(() => {
      refreshForm();
    }, 8000);
    return () => clearInterval(id);
  }, [isEdit, listingId, form.videoStatus, form.videoPlaybackId, refreshForm]);

  const cancel = () => {
    try {
      uploadAbortRef.current?.abort();
    } catch {
      /* ignore */
    }
    setBusy(false);
    setStage("");
    setPct(0);
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !listingId) return;
    setErr("");
    setBusy(true);
    setPct(0);
    setStage("Uploading… 0%");
    try {
      await readVideoFileMetadata(file);
      uploadAbortRef.current = new AbortController();
      await uploadListingTourVideo(listingId, file, {
        signal: uploadAbortRef.current.signal,
        onUploadProgress: (p) => {
          setPct(Math.round(p * 0.45));
          setStage(`Uploading… ${Math.round(p * 0.45)}%`);
        },
      });

      setPct(50);
      setStage("Processing video…");
      setForm((f) => ({ ...f, videoStatus: "processing", videoPlaybackId: null }));
      await refreshForm();
      setPct(85);
      setStage("Almost ready…");
      showToast("Video uploaded — processing on Northing (usually 2–3 minutes)", "success");
      setPct(100);
      setStage("Your video is live ✓");
    } catch (ex) {
      if (String(ex?.message) === "aborted") {
        setErr("Upload cancelled");
      } else {
        let msg = "Upload failed. Please try again.";
        const raw = String(ex?.message || "");
        try {
          const j = JSON.parse(raw);
          if (j.error) msg = formatErr(j.error);
        } catch {
          msg = formatErr(raw);
        }
        setErr(msg);
        showToast(msg, "error");
      }
    } finally {
      setBusy(false);
      setTimeout(() => {
        setPct(0);
        setStage("");
      }, 4000);
    }
  };

  const pickPending = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    try {
      await readVideoFileMetadata(file);
      onPendingVideoChange?.(file);
      showToast("Video selected — it uploads when you save draft or publish", "success");
    } catch (pe) {
      const msg = formatErr(pe?.message || "");
      setErr(msg);
      showToast(msg, "error");
    }
  };

  const remove = async () => {
    if (!listingId) return;
    if (!window.confirm("Remove this video tour from the listing?")) return;
    try {
      const res = await fetch("/api/video/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Delete failed");
      await refreshForm();
      showToast("Video removed", "success");
    } catch (e) {
      showToast(e.message || "Delete failed", "error");
    }
  };

  if (!isEdit) {
    return (
      <div>
        <p style={{ margin: "0 0 12px", fontSize: 13, color: "var(--muted)", lineHeight: 1.55 }}>
          Choose a video now or after you save a draft. <strong>Either photos or a video</strong> is required to publish. Video-only: we use frames for PDFs and WhatsApp after processing.
        </p>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 10 }}>
          <label className="btn-ghost" style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13, cursor: "pointer" }}>
            📁 Choose video tour
            <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/avi" style={{ display: "none" }} onChange={pickPending} />
          </label>
          {pendingVideoFile ? (
            <button type="button" className="btn-outline" style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12 }} onClick={() => onPendingVideoChange?.(null)}>
              Clear video
            </button>
          ) : null}
        </div>
        {pendingVideoFile ? (
          <div
            style={{
              fontSize: 13,
              color: "var(--navy)",
              padding: "10px 12px",
              background: "var(--primary-light)",
              borderRadius: 10,
              border: "1px solid var(--primary-mid)",
              marginBottom: 8,
            }}
          >
            Selected: <strong>{pendingVideoFile.name}</strong> — uploads when you tap <strong>Save draft</strong> or <strong>Publish listing</strong>.
          </div>
        ) : null}
        {err ? <div style={{ fontSize: 12, color: "#DC2626", marginTop: 6 }}>{err}</div> : null}
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
          MP4, MOV, WebM or AVI · Max 500MB · 5s–5min · Short edge ≥360px.
        </p>
      </div>
    );
  }

  return (
    <div>
      {form.videoPlaybackId && form.videoStatus === "ready" ? (
        <div style={{ marginBottom: 14 }}>
          <NorthingMuxPlayer
            playbackId={form.videoPlaybackId}
            aspectRatio="16 / 9"
            onPlay={() => {
              fetch("/api/video/view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ listingId }),
              }).catch(() => {});
            }}
          />
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
            🎥 Views tracked: {form.videoViewCount ?? 0}
          </p>
        </div>
      ) : form.videoStatus === "processing" ? (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "var(--primary-light)",
            border: "1px solid var(--primary-mid)",
            fontSize: 13,
            color: "var(--navy)",
            marginBottom: 12,
          }}
        >
          Processing your video… usually 2–3 minutes
        </div>
      ) : form.videoStatus === "failed" ? (
        <div style={{ padding: 12, borderRadius: 10, background: "#FEF2F2", color: "#991B1B", fontSize: 13, marginBottom: 12 }}>
          Video processing failed. Please try uploading again.
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 10 }}>
        <label className="btn-ghost" style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13, cursor: busy ? "wait" : "pointer" }}>
          {busy ? "Working…" : form.videoPlaybackId ? "Replace video tour" : "Add Video Tour"}
          <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo,video/avi" disabled={busy} style={{ display: "none" }} onChange={upload} />
        </label>
        {busy && (
          <button type="button" className="btn-outline" style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12 }} onClick={cancel}>
            Cancel
          </button>
        )}
        {form.muxVideoAssetId || form.videoPlaybackId ? (
          <button type="button" className="btn-danger" style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12 }} onClick={remove} disabled={busy}>
            Delete video
          </button>
        ) : null}
      </div>

      {busy && (
        <div style={{ marginBottom: 10 }}>
          <div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)", transition: "width 0.2s" }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{stage}</div>
        </div>
      )}

      {err ? <div style={{ fontSize: 12, color: "#DC2626", marginTop: 6 }}>{err}</div> : null}
      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8, lineHeight: 1.5 }}>
        Optional if you already have photos · MP4, MOV, WebM or AVI · Max 500MB · 5s–5min · Short edge ≥360px. Video-only: stills for PDFs/WhatsApp after processing.
      </p>
    </div>
  );
}
