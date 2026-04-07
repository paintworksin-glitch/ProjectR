export const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,500;0,600;0,700;0,800;1,600&family=Fraunces:ital,wght@0,700;0,800;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;0,8..60,700;0,8..60,800;1,8..60,600&display=swap');
  .home-heading { font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; font-weight: 600; font-optical-sizing: auto; letter-spacing: -0.012em; line-height: 1.22; }
  .login-heading-serif { font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; letter-spacing: -0.01em; line-height: 1.2; }
  .h1big-hero.home-hero-section { min-height: clamp(480px, 72vh, 760px); min-height: clamp(480px, 72dvh, 760px); width: 100%; display: flex; flex-direction: column; align-items: stretch; box-sizing: border-box; }
  .home-hero-overlay { position: absolute; inset: 0; z-index: 1; background: rgba(26, 26, 26, 0.6); pointer-events: none; }
  .home-hero-overlay--light { background: linear-gradient(180deg, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.32) 45%, rgba(255,255,255,0.14) 100%); pointer-events: none; }
  .home-hero-inner { position: relative; z-index: 2; width: 100%; max-width: var(--home-content-max); margin: 0 auto; padding: clamp(24px, 4vw, 48px) var(--home-gutter-x) clamp(22px, 3.5vw, 40px); display: flex; flex-direction: column; align-items: center; justify-content: space-between; flex: 1 1 auto; min-height: 0; min-width: 0; box-sizing: border-box; will-change: transform; gap: clamp(22px, 3.5vw, 36px); }
  .home-hero-copy { width: 100%; max-width: 52rem; margin: 0 auto; text-align: center; display: flex; flex-direction: column; align-items: center; flex: 1 1 auto; justify-content: center; padding-top: clamp(12px, 3vh, 40px); }
  .home-hero-headline { margin: 0; text-wrap: balance; }
  .home-hero-headline-line { display: block; color: #fff; }
  .home-hero-headline-line--sans { font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif; font-size: clamp(36px, 5vw, 56px); line-height: 1.05; letter-spacing: -0.035em; font-weight: 800; }
  .home-hero-headline-line--serif { font-family: 'Fraunces', Georgia, 'Times New Roman', serif; font-size: clamp(28px, 3.6vw, 42px); line-height: 1.12; letter-spacing: -0.02em; font-weight: 700; margin-top: 0.14em; font-style: normal; }
  .home-hero-parallax-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .home-hero-parallax-bg img { position: absolute; left: 0; top: -10%; width: 100%; height: 120%; object-fit: cover; object-position: center; opacity: 1; will-change: transform; }
  .home-hero-parallax-bg--illustration { display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 55%, #e8edf4 100%); contain: layout style; }
  .home-hero-parallax-bg-inner { position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; overflow: hidden; pointer-events: none; }
  .home-hero-mobile-art-rail { display: none; }
  .home-hero-illustration-svg { width: min(118vw, 1200px); max-width: none; height: auto; min-height: min(52vh, 440px); flex-shrink: 0; will-change: transform; display: block; }
  .home-hero-marquee-root { will-change: transform; }
  @media (prefers-reduced-motion: reduce) {
    .home-hero-marquee-root { will-change: auto; }
  }
  @media (max-width: 640px) {
    .home-hero-illustration-svg { width: min(160vw, 880px); min-height: min(38vh, 300px); max-height: 40vh; }
    .home-hero-parallax-bg--illustration { align-items: flex-end; padding-bottom: env(safe-area-inset-bottom, 0px); }
  }
  @media (max-width: 380px) {
    .home-hero-illustration-svg { min-height: min(34vh, 280px); }
  }
  .skyline-backdrop { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .skyline-backdrop-svg-wrap { position: absolute; left: 0; right: 0; bottom: 0; width: 100%; display: flex; align-items: flex-end; justify-content: center; line-height: 0; }
  .skyline-backdrop-svg-wrap .home-hero-illustration-svg { width: min(220vw, 1680px); max-width: none; height: auto; min-height: 0; min-width: 720px; max-height: min(52vh, 420px); flex-shrink: 0; opacity: 0.38; }
  .skyline-backdrop--tone-standard .skyline-backdrop-svg-wrap .home-hero-illustration-svg { opacity: 0.44; max-height: min(58vh, 480px); }
  .skyline-backdrop--dark .skyline-backdrop-scrim { position: absolute; inset: 0; z-index: 1; background: linear-gradient(180deg, rgba(15,23,42,0.82) 0%, rgba(15,23,42,0.9) 50%, rgba(15,23,42,0.94) 100%); pointer-events: none; }
  @media (max-width: 900px) {
    .skyline-backdrop-svg-wrap .home-hero-illustration-svg { min-width: 600px; max-height: min(38vh, 260px); }
    .skyline-backdrop--tone-standard .skyline-backdrop-svg-wrap .home-hero-illustration-svg { max-height: min(42vh, 300px); }
  }
  .auth-left-panel { position: relative; overflow: hidden; background: #0f172a; border-right: 1px solid rgba(51,65,85,0.6); }
  @media (max-width: 900px) {
    .auth-left-panel { border-right: none; border-bottom: 1px solid rgba(51,65,85,0.6); }
  }
  .skyline-ribbon { position: relative; width: 100%; overflow: hidden; pointer-events: none; flex-shrink: 0; }
  .skyline-ribbon-svg-wrap { position: relative; width: 100%; display: flex; align-items: flex-end; justify-content: center; line-height: 0; }
  .skyline-ribbon-svg-wrap .home-hero-illustration-svg { width: min(200vw, 1600px); max-width: none; height: auto; min-height: 0; min-width: 560px; flex-shrink: 0; opacity: 0.4; }
  .skyline-ribbon-scrim { position: absolute; inset: 0; pointer-events: none; z-index: 1; }
  .skyline-ribbon--light { height: clamp(48px, 9vw, 80px); margin: 0 -1px; background: linear-gradient(180deg, rgba(248,250,252,0) 0%, rgba(241,245,249,0.45) 100%); }
  .skyline-ribbon--light .skyline-ribbon-scrim { background: linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.88) 72%, #fff 100%); }
  .skyline-ribbon--band { height: clamp(56px, 11vw, 96px); margin-bottom: clamp(10px, 2vw, 20px); }
  .skyline-ribbon--band .skyline-ribbon-svg-wrap .home-hero-illustration-svg { opacity: 0.34; max-height: min(110px, 18vw); }
  .skyline-ribbon--band .skyline-ribbon-scrim { background: linear-gradient(180deg, rgba(251,252,254,0.25) 0%, rgba(245,247,250,0.92) 100%); }
  .skyline-ribbon--trust { height: clamp(52px, 10vw, 84px); margin: 0 auto 20px; max-width: var(--home-content-max); width: 100%; opacity: 0.88; border-radius: 14px; overflow: hidden; box-shadow: 0 1px 0 rgba(255,255,255,0.75) inset; padding: 0 var(--home-gutter-x); box-sizing: border-box; }
  .skyline-ribbon--trust .skyline-ribbon-svg-wrap .home-hero-illustration-svg { opacity: 0.3; max-height: 88px; }
  .skyline-ribbon--trust .skyline-ribbon-scrim { background: linear-gradient(180deg, rgba(255,255,255,0.5) 0%, rgba(246,248,251,0.92) 100%); }
  .skyline-ribbon--footer { position: relative; z-index: 0; height: clamp(68px, 11vw, 100px); margin: 0; border-bottom: 1px solid rgba(255,255,255,0.09); }
  .skyline-ribbon--footer .skyline-ribbon-svg-wrap .home-hero-illustration-svg { opacity: 0.2; max-height: min(92px, 13vw); filter: saturate(0.88) brightness(1.06); }
  .skyline-ribbon--footer .skyline-ribbon-scrim { background: linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.94) 100%); }
  .skyline-ribbon--page { height: clamp(44px, 11vw, 68px); margin-top: clamp(24px, 4vw, 40px); border-radius: 0 0 16px 16px; overflow: hidden; border: 1px solid rgba(226,232,240,0.65); border-top: none; box-shadow: 0 8px 32px rgba(15,23,42,0.04); }
  .skyline-ribbon--page .skyline-ribbon-svg-wrap .home-hero-illustration-svg { opacity: 0.3; max-height: 60px; min-width: 460px; }
  .skyline-ribbon--page .skyline-ribbon-scrim { background: linear-gradient(180deg, rgba(248,250,252,0.35) 0%, rgba(241,245,249,0.98) 100%); }
  .home-band-split { background: linear-gradient(180deg, #fbfcfe 0%, #f5f7fa 100%); padding: clamp(44px, 5.5vw, 68px) var(--home-gutter-x); border-top: 1px solid rgba(226,232,240,0.45); border-bottom: 1px solid rgba(226,232,240,0.45); position: relative; }
  .home-hero-qs-dock { position: absolute; z-index: 4; right: max(14px, env(safe-area-inset-right)); bottom: max(18px, env(safe-area-inset-bottom)); width: min(400px, calc(100vw - 28px)); display: flex; flex-direction: column; align-items: stretch; gap: 0; pointer-events: none; }
  .home-hero-qs-dock > * { pointer-events: auto; }
  .home-hero-qs-toggle { display: flex; align-items: center; gap: 10px; width: 100%; padding: 12px 16px; border-radius: 14px; border: 1px solid rgba(226,232,240,0.95); background: rgba(255,255,255,0.96); box-shadow: 0 4px 24px rgba(15,23,42,0.08), 0 1px 3px rgba(15,23,42,0.04); font-family: inherit; font-size: 14px; font-weight: 700; color: var(--navy); cursor: pointer; -webkit-tap-highlight-color: transparent; transition: box-shadow 0.22s ease, border-color 0.2s, transform 0.15s ease; text-align: left; }
  .home-hero-qs-toggle:hover { border-color: rgba(26,26,26,0.18); box-shadow: 0 6px 28px rgba(15,23,42,0.1); }
  .home-hero-qs-toggle:active { transform: scale(0.99); }
  .home-hero-qs-toggle-icon { font-size: 1.05rem; line-height: 1; flex-shrink: 0; }
  .home-hero-qs-toggle-chevron { margin-left: auto; font-size: 11px; opacity: 0.55; flex-shrink: 0; }
  .home-hero-qs-panel { max-height: 0; overflow: hidden; opacity: 0; transition: max-height 0.38s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.28s ease; margin-top: 0; pointer-events: none; }
  .home-hero-qs-panel--open { max-height: min(78vh, 920px); opacity: 1; margin-top: 10px; overflow: visible; pointer-events: auto; }
  .home-hero-qs-panel .home-hero-search-wrap { max-height: min(72vh, 860px); overflow-y: auto; -webkit-overflow-scrolling: touch; overscroll-behavior: contain; }
  .home-hero-search-wrap { min-width: 0; width: 100%; max-width: 440px; display: flex; flex-direction: column; gap: 14px; flex-shrink: 0; align-self: center; }
  .home-hero-search { flex: 0 1 380px; max-width: 100%; min-width: 0; width: 100%; border-radius: var(--home-card-radius) !important; padding: 0 !important; overflow: hidden; background: #fff !important; border: var(--home-card-border) !important; box-shadow: var(--home-card-shadow) !important; backdrop-filter: blur(8px) saturate(120%) !important; -webkit-backdrop-filter: blur(8px) saturate(120%) !important; }
  .home-qs-inner { padding: 22px 22px 24px; }
  .home-qs-head { display: flex; align-items: center; gap: 12px; margin-bottom: 0; padding-bottom: 16px; border-bottom: 1px solid rgba(226,232,240,0.42); }
  .home-qs-title { font-family: 'Source Serif 4', Georgia, serif; font-size: 1.25rem; font-weight: 700; color: var(--navy); margin: 0; letter-spacing: -0.024em; line-height: 1.2; }
  .home-qs-icon { font-size: 1.1rem; opacity: 0.78; line-height: 1; flex-shrink: 0; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(248,250,252,0.95); border: 1px solid rgba(226,232,240,0.85); }
  .home-qs-stack { display: flex; flex-direction: column; gap: 16px; margin-top: 18px; }
  .home-qs-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px; align-items: start; }
  .home-qs-grid2 + .home-qs-grid2 { margin-top: 2px; }
  .home-qs-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-readable); margin-bottom: 9px; letter-spacing: 0.005em; line-height: 1.4; }
  .home-qs-label-em { font-size: 12.5px; font-weight: 600; color: var(--navy); letter-spacing: -0.01em; padding-left: 10px; margin-left: -10px; border-left: 2px solid rgba(26,26,26,0.35); }
  .home-qs-hint { font-size: 12px; color: var(--text-body); margin: 10px 0 0; line-height: 1.55; font-weight: 500; padding: 12px 14px; border-radius: 12px; background: rgba(248,250,252,0.92); border: 1px solid rgba(226,232,240,0.75); }
  .home-hero-search .inp.home-qs-inp { min-height: 46px; padding: 12px 14px !important; font-size: 14px !important; line-height: 1.45; color: var(--text); border-radius: 12px !important; background: rgba(248,250,252,0.88) !important; border: 1px solid rgba(226,232,240,0.72) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.75) !important; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
  .home-hero-search select.inp.home-qs-inp { cursor: pointer; padding-right: 38px !important; appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 18px; }
  .home-hero-search select.inp.home-qs-inp:disabled { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23cbd5e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
  .home-hero-search .inp.home-qs-inp:hover:not(:disabled) { border-color: rgba(148,163,184,0.65) !important; background: #fff !important; }
  .home-hero-search .inp.home-qs-inp:focus { border-color: rgba(26,26,26,0.35) !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(26,26,26,0.08), inset 0 1px 0 rgba(255,255,255,1) !important; outline: none; }
  .home-hero-search .inp.home-qs-inp:disabled { opacity: 0.5; cursor: not-allowed; background: rgba(241,245,249,0.85) !important; }
  .home-qs-submit { width: 100%; margin-top: 10px; padding: 15px 20px !important; border-radius: 12px !important; font-size: 15px !important; font-weight: 700; letter-spacing: -0.017em; }
  .home-hero-actions { display: flex; gap: 12px 16px; margin-top: clamp(22px, 3.2vw, 34px); padding-top: 4px; flex-wrap: wrap; align-items: center; justify-content: center; }
  .home-hero-cta { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 14px 22px; border-radius: 12px; font-size: 14px; font-weight: 700; letter-spacing: -0.014em; line-height: 1.2; text-align: center; box-sizing: border-box; font-family: inherit; cursor: pointer; border: none; transition: transform 0.2s ease, box-shadow 0.22s ease, background 0.2s ease, border-color 0.2s ease, color 0.2s ease; -webkit-tap-highlight-color: transparent; }
  .home-hero-cta--primary { background: #fff; color: #1a1a1a; box-shadow: 0 1px 2px rgba(0,0,0,0.06), 0 6px 20px rgba(0,0,0,0.12); }
  .home-hero-cta--primary:hover { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.14); }
  .home-hero-cta--primary:active { transform: translateY(0); }
  .home-hero-cta--secondary { background: transparent; color: #fff; border: 2px solid rgba(255,255,255,0.92); box-shadow: none; }
  .home-hero-cta--secondary:hover { background: rgba(255,255,255,0.08); border-color: #fff; transform: translateY(-1px); }
  .home-hero-cta--secondary:active { transform: translateY(0); }
  .home-hero-tabs { display: flex; width: 100%; align-items: stretch; gap: 5px; padding: 5px; margin: 0; box-sizing: border-box; background: rgba(241,245,249,0.55); border: 1px solid rgba(226,232,240,0.5); border-radius: 14px; box-shadow: inset 0 1px 1px rgba(15,23,42,0.02); }
  .home-hero-tab { flex: 1; min-width: 0; text-align: center; padding: 11px 12px; font-weight: 600; font-size: 13.5px; letter-spacing: -0.012em; line-height: 1.28; color: #526073; background: transparent; border: none; border-radius: 11px; margin: 0; cursor: pointer; font-family: inherit; transition: color 0.18s ease, background 0.18s ease, box-shadow 0.2s ease, font-weight 0.15s ease, transform 0.12s ease; -webkit-tap-highlight-color: transparent; }
  .home-hero-tab:hover:not(.home-hero-tab-active) { color: var(--navy2); background: rgba(255,255,255,0.55); }
  .home-hero-tab:focus-visible { outline: 2px solid rgba(26,26,26,0.35); outline-offset: 1px; }
  .home-hero-tab:active { transform: scale(0.98); }
  .home-hero-tab-active { color: var(--primary); font-weight: 600; background: #fff; box-shadow: 0 1px 2px rgba(15,23,42,0.04), inset 0 1px 0 rgba(255,255,255,1); }
  .home-hero-tab-active:hover { color: var(--primary2); background: #fff; box-shadow: 0 1px 3px rgba(15,23,42,0.05), inset 0 1px 0 rgba(255,255,255,1); }
  .mob-nav { display: none; justify-content: space-around; align-items: stretch; box-sizing: border-box; width: 100%; left: 0; right: 0; }
  .mob-nav button { -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Inter', sans-serif; background: #f6f8fb; color: #0f172a; overflow-x: hidden; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; line-height: 1.575; letter-spacing: -0.008em; width: 100%; max-width: 100%; }
  #root { width: 100%; max-width: 100%; overflow-x: hidden; }
  input, select, textarea, button { font-family: inherit; }
  :root {
    --primary: #1a1a1a; --primary2: #333333; --primary-light: #f4f4f5; --primary-mid: #d4d4d4;
    --navy: #0f172a; --navy2: #1e293b; --green: #1a1a1a; --green2: #333333;
    --green-light: #f4f4f5; --green-mid: #d4d4d4; --cream: #f8fafc;
    --white: #ffffff; --gray: #f1f5f9; --border: #e8ecf1; --text: #0f172a;
    --muted: #64748b; --text-readable: #475569; --text-body: #334155;
    --home-content-max: 1120px;
    --home-gutter-x: clamp(18px, 3.2vw, 32px);
    --shadow: 0 1px 2px rgba(15,23,42,0.028), 0 8px 24px rgba(15,23,42,0.032);
    --shadow-lg: 0 2px 8px rgba(15,23,42,0.028), 0 24px 48px rgba(15,23,42,0.05);
    --shadow-card-hover: 0 6px 20px rgba(15,23,42,0.045), 0 2px 6px rgba(15,23,42,0.028);
    --home-card-radius: 18px;
    --home-card-surface: rgba(255,255,255,0.985);
    --home-card-border: 1px solid rgba(226,232,240,0.55);
    --home-card-border-soft: 1px solid rgba(15,23,42,0.04);
    --home-card-shadow: 0 1px 2px rgba(15,23,42,0.02), 0 12px 40px rgba(15,23,42,0.032);
    --home-card-shadow-hover: 0 2px 10px rgba(15,23,42,0.035), 0 18px 48px rgba(15,23,42,0.045);
  }
  .card { background: var(--white); border-radius: 16px; border: 1px solid rgba(226,232,240,0.65); box-shadow: var(--shadow); transition: box-shadow 0.32s ease, transform 0.32s ease, border-color 0.24s ease; }
  .card:hover { box-shadow: var(--shadow-card-hover); transform: translateY(-0.5px); border-color: rgba(203,213,225,0.78); }
  .card-flat { background: var(--white); border-radius: 14px; border: 1px solid rgba(226,232,240,0.65); box-shadow: 0 1px 2px rgba(15,23,42,0.02); }
  .inp { background: var(--white); border: 1px solid rgba(226,232,240,0.95); color: var(--text); border-radius: 12px; padding: 11px 14px; font-size: 14px; width: 100%; outline: none; transition: border 0.2s, box-shadow 0.2s, background 0.2s; font-family: inherit; }
  .inp::placeholder { color: var(--muted); }
  .inp:focus { border-color: rgba(26,26,26,0.35); box-shadow: 0 0 0 3px rgba(26,26,26,0.08); }
  .inp option { background: #fff; color: var(--text); }
  .btn-primary { background: linear-gradient(180deg, #333333 0%, var(--primary) 48%, #111111 100%); color: #fff; border: none; cursor: pointer; font-weight: 600; font-family: inherit; box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 4px 14px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12); transition: transform 0.22s ease, box-shadow 0.26s ease, filter 0.2s ease; }
  .btn-primary:hover:not(:disabled) { filter: brightness(1.04); transform: translateY(-0.5px); box-shadow: 0 2px 8px rgba(0,0,0,0.14), 0 8px 22px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.14); }
  .btn-primary:active:not(:disabled) { transform: translateY(0); box-shadow: 0 1px 3px rgba(0,0,0,0.2), inset 0 1px 3px rgba(0,0,0,0.15); transition-duration: 0.08s; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-green { background: linear-gradient(180deg, #333333 0%, var(--primary) 48%, #111111 100%); color: #fff; border: none; cursor: pointer; font-weight: 600; font-family: inherit; box-shadow: 0 1px 2px rgba(0,0,0,0.12), 0 4px 14px rgba(0,0,0,0.1), inset 0 1px 0 rgba(255,255,255,0.12); transition: transform 0.22s ease, box-shadow 0.26s ease, filter 0.2s ease; }
  .btn-green:hover { filter: brightness(1.04); transform: translateY(-0.5px); box-shadow: 0 2px 8px rgba(0,0,0,0.14), 0 8px 22px rgba(0,0,0,0.12), inset 0 1px 0 rgba(255,255,255,0.14); }
  .btn-green:active { transform: translateY(0); }
  .btn-outline { background: #fff; border: 1px solid rgba(226,232,240,0.75); color: var(--navy2); cursor: pointer; font-weight: 600; font-family: inherit; backdrop-filter: blur(8px); transition: transform 0.2s ease, border-color 0.22s, box-shadow 0.24s, background 0.2s, color 0.2s; box-shadow: 0 1px 2px rgba(15,23,42,0.02); }
  .btn-outline:hover { border-color: rgba(26,26,26,0.22); color: var(--primary); background: #fff; transform: translateY(-0.5px); box-shadow: 0 2px 8px rgba(15,23,42,0.035); }
  .btn-outline:active { transform: translateY(0); }
  .btn-ghost { background: rgba(241,245,249,0.85); border: 1.5px solid var(--border); color: var(--muted); cursor: pointer; font-weight: 600; font-family: inherit; backdrop-filter: blur(8px); transition: transform 0.18s ease, background 0.2s, border-color 0.2s; }
  .btn-ghost:hover { background: rgba(226,232,240,0.95); color: var(--text); transform: translateY(-1px); }
  .btn-ghost:active { transform: scale(0.98); }
  .glass-panel {
    background: rgba(255,255,255,0.78) !important;
    backdrop-filter: blur(24px) saturate(170%);
    -webkit-backdrop-filter: blur(24px) saturate(170%);
    border: 1px solid rgba(255,255,255,0.94) !important;
    box-shadow: 0 6px 28px rgba(15,23,42,0.06), 0 1px 3px rgba(15,23,42,0.03), inset 0 1px 0 rgba(255,255,255,0.98) !important;
  }
  .card.glass-card {
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(16px) saturate(140%);
    -webkit-backdrop-filter: blur(16px) saturate(140%);
    border: 1px solid rgba(226,232,240,0.55);
    box-shadow: 0 1px 2px rgba(15,23,42,0.02), 0 12px 36px rgba(15,23,42,0.035), inset 0 1px 0 rgba(255,255,255,0.9);
    transition: transform 0.34s ease, box-shadow 0.34s ease, border-color 0.26s ease;
  }
  .card.glass-card:hover {
    transform: translateY(-1px);
    border-color: rgba(203,213,225,0.65);
    box-shadow: 0 2px 10px rgba(15,23,42,0.04), 0 20px 44px rgba(15,23,42,0.045), inset 0 1px 0 rgba(255,255,255,0.95);
  }
  .glass-footer {
    background: rgba(15,23,42,0.88) !important;
    backdrop-filter: blur(24px) saturate(130%);
    -webkit-backdrop-filter: blur(24px) saturate(130%);
    border-top: 1px solid rgba(255,255,255,0.1);
    box-shadow: 0 -4px 28px rgba(0,0,0,0.12);
  }
  .glass-nav-enhance {
    background: rgba(255,255,255,0.74) !important;
    backdrop-filter: blur(28px) saturate(185%);
    -webkit-backdrop-filter: blur(28px) saturate(185%);
  }
  .nav-desktop-cluster { display: flex; gap: 4px; align-items: center; flex-wrap: wrap; justify-content: flex-end; max-width: min(100%, 720px); }
  .nav-mob-actions { display: none; align-items: center; gap: 10px; flex-shrink: 0; }
  .nav-mob-toggle {
    display: none; align-items: center; justify-content: center; width: 44px; height: 44px; border-radius: 12px;
    border: 1px solid rgba(226,232,240,0.95); background: rgba(255,255,255,0.96); cursor: pointer; color: var(--navy2);
    font-size: 20px; line-height: 1; box-shadow: 0 1px 2px rgba(15,23,42,0.04); transition: background 0.2s, border-color 0.2s, transform 0.15s;
  }
  .nav-mob-toggle:active { transform: scale(0.96); }
  .nav-mob-cta {
    padding: 9px 16px; border-radius: 10px; font-weight: 700; font-size: 13px; border: none; cursor: pointer; font-family: inherit;
    background: linear-gradient(180deg, #333333 0%, var(--primary) 48%, #111111 100%); color: #fff;
    box-shadow: 0 1px 2px rgba(0,0,0,0.18); white-space: nowrap;
  }
  .nav-drawer-backdrop { position: fixed; inset: 0; z-index: 9998; background: rgba(15,23,42,0.38); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }
  .nav-drawer-panel {
    position: fixed; top: 0; right: 0; bottom: 0; width: min(100%, 400px); max-width: 100vw; z-index: 9999;
    background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%); box-shadow: -16px 0 56px rgba(15,23,42,0.14);
    display: flex; flex-direction: column; padding: calc(16px + env(safe-area-inset-top)) 20px 24px calc(20px + env(safe-area-inset-right));
    box-sizing: border-box; border-left: 1px solid rgba(226,232,240,0.85); animation: navDrawerIn 0.28s cubic-bezier(0.4, 0, 0.2, 1) forwards;
  }
  @keyframes navDrawerIn { from { transform: translateX(100%); opacity: 0.96; } to { transform: translateX(0); opacity: 1; } }
  .nav-drawer-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; padding-bottom: 12px; border-bottom: 1px solid rgba(226,232,240,0.75); }
  .nav-drawer-title { font-family: 'Source Serif 4', Georgia, serif; font-size: 1.125rem; font-weight: 700; color: var(--navy); letter-spacing: -0.02em; margin: 0; }
  .nav-drawer-close { width: 40px; height: 40px; border-radius: 10px; border: 1px solid rgba(226,232,240,0.9); background: #fff; cursor: pointer; font-size: 22px; line-height: 1; color: var(--navy2); display: flex; align-items: center; justify-content: center; }
  .nav-drawer-links { display: flex; flex-direction: column; gap: 4px; flex: 1; overflow: auto; -webkit-overflow-scrolling: touch; }
  .nav-drawer-links button {
    text-align: left; padding: 14px 16px; border-radius: 12px; border: none; background: transparent; font-size: 15px; font-weight: 600;
    color: var(--navy2); font-family: inherit; cursor: pointer; transition: background 0.18s, color 0.18s;
  }
  .nav-drawer-links button:hover, .nav-drawer-links button:focus-visible { background: rgba(241,245,249,0.95); color: var(--primary); outline: none; }
  .nav-drawer-links button.nav-drawer-link-active { background: var(--primary-light); color: var(--primary); }
  .nav-drawer-foot { margin-top: auto; padding-top: 14px; border-top: 1px solid rgba(226,232,240,0.75); display: flex; flex-direction: column; gap: 8px; }
  .btn-danger { background: #FEF2F2; border: 1.5px solid #FECACA; color: #DC2626; cursor: pointer; font-weight: 600; transition: all 0.2s; font-family: inherit; }
  .btn-danger:hover { background: #FEE2E2; }
  .badge { padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; letter-spacing: 0.2px; display: inline-block; }
  .tag { background: var(--primary-light); color: var(--primary); border: 1px solid var(--primary-mid); }
  .tag-navy { background: rgba(15,23,42,0.05); color: var(--navy); border: 1px solid var(--border); }
  .section-label { font-size: 11px; font-weight: 600; color: var(--primary2); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 10px; display: block; }
  .home-hero-section { background: #1a1a1a; border-bottom: none; isolation: isolate; position: relative; }
  .home-hero-section--light { background: #ffffff; border-bottom: 1px solid rgba(226,232,240,0.65); }
  .home-hero-section--light .home-hero-headline-line { color: #1a1a1a; }
  .home-hero-section--light .home-hero-headline-line--serif { color: #2d2d2d; }
  .home-hero-section--light .home-hero-cta--primary { background: #1a1a1a; color: #fff; box-shadow: 0 1px 2px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.12); }
  .home-hero-section--light .home-hero-cta--primary:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.1), 0 14px 32px rgba(0,0,0,0.14); }
  .home-hero-section--light .home-hero-cta--secondary { color: #1a1a1a; border: 2px solid rgba(26,26,26,0.28); }
  .home-hero-section--light .home-hero-cta--secondary:hover { background: rgba(26,26,26,0.05); border-color: rgba(26,26,26,0.45); }
  .home-hero-section--light .home-hero-inner { justify-content: center; padding-bottom: max(64px, 7vh); }
  @media (min-width: 769px) {
    .h1big-hero.home-hero-section .home-hero-inner .home-hero-mobile-art-rail { display: none !important; }
    .h1big-hero.home-hero-section .home-hero-inner .home-hero-qs-dock {
      position: absolute !important;
      right: max(14px, env(safe-area-inset-right)) !important;
      bottom: max(18px, env(safe-area-inset-bottom)) !important;
      left: auto !important;
      width: min(400px, calc(100vw - 28px)) !important;
      max-width: none !important;
      margin: 0 !important;
      pointer-events: none !important;
    }
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration .home-hero-parallax-bg-inner {
      position: absolute !important;
      inset: 0 !important;
      align-items: center !important;
      justify-content: center !important;
    }
  }
  .home-section-subnav { position: sticky; top: 72px; z-index: 90; background: #fff; border-bottom: 1px solid rgba(226,232,240,0.9); box-shadow: 0 1px 0 rgba(15,23,42,0.04); }
  .home-section-subnav-inner { max-width: var(--home-content-max); margin: 0 auto; padding: 0 var(--home-gutter-x); display: flex; flex-wrap: wrap; align-items: center; justify-content: center; gap: 6px 8px; min-height: 52px; box-sizing: border-box; }
  .home-section-subnav a { font-size: 13px; font-weight: 600; letter-spacing: -0.01em; color: #1a1a1a; text-decoration: none; padding: 10px 14px; border-radius: 10px; transition: background 0.18s ease, color 0.18s ease; }
  .home-section-subnav a:hover { background: rgba(26,26,26,0.06); color: #1a1a1a; }
  .home-section-subnav a:focus-visible { outline: 2px solid rgba(26,26,26,0.35); outline-offset: 2px; }
  @media (prefers-reduced-motion: reduce) {
    .home-hero-parallax-bg img { transform: none !important; will-change: auto; }
    .home-hero-parallax-bg--illustration { transform: none !important; will-change: auto; }
    .home-hero-inner.home-hero-parallax-inner { transform: none !important; }
  }
  @media (max-width: 768px) {
    .home-hero-marquee-root { will-change: transform; }
  }
  .home-prop-section { padding: clamp(36px, 4.5vw, 56px) var(--home-gutter-x) clamp(44px, 5.5vw, 64px); max-width: var(--home-content-max); margin: 0 auto; width: 100%; box-sizing: border-box; }
  .home-prop-section + .home-sample-pane { padding-top: clamp(28px, 4vw, 44px); }
  #prop-grid { scroll-margin-top: 120px; }
  #home-sample-outputs { scroll-margin-top: 120px; }
  #home-band-split { scroll-margin-top: 120px; }
  #home-testimonials { scroll-margin-top: 120px; }
  .home-featured-toolbar { display: flex; gap: 22px 32px; margin-bottom: clamp(22px, 3vw, 36px); flex-wrap: wrap; align-items: flex-start; justify-content: space-between; }
  .home-featured-title { font-size: clamp(1.4rem, 2.45vw, 1.72rem); font-weight: 700; color: var(--navy); letter-spacing: -0.022em; line-height: 1.18; }
  .home-featured-sub { font-size: 15px; color: var(--text-readable); margin-top: 10px; font-weight: 400; line-height: 1.62; max-width: 40em; }
  .home-featured-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: flex-end; padding-top: 2px; }
  .home-ui-clear-filters { padding: 10px 18px; border-radius: 12px; background: #fff; color: var(--navy2); border: 1px solid rgba(226,232,240,0.75); font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; line-height: 1.25; box-shadow: 0 1px 2px rgba(15,23,42,0.02); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: border-color 0.22s, color 0.2s, box-shadow 0.24s, transform 0.2s ease; min-height: 44px; box-sizing: border-box; }
  .home-ui-clear-filters:hover { border-color: rgba(26,26,26,0.22); color: var(--primary); box-shadow: 0 2px 8px rgba(15,23,42,0.035); transform: translateY(-0.5px); }
  .home-featured-actions .btn-outline { min-height: 44px; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; box-sizing: border-box; }
  .home-featured-actions .btn-primary { min-height: 44px; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; box-sizing: border-box; border: none; }
  .home-band-split-inner { max-width: var(--home-content-max); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: clamp(22px, 3vw, 28px); align-items: stretch; }
  .home-sample-pane { --sample-cream: #f9f6f0; --sample-card: #ede8e0; --sample-brown: #3c2a2c; --sample-brown-mid: #5c4548; position: relative; background: var(--sample-cream); padding: clamp(40px, 5.5vw, 72px) 0; border: none; overflow-x: clip; }
  .home-sample-pane-bg-artifacts { position: absolute; inset: 0; pointer-events: none; z-index: 0; overflow: hidden; }
  .home-sample-pane-bg-artifacts .skyline-backdrop { opacity: 0.9; }
  .home-sample-pane-bg-artifacts .skyline-backdrop-scrim { background: linear-gradient(180deg, rgba(249,246,240,0.82) 0%, rgba(249,246,240,0.92) 45%, rgba(237,232,224,0.94) 100%) !important; }
  .home-sample-pane-bg-artifacts .skyline-backdrop-svg-wrap .home-hero-illustration-svg { opacity: 0.26 !important; max-height: min(42vh, 340px) !important; }
  .home-sample-pane-bg-orb { position: absolute; border-radius: 50%; filter: blur(60px); opacity: 0.35; }
  .home-sample-pane-bg-orb--a { width: min(55vw, 420px); height: min(55vw, 420px); top: -12%; right: -8%; background: rgba(148,163,184,0.35); }
  .home-sample-pane-bg-orb--b { width: min(45vw, 320px); height: min(45vw, 320px); bottom: 5%; left: -6%; background: rgba(167,139,250,0.12); }
  .home-sample-pane-inner { position: relative; z-index: 1; }
  .home-sample-pane-shell { max-width: var(--home-content-max); margin: 0 auto; padding: 0 var(--home-gutter-x); box-sizing: border-box; width: 100%; }
  .home-sample-pane-topbar { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 16px 20px; margin-bottom: clamp(22px, 3vw, 32px); }
  .home-sample-pane-pills { display: inline-flex; flex-wrap: wrap; align-items: center; gap: 4px; padding: 6px; background: #fff; border-radius: 999px; box-shadow: 0 2px 20px rgba(60,42,44,0.08); }
  .home-sample-pane-pill { border: none; padding: 10px 16px; border-radius: 999px; font-size: 13px; font-weight: 600; font-family: inherit; background: transparent; color: var(--sample-brown); cursor: pointer; transition: background 0.2s ease, color 0.2s ease; -webkit-tap-highlight-color: transparent; line-height: 1.2; }
  .home-sample-pane-pill:hover { background: rgba(60,42,44,0.06); }
  .home-sample-pane-pill:focus-visible { outline: 2px solid rgba(60,42,44,0.45); outline-offset: 2px; }
  .home-sample-pane-pill--active { background: var(--sample-brown); color: #fff; }
  .home-sample-pane-pill--active:hover { background: var(--sample-brown-mid); }
  .home-sample-pane-cta { flex-shrink: 0; padding: 12px 22px; border-radius: 999px; border: none; background: var(--sample-brown); color: #fff; font-weight: 700; font-size: 13px; font-family: inherit; cursor: pointer; transition: filter 0.2s ease, transform 0.15s ease; white-space: nowrap; -webkit-tap-highlight-color: transparent; }
  .home-sample-pane-cta:hover { filter: brightness(1.06); }
  .home-sample-pane-cta:active { transform: scale(0.98); }
  .home-sample-pane-head { text-align: left; max-width: 36rem; }
  .home-sample-pane-eyebrow { font-family: 'Source Serif 4', Georgia, serif; font-size: clamp(15px, 1.9vw, 17px); font-weight: 600; color: var(--sample-brown-mid); margin: 0 0 8px; letter-spacing: -0.01em; }
  .home-sample-pane-title { margin: 0; font-family: 'Plus Jakarta Sans', 'Inter', system-ui, sans-serif; font-size: clamp(1.65rem, 3.2vw, 2.15rem); font-weight: 800; color: var(--sample-brown); letter-spacing: -0.03em; line-height: 1.12; }
  .home-sample-pane-grid-outer { margin-top: clamp(24px, 3.5vw, 36px); width: 100%; max-width: var(--home-content-max); margin-left: auto; margin-right: auto; padding: 0 max(var(--home-gutter-x), env(safe-area-inset-left)) 0 max(var(--home-gutter-x), env(safe-area-inset-right)); box-sizing: border-box; }
  .home-sample-pane-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: clamp(14px, 2.2vw, 22px); align-items: stretch; width: 100%; }
  @media (max-width: 900px) {
    .home-sample-pane-grid { grid-template-columns: 1fr; max-width: min(400px, 100%); margin-left: auto; margin-right: auto; }
  }
  .home-sample-pane-card-wrap { min-height: 0; width: 100%; max-width: 100%; display: flex; flex-direction: column; align-items: stretch; align-self: stretch; }
  .home-sample-pane-card { width: 100%; background: var(--sample-card); border-radius: 22px; padding: 14px 14px 16px; box-sizing: border-box; display: flex; flex-direction: column; min-height: 0; box-shadow: 0 1px 0 rgba(255,255,255,0.65) inset; }
  .home-sample-pane-card--stack { gap: 12px; transition: transform 0.22s ease, box-shadow 0.22s ease; overflow: hidden; max-width: 100%; box-sizing: border-box; }
  .home-sample-pane-card--stack:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(60,42,44,0.12); }
  @media (hover: none) {
    .home-sample-pane-card--stack:active { transform: scale(0.985); box-shadow: 0 10px 28px rgba(60,42,44,0.1); }
  }
  .home-sample-pane-card-open { flex: 1 1 auto; display: flex; flex-direction: column; gap: 10px; margin: 0; padding: 0; border: none; background: transparent; cursor: pointer; text-align: left; font: inherit; border-radius: 12px; transition: opacity 0.15s; -webkit-tap-highlight-color: transparent; }
  .home-sample-pane-card-open:focus-visible { outline: 2px solid rgba(60,42,44,0.45); outline-offset: 3px; }
  .home-sample-card-download { width: 100%; border: 1.5px solid rgba(60,42,44,0.18); background: #fff; color: var(--sample-brown); font-family: inherit; font-size: 13px; font-weight: 700; padding: 10px 14px; border-radius: 12px; cursor: pointer; transition: background 0.2s, border-color 0.2s, opacity 0.2s; -webkit-tap-highlight-color: transparent; flex-shrink: 0; }
  .home-sample-card-download:hover:not(:disabled) { background: rgba(60,42,44,0.06); border-color: rgba(60,42,44,0.32); }
  .home-sample-card-download:disabled { opacity: 0.65; cursor: not-allowed; }
  .home-sample-wa-mock { position: relative; width: 100%; aspect-ratio: 1; border-radius: 16px; overflow: hidden; background: linear-gradient(145deg, #3d3530 0%, #1a1410 55%, #0f0c0a 100%); box-shadow: 0 8px 28px rgba(0,0,0,0.2); flex-shrink: 0; container-type: inline-size; isolation: isolate; }
  .home-sample-wa-mock-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; z-index: 1; }
  .home-sample-wa-mock-fallback { position: absolute; inset: 0; z-index: 1; background: linear-gradient(160deg, #5c4a42 0%, #2d2520 45%, #1a1410 100%); }
  .home-sample-wa-mock-scrim { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.02) 38%, rgba(10,5,2,0.78) 68%, rgba(10,5,2,0.94) 100%); pointer-events: none; z-index: 2; }
  .home-sample-wa-mock-row { position: absolute; top: 10px; left: 10px; right: 10px; display: flex; justify-content: space-between; align-items: flex-start; pointer-events: none; z-index: 3; }
  .home-sample-wa-mock-pill { background: var(--primary); color: #fff; font-size: clamp(8px, 2.6cqi, 10px); font-weight: 800; padding: 4px 10px; border-radius: 999px; letter-spacing: 0.04em; }
  .home-sample-wa-mock-bottom { position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 12px 12px; pointer-events: none; z-index: 3; }
  .home-sample-wa-mock-price { font-family: 'Fraunces', Georgia, serif; font-size: clamp(17px, 6.2cqi, 24px); font-weight: 900; color: #fff; line-height: 1.05; margin-bottom: 4px; }
  .home-sample-wa-mock-price span { font-size: clamp(9px, 2.8cqi, 11px); font-weight: 500; color: rgba(255,255,255,0.65); margin-left: 3px; }
  .home-sample-wa-mock-ttl { font-size: clamp(10px, 3.1cqi, 12px); font-weight: 800; color: #fff; line-height: 1.28; margin-bottom: 3px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
  .home-sample-wa-mock-loc { font-size: clamp(8px, 2.5cqi, 10px); color: rgba(255,255,255,0.58); }
  .home-sample-pdf-mock { position: relative; width: 100%; aspect-ratio: 1; border-radius: 16px; overflow: hidden; background: #fff; box-shadow: 0 8px 28px rgba(15,23,42,0.1); border: 1px solid rgba(226,232,240,0.95); display: grid; grid-template-rows: minmax(0, 0.5fr) minmax(0, 0.5fr); flex-shrink: 0; isolation: isolate; }
  .home-sample-pdf-mock-hero { position: relative; min-height: 120px; width: 100%; overflow: hidden; background: linear-gradient(135deg, #e8e4df 0%, #d4cfc8 100%); }
  .home-sample-pdf-mock-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: center; display: block; z-index: 1; }
  .home-sample-pdf-mock-fallback { position: absolute; inset: 0; z-index: 1; background: linear-gradient(135deg, #cbd5e1 0%, #94a3b8 50%, #64748b 100%); }
  .home-sample-pdf-mock-hero-scrim { position: absolute; inset: 0; background: linear-gradient(180deg, rgba(15,23,42,0.04) 0%, rgba(255,255,255,0.35) 100%); pointer-events: none; z-index: 2; }
  .home-sample-pdf-mock-label { position: absolute; bottom: 8px; left: 10px; font-size: 9px; font-weight: 800; color: #fff; text-shadow: 0 1px 8px rgba(0,0,0,0.45); letter-spacing: 0.07em; text-transform: uppercase; z-index: 3; }
  .home-sample-pdf-mock-body { padding: 10px 12px 12px; background: linear-gradient(180deg, #f6f4f1 0%, #fff 55%); min-height: 0; }
  .home-sample-pdf-mock-line { height: 6px; background: #e5e1dc; border-radius: 3px; margin-bottom: 8px; }
  .home-sample-pdf-mock-line.short { width: 74%; }
  .home-sample-pane-card-media { border-radius: 18px; overflow: hidden; background: #faf7f2; aspect-ratio: 1; display: flex; align-items: center; justify-content: center; position: relative; margin-bottom: 14px; container-type: inline-size; }
  .home-sample-pane-card-media--tall { aspect-ratio: 4/5; }
  .home-sample-pane-wa-frame { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; min-height: 0; }
  .home-sample-pane .home-wa-sample-scale-wrap { width: 420px; height: 420px; transform-origin: center center; transform: scale(0.68); }
  @supports (width: 1cqi) {
    .home-sample-pane .home-wa-sample-scale-wrap { transform: scale(min(0.68, calc(100cqi / 420))); }
  }
  .home-sample-pane-card-title { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; font-size: 16px; font-weight: 800; color: var(--sample-brown); margin: 0 0 8px; letter-spacing: -0.02em; line-height: 1.2; }
  .home-sample-pane-card-desc { font-size: 13px; line-height: 1.55; color: var(--sample-brown-mid); margin: 0; flex: 1 1 auto; }
  .home-sample-pane-carousel { position: relative; border-radius: 18px; overflow: visible; background: #fff; margin-bottom: 14px; min-height: 280px; }
  .home-sample-pane-carousel-viewport { border-radius: 18px; overflow: hidden; background: #fff; }
  .home-sample-pane-carousel-viewport { position: relative; min-height: 280px; }
  .home-sample-pane-pdf-clip { max-height: 280px; overflow: hidden; border-radius: 12px; background: #fff; }
  .home-sample-pane-carousel-text { padding: 22px 20px 28px; font-size: 14px; line-height: 1.65; color: var(--sample-brown); }
  .home-sample-pane-carousel-nav { position: absolute; top: 50%; transform: translateY(-50%); z-index: 2; width: 40px; height: 40px; border-radius: 50%; border: none; background: rgba(255,255,255,0.95); color: var(--sample-brown); font-size: 18px; font-weight: 700; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 12px rgba(60,42,44,0.12); transition: transform 0.15s ease; -webkit-tap-highlight-color: transparent; }
  .home-sample-pane-carousel-nav:hover { transform: translateY(-50%) scale(1.04); }
  .home-sample-pane-carousel-nav--prev { left: 10px; }
  .home-sample-pane-carousel-nav--next { right: 10px; }
  .home-sample-pane-carousel-dots { position: absolute; bottom: 12px; left: 50%; transform: translateX(-50%); display: flex; gap: 8px; z-index: 2; }
  .home-sample-pane-carousel-dot { width: 8px; height: 8px; border-radius: 50%; border: none; padding: 0; background: rgba(255,255,255,0.55); cursor: pointer; transition: transform 0.15s, background 0.15s; }
  .home-sample-pane-carousel-dot--active { background: #fff; transform: scale(1.15); }
  .home-sample-pane-card--click { appearance: none; -webkit-appearance: none; border: none; cursor: pointer; text-align: left; font: inherit; display: flex; flex-direction: column; align-items: stretch; transition: transform 0.22s ease, box-shadow 0.22s ease; }
  .home-sample-pane-card--click:hover { transform: translateY(-3px); box-shadow: 0 14px 36px rgba(60,42,44,0.14); }
  .home-sample-pane-card--click:focus-visible { outline: 3px solid rgba(60,42,44,0.45); outline-offset: 3px; }
  .home-sample-pane-card-media-img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .home-sample-modal-overlay { position: fixed; inset: 0; z-index: 400; background: rgba(15,23,42,0.48); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); display: flex; align-items: center; justify-content: center; padding: max(12px, env(safe-area-inset-top)) max(14px, env(safe-area-inset-right)) max(12px, env(safe-area-inset-bottom)) max(14px, env(safe-area-inset-left)); box-sizing: border-box; }
  .home-sample-modal-panel { --sample-brown: #3c2a2c; --sample-brown-mid: #5c4548; background: #fff; border-radius: 20px; max-width: 520px; width: 100%; max-height: min(88vh, 720px); display: flex; flex-direction: column; overflow: hidden; padding: 0; position: relative; box-shadow: 0 24px 64px rgba(0,0,0,0.22); border: 1px solid rgba(226,232,240,0.9); box-sizing: border-box; }
  .home-sample-modal-scroll { overflow-y: auto; -webkit-overflow-scrolling: touch; flex: 1 1 auto; min-height: 0; padding: 52px 24px 12px; box-sizing: border-box; }
  .home-sample-modal-close { position: absolute; top: 12px; right: 12px; width: 44px; height: 44px; border: none; border-radius: 12px; background: rgba(241,245,249,0.98); color: #3c2a2c; font-size: 22px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center; font-family: inherit; transition: background 0.2s; z-index: 2; flex-shrink: 0; }
  .home-sample-modal-close:hover { background: #e2e8f0; }
  .home-sample-modal-panel h3 { font-family: 'Plus Jakarta Sans', 'Inter', sans-serif; font-size: 1.35rem; font-weight: 800; color: var(--sample-brown); margin: 0 0 10px; letter-spacing: -0.03em; line-height: 1.2; padding-right: 48px; }
  .home-sample-modal-panel .home-sample-modal-tag { font-size: 13px; color: var(--sample-brown-mid); margin: 0 0 18px; line-height: 1.55; }
  .home-sample-modal-panel h4 { font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; color: var(--sample-brown-mid); margin: 18px 0 10px; }
  .home-sample-modal-panel ul { margin: 0; padding-left: 1.15rem; color: #334155; font-size: 14px; line-height: 1.6; }
  .home-sample-modal-panel li { margin-bottom: 8px; }
  .home-sample-modal-dl { flex-shrink: 0; margin-top: 0; padding: 14px 24px max(20px, env(safe-area-inset-bottom)); border-top: 1px solid rgba(226,232,240,0.95); background: linear-gradient(180deg, rgba(255,255,255,0.88) 0%, #fff 35%); box-sizing: border-box; }
  .home-sample-modal-dl-btn { width: 100%; border: none; border-radius: 12px; background: #3c2a2c; color: #fff; font-family: inherit; font-size: 15px; font-weight: 700; padding: 14px 18px; min-height: 48px; cursor: pointer; transition: filter 0.2s, opacity 0.2s; -webkit-tap-highlight-color: transparent; touch-action: manipulation; }
  .home-sample-modal-dl-btn:hover:not(:disabled) { filter: brightness(1.06); }
  .home-sample-modal-dl-btn:disabled { opacity: 0.65; cursor: not-allowed; }
  .home-wa-sample-inner { max-width: var(--home-content-max); margin: 0 auto; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: stretch; gap: 0; }
  .home-wa-sample-frame { width: 357px; height: 357px; max-width: 100%; box-sizing: border-box; display: flex; align-items: center; justify-content: center; flex-shrink: 0; container-type: inline-size; }
  .home-wa-sample-scale-wrap { width: 420px; height: 420px; flex-shrink: 0; transform-origin: center center; transform: scale(0.85); }
  @supports (width: 1cqi) {
    .home-wa-sample-scale-wrap { transform: scale(min(0.85, calc(100cqi / 420))); }
  }
  .home-wa-card-mock { width: 420px; height: 420px; border-radius: 20px; overflow: hidden; box-shadow: 0 24px 56px rgba(0,0,0,0.32); position: relative; background: #1a1410; }
  /* Keep Northing chip crisp when the mock card is CSS-scaled (avoids subpixel flex drift in WebKit). */
  .home-wa-sample-scale-wrap .northing-wa-chip-lockup { transform: translateZ(0); }
  .home-wa-sample-scale-wrap .northing-wa-chip-lockup span { -webkit-font-smoothing: antialiased; }
  .home-wa-sample-actions { display: flex; flex-wrap: wrap; justify-content: center; align-items: center; gap: 12px; margin-top: clamp(22px, 3.2vw, 32px); padding-top: 2px; }
  .home-pdf-sample-frame { max-width: 720px; margin: clamp(12px, 2vw, 20px) auto 0; width: 100%; border-radius: 14px; overflow: hidden; box-shadow: 0 14px 44px rgba(15,23,42,0.08); border: 1px solid rgba(226,232,240,0.9); background: #fff; box-sizing: border-box; }
  .home-pdf-download-wrap { display: flex; justify-content: center; margin-top: clamp(22px, 3vw, 32px); }
  .home-band-card { padding: 30px 28px; display: flex; gap: 20px; align-items: flex-start; border-radius: var(--home-card-radius); }
  .home-band-card-media { width: 52px; height: 52px; border-radius: 13px; background: linear-gradient(160deg, #333333 0%, var(--primary) 100%); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.12), 0 6px 16px rgba(0,0,0,0.08); }
  .home-band-card h3 { font-size: 17px; font-weight: 700; color: var(--navy); margin: 0 0 12px; letter-spacing: -0.018em; line-height: 1.24; }
  .home-band-card p { font-size: 14px; color: var(--text-readable); line-height: 1.64; margin: 0 0 20px; max-width: 40em; }
  .home-band-card .btn-primary { min-height: 44px; padding: 11px 22px; border-radius: 12px; font-size: 13px; font-weight: 700; border: none; box-sizing: border-box; }
  .home-band-cta { position: relative; background: linear-gradient(180deg, #f6f8fb 0%, #f0f3f7 48%, #f8fafc 100%); padding: clamp(44px, 5.5vw, 68px) var(--home-gutter-x); overflow: hidden; }
  .home-cta-inner { max-width: var(--home-content-max); margin: 0 auto; position: relative; z-index: 1; }
  .home-cta-eyebrow { text-align: center; margin-bottom: clamp(22px, 3vw, 32px); }
  .home-cta-eyebrow span { font-size: 11px; font-weight: 600; color: var(--primary2); text-transform: uppercase; letter-spacing: 0.16em; }
  .home-cta-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: clamp(18px, 2.2vw, 24px); }
  .home-cta-grid .card.glass-card { padding: 28px 24px; border-radius: var(--home-card-radius); }
  .home-cta-grid .home-cta-stars { font-size: 12px; margin-bottom: 12px; letter-spacing: 0.08em; line-height: 1; opacity: 0.88; }
  .home-cta-grid .home-cta-quote { font-size: 14px; color: var(--text-body); line-height: 1.72; font-style: normal; margin: 0; letter-spacing: -0.008em; }
  .home-cta-grid .home-cta-name { font-weight: 700; font-size: 13px; color: var(--navy); letter-spacing: -0.015em; line-height: 1.3; }
  .home-cta-grid .home-cta-agency { font-size: 11px; color: var(--text-readable); margin-top: 3px; font-weight: 500; line-height: 1.35; }
  .home-cta-grid .home-cta-testimonial-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
  .home-cta-grid .home-cta-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(160deg, #333333 0%, var(--primary) 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 15px; flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.12); }
  .home-footer-inner { max-width: var(--home-content-max); margin: 0 auto; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 22px 28px; position: relative; z-index: 1; padding: 0 var(--home-gutter-x); box-sizing: border-box; }
  .gr-listings { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 288px), 1fr)); gap: clamp(22px, 2.8vw, 30px); }
  .home-page-shell .card:not(.glass-card) { border-radius: var(--home-card-radius); border: var(--home-card-border); background: #fff; box-shadow: var(--home-card-shadow); transition: box-shadow 0.28s ease, transform 0.28s ease, border-color 0.22s ease; }
  .home-page-shell .card:not(.glass-card):hover { transform: translateY(-1px); box-shadow: var(--home-card-shadow-hover); border-color: rgba(203,213,225,0.78); }
  .home-page-shell .card.glass-card { border-radius: var(--home-card-radius); background: var(--home-card-surface); border: var(--home-card-border); box-shadow: var(--home-card-shadow), inset 0 1px 0 rgba(255,255,255,0.94); backdrop-filter: blur(12px) saturate(125%); -webkit-backdrop-filter: blur(12px) saturate(125%); transition: box-shadow 0.34s ease, transform 0.34s ease, border-color 0.26s ease; }
  .home-page-shell .card.glass-card:hover { transform: translateY(-0.5px); border-color: rgba(203,213,225,0.62); box-shadow: var(--home-card-shadow-hover), inset 0 1px 0 rgba(255,255,255,0.98); }
  .home-empty-state-card { padding: clamp(44px, 5.5vw, 56px) clamp(28px, 4vw, 40px) !important; text-align: center; }
  .home-empty-state-card .home-empty-icon { font-size: 44px; line-height: 1; margin-bottom: 16px; opacity: 0.88; }
  .home-empty-state-card h3 { font-family: 'Source Serif 4', Georgia, serif; font-size: clamp(18px, 2.2vw, 20px); font-weight: 700; color: var(--navy); margin: 0 0 10px; letter-spacing: -0.02em; line-height: 1.25; }
  .home-empty-state-card p { color: var(--text-readable); font-size: 14px; line-height: 1.62; margin: 0; max-width: 28em; margin-left: auto; margin-right: auto; }
  .home-listing-card { cursor: pointer; }
  .home-listing-card .home-listing-media { height: 212px; background: linear-gradient(168deg, #f3f5f8 0%, #eceff4 100%); position: relative; overflow: hidden; }
  .home-listing-card .home-listing-body { padding: 20px 22px 22px; display: flex; flex-direction: column; gap: 0; }
  .home-listing-card .home-listing-title { font-size: 15px; font-weight: 600; color: var(--navy); margin: 0 0 8px; line-height: 1.35; letter-spacing: -0.014em; }
  .home-listing-card .home-listing-loc { font-size: 12px; color: var(--text-readable); margin: 0 0 14px; line-height: 1.45; display: flex; align-items: center; gap: 5px; }
  .home-listing-card .home-listing-price { font-family: 'Source Serif 4', Georgia, serif; font-size: 21px; font-weight: 700; color: var(--navy); margin: 0 0 16px; letter-spacing: -0.024em; line-height: 1.12; }
  .home-listing-card .home-listing-price .home-listing-unit { font-family: 'Inter', sans-serif; font-size: 12px; font-weight: 500; color: var(--text-readable); letter-spacing: -0.01em; margin-left: 0.12em; }
  .home-listing-card .home-listing-meta { display: flex; justify-content: space-between; align-items: center; padding-top: 16px; border-top: 1px solid rgba(226,232,240,0.75); gap: 12px; }
  .home-listing-card .home-listing-specs { display: flex; gap: 14px; font-size: 12px; color: var(--text-readable); line-height: 1.4; font-weight: 500; flex-wrap: wrap; }
  .home-listing-card .home-listing-badge { flex-shrink: 0; font-size: 12px; font-weight: 600; color: var(--navy2); letter-spacing: -0.01em; background: rgba(255,255,255,0.92); padding: 8px 14px; border-radius: 12px; border: 1px solid rgba(226,232,240,0.8); box-shadow: 0 1px 2px rgba(15,23,42,0.03); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: border-color 0.2s ease, color 0.2s ease, box-shadow 0.2s ease; }
  .home-listing-card:hover .home-listing-badge { border-color: rgba(26,26,26,0.22); color: var(--primary); box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
  .home-listing-card .home-listing-status { position: absolute; top: 14px; right: 14px; font-size: 10px; font-weight: 700; letter-spacing: 0.07em; text-transform: uppercase; padding: 6px 12px; border-radius: 999px; line-height: 1; box-shadow: 0 1px 3px rgba(15,23,42,0.06); }
  .home-listing-card .home-listing-photo-ph { width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; font-size: 42px; opacity: 0.28; }
  @keyframes shiny-sweep { 0%{background-position:200% center} 100%{background-position:-200% center} }
  @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  .shiny-text { display: inline-block; }
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
  @keyframes slideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-5px)} 40%,80%{transform:translateX(5px)} }
  @keyframes spin { to { transform: rotate(360deg); } }
  .af{animation:float 5s ease-in-out infinite} .asl{animation:slideUp 0.4s ease forwards}
  .afd{animation:fadeIn 0.3s ease forwards} .shk{animation:shake 0.4s ease}
  .spin{animation:spin 0.8s linear infinite; display:inline-block; width:16px; height:16px; border:2px solid rgba(255,255,255,0.3); border-top-color:#fff; border-radius:50%;}
  ::-webkit-scrollbar{width:5px} ::-webkit-scrollbar-track{background:var(--gray)} ::-webkit-scrollbar-thumb{background:var(--border);border-radius:3px}
  @media print {
    body > * { display:none !important; }
    #pdf-print-area { display:block !important; position:static !important; width:100% !important; padding:32px !important; box-sizing:border-box !important; }
    #pdf-print-area * { visibility:visible !important; }
  }
  @media (max-width: 768px) and (prefers-reduced-motion: reduce) {
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration .home-hero-illustration-svg { opacity: 0.75 !important; filter: saturate(0.81) !important; }
  }
  @media(max-width:768px){
    .h1big-hero.home-hero-section { isolation: isolate !important; align-items: stretch !important; min-height: clamp(480px, 60dvh, 600px) !important; }
    .h1big-hero.home-hero-section .home-hero-decor-layer { contain: layout paint !important; pointer-events: none !important; z-index: 0 !important; }
    .h1big-hero.home-hero-section .home-hero-parallax-bg { z-index: 0 !important; pointer-events: none !important; }
    .h1big-hero.home-hero-section .home-hero-parallax-bg-inner { pointer-events: none !important; overflow: hidden !important; }
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration { overflow: hidden !important; pointer-events: none !important; z-index: 0 !important; }
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration .home-hero-illustration-svg { pointer-events: none !important; min-height: 0 !important; }
    .h1big-hero.home-hero-section .home-hero-inner { position: relative !important; z-index: 2 !important; isolation: isolate !important; display: flex !important; flex-direction: column !important; flex: 1 1 auto !important; justify-content: flex-start !important; align-items: stretch !important; gap: 0 !important; padding: max(16px, env(safe-area-inset-top)) max(20px, env(safe-area-inset-left)) max(16px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-right)) !important; min-height: 0 !important; background: linear-gradient(180deg, rgba(255,255,255,0.998) 0%, rgba(255,255,255,0.97) 36%, rgba(255,255,255,0.9) 52%, rgba(255,255,255,0.52) 74%, rgba(255,255,255,0.12) 90%, transparent 100%) !important; }
    .h1big-hero.home-hero-section .home-hero-copy { position: relative !important; z-index: 2 !important; flex: 0 0 auto !important; justify-content: flex-start !important; align-items: center !important; max-width: min(100%, 360px) !important; width: 100% !important; margin-left: auto !important; margin-right: auto !important; padding: 14px 0 11px !important; gap: 0 !important; box-sizing: border-box !important; }
    .h1big-hero.home-hero-section .home-hero-headline-line--sans { color: #111111 !important; text-shadow: 0 1px 0 rgba(255,255,255,0.98), 0 0 1px rgba(255,255,255,0.9) !important; }
    .h1big-hero.home-hero-section .home-hero-headline-line--serif { color: #1f1f1f !important; text-shadow: 0 1px 0 rgba(255,255,255,0.98), 0 0 1px rgba(255,255,255,0.88) !important; }
    .h1big-hero.home-hero-section .home-hero-mobile-art-rail { position: relative !important; z-index: 2 !important; display: block !important; flex: 0 0 0 !important; min-height: 0 !important; max-height: 0 !important; height: 0 !important; width: 100% !important; max-width: min(360px, 100%) !important; margin: 0 !important; padding: 0 !important; overflow: hidden !important; pointer-events: none !important; }
    .h1big-hero.home-hero-section .home-hero-inner .home-hero-qs-dock { position: relative !important; left: auto !important; right: auto !important; bottom: auto !important; top: auto !important; width: 100% !important; max-width: min(360px, 100%) !important; margin: 10px auto 0 !important; z-index: 5 !important; pointer-events: none !important; align-self: center !important; flex-shrink: 0 !important; box-sizing: border-box !important; }
    .h1big-hero.home-hero-section .home-hero-inner .home-hero-qs-dock .home-hero-search-wrap { max-width: 100% !important; width: 100% !important; align-self: stretch !important; }
    .h1big-hero.home-hero-section .home-hero-overlay--light { z-index: 1 !important; background: linear-gradient(180deg, rgba(255,255,255,1) 0%, rgba(255,255,255,0.98) 12%, rgba(255,255,255,0.92) 26%, rgba(255,255,255,0.66) 42%, rgba(255,255,255,0.32) 58%, rgba(255,255,255,0.14) 74%, rgba(255,255,255,0.07) 88%, rgba(255,255,255,0.05) 100%) !important; }
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration { align-items: stretch !important; justify-content: center !important; padding-bottom: 0 !important; }
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration .home-hero-parallax-bg-inner { position: absolute !important; left: 0 !important; right: 0 !important; top: clamp(278px, 60dvh, 388px) !important; bottom: 0 !important; display: flex !important; align-items: flex-end !important; justify-content: center !important; overflow: hidden !important; z-index: 0 !important; }
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration .home-hero-illustration-svg { width: min(102vw, 520px) !important; min-height: 0 !important; max-height: min(11vh, 96px) !important; opacity: 0.5 !important; transform: none !important; filter: saturate(0.74) !important; }
    .h1big-hero.home-hero-section .home-hero-illustration-svg--heroMobile { max-height: min(11vh, 96px) !important; opacity: 0.5 !important; }
    .h1big-hero.home-hero-section .home-hero-headline-line--serif { margin-top: 0.06em !important; }
    .h1big-hero.home-hero-section .home-hero-actions { position: relative !important; z-index: 2 !important; flex-direction: column !important; flex-wrap: nowrap !important; align-items: stretch !important; margin-top: 15px !important; gap: 12px !important; width: 100% !important; max-width: min(360px, 100%) !important; margin-left: auto !important; margin-right: auto !important; padding: 2px 0 0 !important; box-sizing: border-box !important; box-shadow: 0 10px 32px rgba(15,23,42,0.05) !important; border-radius: 14px !important; }
    .h1big-hero.home-hero-section .home-hero-actions .home-hero-cta { min-height: 52px !important; height: 52px !important; box-sizing: border-box !important; width: 100% !important; max-width: 100% !important; flex: 0 0 auto !important; }
    .h1big-hero.home-hero-section .home-hero-marquee-root { will-change: auto !important; }
    html{-webkit-text-size-adjust:100%;text-size-adjust:100%}
    body{font-size:16px;line-height:1.6}
    .inp{font-size:16px!important;min-height:48px!important;box-sizing:border-box!important}
    textarea.inp{min-height:100px!important;font-size:16px!important}
    .nav-desktop-cluster{display:none!important}
    .nav-mob-actions{display:flex!important}
    .nav-mob-toggle{display:inline-flex!important}
    .glass-nav-enhance{padding-left:max(20px, env(safe-area-inset-left))!important;padding-right:max(20px, env(safe-area-inset-right))!important;min-height:56px!important}
    .nav-logo-img{height:46px!important;max-width:200px!important}
    .hm{display:none!important}
    .gr{grid-template-columns:1fr!important}
    .gr3{grid-template-columns:1fr!important}
    .mob-nav{display:flex!important;align-items:stretch!important;justify-content:space-around!important;padding:10px max(10px, env(safe-area-inset-left)) max(14px, env(safe-area-inset-bottom)) max(10px, env(safe-area-inset-right))!important;background:rgba(255,255,255,0.97)!important;backdrop-filter:blur(16px) saturate(180%)!important;-webkit-backdrop-filter:blur(16px) saturate(180%)!important;border-top:1px solid rgba(226,232,240,0.95)!important;border-top-left-radius:16px!important;border-top-right-radius:16px!important;box-shadow:0 -6px 28px rgba(15,23,42,0.06)!important}
    .mob-nav button{min-height:52px!important;min-width:56px!important;padding:10px 8px!important;border-radius:14px!important;align-items:center!important;justify-content:center!important;gap:4px!important;color:var(--navy2)!important}
    .mob-nav button:active{background:rgba(241,245,249,0.95)!important}
    .mob-nav button span:first-child{font-size:22px!important;line-height:1!important}
    .mob-nav button span:last-child{font-size:10px!important;font-weight:700!important;letter-spacing:0.03em!important;opacity:0.88!important}
    .login-page{flex-direction:column!important}
    .login-hero-col{display:none!important}
    .login-form-col{width:100%!important;padding:max(20px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) max(28px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-left))!important;min-height:100vh!important;min-height:100dvh!important;box-sizing:border-box!important}
    .login-form-col{width:100%!important;flex:1}
    .home-page-shell{overflow-x:clip!important;max-width:100%!important;padding-bottom:max(68px, calc(48px + env(safe-area-inset-bottom)))!important}
    .home-section-subnav-inner{padding-left:max(16px, env(safe-area-inset-left))!important;padding-right:max(16px, env(safe-area-inset-right))!important;min-height:48px!important;flex-wrap:nowrap!important;overflow-x:auto!important;-webkit-overflow-scrolling:touch!important;scrollbar-width:none!important;justify-content:flex-start!important;gap:6px!important;scroll-padding-inline:8px!important}
    .home-section-subnav-inner::-webkit-scrollbar{display:none!important}
    .home-section-subnav a{flex-shrink:0!important;white-space:nowrap!important;padding:11px 14px!important;min-height:44px!important;box-sizing:border-box!important;display:inline-flex!important;align-items:center!important;touch-action:manipulation!important}
    .home-hero-inner{display:flex!important;flex-direction:column!important;flex:1 1 auto!important;justify-content:center!important;padding:clamp(20px,4vw,36px) max(20px, env(safe-area-inset-left)) clamp(20px,3.5vw,32px) max(20px, env(safe-area-inset-right))!important;gap:clamp(18px,4vw,28px)!important;align-items:center!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important;min-height:0!important}
    .home-hero-section--light .home-hero-inner{justify-content:center!important;padding-bottom:max(132px, calc(52px + 56px + min(10vh, 72px) + env(safe-area-inset-bottom)))!important}
    .home-hero-search-wrap{justify-self:stretch!important;max-width:100%!important}
    .home-hero-copy{text-align:center!important;max-width:min(100%,440px)!important;width:100%!important;margin-left:auto!important;margin-right:auto!important;flex:1 1 auto!important;align-self:stretch!important;justify-content:center!important;padding:clamp(12px,2.8vh,36px) max(14px,3.5vw) clamp(8px,1.5vh,16px)!important}
    .home-hero-headline-line--sans{font-size:clamp(28px,7vw,40px)!important;line-height:1.06!important;letter-spacing:-0.032em!important}
    .home-hero-headline-line--serif{font-size:clamp(22px,5.5vw,30px)!important;line-height:1.1!important;margin-top:0.12em!important}
    .home-hero-search-wrap{width:100%!important;max-width:100%!important;flex:0 0 auto!important;align-self:stretch!important;gap:12px!important}
    .home-hero-qs-toggle{min-height:48px!important;padding:13px 16px!important;touch-action:manipulation!important}
    .home-hero-search{flex:0 0 auto!important;width:100%!important;max-width:100%!important}
    .home-qs-inner{padding:20px 16px 22px!important}
    .home-qs-head{padding-bottom:16px!important;margin-bottom:0!important;gap:10px!important}
    .home-qs-title{font-size:1.0625rem!important}
    .home-qs-icon{width:40px!important;height:40px!important;font-size:1.05rem!important;border-radius:11px!important}
    .home-qs-stack{gap:14px!important;margin-top:18px!important}
    .home-qs-grid2{gap:12px 14px!important}
    .home-qs-label{margin-bottom:8px!important;font-size:12px!important}
    .home-qs-label-em{font-size:12.5px!important}
    .home-qs-hint{font-size:12px!important;padding:11px 12px!important;margin-top:8px!important;line-height:1.52!important}
    .home-hero-search .inp.home-qs-inp{min-height:48px!important;padding:13px 14px!important;font-size:16px!important;line-height:1.35!important;-webkit-appearance:none!important;appearance:none!important}
    .home-hero-search select.inp.home-qs-inp{padding-right:40px!important;background-position:right 12px center!important;background-size:18px!important}
    .home-qs-submit{margin-top:6px!important;padding:15px 18px!important;min-height:52px!important;font-size:16px!important;box-sizing:border-box!important}
    .home-hero-actions{flex-direction:column!important;justify-content:center!important;align-items:stretch!important;margin-top:clamp(20px,4.5vw,30px)!important;width:100%!important;max-width:min(100%,380px)!important;margin-left:auto!important;margin-right:auto!important;gap:12px!important;padding:4px 0 0!important;box-sizing:border-box!important}
    .home-hero-actions .home-hero-cta{width:100%!important;justify-content:center!important;text-align:center!important;box-sizing:border-box!important;min-height:52px!important;padding:15px 20px!important;font-size:15px!important}
    .home-hero-tabs{padding:5px!important;gap:5px!important;border-radius:14px!important}
    .home-hero-tab{font-size:13px!important;padding:12px 10px!important;min-height:46px!important;border-radius:11px!important;letter-spacing:-0.01em!important;display:flex!important;align-items:center!important;justify-content:center!important}
    .home-prop-section{padding:28px max(20px, env(safe-area-inset-left)) 36px max(20px, env(safe-area-inset-right))!important;max-width:100%!important;width:100%!important;box-sizing:border-box!important}
    .home-featured-title{font-size:clamp(1.35rem,4.2vw,1.65rem)!important;line-height:1.15!important;text-align:left!important}
    .home-featured-sub{font-size:14px!important;margin-top:10px!important;line-height:1.62!important;text-align:left!important;max-width:none!important}
    .home-featured-toolbar{margin-bottom:20px!important;flex-direction:column!important;align-items:stretch!important;gap:14px!important}
    .home-featured-toolbar>div:first-child{width:100%!important}
    .home-featured-actions{justify-content:stretch!important;padding-top:0!important;flex-direction:column!important;align-items:stretch!important;gap:10px!important;width:100%!important}
    .home-featured-actions .btn-outline,.home-featured-actions .btn-primary{width:100%!important;min-height:48px!important;justify-content:center!important;box-sizing:border-box!important;display:flex!important;align-items:center!important}
    .home-ui-clear-filters{width:100%!important;min-height:48px!important;box-sizing:border-box!important;display:flex!important;align-items:center!important;justify-content:center!important;font-size:13px!important}
    .gr-listings{grid-template-columns:1fr!important;gap:14px!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important}
    .home-prop-section .gr-listings,.home-prop-section .gr.gr-listings{width:100%!important}
    .home-prop-section .home-listing-card{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;touch-action:manipulation!important;-webkit-tap-highlight-color:rgba(0,0,0,0)!important}
    .home-listing-card .home-listing-media{height:min(52vw,220px)!important;min-height:180px!important}
    .home-listing-card .home-listing-body{padding:18px 16px 18px!important}
    .home-listing-card .home-listing-title{font-size:15px!important}
    .home-listing-card .home-listing-price{font-size:21px!important}
    .home-band-split{padding:36px max(20px, env(safe-area-inset-left)) 40px max(20px, env(safe-area-inset-right))!important;box-sizing:border-box!important}
    .home-band-split-inner{max-width:100%!important;width:100%!important}
    .home-band-card .btn-primary{touch-action:manipulation!important}
    .home-sample-pane{padding:32px 0 36px!important;box-sizing:border-box!important}
    .home-sample-pane-shell{padding:0 max(20px, env(safe-area-inset-left)) 0 max(20px, env(safe-area-inset-right))!important}
    #home-sample-outputs{scroll-margin-top:max(16px, env(safe-area-inset-top))!important}
    .home-sample-pane-topbar{flex-direction:column!important;align-items:stretch!important}
    .home-sample-pane-pills{justify-content:center!important;width:100%!important}
    .home-sample-pane-cta{width:100%!important;justify-content:center!important;display:flex!important}
    .home-sample-pane-head{text-align:center!important;max-width:none!important;margin-left:auto!important;margin-right:auto!important}
    .home-sample-pane-title{font-size:clamp(1.45rem,5vw,1.85rem)!important}
    .home-sample-pane-grid-outer{padding-left:max(16px, env(safe-area-inset-left))!important;padding-right:max(16px, env(safe-area-inset-right))!important}
    .home-sample-pane-grid{gap:16px!important;max-width:min(400px,100%)!important}
    .home-sample-pane-card-wrap{width:100%!important;max-width:100%!important}
    .home-sample-pane-eyebrow{font-size:14px!important}
    .home-sample-pane-card-open{gap:12px!important;touch-action:manipulation!important}
    .home-sample-pane-card-title{font-size:15px!important;line-height:1.25!important}
    .home-sample-pane-card-desc{font-size:13px!important;line-height:1.5!important}
    .home-sample-modal-overlay{padding-left:max(12px, env(safe-area-inset-left))!important;padding-right:max(12px, env(safe-area-inset-right))!important}
    .home-sample-modal-panel{max-width:100%!important;border-radius:18px!important}
    .home-sample-modal-scroll{padding-left:max(20px, env(safe-area-inset-left))!important;padding-right:max(20px, env(safe-area-inset-right))!important}
    .home-sample-modal-dl{padding-left:max(20px, env(safe-area-inset-left))!important;padding-right:max(20px, env(safe-area-inset-right))!important}
    .home-sample-pane-downloads{flex-direction:column!important;align-items:stretch!important;padding:0 max(16px, env(safe-area-inset-left)) 0 max(16px, env(safe-area-inset-right))!important}
    .home-sample-pane-downloads .btn-outline,.home-sample-pane-downloads .btn-primary{width:100%!important;justify-content:center!important}
    .home-wa-sample-frame{width:100%!important;height:auto!important;aspect-ratio:1/1!important;max-width:min(357px,100%)!important;margin-left:auto!important;margin-right:auto!important}
    .home-band-split-inner{grid-template-columns:1fr!important;gap:14px!important}
    .home-band-card{padding:22px 18px!important;gap:14px!important;flex-direction:column!important;align-items:stretch!important}
    .home-band-card .home-band-card-media{align-self:flex-start!important}
    .home-band-card h3,.home-band-card p{text-align:left!important}
    .home-band-card .btn-primary{width:100%!important;min-height:48px!important;justify-content:center!important}
    .home-band-cta{padding:36px max(20px, env(safe-area-inset-left)) 40px max(20px, env(safe-area-inset-right))!important;box-sizing:border-box!important}
    .home-cta-eyebrow{text-align:left!important;margin-bottom:18px!important;padding:0 2px!important;box-sizing:border-box!important}
    .home-cta-eyebrow span{letter-spacing:0.14em!important}
    .home-cta-grid{gap:16px!important}
    .home-cta-grid .card.glass-card{padding:22px 18px!important}
    .home-cta-grid .home-cta-quote{font-size:15px!important;line-height:1.68!important}
    .home-cta-grid .home-cta-testimonial-head{gap:14px!important}
    .home-cta-grid .home-cta-avatar{min-width:44px!important;min-height:44px!important;width:44px!important;height:44px!important}
    .feed-page{overflow-x:clip!important;box-sizing:border-box!important;padding-bottom:max(84px, calc(52px + env(safe-area-inset-bottom)))!important}
    .feed-page-hero{padding:48px max(20px, env(safe-area-inset-left)) 88px max(20px, env(safe-area-inset-right))!important;box-sizing:border-box!important}
    .feed-page-hero-inner{max-width:100%!important;padding:0 2px!important;box-sizing:border-box!important}
    .feed-page-hero-inner h1.h1big{font-size:clamp(26px,7.2vw,40px)!important;line-height:1.12!important;margin-bottom:14px!important}
    .feed-page-hero-inner>p{font-size:15px!important;line-height:1.55!important;margin-bottom:24px!important;padding:0!important}
    .feed-search-tape{flex-direction:column!important;align-items:stretch!important;gap:10px!important;padding:12px!important;max-width:100%!important;box-sizing:border-box!important}
    .feed-search-prop-pills{width:100%!important;justify-content:stretch!important;gap:8px!important}
    .feed-search-prop-pills button{flex:1 1 auto!important;min-height:44px!important;box-sizing:border-box!important}
    .feed-search-tape select,.feed-search-tape .feed-search-input{width:100%!important;min-height:48px!important;font-size:16px!important;box-sizing:border-box!important;-webkit-appearance:none;appearance:none}
    .feed-page-inner{padding:0 max(20px, env(safe-area-inset-left)) 56px max(20px, env(safe-area-inset-right))!important;margin-top:-40px!important;box-sizing:border-box!important;max-width:100%!important}
    .feed-toolbar-card{flex-direction:column!important;align-items:stretch!important;gap:14px!important}
    .feed-toolbar-card .feed-toolbar-row{width:100%!important;justify-content:space-between!important;gap:10px!important}
    .feed-toolbar-card select.inp.feed-sort-select{max-width:100%!important;width:100%!important;margin:0!important}
    .nav-drawer-panel{padding:calc(12px + env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))!important}
    .nav-drawer-links button{min-height:48px!important;padding:14px 18px!important;font-size:15px!important}
    .home-empty-state-card{padding:36px 20px!important}
    .home-empty-state-card .home-empty-icon{font-size:40px!important;margin-bottom:14px!important}
    .home-section-subnav{top:56px!important}
    #prop-grid,#home-sample-outputs,#home-band-split,#home-testimonials{scroll-margin-top:108px!important}
    .home-page-shell .card.glass-card{touch-action:manipulation!important}
    .home-footer-inner{flex-direction:column!important;align-items:center!important;text-align:center!important;gap:16px!important;padding:0 max(16px, env(safe-area-inset-left)) max(8px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-right))!important}
    .glass-footer .home-footer-inner button,.glass-footer .home-footer-inner a,.glass-footer .home-footer-inner nav button{min-height:44px!important;padding:10px 14px!important;touch-action:manipulation!important}
    .home-cta-inner{width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding-left:0!important;padding-right:0!important}
    .home-qs-grid2{grid-template-columns:1fr!important;gap:14px!important}
    @supports not (width: 1cqi) {
      .home-wa-sample-scale-wrap{transform:scale(min(0.85, calc((100vw - 96px) / 420)))!important}
    }
  }
  @media(max-width:640px){.h1big:not(.home-hero-headline){font-size:32px!important}}
  @media(max-width:480px){
    .h1big-hero.home-hero-section .home-hero-inner{padding-top:max(16px, env(safe-area-inset-top))!important;gap:0!important}
    .home-hero-inner{padding-top:clamp(16px,4vw,24px)!important;gap:clamp(16px,4vw,24px)!important}
    .home-hero-headline-line--sans{font-size:clamp(24px,6.8vw,34px)!important;line-height:1.06!important}
    .home-hero-headline-line--serif{font-size:clamp(20px,5.2vw,28px)!important;line-height:1.1!important}
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration .home-hero-illustration-svg{max-height:min(10vh,88px)!important;opacity:0.47!important;transform:none!important;filter:saturate(0.7)!important}
    .home-prop-section{padding-top:24px!important;padding-bottom:32px!important}
    .home-band-split,.home-band-cta{padding-top:32px!important;padding-bottom:36px!important}
    .home-sample-pane{padding-top:28px!important;padding-bottom:32px!important}
    .home-listing-card .home-listing-media{min-height:168px!important;height:48vw!important}
    .home-sample-pane-grid{max-width:100%!important}
  }
  @media(max-width:420px){
    .home-qs-grid2{grid-template-columns:1fr!important;gap:15px!important}
  }
  @media (max-width: 768px) and (hover: none) {
    .card:hover, .card-flat:hover { transform: none !important; }
    .home-page-shell .card:not(.glass-card):hover,
    .home-page-shell .card.glass-card:hover { transform: none !important; }
  }
  .property-detail-page { background: #fff; color: #1a1a1a; min-height: 100vh; box-sizing: border-box; padding-bottom: max(104px, calc(92px + env(safe-area-inset-bottom))); }
  .property-detail-topbar { position: sticky; top: 0; z-index: 120; display: flex; align-items: center; gap: 10px; padding: max(8px, env(safe-area-inset-top)) max(16px, env(safe-area-inset-right)) 10px max(12px, env(safe-area-inset-left)); background: rgba(255,255,255,0.94); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border-bottom: 1px solid rgba(226,232,240,0.95); }
  .property-detail-back { display: inline-flex; align-items: center; justify-content: center; min-width: 44px; min-height: 44px; padding: 0 12px; border-radius: 12px; border: 1px solid rgba(26,26,26,0.12); background: #fff; color: #1a1a1a; font-size: 14px; font-weight: 700; cursor: pointer; font-family: inherit; -webkit-tap-highlight-color: transparent; }
  .property-detail-back:active { transform: scale(0.98); }
  .property-detail-logo { height: 36px; width: auto; max-width: 160px; object-fit: contain; display: block; margin-left: auto; cursor: pointer; }
  .property-detail-carousel-shell { width: 100%; max-width: min(100%, 520px); margin: 0 auto; padding: 0 max(12px, env(safe-area-inset-left)) 0 max(12px, env(safe-area-inset-right)); box-sizing: border-box; }
  .property-detail-carousel-outer { position: relative; width: 100%; background: #0f0f0f; overflow: hidden; touch-action: pan-x pinch-zoom; border-radius: 14px; box-shadow: 0 8px 32px rgba(15,23,42,0.12); }
  .property-detail-carousel-track { display: flex; transition: transform 0.35s cubic-bezier(0.4, 0, 0.2, 1); will-change: transform; }
  .property-detail-carousel-slide { flex: 0 0 100%; width: 100%; aspect-ratio: 4/3; max-height: min(56vh, 420px); }
  .property-detail-carousel-btn { position: absolute; top: 50%; transform: translateY(-50%); z-index: 10; width: 42px; height: 42px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.45); background: rgba(0,0,0,0.5); color: #fff; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 22px; line-height: 1; font-family: inherit; padding: 0; -webkit-tap-highlight-color: transparent; transition: background 0.2s, opacity 0.2s; }
  .property-detail-carousel-btn:hover:not(:disabled) { background: rgba(0,0,0,0.65); }
  .property-detail-carousel-btn:disabled { opacity: 0.28; cursor: not-allowed; }
  .property-detail-carousel-btn--prev { left: 8px; }
  .property-detail-carousel-btn--next { right: 8px; }
  .property-detail-carousel-slide img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .property-detail-carousel-ph { width: 100%; height: 100%; min-height: 200px; display: flex; align-items: center; justify-content: center; font-size: 56px; opacity: 0.25; background: #1a1a1a; color: #fff; }
  .property-detail-dots { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 14px 16px 18px; background: #fff; flex-wrap: wrap; }
  .property-detail-dot { width: 8px; height: 8px; border-radius: 50%; border: none; padding: 0; background: #d4d4d4; cursor: pointer; transition: transform 0.2s, background 0.2s; }
  .property-detail-dot--active { background: #1a1a1a; transform: scale(1.2); }
  .property-detail-main { max-width: 720px; margin: 0 auto; padding: 0 max(18px, env(safe-area-inset-left)) 28px max(18px, env(safe-area-inset-right)); }
  .property-detail-title { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.35rem, 4.2vw, 1.75rem); font-weight: 700; color: #1a1a1a; line-height: 1.2; margin: 0 0 8px; letter-spacing: -0.02em; }
  .property-detail-loc { font-size: 15px; color: #475569; margin: 0 0 12px; line-height: 1.45; }
  .property-detail-price { font-family: 'Fraunces', Georgia, serif; font-size: clamp(1.65rem, 5vw, 2rem); font-weight: 700; color: #1a1a1a; margin: 0 0 6px; letter-spacing: -0.02em; }
  .property-detail-price-unit { font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 500; color: #64748b; margin-left: 0.15em; }
  .property-detail-chip-row { display: flex; flex-wrap: wrap; gap: 8px 10px; margin: 18px 0 22px; }
  .property-detail-chip { display: inline-flex; align-items: center; gap: 6px; padding: 9px 14px; border-radius: 999px; background: #f4f4f5; border: 1px solid rgba(26,26,26,0.08); font-size: 13px; font-weight: 600; color: #1a1a1a; line-height: 1.25; }
  .property-detail-desc { font-size: 15px; line-height: 1.65; color: #334155; margin: 0 0 12px; }
  .property-detail-desc-toggle { background: none; border: none; padding: 0; font-size: 14px; font-weight: 700; color: #1a1a1a; cursor: pointer; font-family: inherit; text-decoration: underline; text-underline-offset: 3px; margin-bottom: 22px; }
  .property-detail-ai { margin: 0 0 22px; padding: 18px 16px; border-radius: 14px; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); border: 1px solid rgba(148,163,184,0.35); }
  .property-detail-ai-title { font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #64748b; margin: 0 0 10px; }
  .property-detail-ai-text { font-size: 15px; line-height: 1.65; color: #334155; margin: 0 0 10px; white-space: pre-wrap; }
  .property-detail-ai-note { font-size: 12px; line-height: 1.45; color: #94a3b8; margin: 0; }
  .property-detail-actions { display: flex; flex-direction: column; gap: 10px; margin: 8px 0 24px; }
  .property-detail-actions .btn-primary { width: 100%; justify-content: center; display: inline-flex; align-items: center; gap: 8px; min-height: 48px; border-radius: 12px; font-size: 14px; font-weight: 700; }
  .property-detail-actions .btn-outline { width: 100%; justify-content: center; display: inline-flex; align-items: center; gap: 8px; min-height: 48px; border-radius: 12px; font-size: 14px; font-weight: 700; }
  @media (min-width: 520px) {
    .property-detail-actions { flex-direction: row; flex-wrap: wrap; }
    .property-detail-actions .btn-primary, .property-detail-actions .btn-outline { flex: 1 1 calc(33.33% - 8px); min-width: 160px; }
  }
  .property-detail-broker { margin-top: 8px; padding: 20px; border-radius: 16px; border: 1px solid rgba(226,232,240,0.95); background: #fafafa; }
  .property-detail-broker-row { display: flex; align-items: center; gap: 14px; }
  .property-detail-broker-photo { width: 56px; height: 56px; border-radius: 50%; overflow: hidden; flex-shrink: 0; background: #e5e5e5; display: flex; align-items: center; justify-content: center; font-size: 20px; font-weight: 800; color: #1a1a1a; }
  .property-detail-broker-photo img { width: 100%; height: 100%; object-fit: contain; box-sizing: border-box; padding: 2px; }
  .property-detail-broker-name { font-size: 16px; font-weight: 700; color: #1a1a1a; margin: 0 0 4px; }
  .property-detail-broker-meta { font-size: 13px; color: #64748b; margin: 0; }
  .property-detail-broker-phone { margin-top: 12px; font-size: 15px; font-weight: 600; }
  .property-detail-broker-phone a { color: #1a1a1a; text-decoration: none; }
  .property-detail-bottom-cta { position: fixed; left: 0; right: 0; bottom: 0; z-index: 150; padding: 12px max(16px, env(safe-area-inset-left)) max(12px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-right)); background: rgba(255,255,255,0.97); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid rgba(226,232,240,0.95); box-shadow: 0 -6px 28px rgba(15,23,42,0.08); }
  .property-detail-bottom-cta .btn-primary { width: 100%; min-height: 52px; border-radius: 12px; font-size: 15px; font-weight: 700; display: flex; align-items: center; justify-content: center; gap: 8px; border: none; cursor: pointer; font-family: inherit; }
  .northing-show-mobile { display: none !important; }
  .northing-show-desktop { display: inline !important; }
  .feed-filter-label-short { display: none; }
  @media (max-width: 768px) {
    .northing-show-mobile { display: inline-flex !important; }
    .northing-show-desktop { display: none !important; }
    .feed-filter-label-long { display: none !important; }
    .feed-filter-label-short { display: inline !important; }
  }
  .feed-filter-backdrop { display: none; }
  @media (max-width: 768px) {
    .feed-filter-backdrop { display: block; position: fixed; inset: 0; z-index: 180; background: rgba(15,23,42,0.45); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); }
    .feed-filter-drawer.card { position: fixed !important; left: 0 !important; right: 0 !important; bottom: 0 !important; z-index: 190 !important; margin: 0 !important; border-radius: 16px 16px 0 0 !important; max-height: min(78vh, 560px) !important; overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; padding: 20px max(16px, env(safe-area-inset-left)) max(20px, env(safe-area-inset-bottom)) max(16px, env(safe-area-inset-right)) !important; box-shadow: 0 -12px 40px rgba(15,23,42,0.18) !important; grid-template-columns: 1fr !important; }
    .dashboard-page-shell { padding-left: max(16px, env(safe-area-inset-left)) !important; padding-right: max(16px, env(safe-area-inset-right)) !important; }
    .northing-modal-overlay { padding: 0 !important; align-items: stretch !important; }
    .northing-modal-overlay > .card,
    .northing-modal-overlay > .asl { max-width: 100% !important; width: 100% !important; min-height: 100vh !important; min-height: 100dvh !important; max-height: none !important; border-radius: 0 !important; margin: 0 !important; box-sizing: border-box !important; }
    .northing-modal-overlay > .card.asl,
    .northing-modal-overlay > .asl { overflow-y: auto !important; -webkit-overflow-scrolling: touch !important; }
    .master-dash-table-wrap { overflow-x: visible !important; }
    .master-dash-table-wrap table { min-width: 0 !important; }
  }
`;
