"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

/**
 * Password reset emails send either:
 * - PKCE: ?code=... on this URL → must call exchangeCodeForSession(code)
 * - Implicit: #access_token=...&refresh_token=... → setSession
 * Without that, updateUser({ password }) throws "Auth session missing".
 */
export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const [sessionError, setSessionError] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (typeof window === "undefined") return;
      const url = new URL(window.location.href);
      const code = url.searchParams.get("code");

      if (code) {
        const { error: exErr } = await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exErr) {
          setSessionError(exErr.message || "This reset link is invalid or expired. Request a new one from the login page.");
          setSessionReady(false);
          return;
        }
        url.searchParams.delete("code");
        const qs = url.searchParams.toString();
        window.history.replaceState({}, "", `${url.pathname}${qs ? `?${qs}` : ""}`);
        setSessionReady(true);
        return;
      }

      const hash = window.location.hash?.replace(/^#/, "");
      if (hash) {
        const p = new URLSearchParams(hash);
        const access_token = p.get("access_token");
        const refresh_token = p.get("refresh_token");
        if (access_token && refresh_token) {
          const { error: sErr } = await supabase.auth.setSession({ access_token, refresh_token });
          if (cancelled) return;
          if (sErr) {
            setSessionError(sErr.message || "Could not use this reset link. Request a new one.");
            setSessionReady(false);
            return;
          }
          window.history.replaceState({}, "", window.location.pathname + window.location.search);
          setSessionReady(true);
          return;
        }
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled) return;
      if (session?.user) {
        setSessionReady(true);
        return;
      }

      setSessionError(
        "Open this page from the password reset email link, or the link has expired. Use “Forgot password?” on the login page to send a new email."
      );
      setSessionReady(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const submit = async () => {
    setError("");
    setMessage("");
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      const { error: updateError } = await supabase.auth.updateUser({ password });
      if (updateError) throw updateError;
      setMessage("Password updated. Redirecting…");
      setTimeout(() => router.replace("/dashboard"), 900);
    } catch (err) {
      setError(err?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

  if (!sessionReady && !sessionError) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <p style={{ color: "var(--muted)", fontSize: 14 }}>Confirming your reset link…</p>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
        <div className="card" style={{ width: "100%", maxWidth: 440, padding: 24, borderRadius: 16 }}>
          <h1 className="login-heading-serif" style={{ fontSize: 22, fontWeight: 700, color: "var(--navy)", marginBottom: 12 }}>
            Reset link issue
          </h1>
          <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 20, lineHeight: 1.55 }}>{sessionError}</p>
          <button type="button" className="btn-primary" onClick={() => router.replace("/login")} style={{ width: "100%", padding: "12px", borderRadius: 10 }}>
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div className="card" style={{ width: "100%", maxWidth: 440, padding: 24, borderRadius: 16 }}>
        <h1 className="login-heading-serif" style={{ fontSize: 26, fontWeight: 700, color: "var(--navy)", marginBottom: 8 }}>
          Reset password
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginBottom: 16 }}>
          Enter a new password for your Northing account.
        </p>

        <div style={{ marginBottom: 12 }}>
          <input
            className="inp"
            type="password"
            placeholder="New password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <input
            className="inp"
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
          />
        </div>

        <button
          type="button"
          className="btn-primary"
          disabled={loading}
          onClick={submit}
          style={{ width: "100%", padding: "13px", borderRadius: 11, fontSize: 15 }}
        >
          {loading ? "Updating…" : "Update password →"}
        </button>

        {error ? <p style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>{error}</p> : null}
        {message ? <p style={{ marginTop: 10, color: "#166534", fontSize: 13 }}>{message}</p> : null}
      </div>
    </div>
  );
}
