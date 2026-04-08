"use client";

import { useNorthing } from "@/modules/NorthingContext";

export default function ContactPage() {
  const { nav } = useNorthing();
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: "28px 20px 52px" }}>
      <div style={{ maxWidth: 780, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => nav("home")}
          style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 14 }}
        >
          ← Back to Home
        </button>
        <h1 className="login-heading-serif" style={{ fontSize: 34, color: "var(--navy)", marginBottom: 8 }}>
          Contact Northing
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 16 }}>
          Reach us for support, onboarding, listing help, or partnership requests.
        </p>

        <div className="card" style={{ padding: 18, borderRadius: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>Email</div>
          <a href="mailto:support@northing.in" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            support@northing.in
          </a>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 14, marginBottom: 12 }}>
          <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>Sales & Partnerships</div>
          <a href="mailto:hello@northing.in" style={{ color: "var(--primary)", textDecoration: "none", fontWeight: 600 }}>
            hello@northing.in
          </a>
        </div>

        <div className="card" style={{ padding: 18, borderRadius: 14 }}>
          <div style={{ fontWeight: 700, color: "var(--navy)", marginBottom: 6 }}>Coverage</div>
          <p style={{ color: "var(--text-body)" }}>Mumbai, Thane, and Navi Mumbai.</p>
        </div>
      </div>
    </div>
  );
}
