"use client";

export default function GlobalError({ error, reset }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#faf8f5",
          padding: 24,
          fontFamily: "system-ui, -apple-system, sans-serif",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: 56, lineHeight: 1, marginBottom: 16 }} aria-hidden>
          🏠
        </div>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#1a1a1a", margin: "0 0 8px" }}>Something went wrong</h1>
        <p style={{ color: "#57534e", fontSize: 15, maxWidth: 420, lineHeight: 1.6, marginBottom: 20 }}>
          Northing hit an unexpected error. Your data is safe — try again or return home.
        </p>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center" }}>
          <button
            type="button"
            onClick={() => reset()}
            style={{
              background: "#1a1a1a",
              color: "#fff",
              border: "none",
              padding: "12px 24px",
              borderRadius: 10,
              fontWeight: 700,
              cursor: "pointer",
              fontSize: 15,
            }}
          >
            Try again
          </button>
          <a
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              padding: "12px 24px",
              borderRadius: 10,
              fontWeight: 700,
              fontSize: 15,
              border: "1px solid #d6d3d1",
              color: "#1a1a1a",
              textDecoration: "none",
            }}
          >
            Home
          </a>
        </div>
        {process.env.NODE_ENV === "development" && error?.message ? (
          <pre
            style={{
              marginTop: 24,
              textAlign: "left",
              fontSize: 11,
              color: "#78716c",
              maxWidth: 520,
              overflow: "auto",
              background: "#f5f5f4",
              padding: 12,
              borderRadius: 8,
            }}
          >
            {error.message}
          </pre>
        ) : null}
      </body>
    </html>
  );
}
