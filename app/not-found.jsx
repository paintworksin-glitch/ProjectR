import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--cream)",
        padding: 24,
        fontFamily: "'Inter', system-ui, sans-serif",
        textAlign: "center",
      }}
    >
      <div className="af" style={{ fontSize: 56, lineHeight: 1, marginBottom: 16 }} aria-hidden>
        🏠
      </div>
      <h1
        style={{
          fontFamily: "'Fraunces', Georgia, serif",
          fontSize: 28,
          fontWeight: 800,
          color: "var(--navy)",
          margin: "0 0 8px",
        }}
      >
        Page not found
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15, maxWidth: 420, lineHeight: 1.6, marginBottom: 24 }}>
        That address isn&apos;t on Northing. Try the home page or browse listings.
      </p>
      <Link
        href="/"
        className="btn-primary"
        style={{
          display: "inline-block",
          padding: "12px 28px",
          borderRadius: 11,
          fontWeight: 700,
          fontSize: 15,
          textDecoration: "none",
        }}
      >
        ← Back to home
      </Link>
    </div>
  );
}
