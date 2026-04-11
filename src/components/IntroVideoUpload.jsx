"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { NorthingMuxPlayer } from "@/components/NorthingMuxPlayer";
import { readVideoFileMetadata } from "@/lib/clientVideoMetadata";
import { uploadIntroVideo } from "@/lib/listingVideoUploadClient";
import { formatVideoUploadError } from "@/lib/videoUploadUserMessages.js";

export function IntroVideoUpload({ userId, showToast }) {
  const [playbackId, setPlaybackId] = useState(null);
  const [status, setStatus] = useState("processing");
  const [views, setViews] = useState(0);
  const [busy, setBusy] = useState(false);
  const [pct, setPct] = useState(0);
  const [stage, setStage] = useState("");
  const [err, setErr] = useState("");
  const uploadAbortRef = useRef(null);

  const load = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("profiles")
      .select("intro_video_playback_id, intro_video_status, intro_video_view_count")
      .eq("id", userId)
      .single();
    if (!data) return;
    setPlaybackId(data.intro_video_playback_id || null);
    setStatus(data.intro_video_status || "processing");
    setViews(data.intro_video_view_count ?? 0);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (status !== "processing" || playbackId) return undefined;
    const id = setInterval(load, 8000);
    return () => clearInterval(id);
  }, [status, playbackId, load]);

  const cancel = () => {
    uploadAbortRef.current?.abort();
    setBusy(false);
    setPct(0);
    setStage("");
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErr("");
    setBusy(true);
    setPct(0);
    setStage("Uploading… 0%");
    try {
      let probe;
      try {
        probe = await readVideoFileMetadata(file);
      } catch (pe) {
        const msg = formatVideoUploadError(pe?.message || "");
        setErr(msg);
        showToast(msg, "error");
        setBusy(false);
        return;
      }
      uploadAbortRef.current = new AbortController();
      await uploadIntroVideo(file, {
        signal: uploadAbortRef.current.signal,
        onUploadProgress: (pct) => {
          const p = Math.round(pct * 0.45);
          setPct(p);
          setStage(`Uploading… ${p}%`);
        },
      });
      setPct(55);
      setStage("Processing video…");
      setStatus("processing");
      setPlaybackId(null);
      showToast("Intro video uploaded — processing (usually 2–3 minutes)", "success");
      await load();
      setPct(100);
      setStage("Your video is live ✓");
    } catch (ex) {
      if (String(ex?.message) !== "aborted") {
        let msg = "Upload failed. Please try again.";
        const raw = String(ex?.message || "");
        try {
          const j = JSON.parse(raw);
          if (j.error) msg = formatVideoUploadError(j.error);
        } catch {
          msg = formatVideoUploadError(raw);
        }
        setErr(msg);
        showToast(msg, "error");
      }
    } finally {
      setBusy(false);
      setTimeout(() => {
        setPct(0);
        setStage("");
      }, 3500);
    }
  };

  const remove = async () => {
    if (!window.confirm("Remove your introduction video?")) return;
    try {
      const res = await fetch("/api/video/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ introVideo: true }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Delete failed");
      await load();
      showToast("Introduction video removed", "success");
    } catch (e) {
      showToast(e.message || "Delete failed", "error");
    }
  };

  return (
    <div style={{ marginTop: 24, paddingTop: 20, borderTop: "1px solid var(--border)" }}>
      <h3 style={{ margin: "0 0 10px", fontSize: 12, fontWeight: 700, color: "var(--green)", textTransform: "uppercase", letterSpacing: 1 }}>Introduction Video</h3>
      <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 12, lineHeight: 1.55 }}>
        Vertical 9:16 · Max 60 seconds · Optional. Shown on your public profile.
      </p>

      {playbackId && status !== "failed" ? (
        <div style={{ marginBottom: 14 }}>
          <NorthingMuxPlayer
            playbackId={playbackId}
            aspectRatio="9 / 16"
            style={{ maxWidth: 280, margin: "0 auto" }}
            onPlay={() => {
              fetch("/api/video/view", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ introUserId: userId }),
              }).catch(() => {});
            }}
          />
          {status === "processing" ? (
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Encoding — refresh if the player does not start.</p>
          ) : (
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>Views: {views}</p>
          )}
        </div>
      ) : status === "processing" && !playbackId ? (
        <div
          style={{
            padding: 16,
            borderRadius: 12,
            background: "var(--primary-light)",
            border: "1px solid var(--primary-mid)",
            fontSize: 13,
            marginBottom: 12,
          }}
        >
          Processing your video... usually 2-3 minutes
        </div>
      ) : status === "failed" ? (
        <div style={{ padding: 12, borderRadius: 10, background: "#FEF2F2", color: "#991B1B", fontSize: 13, marginBottom: 12 }}>
          Video processing failed. Please try uploading again.
        </div>
      ) : null}

      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <label className="btn-ghost" style={{ padding: "10px 18px", borderRadius: 10, fontSize: 13, cursor: busy ? "wait" : "pointer" }}>
          {busy ? "Working…" : playbackId ? "Replace introduction video" : "Add Introduction Video"}
          <input type="file" accept="video/mp4,video/quicktime,video/webm,video/x-msvideo" disabled={busy} style={{ display: "none" }} onChange={upload} />
        </label>
        {busy && (
          <button type="button" className="btn-outline" style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12 }} onClick={cancel}>
            Cancel
          </button>
        )}
        {playbackId ? (
          <button type="button" className="btn-danger" style={{ padding: "8px 14px", borderRadius: 10, fontSize: 12 }} onClick={remove} disabled={busy}>
            Delete video
          </button>
        ) : null}
      </div>
      {busy && (
        <div style={{ marginTop: 10 }}>
          <div style={{ height: 8, borderRadius: 999, background: "var(--border)", overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: "var(--primary)", transition: "width 0.2s" }} />
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>{stage}</div>
        </div>
      )}
      {err ? <div style={{ fontSize: 12, color: "#DC2626", marginTop: 8 }}>{err}</div> : null}
    </div>
  );
}
