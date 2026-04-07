"use client";

import { HomeHeroIllustration } from "../SkylineIllustration.jsx";

/**
 * Left column for login/signup: same illustrated pastel skyline as the home hero
 * (light gradient + marquee buildings + soft white scrim).
 *
 * @param {{ variant?: "login" | "signup" }} props
 */
export default function AuthLeftPanel({ variant = "login" }) {
  const tagline =
    variant === "signup" ? "India's trusted property platform" : "India's trusted property platform";

  return (
    <div
      className="login-hero-col auth-left-panel"
      style={{
        width: "45%",
        minHeight: "100vh",
        alignSelf: "stretch",
        padding: "56px 44px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "relative",
        overflow: "hidden",
        flexShrink: 0,
      }}
    >
      <div className="auth-left-panel-hero-bg" aria-hidden>
        <div className="auth-left-panel-hero-bg-inner">
          <HomeHeroIllustration />
        </div>
      </div>
      <div className="auth-left-panel-hero-overlay" aria-hidden />
      <div style={{ position: "relative", zIndex: 2 }}>
        <div className="login-heading-serif" style={{ fontWeight: 700, fontSize: 28, color: "#1a1a1a", marginBottom: 6 }}>
          Northing
        </div>
        <p
          style={{
            fontSize: 15,
            color: "rgba(26,26,26,0.72)",
            lineHeight: 1.45,
            maxWidth: 360,
            fontWeight: 500,
          }}
        >
          {tagline}
        </p>
      </div>
      <div style={{ position: "relative", zIndex: 2 }}>
        <p style={{ fontSize: 12, color: "rgba(26,26,26,0.45)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
          Professional property marketing
        </p>
      </div>
    </div>
  );
}
