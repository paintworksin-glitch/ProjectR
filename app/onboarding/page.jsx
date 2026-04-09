"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

const ROLE_OPTIONS = [
  { id: "user", label: "Buyer" },
  { id: "seller", label: "Seller" },
  { id: "agent", label: "Agent" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [message, setMessage] = useState("");

  const roleLabel = useMemo(
    () => ROLE_OPTIONS.find((option) => option.id === selectedRole)?.label ?? "Buyer",
    [selectedRole]
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (cancelled) return;
        if (sessionError) throw sessionError;
        if (!session?.user) {
          router.replace("/login");
          return;
        }
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", session.user.id)
          .maybeSingle();
        if (cancelled) return;
        if (profileError) throw profileError;
        if (profile?.role) {
          router.replace("/dashboard");
          return;
        }
        setChecking(false);
      } catch {
        if (!cancelled) {
          setMessage("Could not load your profile. Please refresh or sign in again.");
          setChecking(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const saveRole = async () => {
    setLoading(true);
    setMessage("");
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }
      const payload = { role: selectedRole };
      if (selectedRole === "agent") {
        payload.agent_verified = false;
      }
      const { error } = await supabase.from("profiles").update(payload).eq("id", session.user.id);
      if (error) throw error;
      router.replace("/dashboard");
    } catch (err) {
      setMessage(err?.message || "Could not save role. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 460, padding: 24, borderRadius: 16 }}>
        <div style={{ marginBottom: 16 }}>
          <div className="login-heading-serif" style={{ fontSize: 24, fontWeight: 700, color: "var(--navy)", marginBottom: 4 }}>
            I am a...
          </div>
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Choose your role to personalize Northing.</p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
          {ROLE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setSelectedRole(option.id)}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: `1.5px solid ${selectedRole === option.id ? "#1a1a1a" : "var(--border)"}`,
                background: selectedRole === option.id ? "var(--primary-light)" : "#ffffff",
                color: "#1a1a1a",
                fontWeight: 700,
                fontSize: 15,
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              {option.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={saveRole}
          style={{ width: "100%", padding: "13px", borderRadius: 11, fontSize: 15 }}
        >
          {loading ? "Saving..." : `Continue as ${roleLabel} ->`}
        </button>

        {message ? <p style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>{message}</p> : null}
      </div>
    </div>
  );
}
