"use client";

import { useNorthing } from "@/modules/NorthingContext";

const plans = [
  {
    name: "Buyer",
    price: "Free",
    points: ["Browse and save listings", "Send enquiries", "Manage profile and phone"],
  },
  {
    name: "Seller",
    price: "Free (2 active listings)",
    points: ["Create up to 2 active listings", "Receive enquiries", "Use WhatsApp card + PDF tools"],
  },
  {
    name: "Agent",
    price: "Contact us",
    points: ["Unlimited listings after verification", "Brand profile and logo", "Advanced sharing tools"],
  },
];

export default function PricingPage() {
  const { nav } = useNorthing();
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: "28px 20px 52px" }}>
      <div style={{ maxWidth: 980, margin: "0 auto" }}>
        <button
          type="button"
          onClick={() => nav("home")}
          style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: 13, fontWeight: 600, marginBottom: 14 }}
        >
          ← Back to Home
        </button>
        <h1 className="login-heading-serif" style={{ fontSize: 34, color: "var(--navy)", marginBottom: 8 }}>
          Northing Pricing
        </h1>
        <p style={{ color: "var(--muted)", marginBottom: 22 }}>
          Transparent plans for property discovery and marketing.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 14 }}>
          {plans.map((plan) => (
            <div key={plan.name} className="card" style={{ padding: 18, borderRadius: 14 }}>
              <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "uppercase", fontWeight: 700, letterSpacing: 0.6 }}>
                {plan.name}
              </div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "var(--navy)", margin: "6px 0 12px" }}>{plan.price}</div>
              <ul style={{ paddingLeft: 18, color: "var(--text-body)", fontSize: 14, lineHeight: 1.6 }}>
                {plan.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="card" style={{ marginTop: 16, padding: 18, borderRadius: 14 }}>
          <h2 style={{ fontSize: 20, color: "var(--navy)", marginBottom: 8 }}>Need an agent plan?</h2>
          <p style={{ color: "var(--text-body)", marginBottom: 12 }}>
            For verified agency workflows and custom growth plans, contact us directly.
          </p>
          <button type="button" className="btn-primary" onClick={() => nav("contact")} style={{ padding: "11px 16px", borderRadius: 10 }}>
            Contact sales →
          </button>
        </div>
      </div>
    </div>
  );
}
