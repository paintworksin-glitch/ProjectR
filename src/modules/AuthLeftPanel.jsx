"use client";

const INK = "rgba(37,37,37,0.28)";

function HouseGable({ style, fill, opacity = 0.25 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 72" aria-hidden style={{ position: "absolute", width: 52, height: 58, opacity, ...style }}>
      <polygon points="32,4 58,28 58,68 6,68 6,28" fill={fill} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="22" y="38" width="20" height="22" rx="1" fill="rgba(255,255,255,0.22)" stroke={INK} strokeWidth="1.2" />
    </svg>
  );
}

function HouseBlock({ style, fill, opacity = 0.25 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 64" aria-hidden style={{ position: "absolute", width: 58, height: 52, opacity, ...style }}>
      <polygon points="36,6 66,32 66,60 6,60 6,32" fill={fill} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="26" y="34" width="20" height="20" rx="1" fill="rgba(255,255,255,0.18)" stroke={INK} strokeWidth="1.1" />
    </svg>
  );
}

function HouseTower({ style, fill, opacity = 0.25 }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 56 80" aria-hidden style={{ position: "absolute", width: 44, height: 62, opacity, ...style }}>
      <rect x="8" y="22" width="40" height="54" rx="2" fill={fill} stroke={INK} strokeWidth="2" />
      <polygon points="28,4 48,24 8,24" fill={fill} stroke={INK} strokeWidth="2" strokeLinejoin="round" />
      <rect x="22" y="44" width="12" height="14" rx="1" fill="rgba(255,255,255,0.18)" stroke={INK} strokeWidth="1" />
    </svg>
  );
}

const COLORS = {
  pink: "#f8bbd0",
  yellow: "#fff59d",
  teal: "#80cbc4",
  blue: "#90caf9",
  lavender: "#d1c4e9",
  green: "#a5d6a7",
};

/** Hero-style pastel houses, 20–30% opacity, scattered (deterministic for SSR). */
const FLOAT = [
  { C: HouseGable, fill: COLORS.pink, o: 0.22, s: { top: "4%", left: "3%", transform: "rotate(-7deg)" } },
  { C: HouseBlock, fill: COLORS.yellow, o: 0.26, s: { top: "2%", right: "12%", transform: "rotate(5deg)" } },
  { C: HouseTower, fill: COLORS.teal, o: 0.24, s: { top: "14%", left: "18%", transform: "rotate(3deg) scale(0.92)" } },
  { C: HouseGable, fill: COLORS.blue, o: 0.28, s: { top: "11%", right: "4%", transform: "rotate(-4deg)" } },
  { C: HouseBlock, fill: COLORS.lavender, o: 0.2, s: { top: "22%", left: "44%", transform: "rotate(8deg)" } },
  { C: HouseGable, fill: COLORS.green, o: 0.25, s: { top: "28%", right: "22%", transform: "rotate(-6deg) scale(0.88)" } },
  { C: HouseTower, fill: COLORS.pink, o: 0.23, s: { top: "36%", left: "6%", transform: "rotate(4deg)" } },
  { C: HouseBlock, fill: COLORS.yellow, o: 0.27, s: { top: "42%", right: "8%", transform: "rotate(-3deg)" } },
  { C: HouseGable, fill: COLORS.teal, o: 0.21, s: { top: "48%", left: "52%", transform: "rotate(-8deg) scale(0.95)" } },
  { C: HouseTower, fill: COLORS.blue, o: 0.26, s: { top: "55%", right: "28%", transform: "rotate(6deg)" } },
  { C: HouseBlock, fill: COLORS.lavender, o: 0.24, s: { top: "58%", left: "28%", transform: "rotate(-5deg)" } },
  { C: HouseGable, fill: COLORS.green, o: 0.22, s: { top: "62%", right: "4%", transform: "rotate(7deg) scale(0.9)" } },
  { C: HouseTower, fill: COLORS.pink, o: 0.25, s: { bottom: "26%", left: "2%", transform: "rotate(-4deg)" } },
  { C: HouseGable, fill: COLORS.yellow, o: 0.23, s: { bottom: "18%", left: "38%", transform: "rotate(5deg)" } },
  { C: HouseBlock, fill: COLORS.teal, o: 0.28, s: { bottom: "12%", right: "18%", transform: "rotate(-6deg)" } },
  { C: HouseGable, fill: COLORS.blue, o: 0.2, s: { bottom: "6%", left: "12%", transform: "rotate(3deg) scale(0.85)" } },
  { C: HouseTower, fill: COLORS.lavender, o: 0.26, s: { bottom: "4%", right: "6%", transform: "rotate(-7deg)" } },
  { C: HouseBlock, fill: COLORS.green, o: 0.24, s: { top: "18%", left: "68%", transform: "rotate(4deg) scale(0.82)" } },
  { C: HouseGable, fill: COLORS.pink, o: 0.22, s: { top: "32%", right: "38%", transform: "rotate(-5deg)" } },
  { C: HouseTower, fill: COLORS.yellow, o: 0.27, s: { bottom: "34%", right: "42%", transform: "rotate(6deg) scale(0.9)" } },
  { C: HouseBlock, fill: COLORS.teal, o: 0.21, s: { top: "50%", left: "72%", transform: "rotate(-3deg)" } },
  { C: HouseGable, fill: COLORS.blue, o: 0.25, s: { bottom: "40%", left: "58%", transform: "rotate(8deg)" } },
  { C: HouseTower, fill: COLORS.lavender, o: 0.23, s: { top: "8%", left: "78%", transform: "rotate(-6deg) scale(0.78)" } },
  { C: HouseBlock, fill: COLORS.green, o: 0.26, s: { bottom: "22%", right: "48%", transform: "rotate(4deg)" } },
];

export default function AuthLeftPanel() {
  const tagline = "India's trusted property platform";

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
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background: "radial-gradient(ellipse 90% 80% at 30% 20%, rgba(30,41,59,0.5) 0%, #0f172a 55%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 1,
          pointerEvents: "none",
          background: "linear-gradient(180deg, rgba(15,23,42,0.15) 0%, rgba(15,23,42,0.92) 100%)",
        }}
      />
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 2,
          pointerEvents: "none",
          overflow: "hidden",
        }}
      >
        {FLOAT.map((f, i) => {
          const Comp = f.C;
          return <Comp key={i} fill={f.fill} opacity={f.o} style={f.s} />;
        })}
      </div>
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
