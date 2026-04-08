"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentDash, UserDash, MasterDash } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";
import { supabase } from "@/lib/supabaseClient";

function ProfileTypeChooser({ user, onSaved, showToast }) {
  const [role, setRole] = useState("user");
  const [saving, setSaving] = useState(false);
  const options = [
    { id: "user", label: "Buyer", desc: "Browse and save properties" },
    { id: "seller", label: "Seller", desc: "List properties with seller limits" },
    { id: "agent", label: "Agent", desc: "Requires admin approval before listing" },
  ];

  const submit = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from("profiles").update({ role, agent_verified: role === "agent" ? false : null }).eq("id", user.id);
      if (error) throw error;
      await onSaved?.();
      showToast("Profile selected successfully", "success");
    } catch (err) {
      showToast(err?.message || "Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ maxWidth: 520, width: "100%", padding: 24 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, color: "var(--navy)", marginBottom: 8 }}>Choose your profile</h2>
        <p style={{ color: "var(--muted)", marginBottom: 14 }}>You can continue as Buyer, Seller, or Agent.</p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setRole(o.id)}
              style={{
                textAlign: "left",
                borderRadius: 12,
                border: `1.5px solid ${role === o.id ? "var(--primary)" : "var(--border)"}`,
                background: role === o.id ? "var(--primary-light)" : "#fff",
                padding: "12px 14px",
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 700, color: "var(--navy)" }}>{o.label}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>{o.desc}</div>
            </button>
          ))}
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={saving}
          onClick={submit}
          style={{ width: "100%", marginTop: 14, padding: "12px", borderRadius: 10 }}
        >
          {saving ? "Saving..." : "Continue to dashboard →"}
        </button>
      </div>
    </div>
  );
}

export default function DashboardRoutePage() {
  const { user, authLoading, showToast, refreshSessionUser } = useNorthing();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--muted)",
        }}
      >
        Loading…
      </div>
    );
  }

  if (!user.role) {
    return <ProfileTypeChooser user={user} onSaved={refreshSessionUser} showToast={showToast} />;
  }

  if (user.role === "master") {
    return <MasterDash showToast={showToast} />;
  }

  if (user.role === "user") {
    return (
      <UserDash
        currentUser={user}
        showToast={showToast}
        onPhoneLinked={refreshSessionUser}
      />
    );
  }

  if (user.role === "agent" || user.role === "seller") {
    return (
      <AgentDash
        currentUser={user}
        showToast={showToast}
        onPhoneLinked={refreshSessionUser}
      />
    );
  }

  return (
    <UserDash
      currentUser={user}
      showToast={showToast}
      onPhoneLinked={refreshSessionUser}
    />
  );
}
