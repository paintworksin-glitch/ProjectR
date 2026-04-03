/**
 * About Northing — matches home legal pages chrome.
 */
export default function AboutPage({ onNavigate }) {
  const linkBtn = {
    background: "none",
    border: "none",
    padding: 0,
    cursor: "pointer",
    font: "inherit",
    color: "inherit",
    textDecoration: "underline",
    textUnderlineOffset: 3,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--cream)" }}>
      <main style={{ flex: 1, width: "100%", maxWidth: 720, margin: "0 auto", padding: "28px max(20px, env(safe-area-inset-left)) max(80px, calc(40px + env(safe-area-inset-bottom))) max(20px, env(safe-area-inset-right))", boxSizing: "border-box" }}>
        <p style={{ fontSize: 13, color: "var(--muted)", marginBottom: 8 }}>
          <button type="button" onClick={() => onNavigate("home")} style={{ ...linkBtn, color: "var(--primary)", fontWeight: 600 }}>
            ← Back to Home
          </button>
        </p>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: "clamp(26px, 4vw, 34px)", fontWeight: 800, color: "var(--navy)", margin: "0 0 16px", lineHeight: 1.2 }}>
          About Northing
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)", marginBottom: 20 }}>
          Northing is a property marketing platform built for India’s real estate agents, brokers, and individual sellers. We help you turn listings into polished WhatsApp cards, PDF brochures, and shareable assets—so your properties look professional everywhere clients see them.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)", marginBottom: 20 }}>
          Whether you manage one home or a full portfolio, Northing is designed to save time on repetitive formatting and keep your brand consistent across every touchpoint.
        </p>
        <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text)", margin: 0 }}>
          Questions? Use the contact options in the app or reach us through your agent dashboard when you’re signed in.
        </p>
      </main>
    </div>
  );
}
