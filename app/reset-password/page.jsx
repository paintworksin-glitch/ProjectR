"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
      setMessage("Password updated. Redirecting to dashboard...");
      setTimeout(() => router.replace("/dashboard"), 900);
    } catch (err) {
      setError(err?.message || "Could not reset password.");
    } finally {
      setLoading(false);
    }
  };

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
          {loading ? "Updating..." : "Update password ->"}
        </button>

        {error ? <p style={{ marginTop: 10, color: "#b91c1c", fontSize: 13 }}>{error}</p> : null}
        {message ? <p style={{ marginTop: 10, color: "#166534", fontSize: 13 }}>{message}</p> : null}
      </div>
    </div>
  );
}
