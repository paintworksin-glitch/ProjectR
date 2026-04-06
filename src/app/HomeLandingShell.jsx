/**
 * Server-only landing shell for `/` (SSR + Suspense fallback).
 * Full interactive home remains in NorthingApp `Home` via HomePageClient.
 */
export default function HomeLandingShell() {
  return (
    <div
      className="home-page-shell"
      style={{
        background: "#ffffff",
        width: "100%",
        maxWidth: "100%",
        boxSizing: "border-box",
        minHeight: "72vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(32px, 6vw, 80px)",
      }}
    >
      <section
        aria-label="Welcome"
        style={{
          textAlign: "center",
          maxWidth: 640,
        }}
      >
        <h1
          style={{
            fontFamily: "'Fraunces', Georgia, 'Times New Roman', serif",
            fontSize: "clamp(1.85rem, 4.5vw, 3rem)",
            fontWeight: 800,
            color: "#0f172a",
            margin: "0 0 1rem",
            lineHeight: 1.12,
          }}
        >
          <span
            style={{
              display: "block",
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              fontWeight: 700,
              fontStyle: "normal",
            }}
          >
            Northing to your
          </span>
          <span style={{ display: "block", fontStyle: "italic" }}>dream home</span>
        </h1>
        <p
          style={{
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
            color: "#64748b",
            fontSize: 16,
            lineHeight: 1.55,
            margin: "0 0 1.75rem",
          }}
        >
          Browse curated listings, or list your property with brochures and WhatsApp-ready cards.
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 12,
            justifyContent: "center",
          }}
        >
          <a
            href="/feed"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              padding: "14px 22px",
              borderRadius: 14,
              background: "#0d9488",
              color: "#fff",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: 15,
            }}
          >
            Browse Properties
          </a>
          <a
            href="/login"
            style={{
              fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
              padding: "14px 22px",
              borderRadius: 14,
              border: "1px solid #cbd5e1",
              color: "#0f172a",
              fontWeight: 700,
              textDecoration: "none",
              fontSize: 15,
              background: "#fff",
            }}
          >
            List Your Property
          </a>
        </div>
      </section>
    </div>
  );
}
