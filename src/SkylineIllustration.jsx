import { useState, useEffect, useId } from "react";

const HERO_INK = "#252525";
const HERO_SW = 2.2;

/** Positions one building in SVG coordinates (strip is 900 units wide; duplicated for marquee). */
const HomeHeroBld = ({ x, y, children }) => <g transform={`translate(${x},${y})`}>{children}</g>;

/** One full row of colourful cartoon buildings — drawn twice side-by-side for seamless horizontal scroll. */
const HomeHeroBuildingsStrip = () => {
  const ink = HERO_INK;
  const sw = HERO_SW;
  return (
    <>
      <HomeHeroBld x={40} y={438}>
        <polygon points="-2,-54 30,-82 62,-54" fill="#7ec4e8" stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="0" y="-54" width="60" height="54" fill="#b8e0f5" stroke={ink} strokeWidth={sw} />
        <rect x="22" y="-34" width="16" height="20" rx="1" fill="#4a9ec9" stroke={ink} strokeWidth="1.5" />
      </HomeHeroBld>
      <HomeHeroBld x={108} y={392}>
        <rect x="0" y="-118" width="52" height="118" fill="#c8e6c9" stroke={ink} strokeWidth={sw} />
        <rect x="8" y="-100" width="14" height="12" fill="#81c784" stroke={ink} strokeWidth="1.2" />
        <rect x="30" y="-76" width="14" height="12" fill="#81c784" stroke={ink} strokeWidth="1.2" />
        <rect x="8" y="-52" width="14" height="12" fill="#81c784" stroke={ink} strokeWidth="1.2" />
        <rect x="30" y="-28" width="14" height="12" fill="#81c784" stroke={ink} strokeWidth="1.2" />
        <rect x="15" y="-10" width="22" height="30" fill="#a5d6a7" stroke={ink} strokeWidth="1.5" />
      </HomeHeroBld>
      <HomeHeroBld x={178} y={148}>
        <rect x="0" y="-42" width="68" height="42" fill="#e1bee7" stroke={ink} strokeWidth={sw} />
        <polygon points="0,-42 34,-64 68,-42" fill="#ce93d8" stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="26" y="-30" width="18" height="22" fill="#ab47bc" stroke={ink} strokeWidth="1.3" />
      </HomeHeroBld>
      <HomeHeroBld x={598} y={162}>
        <rect x="0" y="-48" width="78" height="48" fill="#ffe0b2" stroke={ink} strokeWidth={sw} />
        <rect x="-5" y="-56" width="88" height="10" fill="#ffcc80" stroke={ink} strokeWidth="2" />
        <rect x="14" y="-34" width="18" height="22" fill="#fb8c00" stroke={ink} strokeWidth="1.3" />
        <rect x="46" y="-34" width="18" height="22" fill="#fb8c00" stroke={ink} strokeWidth="1.3" />
      </HomeHeroBld>
      <HomeHeroBld x={688} y={368}>
        <rect x="0" y="-72" width="62" height="72" fill="#ffccbc" stroke={ink} strokeWidth={sw} />
        <rect x="10" y="-92" width="20" height="20" fill="#ff8a65" stroke={ink} strokeWidth="2" />
        <rect x="34" y="-102" width="20" height="32" fill="#ff7043" stroke={ink} strokeWidth="2" />
        <rect x="22" y="-42" width="20" height="24" fill="#f4511e" stroke={ink} strokeWidth="1.3" />
      </HomeHeroBld>
      <HomeHeroBld x={752} y={412}>
        <polygon points="0,-46 42,-68 84,-46" fill="#fff59d" stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="0" y="-46" width="84" height="46" fill="#fff9c4" stroke={ink} strokeWidth={sw} />
        <rect x="32" y="-30" width="22" height="18" fill="#fdd835" stroke={ink} strokeWidth="1.3" />
      </HomeHeroBld>
      <HomeHeroBld x={14} y={278}>
        <rect x="0" y="-66" width="48" height="66" fill="#f8bbd0" stroke={ink} strokeWidth={sw} />
        <polygon points="0,-66 24,-90 48,-66" fill="#f48fb1" stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="16" y="-42" width="18" height="22" fill="#ec407a" stroke={ink} strokeWidth="1.3" />
      </HomeHeroBld>
      <HomeHeroBld x={298} y={508}>
        <rect x="0" y="-40" width="96" height="40" fill="#b2dfdb" stroke={ink} strokeWidth={sw} />
        <rect x="10" y="-54" width="76" height="14" fill="#80cbc4" stroke={ink} strokeWidth="2" />
        <rect x="18" y="-28" width="16" height="20" fill="#26a69a" stroke={ink} strokeWidth="1.3" />
        <rect x="62" y="-28" width="16" height="20" fill="#26a69a" stroke={ink} strokeWidth="1.3" />
      </HomeHeroBld>
      <HomeHeroBld x={458} y={524}>
        <rect x="0" y="-62" width="56" height="62" fill="#d1c4e9" stroke={ink} strokeWidth={sw} />
        <polygon points="0,-62 28,-88 56,-62" fill="#b39ddb" stroke={ink} strokeWidth={sw} strokeLinejoin="round" />
        <rect x="20" y="-38" width="18" height="24" fill="#7e57c2" stroke={ink} strokeWidth="1.3" />
      </HomeHeroBld>
      <HomeHeroBld x={608} y={488}>
        <rect x="0" y="-32" width="108" height="32" fill="#cfd8dc" stroke={ink} strokeWidth={sw} />
        <rect x="12" y="-58" width="24" height="26" fill="#90a4ae" stroke={ink} strokeWidth="2" />
        <rect x="42" y="-70" width="26" height="40" fill="#78909c" stroke={ink} strokeWidth="2" />
        <rect x="74" y="-48" width="24" height="18" fill="#607d8b" stroke={ink} strokeWidth="2" />
        <rect x="20" y="-18" width="14" height="16" fill="#455a64" stroke={ink} strokeWidth="1.2" />
        <rect x="76" y="-18" width="14" height="16" fill="#455a64" stroke={ink} strokeWidth="1.2" />
      </HomeHeroBld>
      <HomeHeroBld x={368} y={118}>
        <rect x="0" y="-28" width="44" height="28" fill="#aed581" stroke={ink} strokeWidth="2" />
        <polygon points="0,-28 22,-46 44,-28" fill="#9ccc65" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      </HomeHeroBld>
      <HomeHeroBld x={808} y={272}>
        <rect x="0" y="-52" width="40" height="52" fill="#90caf9" stroke={ink} strokeWidth={sw} />
        <rect x="10" y="-38" width="11" height="11" fill="#1e88e5" stroke={ink} strokeWidth="1.1" />
        <rect x="24" y="-24" width="11" height="11" fill="#1e88e5" stroke={ink} strokeWidth="1.1" />
      </HomeHeroBld>
      <HomeHeroBld x={248} y={198}>
        <polygon points="0,-36 20,-54 40,-36" fill="#ffab91" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        <rect x="0" y="-36" width="40" height="36" fill="#ffccbc" stroke={ink} strokeWidth="2" />
        <rect x="13" y="-24" width="14" height="16" fill="#ff6e40" stroke={ink} strokeWidth="1.2" />
      </HomeHeroBld>
      <HomeHeroBld x={520} y={132}>
        <rect x="0" y="-32" width="52" height="32" fill="#bcaaa4" stroke={ink} strokeWidth="2" />
        <polygon points="0,-32 26,-50 52,-32" fill="#a1887f" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        <circle cx="26" cy="-20" r="5" fill="#6d4c41" stroke={ink} strokeWidth="1.1" />
      </HomeHeroBld>
      <HomeHeroBld x={318} y={228}>
        <rect x="0" y="-22" width="36" height="22" fill="#fff176" stroke={ink} strokeWidth="1.8" />
        <polygon points="0,-22 18,-36 36,-22" fill="#ffee58" stroke={ink} strokeWidth="1.8" strokeLinejoin="round" />
      </HomeHeroBld>
      <HomeHeroBld x={682} y={248}>
        <rect x="0" y="-26" width="48" height="26" fill="#c5cae9" stroke={ink} strokeWidth="2" />
        <rect x="8" y="-40" width="32" height="14" fill="#7986cb" stroke={ink} strokeWidth="1.5" />
      </HomeHeroBld>
      <HomeHeroBld x={142} y={498}>
        <polygon points="0,-44 24,-66 48,-44" fill="#80deea" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
        <rect x="0" y="-44" width="48" height="44" fill="#b2ebf2" stroke={ink} strokeWidth="2" />
        <rect x="17" y="-28" width="14" height="18" fill="#00acc1" stroke={ink} strokeWidth="1.2" />
      </HomeHeroBld>
      <HomeHeroBld x={778} y={468}>
        <rect x="0" y="-36" width="44" height="36" fill="#dce775" stroke={ink} strokeWidth="2" />
        <polygon points="0,-36 22,-54 44,-36" fill="#cddc39" stroke={ink} strokeWidth="2" strokeLinejoin="round" />
      </HomeHeroBld>
      <HomeHeroBld x={200} y={320}>
        <rect x="0" y="-30" width="56" height="30" fill="#ffecb3" stroke={ink} strokeWidth="2" />
        <rect x="6" y="-42" width="44" height="12" fill="#ffc107" stroke={ink} strokeWidth="1.5" />
        <rect x="20" y="-22" width="16" height="18" fill="#ff8f00" stroke={ink} strokeWidth="1.2" />
      </HomeHeroBld>
    </>
  );
};

