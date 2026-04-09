"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AgentDash, UserDash } from "@/modules/NorthingApp";
import { useNorthing } from "@/modules/NorthingContext";
import { supabase } from "@/lib/supabaseClient";

function normalizeDashboardRole(r) {
  if (r === "user" || r === "seller" || r === "agent") return r;
  return "user";
}

function ProfileTypeChooser({ user, onSaved, showToast, variant = "first", onCancel }) {
  const [role, setRole] = useState(() => normalizeDashboardRole(user?.role));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setRole(normalizeDashboardRole(user?.role));
  }, [user?.id, user?.role]);

  const options = [
    { id: "user", label: "Buyer", desc: "Browse and save properties" },
    { id: "seller", label: "Seller", desc: "List properties with seller limits" },
    { id: "agent", label: "Agent", desc: "Listings subject to admin approval" },
  ];

  const submit = async () => {
    setSaving(true);
    try {
      const prevRole = normalizeDashboardRole(user?.role);
      const verifiedAgent = prevRole === "agent" && user?.agentVerified === true;
      if (verifiedAgent && role !== "agent") {
        showToast("Verified agents cannot change account type. Contact Northing admin.", "error");
        setSaving(false);
        return;
      }
      const payload = { role };
      // Becoming an agent always requires admin approval before listing creation.
      if (role === "agent" && prevRole !== "agent") {
        payload.agent_verified = false;
      }
      const { error } = await supabase.from("profiles").update(payload).eq("id", user.id);
      if (error) throw error;
      await supabase.auth.updateUser({ data: { role_selected: true } });
      await onSaved?.();
      showToast(variant === "change" ? "Account type updated" : "Welcome to Northing", "success");
    } catch (err) {
      showToast(err?.message || "Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  };

  const isChange = variant === "change";

  return (
    <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div className="card" style={{ maxWidth: 520, width: "100%", padding: 24 }}>
        <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 26, color: "var(--navy)", marginBottom: 8 }}>
          {isChange ? "Change account type" : "Choose your profile"}
        </h2>
        <p style={{ color: "var(--muted)", marginBottom: 14 }}>
          {isChange
            ? "Switch between Buyer, Seller, or Agent. Your dashboard updates right away."
            : "Select how you will use Northing. You can change this later from the dashboard."}
        </p>
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
          {saving ? "Saving…" : isChange ? "Save changes" : "Continue →"}
        </button>
        {isChange && onCancel && (
          <button
            type="button"
            className="btn-ghost"
            disabled={saving}
            onClick={onCancel}
            style={{ width: "100%", marginTop: 10, padding: "10px", borderRadius: 10, fontSize: 14 }}
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

export default function DashboardRoutePage() {
  const { user, authLoading, showToast, refreshSessionUser } = useNorthing();
  const router = useRouter();
  const searchParams = useSearchParams();
  const changeRole = searchParams.get("changeRole") === "1";
  const [roleSelectionChecked, setRoleSelectionChecked] = useState(false);
  const [mustChooseRole, setMustChooseRole] = useState(false);
  const lockedAgentToastShown = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/login");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    if (!authLoading && user?.role === "master") {
      router.replace("/admin");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    let cancelled = false;
    if (authLoading || !user) return;
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (cancelled) return;
      const roleSelected = data?.user?.user_metadata?.role_selected === true;
      const shouldSelect = !roleSelected && (!user.role || user.role === "user");
      setMustChooseRole(shouldSelect);
      setRoleSelectionChecked(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  // Must run every render (before any return) — same rules as other hooks.
  useEffect(() => {
    if (authLoading || !user) return;
    const lockedVerifiedAgent = user.role === "agent" && user.agentVerified === true;
    if (!changeRole || !lockedVerifiedAgent || mustChooseRole) return;
    if (lockedAgentToastShown.current) return;
    lockedAgentToastShown.current = true;
    showToast(
      "Verified agents cannot change their account type. Contact Northing admin if you need a change.",
      "error"
    );
    router.replace("/dashboard");
  }, [authLoading, user, changeRole, mustChooseRole, router, showToast]);

  if (authLoading || !user || !roleSelectionChecked) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          color: "var(--muted)",
        }}
        aria-busy="true"
        aria-live="polite"
      >
        <span className="spin" style={{ borderColor: "rgba(26,26,26,0.2)", borderTopColor: "var(--navy)" }} />
        <span style={{ fontSize: 14 }}>Loading your account…</span>
      </div>
    );
  }

  if (user.role === "master") {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 10,
          color: "var(--muted)",
        }}
        aria-busy="true"
      >
        <span className="spin" style={{ borderColor: "rgba(26,26,26,0.2)", borderTopColor: "var(--navy)" }} />
        <span style={{ fontSize: 14 }}>Redirecting…</span>
      </div>
    );
  }

  const lockedVerifiedAgent = user.role === "agent" && user.agentVerified === true;
  const showRoleChooser =
    (mustChooseRole || (changeRole && user.role !== "master")) &&
    !(changeRole && lockedVerifiedAgent);

  if (showRoleChooser) {
    return (
      <ProfileTypeChooser
        user={user}
        variant={changeRole && !mustChooseRole ? "change" : "first"}
        onSaved={async () => {
          await refreshSessionUser();
          router.replace("/dashboard");
        }}
        onCancel={changeRole ? () => router.replace("/dashboard") : undefined}
        showToast={showToast}
      />
    );
  }

  if (user.role === "user") {
    return (
      <UserDash
        currentUser={user}
        showToast={showToast}
      />
    );
  }

  if (user.role === "agent" || user.role === "seller") {
    return (
      <AgentDash
        currentUser={user}
        showToast={showToast}
      />
    );
  }

  return (
    <UserDash
      currentUser={user}
      showToast={showToast}
    />
  );
}
