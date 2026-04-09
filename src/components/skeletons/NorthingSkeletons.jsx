const bar = (h, w = "100%") => ({
  height: h,
  width: w,
  borderRadius: 10,
  background: "linear-gradient(90deg,#eef2f6 22%,#f8fafc 50%,#eef2f6 78%)",
  backgroundSize: "200% 100%",
  animation: "shimmer 1.5s infinite",
  border: "1px solid rgba(226,232,240,0.48)",
});

export function FeedSkeleton() {
  return (
    <div className="feed-page" style={{ minHeight: "100vh", background: "var(--cream)", padding: "24px 20px 60px" }}>
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        <div style={{ ...bar(48), maxWidth: 420, margin: "0 auto 24px" }} />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 24 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card" style={{ overflow: "hidden", padding: 0 }}>
              <div style={{ height: 195, ...bar(195, "100%"), borderRadius: 0, border: "none" }} />
              <div style={{ padding: 16 }}>
                <div style={{ ...bar(14), marginBottom: 10 }} />
                <div style={{ ...bar(12), width: "70%", marginBottom: 16 }} />
                <div style={{ ...bar(36) }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
      <div style={{ ...bar(36), width: 280, marginBottom: 12 }} />
      <div style={{ ...bar(16), width: 200, marginBottom: 28 }} />
      <div style={{ ...bar(44), width: 320, marginBottom: 24 }} />
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 24 }}>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="card" style={{ padding: 20 }}>
            <div style={{ ...bar(24), width: "40%", marginBottom: 12 }} />
            <div style={{ ...bar(36) }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PropertyDetailSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", padding: 24 }}>
      <div style={{ ...bar(48), maxWidth: 900, margin: "0 auto 20px" }} />
      <div style={{ ...bar(280), maxWidth: 900, margin: "0 auto", borderRadius: 16 }} />
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ ...bar(28), marginBottom: 20 }} />
        <div style={{ ...bar(48), marginBottom: 12 }} />
        <div style={{ ...bar(48), marginBottom: 12 }} />
        <div style={{ ...bar(48) }} />
      </div>
    </div>
  );
}