/**
 * Colourful skyline; slow right→left drift (SMIL translate 0→−900). Parent must not use CSS transform
 * (that breaks SMIL in many browsers) — hero parallax uses top/bottom on the wrapper instead.
 */
/**
 * @param {{ variant?: "default" | "homeHero" }} props
 * `homeHero` — on narrow viewports only: crops to a lower skyline band (fewer shapes), slower drift; ribbons/backdrops omit this prop.
 */
export function HomeHeroIllustration({ variant = "default" } = {}) {
  const clipId = `homeHeroSkyClip-${useId().replace(/:/g, "")}`;
  const [reduceMotion, setReduceMotion] = useState(false);
  const [marqueeDur, setMarqueeDur] = useState("125s");
  const [narrow, setNarrow] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(max-width: 768px)").matches : false
  );
  useEffect(() => {
    const mqRm = window.matchMedia("(prefers-reduced-motion: reduce)");
    const setRm = () => setReduceMotion(!!mqRm.matches);
    setRm();
    mqRm.addEventListener("change", setRm);
    const mqNarrow = window.matchMedia("(max-width: 768px)");
    const setN = () => setNarrow(!!mqNarrow.matches);
    setN();
    mqNarrow.addEventListener("change", setN);
    const updDur = () => {
      const w = window.innerWidth;
      if (variant === "homeHero" && w <= 768) {
        if (w <= 480) setMarqueeDur("340s");
        else setMarqueeDur("280s");
      } else if (w <= 768) setMarqueeDur("190s");
      else setMarqueeDur("125s");
    };
    updDur();
    window.addEventListener("resize", updDur, { passive: true });
    return () => {
      mqRm.removeEventListener("change", setRm);
      mqNarrow.removeEventListener("change", setN);
      window.removeEventListener("resize", updDur);
    };
  }, [variant]);
  const showMarquee = !reduceMotion;
  const homeHeroMobile = variant === "homeHero" && narrow;
  /** Crop to lower ~52% of viewBox so only the “street” band shows — fewer shapes, no roofline clutter in the headline zone (mobile home hero only). */
  const clipY = homeHeroMobile ? 308 : 0;
  const clipH = homeHeroMobile ? 332 : 640;
  return (
    <svg className="home-hero-illustration-svg" viewBox="0 0 900 640" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" shapeRendering="geometricPrecision">
      <defs>
        <clipPath id={clipId}>
          <rect x="0" y={clipY} width="900" height={clipH} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <g className="home-hero-marquee-root">
          {showMarquee ? (
            <animateTransform attributeName="transform" type="translate" additive="replace" from="0 0" to="-900 0" dur={marqueeDur} repeatCount="indefinite" calcMode="linear" />
          ) : null}
          <g transform="translate(0,0)">
            <HomeHeroBuildingsStrip />
          </g>
          <g transform="translate(900,0)">
            <HomeHeroBuildingsStrip />
          </g>
        </g>
      </g>
    </svg>
  );
}

/** Same skyline marquee as home hero, behind a dark scrim — login/signup column & feed hero only. */
export function SkylineHeroBackdrop({ tone = "soft", className = "" }) {
  return (
    <div className={`skyline-backdrop skyline-backdrop--dark skyline-backdrop--tone-${tone === "standard" ? "standard" : "soft"} ${className}`.trim()} aria-hidden="true">
      <div className="skyline-backdrop-svg-wrap">
        <HomeHeroIllustration />
      </div>
      <div className="skyline-backdrop-scrim" />
    </div>
  );
}

/**
 * Thin decorative skyline strip for section dividers (marquee runs inside HomeHeroIllustration).
 * Variants tune scrim + height for light sections, trust band, footer, or legal pages.
 */
export function SkylineRibbon({ variant = "light", className = "" }) {
  return (
    <div className={`skyline-ribbon skyline-ribbon--${variant} ${className}`.trim()} aria-hidden="true">
      <div className="skyline-ribbon-svg-wrap">
        <HomeHeroIllustration />
      </div>
      <div className="skyline-ribbon-scrim" />
    </div>
  );
}
