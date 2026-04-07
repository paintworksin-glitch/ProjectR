"use client";

import { SkylineHeroBackdrop } from "../SkylineIllustration.jsx";

/** Small pastel house shapes (hero-style), scattered for auth left column */
function FloatingHouseIcon({ style, fill }) {
  const ink = "rgba(37,37,37,0.35)";
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 64 72"
      aria-hidden
      style={{ position: "absolute", width: 52, height: 58, opacity: 0.24, ...style }}
    >
      <polygon points="32,4 58,28 58,68 6,68 6,28" fill={fill} stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      <rect x="22" y="38" width="20" height="22" rx="1" fill="rgba(255,255,255,0.35)" stroke={ink} strokeWidth="1.2" />
    </svg>
  );
}

const FLOAT = [
  { fill: "#b8e0f5", style: { top: "6%", left: "4%", transform: "rotate(-8deg)" } },
  { fill: "#c8e6c9", style: { top: "18%", right: "8%", transform: "rotate(6deg)" } },
  { fill: "#fff9c4", style: { top: "38%", left: "2%", transform: "rotate(4deg)" } },
  { fill: "#ffccbc", style: { bottom: "28%", right: "4%", transform: "rotate(-5deg)" } },
  { fill: "#e1bee7", style: { bottom: "12%", left: "14%", transform: "rotate(7deg)" } },
  { fill: "#b2dfdb", style: { top: "52%", right: "18%", transform: "rotate(-4deg)" } },
  { fill: "#d1c4e9", style: { top: "8%", left: "42%", transform: "rotate(3deg) scale(0.92)" } },
  { fill: "#ffe0b2", style: { bottom: "42%", left: "36%", transform: "rotate(-6deg)" } },
];

/**
 * @param {{ variant?: "login" | "signup" }} props
 */
export default function AuthLeftPanel({ variant = "login" }) {
  const tagline =
    variant === "signup"
      ? "India's trusted property platform"
      : "India's trusted property platform";

  return (
    <div
      className="login-hero-col auth-left-panel"
      style={{
        width: "45%",
        minHeight: "100vh",
        alignSelf: "stretch",
        background: "#0f172a",
        padding: "56px 44px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <SkylineHeroBackdrop tone="standard" />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          background: "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(15,23,42,0.2) 0%, rgba(15,23,42,0.85) 100%)",
        }}
      />
      {FLOAT.map((f, i) => (
        <FloatingHouseIcon key={i} fill={f.fill} style={f.style} />
      ))}
      <div style={{ position: "relative", zIndex: 4 }}>
        <div className="login-heading-serif" style={{ fontWeight: 700, fontSize: 28, color: "#fff", marginBottom: 6 }}>
          Northing
        </div>
        <p
          style={{
            fontSize: 15,
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.45,
            maxWidth: 360,
            fontWeight: 500,
          }}
        >
          {tagline}
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 4 }}>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Professional property marketing
        </p>
      </div>
    </div>
  );
}
