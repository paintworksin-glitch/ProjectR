"use client";

import { useEffect } from "react";

export default function RouteError({ error, reset }) {
  useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: "50vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
        background: "var(--cream)",
        textAlign: "center",
      }}
    >
      <div className="af" style={{ fontSize: 48, marginBottom: 12 }} aria-hidden>
        🏠
      </div>
      <h2 style={{ fontFamily: "'Fraunces',serif", fontSize: 22, color: "var(--navy)", marginBottom: 8 }}>This page didn&apos;t load</h2>
      <p style={{ color: "var(--muted)", fontSize: 14, maxWidth: 400, marginBottom: 20 }}>
        Something went wrong. You can retry or go back to the previous page.
      </p>
      <button type="button" className="btn-primary" onClick={() => reset()} style={{ padding: "12px 24px", borderRadius: 10, fontWeight: 700 }}>
        Try again
      </button>
    </div>
  );
}
