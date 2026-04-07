"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { G } from "./globalStyles.js";

const roleLabel = (r) => (r === "user" ? "Buyer" : r === "seller" ? "Seller" : r === "agent" ? "Agent" : r);

export default function ProfilePageClient({ currentUser, showToast, onRefresh }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    mobile_number: "",
    rera_number: "",
    agency_name: "",
    city: "",
    avatar_url: "",
  });

  useEffect(() => {
    if (!currentUser) {
      router.replace("/login?next=/profile");
      return;
    }
    (async () => {
      const { data, error } = await supabase.from("profiles").select("*").eq("id", currentUser.id).single();
      if (error || !data) {
        showToast("Could not load profile", "error");
        setLoading(false);
        return;
      }
      setForm({
        name: data.name || "",
        email: data.email || "",
        mobile_number: data.mobile_number || data.phone || "",
        rera_number: data.rera_number || "",
        agency_name: data.agency_name || "",
        city: data.city || "",
        avatar_url: data.avatar_url || "",
      });
      setLoading(false);
    })();
  }, [currentUser, router, showToast]);

  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const save = async () => {
    setSaving(true);
    try {
      const digits = String(form.mobile_number || "").replace(/\D/g, "").slice(0, 10);
      if (digits.length !== 10) {
        showToast("Enter a valid 10-digit mobile number", "error");
        setSaving(false);
        return;
      }
      const { error } = await supabase
        .from("profiles")
        .update({
          name: form.name.trim(),
          mobile_number: digits,
          phone: digits,
          rera_number: currentUser.role === "agent" ? form.rera_number?.trim() || null : null,
          agency_name: currentUser.role === "agent" ? form.agency_name?.trim() || null : null,
          city: currentUser.role === "agent" ? form.city?.trim() || null : null,
          avatar_url: form.avatar_url?.trim() || null,
        })
        .eq("id", currentUser.id);
      if (error) throw error;
      showToast("Profile saved", "success");
      onRefresh?.();
    } catch (e) {
      showToast(e.message || "Save failed", "error");
    }
    setSaving(false);
  };

  const onAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Image must be under 2MB", "error");
      return;
    }
    const path = `${currentUser.id}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "")}`;
    const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (upErr) {
      showToast(upErr.message || "Upload failed — ensure bucket `avatars` exists", "error");
      return;
    }
    const { data: pub } = supabase.storage.from("avatars").getPublicUrl(path);
    setF("avatar_url", pub.publicUrl);
    showToast("Photo uploaded — press Save to apply", "success");
  };

  if (!currentUser || loading) {
    return (
      <div style={{ minHeight: "50vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "32px 20px" }}>
      <style>{G}</style>
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 800, color: "var(--navy)", marginBottom: 8 }}>
        Profile
      </h1>
      <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 24 }}>Update how you appear on Northing.</p>

      {currentUser.role === "agent" && (
        <div style={{ marginBottom: 20, padding: "12px 14px", borderRadius: 10, background: "var(--gray)", border: "1px solid var(--border)", fontSize: 13 }}>
          {currentUser.agentVerified ? (
            <span style={{ color: "#059669", fontWeight: 700 }}>✅ Verified Agent</span>
          ) : (
            <span style={{ color: "var(--muted)", fontWeight: 600 }}>⏳ Verification Pending</span>
          )}
        </div>
      )}

      <div className="card" style={{ padding: 24 }}>
        <div style={{ marginBottom: 18, display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: "50%",
              overflow: "hidden",
              background: "var(--gray)",
              border: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
            }}
          >
            {form.avatar_url ? <img src={form.avatar_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : "👤"}
          </div>
          <label className="btn-outline" style={{ padding: "8px 14px", borderRadius: 9, cursor: "pointer", fontSize: 13 }}>
            Upload photo
            <input type="file" accept="image/*" style={{ display: "none" }} onChange={onAvatar} />
          </label>
        </div>

        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>FULL NAME</label>
        <input className="inp" value={form.name} onChange={(e) => setF("name", e.target.value)} style={{ marginBottom: 14 }} />

        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>EMAIL (READ ONLY)</label>
        <input className="inp" value={form.email} readOnly disabled style={{ marginBottom: 14, opacity: 0.85 }} />

        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>MOBILE NUMBER</label>
        <input
          className="inp"
          inputMode="numeric"
          value={form.mobile_number}
          onChange={(e) => setF("mobile_number", e.target.value.replace(/\D/g, "").slice(0, 10))}
          style={{ marginBottom: 14 }}
        />

        <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>ROLE</label>
        <input className="inp" value={roleLabel(currentUser.role)} readOnly disabled style={{ marginBottom: 18, opacity: 0.85 }} />

        {currentUser.role === "agent" && (
          <>
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>RERA REGISTRATION NUMBER</label>
            <input className="inp" value={form.rera_number} onChange={(e) => setF("rera_number", e.target.value)} style={{ marginBottom: 14 }} />
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>AGENCY NAME</label>
            <input className="inp" value={form.agency_name} onChange={(e) => setF("agency_name", e.target.value)} style={{ marginBottom: 14 }} />
            <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 4 }}>CITY</label>
            <input className="inp" value={form.city} onChange={(e) => setF("city", e.target.value)} style={{ marginBottom: 18 }} />
          </>
        )}

        <button type="button" className="btn-primary" onClick={save} disabled={saving} style={{ width: "100%", padding: 12, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {saving ? (
            <>
              <span className="spin" /> Saving…
            </>
          ) : (
            "Save"
          )}
        </button>
      </div>
    </div>
  );
}
