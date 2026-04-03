import { useState, useEffect, useLayoutEffect, useRef, Component } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from "@supabase/supabase-js";
import LoginParticles from "./LoginParticles.jsx";
import PrivacyPolicyPage from "./PrivacyPolicyPage.jsx";
import TermsOfServicePage from "./TermsOfServicePage.jsx";
import AboutPage from "./AboutPage.jsx";
const SUPABASE_URL      = "https://thgnziutmpmnsrkjoext.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ256aXV0bXBtbnNya2pvZXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTUwOTcsImV4cCI6MjA4ODA5MTA5N30.SYLiGFgGChnibmEP5RQVmJzlfr_nBDpJJCOmTCZgZ9Y";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const G = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Fraunces:ital,wght@0,700;0,800;1,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,600;0,8..60,700;0,8..60,800;1,8..60,600&display=swap');
  .home-heading { font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; font-weight: 600; font-optical-sizing: auto; letter-spacing: -0.012em; line-height: 1.22; }
  .login-heading-serif { font-family: 'Source Serif 4', Georgia, 'Times New Roman', serif; letter-spacing: -0.01em; line-height: 1.2; }
  .h1big-hero { min-height: clamp(260px, 38vh, 420px); width: 100%; display: flex; flex-direction: column; align-items: stretch; box-sizing: border-box; }
  .home-hero-inner { position: relative; z-index: 1; width: 100%; max-width: var(--home-content-max); margin: 0 auto; padding: clamp(40px, 5.2vw, 68px) var(--home-gutter-x) clamp(48px, 6vw, 76px); display: grid; grid-template-columns: minmax(0, 1.12fr) minmax(min(100%, 300px), 398px); align-items: start; column-gap: clamp(28px, 4vw, 48px); row-gap: clamp(24px, 3.2vw, 36px); box-sizing: border-box; flex: 1 1 auto; min-width: 0; will-change: transform; }
  .home-hero-text { min-width: 0; max-width: 42rem; align-self: start; justify-self: start; }
  .home-hero-headline { font-size: clamp(40px, 4.35vw, 58px); line-height: 1.06; letter-spacing: -0.03em; font-weight: 800; color: var(--navy); text-wrap: balance; }
  .home-hero-headline-line { display: block; }
  .home-hero-headline-line:first-child { font-weight: 800; letter-spacing: -0.032em; }
  .home-hero-headline-line:last-child:not(:first-child) { margin-top: 0.1em; font-weight: 600; color: #334155; letter-spacing: -0.024em; }
  .home-hero-parallax-bg { position: absolute; inset: 0; overflow: hidden; pointer-events: none; z-index: 0; }
  .home-hero-parallax-bg img { position: absolute; left: 0; top: -8%; width: 100%; height: 116%; object-fit: cover; object-position: center; opacity: 0.055; will-change: transform; }
  .home-hero-search-wrap { min-width: 0; width: 100%; max-width: 400px; justify-self: end; display: flex; flex-direction: column; align-self: stretch; gap: 14px; }
  .home-hero-search { flex: 0 1 380px; max-width: 100%; min-width: 0; width: 100%; border-radius: var(--home-card-radius) !important; padding: 0 !important; overflow: hidden; background: #fff !important; border: var(--home-card-border) !important; box-shadow: var(--home-card-shadow) !important; backdrop-filter: blur(8px) saturate(120%) !important; -webkit-backdrop-filter: blur(8px) saturate(120%) !important; }
  .home-qs-inner { padding: 22px 22px 24px; }
  .home-qs-head { display: flex; align-items: center; gap: 12px; margin-bottom: 0; padding-bottom: 16px; border-bottom: 1px solid rgba(226,232,240,0.42); }
  .home-qs-title { font-family: 'Source Serif 4', Georgia, serif; font-size: 1.25rem; font-weight: 700; color: var(--navy); margin: 0; letter-spacing: -0.024em; line-height: 1.2; }
  .home-qs-icon { font-size: 1.1rem; opacity: 0.78; line-height: 1; flex-shrink: 0; width: 38px; height: 38px; display: flex; align-items: center; justify-content: center; border-radius: 12px; background: rgba(255,247,237,0.72); border: 1px solid rgba(254,215,170,0.32); }
  .home-qs-stack { display: flex; flex-direction: column; gap: 16px; margin-top: 18px; }
  .home-qs-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px 18px; align-items: start; }
  .home-qs-grid2 + .home-qs-grid2 { margin-top: 2px; }
  .home-qs-label { display: block; font-size: 12px; font-weight: 600; color: var(--text-readable); margin-bottom: 9px; letter-spacing: 0.005em; line-height: 1.4; }
  .home-qs-label-em { font-size: 12.5px; font-weight: 600; color: var(--navy); letter-spacing: -0.01em; padding-left: 10px; margin-left: -10px; border-left: 2px solid rgba(234,88,12,0.38); }
  .home-qs-hint { font-size: 12px; color: var(--text-body); margin: 10px 0 0; line-height: 1.55; font-weight: 500; padding: 12px 14px; border-radius: 12px; background: rgba(255,251,245,0.85); border: 1px solid rgba(254,215,170,0.28); }
  .home-hero-search .inp.home-qs-inp { min-height: 46px; padding: 12px 14px !important; font-size: 14px !important; line-height: 1.45; color: var(--text); border-radius: 12px !important; background: rgba(248,250,252,0.88) !important; border: 1px solid rgba(226,232,240,0.72) !important; box-shadow: inset 0 1px 0 rgba(255,255,255,0.75) !important; transition: border-color 0.2s, background 0.2s, box-shadow 0.2s; }
  .home-hero-search select.inp.home-qs-inp { cursor: pointer; padding-right: 38px !important; appearance: none; -webkit-appearance: none; -moz-appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%2394a3b8' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; background-size: 18px; }
  .home-hero-search select.inp.home-qs-inp:disabled { background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='20' height='20' fill='none' viewBox='0 0 24 24'%3E%3Cpath stroke='%23cbd5e1' stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='m6 9 6 6 6-6'/%3E%3C/svg%3E"); }
  .home-hero-search .inp.home-qs-inp:hover:not(:disabled) { border-color: rgba(148,163,184,0.65) !important; background: #fff !important; }
  .home-hero-search .inp.home-qs-inp:focus { border-color: rgba(234,88,12,0.38) !important; background: #fff !important; box-shadow: 0 0 0 3px rgba(234,88,12,0.08), inset 0 1px 0 rgba(255,255,255,1) !important; outline: none; }
  .home-hero-search .inp.home-qs-inp:disabled { opacity: 0.5; cursor: not-allowed; background: rgba(241,245,249,0.85) !important; }
  .home-qs-submit { width: 100%; margin-top: 10px; padding: 15px 20px !important; border-radius: 12px !important; font-size: 15px !important; font-weight: 700; letter-spacing: -0.017em; }
  .home-hero-actions { display: flex; gap: 12px 16px; margin-top: clamp(24px, 3.5vw, 36px); padding-top: 4px; flex-wrap: wrap; align-items: center; }
  .home-hero-cta { display: inline-flex; align-items: center; justify-content: center; gap: 10px; min-height: 48px; padding: 14px 22px; border-radius: 12px; font-size: 14px; font-weight: 700; letter-spacing: -0.014em; line-height: 1.2; text-align: center; box-sizing: border-box; }
  .home-hero-actions .home-hero-cta.btn-primary { box-shadow: 0 1px 2px rgba(234,88,12,0.12), 0 4px 14px rgba(234,88,12,0.08), inset 0 1px 0 rgba(255,255,255,0.22); }
  .home-hero-actions .home-hero-cta.btn-primary:hover:not(:disabled) { transform: translateY(-0.5px); filter: brightness(1.02); box-shadow: 0 2px 8px rgba(234,88,12,0.14), 0 8px 22px rgba(234,88,12,0.1), inset 0 1px 0 rgba(255,255,255,0.26); }
  .home-hero-actions .home-hero-cta.btn-outline { font-weight: 600; color: var(--navy2); background: #fff; border: 1px solid rgba(226,232,240,0.75); box-shadow: 0 1px 2px rgba(15,23,42,0.02); backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); }
  .home-hero-actions .home-hero-cta.btn-outline:hover { color: var(--primary); border-color: rgba(234,88,12,0.22); background: #fff; transform: translateY(-0.5px); box-shadow: 0 2px 8px rgba(15,23,42,0.035); }
  .home-hero-actions .home-hero-cta.btn-outline:active { transform: translateY(0); }
  .home-hero-tabs { display: flex; width: 100%; align-items: stretch; gap: 5px; padding: 5px; margin: 0; box-sizing: border-box; background: rgba(241,245,249,0.55); border: 1px solid rgba(226,232,240,0.5); border-radius: 14px; box-shadow: inset 0 1px 1px rgba(15,23,42,0.02); }
  .home-hero-tab { flex: 1; min-width: 0; text-align: center; padding: 11px 12px; font-weight: 600; font-size: 13.5px; letter-spacing: -0.012em; line-height: 1.28; color: #526073; background: transparent; border: none; border-radius: 11px; margin: 0; cursor: pointer; font-family: inherit; transition: color 0.18s ease, background 0.18s ease, box-shadow 0.2s ease, font-weight 0.15s ease, transform 0.12s ease; -webkit-tap-highlight-color: transparent; }
  .home-hero-tab:hover:not(.home-hero-tab-active) { color: var(--navy2); background: rgba(255,255,255,0.55); }
  .home-hero-tab:focus-visible { outline: 2px solid rgba(234,88,12,0.35); outline-offset: 1px; }
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
    --primary: #ea580c; --primary2: #c2410c; --primary-light: #fff7ed; --primary-mid: #fed7aa;
    --navy: #0f172a; --navy2: #1e293b; --green: #ea580c; --green2: #c2410c;
    --green-light: #fff7ed; --green-mid: #fed7aa; --cream: #f8fafc;
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
  .inp:focus { border-color: rgba(234,88,12,0.42); box-shadow: 0 0 0 3px rgba(234,88,12,0.09); }
  .inp option { background: #fff; color: var(--text); }
  .btn-primary { background: linear-gradient(180deg, #f97316 0%, var(--primary) 45%, #c2410c 100%); color: #fff; border: none; cursor: pointer; font-weight: 600; font-family: inherit; box-shadow: 0 1px 2px rgba(234,88,12,0.12), 0 4px 14px rgba(234,88,12,0.08), inset 0 1px 0 rgba(255,255,255,0.22); transition: transform 0.22s ease, box-shadow 0.26s ease, filter 0.2s ease; }
  .btn-primary:hover:not(:disabled) { filter: brightness(1.02); transform: translateY(-0.5px); box-shadow: 0 2px 8px rgba(234,88,12,0.14), 0 8px 22px rgba(234,88,12,0.1), inset 0 1px 0 rgba(255,255,255,0.26); }
  .btn-primary:active:not(:disabled) { transform: translateY(0); box-shadow: 0 1px 3px rgba(234,88,12,0.14), inset 0 1px 3px rgba(0,0,0,0.06); transition-duration: 0.08s; }
  .btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
  .btn-green { background: linear-gradient(180deg, #f97316 0%, var(--primary) 45%, #c2410c 100%); color: #fff; border: none; cursor: pointer; font-weight: 600; font-family: inherit; box-shadow: 0 1px 2px rgba(234,88,12,0.12), 0 4px 14px rgba(234,88,12,0.08), inset 0 1px 0 rgba(255,255,255,0.22); transition: transform 0.22s ease, box-shadow 0.26s ease, filter 0.2s ease; }
  .btn-green:hover { filter: brightness(1.02); transform: translateY(-0.5px); box-shadow: 0 2px 8px rgba(234,88,12,0.14), 0 8px 22px rgba(234,88,12,0.1), inset 0 1px 0 rgba(255,255,255,0.26); }
  .btn-green:active { transform: translateY(0); }
  .btn-outline { background: #fff; border: 1px solid rgba(226,232,240,0.75); color: var(--navy2); cursor: pointer; font-weight: 600; font-family: inherit; backdrop-filter: blur(8px); transition: transform 0.2s ease, border-color 0.22s, box-shadow 0.24s, background 0.2s, color 0.2s; box-shadow: 0 1px 2px rgba(15,23,42,0.02); }
  .btn-outline:hover { border-color: rgba(234,88,12,0.22); color: var(--primary); background: #fff; transform: translateY(-0.5px); box-shadow: 0 2px 8px rgba(15,23,42,0.035); }
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
    background: linear-gradient(180deg, #f97316 0%, var(--primary) 48%, #c2410c 100%); color: #fff;
    box-shadow: 0 1px 2px rgba(234,88,12,0.15); white-space: nowrap;
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
  .home-hero-section { background: linear-gradient(175deg, #ffffff 0%, #fafbfd 42%, #f3f5f8 100%); border-bottom: 1px solid rgba(226,232,240,0.42); isolation: isolate; }
  @media (prefers-reduced-motion: reduce) {
    .home-hero-parallax-bg img { transform: none !important; will-change: auto; }
    .home-hero-inner.home-hero-parallax-inner { transform: none !important; }
  }
  .home-prop-section { padding: clamp(36px, 4.5vw, 56px) var(--home-gutter-x) clamp(44px, 5.5vw, 64px); max-width: var(--home-content-max); margin: 0 auto; width: 100%; box-sizing: border-box; }
  .home-prop-section + .home-sample-outputs { padding-top: clamp(28px, 4vw, 44px); }
  #prop-grid { scroll-margin-top: 28px; }
  #home-sample-outputs { scroll-margin-top: 28px; }
  .home-featured-toolbar { display: flex; gap: 22px 32px; margin-bottom: clamp(22px, 3vw, 36px); flex-wrap: wrap; align-items: flex-start; justify-content: space-between; }
  .home-featured-title { font-size: clamp(1.4rem, 2.45vw, 1.72rem); font-weight: 700; color: var(--navy); letter-spacing: -0.022em; line-height: 1.18; }
  .home-featured-sub { font-size: 15px; color: var(--text-readable); margin-top: 10px; font-weight: 400; line-height: 1.62; max-width: 40em; }
  .home-featured-actions { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; justify-content: flex-end; padding-top: 2px; }
  .home-ui-clear-filters { padding: 10px 18px; border-radius: 12px; background: #fff; color: var(--navy2); border: 1px solid rgba(226,232,240,0.75); font-weight: 600; font-size: 13px; cursor: pointer; font-family: inherit; line-height: 1.25; box-shadow: 0 1px 2px rgba(15,23,42,0.02); backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px); transition: border-color 0.22s, color 0.2s, box-shadow 0.24s, transform 0.2s ease; min-height: 44px; box-sizing: border-box; }
  .home-ui-clear-filters:hover { border-color: rgba(234,88,12,0.22); color: var(--primary); box-shadow: 0 2px 8px rgba(15,23,42,0.035); transform: translateY(-0.5px); }
  .home-featured-actions .btn-outline { min-height: 44px; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 600; box-sizing: border-box; }
  .home-featured-actions .btn-primary { min-height: 44px; padding: 10px 20px; border-radius: 12px; font-size: 13px; font-weight: 700; box-sizing: border-box; border: none; }
  .home-band-split { background: linear-gradient(180deg, #fbfcfe 0%, #f5f7fa 100%); padding: clamp(44px, 5.5vw, 68px) var(--home-gutter-x); border-top: 1px solid rgba(226,232,240,0.45); border-bottom: 1px solid rgba(226,232,240,0.45); }
  .home-band-split-inner { max-width: var(--home-content-max); margin: 0 auto; display: grid; grid-template-columns: 1fr 1fr; gap: clamp(22px, 3vw, 28px); align-items: stretch; }
  .home-sample-outputs { padding: clamp(28px, 4vw, 48px) var(--home-gutter-x); background: transparent; border: none; }
  .home-sample-outputs-inner { max-width: 920px; margin: 0 auto; width: 100%; box-sizing: border-box; background: rgba(255,255,255,0.78); backdrop-filter: blur(20px) saturate(1.35); -webkit-backdrop-filter: blur(20px) saturate(1.35); border: 1px solid rgba(255,255,255,0.65); border-radius: var(--home-card-radius); box-shadow: 0 1px 2px rgba(15,23,42,0.04), 0 20px 48px rgba(15,23,42,0.06), inset 0 1px 0 rgba(255,255,255,0.85); padding: clamp(22px, 3.2vw, 36px) clamp(18px, 2.2vw, 32px); }
  .home-sample-outputs-inner .home-wa-sample-inner { max-width: none; margin: 0; }
  .home-sample-outputs-head { text-align: center; max-width: 38rem; margin-left: auto; margin-right: auto; margin-bottom: clamp(16px, 2vw, 24px); }
  .home-sample-outputs-head-toggle { width: 100%; max-width: 38rem; margin: 0 auto; display: block; padding: 12px 16px 16px; background: transparent; border: none; border-radius: 14px; cursor: pointer; font-family: inherit; text-align: center; color: inherit; transition: background 0.2s ease, box-shadow 0.2s ease; -webkit-tap-highlight-color: transparent; }
  .home-sample-outputs-head-toggle:hover { background: rgba(241,245,249,0.65); }
  .home-sample-outputs-head-toggle:focus-visible { outline: 2px solid rgba(234,88,12,0.45); outline-offset: 2px; }
  .home-sample-outputs-head-toggle .section-label { margin-bottom: 10px; }
  .home-sample-outputs-head-toggle .home-heading { margin-bottom: 6px; letter-spacing: -0.024em; font-size: clamp(1.45rem, 2.6vw, 1.75rem); }
  .home-sample-outputs-chevron { display: block; font-size: 13px; color: var(--primary2); font-weight: 700; letter-spacing: 0.04em; margin-top: 4px; opacity: 0.9; }
  .home-sample-outputs-clip { position: relative; }
  .home-sample-outputs-body { overflow: hidden; transition: max-height 0.55s cubic-bezier(0.4, 0, 0.2, 1); }
  .home-sample-outputs-body--collapsed { max-height: clamp(200px, 32vh, 300px); }
  .home-sample-outputs-body--expanded { max-height: min(9200px, 500vh); }
  .home-sample-outputs-fade { position: absolute; bottom: 0; left: 0; right: 0; height: min(140px, 32%); background: linear-gradient(to bottom, rgba(248,250,252,0) 0%, rgba(248,250,252,0.15) 18%, rgba(255,255,255,0.42) 55%, rgba(255,255,255,0.72) 100%); backdrop-filter: blur(12px) saturate(1.25); -webkit-backdrop-filter: blur(12px) saturate(1.25); pointer-events: none; z-index: 1; border-radius: 0 0 12px 12px; }
  .home-sample-outputs-reveal { position: absolute; bottom: 14px; left: 50%; transform: translateX(-50%); z-index: 2; padding: 11px 22px; border-radius: 12px; font-size: 13px; font-weight: 700; font-family: inherit; cursor: pointer; border: none; color: #fff; background: linear-gradient(180deg, #f97316 0%, var(--primary) 45%, #c2410c 100%); box-shadow: 0 1px 2px rgba(234,88,12,0.12), 0 6px 20px rgba(234,88,12,0.18), inset 0 1px 0 rgba(255,255,255,0.22); transition: transform 0.15s ease, box-shadow 0.2s ease, filter 0.2s ease; -webkit-tap-highlight-color: transparent; min-height: 44px; box-sizing: border-box; }
  .home-sample-outputs-reveal:hover { filter: brightness(1.03); box-shadow: 0 2px 8px rgba(234,88,12,0.18), 0 10px 28px rgba(234,88,12,0.12), inset 0 1px 0 rgba(255,255,255,0.26); }
  .home-sample-outputs-reveal:active { transform: translateX(-50%) scale(0.98); }
  @media (prefers-reduced-motion: reduce) {
    .home-sample-outputs-body { transition: none; }
  }
  .home-wa-sample-inner { max-width: var(--home-content-max); margin: 0 auto; width: 100%; box-sizing: border-box; display: flex; flex-direction: column; align-items: stretch; gap: 0; }
  .home-sample-block + .home-sample-block { margin-top: clamp(32px, 4vw, 44px); padding-top: clamp(32px, 4vw, 44px); border-top: 1px solid rgba(226,232,240,0.55); }
  .home-sample-intro { max-width: 42rem; }
  .home-sample-intro .home-heading { margin-bottom: 0.65em; font-size: clamp(1.2rem, 2vw, 1.35rem); }
  .home-wa-sample-pair { display: flex; flex-direction: row; flex-wrap: wrap; justify-content: center; align-items: flex-start; gap: clamp(16px, 3.5vw, 28px); margin-top: clamp(28px, 4vw, 40px); }
  .home-wa-sample-col { display: flex; flex-direction: column; align-items: center; gap: 10px; flex: 0 1 auto; min-width: 0; }
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
  .home-band-card-media { width: 52px; height: 52px; border-radius: 13px; background: linear-gradient(160deg, #ea580c 0%, var(--primary2) 100%); display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(234,88,12,0.12), 0 6px 16px rgba(234,88,12,0.07); }
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
  .home-cta-grid .home-cta-avatar { width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(160deg, #ea580c 0%, var(--primary2) 100%); display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 700; font-size: 15px; flex-shrink: 0; box-shadow: 0 1px 4px rgba(234,88,12,0.1); }
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
  .home-listing-card:hover .home-listing-badge { border-color: rgba(234,88,12,0.22); color: var(--primary); box-shadow: 0 2px 8px rgba(15,23,42,0.04); }
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
  @media(max-width:768px){
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
    .login-hero-col{width:100%!important;min-height:260px;padding:40px 28px!important}
    .login-form-col{width:100%!important;flex:1}
    .h1big-hero{min-height:0!important;align-items:stretch!important}
    .home-page-shell{overflow-x:clip!important;max-width:100%!important;padding-bottom:max(68px, calc(48px + env(safe-area-inset-bottom)))!important}
    .home-hero-inner{display:flex!important;flex-direction:column!important;padding:28px max(20px, env(safe-area-inset-left)) 32px max(20px, env(safe-area-inset-right))!important;gap:clamp(22px,5vw,28px)!important;align-items:stretch!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important}
    .home-hero-search-wrap{justify-self:stretch!important;max-width:100%!important}
    .home-hero-text{text-align:center!important;max-width:min(100%,420px)!important;width:100%!important;margin-left:auto!important;margin-right:auto!important;flex:0 0 auto!important;align-self:stretch!important}
    .home-hero-headline{font-size:clamp(28px,6vw,38px)!important;line-height:1.08!important;letter-spacing:-0.028em!important}
    .home-hero-headline-line:last-child:not(:first-child){margin-top:0.12em!important}
    .home-hero-search-wrap{width:100%!important;max-width:100%!important;flex:0 0 auto!important;align-self:stretch!important;gap:12px!important}
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
    .home-hero-actions{flex-direction:column!important;justify-content:center!important;align-items:stretch!important;margin-top:clamp(22px,5vw,30px)!important;width:100%!important;max-width:100%!important;margin-left:auto!important;margin-right:auto!important;gap:11px!important;padding:4px 0 0!important;box-sizing:border-box!important}
    .home-hero-actions .home-hero-cta{width:100%!important;justify-content:center!important;box-sizing:border-box!important;min-height:52px!important;padding:15px 20px!important;font-size:15px!important}
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
    .home-prop-section .home-listing-card{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
    .home-listing-card .home-listing-media{height:min(52vw,220px)!important;min-height:180px!important}
    .home-listing-card .home-listing-body{padding:18px 16px 18px!important}
    .home-listing-card .home-listing-title{font-size:15px!important}
    .home-listing-card .home-listing-price{font-size:21px!important}
    .home-band-split{padding:36px max(20px, env(safe-area-inset-left)) 40px max(20px, env(safe-area-inset-right))!important;box-sizing:border-box!important}
    .home-sample-outputs{padding:28px max(20px, env(safe-area-inset-left)) 32px max(20px, env(safe-area-inset-right))!important;overflow-x:clip!important;box-sizing:border-box!important}
    .home-sample-outputs-inner{padding:22px max(18px, env(safe-area-inset-left)) 28px max(18px, env(safe-area-inset-right))!important;border-radius:16px!important;max-width:100%!important;width:100%!important;overflow-x:clip!important;box-sizing:border-box!important;display:flex!important;flex-direction:column!important;align-items:stretch!important}
    #home-sample-outputs{scroll-margin-top:max(16px, env(safe-area-inset-top))!important}
    .home-sample-outputs-head{text-align:left!important;max-width:none!important;width:100%!important;margin-left:0!important;margin-right:0!important;margin-bottom:18px!important;padding:0!important;box-sizing:border-box!important}
    .home-sample-outputs-head-toggle{max-width:none!important;width:100%!important;margin:0!important;text-align:left!important;padding:4px 0 8px!important;box-sizing:border-box!important;border-radius:12px!important}
    .home-sample-outputs-head-toggle .section-label{display:block!important;text-align:left!important;margin-bottom:8px!important}
    .home-sample-outputs-head-toggle .home-heading{text-align:left!important;font-size:clamp(1.35rem,4.8vw,1.65rem)!important;line-height:1.2!important;letter-spacing:-0.022em!important}
    .home-sample-outputs-chevron{display:block!important;text-align:left!important;margin-top:6px!important;font-size:12px!important;line-height:1.35!important}
    .home-sample-intro{text-align:left!important;max-width:none!important;width:100%!important;margin-left:0!important;margin-right:0!important;box-sizing:border-box!important}
    .home-sample-intro .section-label{display:block!important;text-align:left!important}
    .home-sample-intro .home-heading{text-align:left!important;font-size:clamp(1.12rem,3.6vw,1.28rem)!important;line-height:1.28!important}
    .home-sample-intro p{text-align:left!important}
    .home-sample-outputs-body--collapsed{max-height:clamp(180px,32vh,260px)!important}
    .home-sample-outputs-clip{padding-bottom:8px!important}
    .home-sample-outputs-reveal{left:max(12px, env(safe-area-inset-left))!important;right:max(12px, env(safe-area-inset-right))!important;width:auto!important;max-width:none!important;transform:none!important;margin:0!important;padding:12px 16px!important;font-size:13px!important;bottom:max(12px, env(safe-area-inset-bottom))!important;text-align:center!important;box-sizing:border-box!important}
    .home-sample-outputs-reveal:active{transform:scale(0.98)!important}
    .home-sample-outputs-body{width:100%!important;min-width:0!important;box-sizing:border-box!important}
    .home-sample-block{width:100%!important;min-width:0!important;box-sizing:border-box!important}
    .home-sample-block + .home-sample-block{margin-top:32px!important;padding-top:32px!important}
    .home-wa-sample-pair{flex-direction:column!important;align-items:stretch!important;margin-top:28px!important;gap:24px!important;width:100%!important;box-sizing:border-box!important}
    .home-wa-sample-col{align-items:stretch!important;width:100%!important;max-width:100%!important;box-sizing:border-box!important}
    .home-wa-sample-kind{align-self:flex-start}
    .home-wa-sample-frame{width:100%!important;height:auto!important;aspect-ratio:1/1!important;max-width:min(357px,100%)!important;margin-left:auto!important;margin-right:auto!important}
    .home-wa-sample-actions{margin-top:24px!important;display:flex!important;flex-direction:column!important;align-items:stretch!important;width:100%!important;gap:10px!important}
    .home-wa-sample-actions .btn-outline{width:100%!important;box-sizing:border-box!important;justify-content:center!important}
    .home-pdf-download-wrap{margin-top:24px!important;display:flex!important;justify-content:center!important;width:100%!important}
    .home-pdf-download-wrap .btn-primary{width:100%!important;max-width:400px!important;box-sizing:border-box!important}
    .home-pdf-sample-frame{max-width:100%!important;box-sizing:border-box!important;border-radius:12px!important;box-shadow:0 8px 28px rgba(15,23,42,0.06)!important}
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
    .feed-page{overflow-x:clip!important;box-sizing:border-box!important;padding-bottom:max(84px, calc(52px + env(safe-area-inset-bottom)))!important}
    .feed-page-hero{padding:48px max(20px, env(safe-area-inset-left)) 88px max(20px, env(safe-area-inset-right))!important;box-sizing:border-box!important}
    .feed-page-hero-inner{max-width:100%!important;padding:0 2px!important;box-sizing:border-box!important}
    .feed-page-hero-inner h1.h1big{font-size:clamp(26px,7.2vw,40px)!important;line-height:1.12!important;margin-bottom:14px!important}
    .feed-page-hero-inner>p{font-size:15px!important;line-height:1.55!important;margin-bottom:24px!important;padding:0!important}
    .feed-search-tape{flex-direction:column!important;align-items:stretch!important;gap:10px!important;padding:12px!important;max-width:100%!important;box-sizing:border-box!important}
    .feed-search-tape select,.feed-search-tape .feed-search-input{width:100%!important;min-height:48px!important;font-size:16px!important;box-sizing:border-box!important;-webkit-appearance:none;appearance:none}
    .feed-page-inner{padding:0 max(20px, env(safe-area-inset-left)) 56px max(20px, env(safe-area-inset-right))!important;margin-top:-40px!important;box-sizing:border-box!important;max-width:100%!important}
    .feed-toolbar-card{flex-direction:column!important;align-items:stretch!important;gap:14px!important}
    .feed-toolbar-card .feed-toolbar-row{width:100%!important;justify-content:space-between!important;gap:10px!important}
    .feed-toolbar-card select.inp.feed-sort-select{max-width:100%!important;width:100%!important;margin:0!important}
    .nav-drawer-panel{padding:calc(12px + env(safe-area-inset-top)) max(20px, env(safe-area-inset-right)) max(24px, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))!important}
    .nav-drawer-links button{min-height:48px!important;padding:14px 18px!important;font-size:15px!important}
    .home-empty-state-card{padding:36px 20px!important}
    .home-empty-state-card .home-empty-icon{font-size:40px!important;margin-bottom:14px!important}
    #prop-grid{scroll-margin-top:20px!important}
    .home-page-shell .card.glass-card{touch-action:manipulation!important}
    .home-footer-inner{flex-direction:column!important;align-items:center!important;text-align:center!important;gap:16px!important;padding:0 max(16px, env(safe-area-inset-left)) 0 max(16px, env(safe-area-inset-right))!important}
    .home-cta-inner{width:100%!important;max-width:100%!important;box-sizing:border-box!important;padding-left:0!important;padding-right:0!important}
    @supports not (width: 1cqi) {
      .home-wa-sample-scale-wrap{transform:scale(min(0.85, calc((100vw - 96px) / 420)))!important}
    }
  }
  @media(max-width:640px){.h1big:not(.home-hero-headline){font-size:32px!important}}
  @media(max-width:480px){
    .home-hero-inner{padding-top:24px!important;padding-bottom:28px!important;gap:20px!important}
    .home-hero-headline{font-size:clamp(24px,6.8vw,32px)!important;line-height:1.09!important}
    .home-prop-section{padding-top:24px!important;padding-bottom:32px!important}
    .home-band-split,.home-band-cta{padding-top:32px!important;padding-bottom:36px!important}
    .home-sample-outputs{padding-top:24px!important;padding-bottom:28px!important}
    .home-sample-outputs-inner{padding:20px max(16px, env(safe-area-inset-left)) 24px max(16px, env(safe-area-inset-right))!important}
    .home-listing-card .home-listing-media{min-height:168px!important;height:48vw!important}
  }
  @media(max-width:420px){
    .home-qs-grid2{grid-template-columns:1fr!important;gap:15px!important}
  }
  @media (max-width: 768px) and (hover: none) {
    .card:hover, .card-flat:hover { transform: none !important; }
    .home-page-shell .card:not(.glass-card):hover,
    .home-page-shell .card.glass-card:hover { transform: none !important; }
  }
`;

const ShinyText = ({text, color="#b5b5b5", shineColor="#ffffff", speed=2, spread=120, direction="left", disabled=false, className=""}) => {
  const animDuration = `${speed}s`;
  const gradAngle = direction==="left" ? "90deg" : "-90deg";
  const style = disabled ? {color} : {
    display:"inline-block",
    backgroundImage:`linear-gradient(${gradAngle}, ${color} 0%, ${color} calc(50% - ${spread/2}px), ${shineColor} 50%, ${color} calc(50% + ${spread/2}px), ${color} 100%)`,
    backgroundSize:"200% auto",
    WebkitBackgroundClip:"text",
    WebkitTextFillColor:"transparent",
    backgroundClip:"text",
    animation:`shiny-sweep ${animDuration} linear infinite`,
  };
  return <span className={`shiny-text ${className}`} style={style}>{text}</span>;
};

const fmtP = (p) => { if(!p) return "POA"; const n=Number(p); if(n>=10000000) return `₹${(n/10000000).toFixed(2)} Cr`; if(n>=100000) return `₹${(n/100000).toFixed(2)} L`; return `₹${n.toLocaleString("en-IN")}`; };
const getPublicSiteBase = () => { try { const v = import.meta.env?.VITE_PUBLIC_SITE_URL; if (v && String(v).trim()) return String(v).replace(/\/$/, ""); } catch (_) {} return typeof window !== "undefined" ? window.location.origin : ""; };
/** Default platform wordmark for Northing-only UI (nav, generic PDF header). Never used as a substitute on agent white-label surfaces. */
const DEFAULT_NORTHING_LOGO_SRC = "/northing-logo.svg";

/** Northing lockup for WA sample cards — fixed row height so mark + wordmark align inside scaled cards (avoids baseline/line-box skew). */
const NorthingWaChipLockup = () => {
  const row = 22;
  return (
    <div
      className="northing-wa-chip-lockup"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        flexShrink: 0,
        height: row,
        boxSizing: "border-box",
      }}
    >
      <svg width={row} height={row} viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden style={{ display: "block", flexShrink: 0 }}>
        <circle cx="15" cy="15" r="11.5" stroke="#0f172a" strokeWidth="1.25" />
        <path d="M15 5l5.25 9.8h-10.5z" fill="#ea580c" />
      </svg>
      <span
        style={{
          fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          fontSize: 14,
          fontWeight: 600,
          letterSpacing: "-0.03em",
          color: "#0f172a",
          lineHeight: `${row}px`,
          height: row,
          display: "flex",
          alignItems: "center",
          whiteSpace: "nowrap",
          flexShrink: 0,
        }}
      >
        Northing
      </span>
    </div>
  );
};

/** White pill around the Northing lockup — symmetric padding, no line-height tricks (prevents uneven vertical padding in the chip). */
const WaSampleCardLogoChip = () => (
  <div
    style={{
      background: "#fff",
      border: "1px solid rgba(15,23,42,0.08)",
      borderRadius: 12,
      padding: "7px 11px",
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 14px rgba(0,0,0,0.28)",
      WebkitFontSmoothing: "antialiased",
      flexShrink: 0,
      boxSizing: "border-box",
      minHeight: 36,
    }}
  >
    <NorthingWaChipLockup />
  </div>
);

/** Watermark / ZIP: logo from agent profile only; no Northing image fallback. */
const watermarkBrandOptionsFromAgent = (listing, agentBrand) => ({
  logoUrl: agentBrand?.logoUrl || null,
  brandName: agentBrand?.agencyName || listing.agencyName || listing.agentName || agentBrand?.name || "",
});

const watermarkOptionsForProfileUpload = (currentUser) => ({
  logoUrl: currentUser?.logoUrl || null,
  brandName: currentUser?.agencyName || currentUser?.name || "",
});

/** Resolves `profiles` for `listing.agentId` — session profile when it is the agent, otherwise fetches from DB. */
const useListingAgentBrand = (listing, sessionProfile) => {
  const [brand, setBrand] = useState(null);
  useEffect(() => {
    if (!listing?.agentId) {
      setBrand(null);
      return;
    }
    if (sessionProfile?.id && sessionProfile.id === listing.agentId) {
      setBrand({
        id: listing.agentId,
        logoUrl: sessionProfile.logoUrl || null,
        agencyName: sessionProfile.agencyName || null,
        name: sessionProfile.name || null,
      });
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: p, error } = await supabase
        .from("profiles")
        .select("id,logo_url,agency_name,name")
        .eq("id", listing.agentId)
        .single();
      if (cancelled) return;
      if (error || !p) {
        setBrand({ id: listing.agentId, logoUrl: null, agencyName: null, name: null });
        return;
      }
      setBrand({
        id: p.id,
        logoUrl: p.logo_url || null,
        agencyName: p.agency_name || null,
        name: p.name || null,
      });
    })();
    return () => { cancelled = true; };
  }, [
    listing?.agentId,
    listing?.id,
    sessionProfile?.id,
    sessionProfile?.logoUrl,
    sessionProfile?.agencyName,
    sessionProfile?.name,
  ]);
  return brand;
};
const googleMapsSearchUrl = (location) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location || "")}`;
/** E.164 for India (+91) or pass-through if already starts with + */
const toE164Phone = (raw) => {
  const t = String(raw || "").trim();
  if (!t) return null;
  if (t.startsWith("+")) return t.replace(/\s/g, "");
  const d = t.replace(/\D/g, "");
  if (d.length === 10) return `+91${d}`;
  if (d.length === 12 && d.startsWith("91")) return `+${d}`;
  if (d.length === 11 && d.startsWith("0")) return `+91${d.slice(1)}`;
  return null;
};
const nationalDigitsFromE164 = (e164) => {
  const d = String(e164 || "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : null;
};
const simScore = (a="",b="") => { a=a.toLowerCase().trim(); b=b.toLowerCase().trim(); if(!a||!b) return 0; const sa=new Set(a.split(/\s+/)),sb=new Set(b.split(/\s+/)); return [...sa].filter(x=>sb.has(x)).length/Math.max(sa.size,sb.size); };
const findDups = (form, all, editId) => all.filter(l => {
  if(l.id===editId) return false;
  const ts=simScore(form.title,l.title), ls=simScore(form.location,l.location);
  const pm=form.price&&l.price&&Math.abs(Number(form.price)-Number(l.price))/Number(l.price)<0.1;
  const dm=form.bedrooms&&l.bedrooms&&String(form.bedrooms)===String(l.bedrooms)&&form.propertyType===l.propertyType;
  return (ts>0.6?2:0)+(ls>0.7?2:0)+(pm?1:0)+(dm?1:0)>=3;
});

const mapListing = (l) => !l ? null : ({
  id: l.id, agentId: l.agent_id, title: l.title, location: l.location,
  propertyType: l.property_type, listingType: l.listing_type,
  price: l.price, sizesqft: l.size_sqft, bedrooms: l.bedrooms, bathrooms: l.bathrooms,
  furnishingStatus: l.furnishing_status, status: l.status,
  description: l.description, highlights: l.highlights || [],
  agentName: l.agent_name, agentPhone: l.agent_phone, agentEmail: l.agent_email,
  agencyName: l.agency_name, photos: l.photos || [], createdAt: l.created_at,
  ...(l.details || {}),
  logoUrl: l.details?.logoUrl || null,
  agentAddress: l.details?.agentAddress || null,
  agentWebsite: l.details?.agentWebsite || null,
  viewCount: l.view_count||0,
  waCount: l.wa_count||0,
  pdfCount: l.pdf_count||0,
});

/** Static Mumbai listing for homepage PDF/WhatsApp samples (not from DB). */
const HOME_SAMPLE_BROCHURE = {
  id: "samp-mumbai-001",
  title: "3 BHK Sea-facing · Bandra West",
  location: "Pali Hill, Bandra West, Mumbai",
  propertyType: "Apartment",
  listingType: "Sale",
  price: 48500000,
  sizesqft: 1250,
  bedrooms: 3,
  bathrooms: 2,
  furnishingStatus: "Semi-Furnished",
  description: "Corner unit with sea glimpses, minutes from Carter Road. Two covered parking, marble flooring in living, and a semi-furnished modular kitchen. Well-maintained society with pool, gym, and concierge.",
  highlights: [
    "Corner unit with cross-ventilation",
    "Modular kitchen with chimney & hob",
    "Society pool, gym, and kids' play area",
  ],
  agentName: "Aditi Mehta",
  agentPhone: "+91 98201 44720",
  agencyName: "Harbourline Realty",
};

const exportElementToPdfById = async (elementId, filenameBase) => {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Missing print target");
  const waitForImages = async (root) => {
    const withTimeout = (p, ms) => Promise.race([p, new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms))]).catch(() => {});
    const imgs = Array.from(root.querySelectorAll("img"));
    await Promise.all(imgs.map(async (img) => {
      if (img.complete) {
        try { if (typeof img.decode === "function") await withTimeout(img.decode(), 4000); } catch {}
        return;
      }
      await withTimeout(new Promise((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      }), 12000);
    }));
    try {
      if (document.fonts && document.fonts.ready) await withTimeout(document.fonts.ready, 5000);
    } catch {}
  };
  await waitForImages(el);
  const h2c = await new Promise((res, rej) => {
    if (window.html2canvas) { res(window.html2canvas); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload = () => res(window.html2canvas);
    s.onerror = rej;
    document.head.appendChild(s);
  });
  const jsPDFCls = await new Promise((res, rej) => {
    if (window.jspdf) { res(window.jspdf.jsPDF); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";
    s.onload = () => res(window.jspdf.jsPDF);
    s.onerror = rej;
    document.head.appendChild(s);
  });
  const canvas = await h2c(el, { scale: 2, useCORS: true, allowTaint: true, backgroundColor: "#ffffff", logging: false, windowWidth: 720 });
  const mmW = 210;
  const pdf = new jsPDFCls({ unit: "mm", format: "a4" });
  const pageH = 297;
  const elRect = el.getBoundingClientRect();
  const cssToCanvasY = elRect.height > 0 ? canvas.height / elRect.height : 1;
  const pagePx = (pageH * canvas.width) / mmW;
  const photoBounds = Array.from(el.querySelectorAll('[data-pdf-photo="1"]'))
    .map((node) => {
      const r = node.getBoundingClientRect();
      const startCss = r.top - elRect.top;
      const endCss = startCss + r.height;
      return { start: Math.max(0, startCss * cssToCanvasY), end: Math.min(canvas.height, endCss * cssToCanvasY) };
    })
    .filter((b) => b.end > b.start)
    .sort((a, b) => a.start - b.start);
  const mergedPhotoBounds = [];
  for (const b of photoBounds) {
    const prev = mergedPhotoBounds[mergedPhotoBounds.length - 1];
    if (prev && b.start <= prev.end + 1) {
      prev.end = Math.max(prev.end, b.end);
    } else {
      mergedPhotoBounds.push({ ...b });
    }
  }
  const cropToDataUrl = (srcCanvas, sy, segH) => {
    const yInt = Math.floor(sy);
    const maxH = srcCanvas.height - yInt;
    const h = Math.max(1, Math.min(maxH, Math.ceil(segH)));
    const sc = document.createElement("canvas");
    sc.width = srcCanvas.width;
    sc.height = h;
    const ctx = sc.getContext("2d");
    ctx.drawImage(srcCanvas, 0, yInt, srcCanvas.width, h, 0, 0, srcCanvas.width, h);
    return sc.toDataURL("image/jpeg", 0.95);
  };
  let y = 0;
  let isFirst = true;
  let guard = 0;
  while (y < canvas.height - 1) {
    if (++guard > 2000) break;
    let pageEnd = Math.min(y + pagePx, canvas.height);
    const crossing = mergedPhotoBounds.find((b) => b.start < pageEnd && b.end > pageEnd);
    if (crossing) {
      const safeEnd = crossing.start;
      if (safeEnd > y + 1) pageEnd = safeEnd;
    }
    if (pageEnd <= y + 1) {
      pageEnd = Math.min(y + pagePx, canvas.height);
    }
    if (pageEnd <= y) {
      pageEnd = Math.min(y + 1, canvas.height);
    }
    const segH = pageEnd - y;
    const segMmH = (segH * mmW) / canvas.width;
    const segImg = cropToDataUrl(canvas, y, segH);
    if (!isFirst) pdf.addPage();
    isFirst = false;
    pdf.addImage(segImg, "JPEG", 0, 0, mmW, segMmH);
    y = pageEnd;
  }
  pdf.save(`${filenameBase}.pdf`);
};

/** WhatsApp-friendly square export; high-quality downscale from html2canvas. */
const WA_CARD_EXPORT_PX = 1080;

const waitForImagesInElement = (root) => {
  const imgs = root.querySelectorAll("img");
  return Promise.all(
    [...imgs].map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete && img.naturalWidth > 0) {
            resolve();
            return;
          }
          const done = () => resolve();
          img.addEventListener("load", done, { once: true });
          img.addEventListener("error", done, { once: true });
        })
    )
  );
};

const normalizeWaCardCanvas = (srcCanvas) => {
  const out = document.createElement("canvas");
  out.width = WA_CARD_EXPORT_PX;
  out.height = WA_CARD_EXPORT_PX;
  const ctx = out.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(srcCanvas, 0, 0, srcCanvas.width, srcCanvas.height, 0, 0, WA_CARD_EXPORT_PX, WA_CARD_EXPORT_PX);
  return out;
};

const downloadHtmlElementAsPngById = async (elementId, filename) => {
  const el = document.getElementById(elementId);
  if (!el) throw new Error("Missing element");
  if (document.fonts?.ready) await document.fonts.ready.catch(() => {});
  await waitForImagesInElement(el);

  const ancestors = [];
  let p = el.parentElement;
  while (p && p !== document.body) {
    const ct = window.getComputedStyle(p).transform;
    if (ct && ct !== "none") {
      ancestors.push({ node: p, prev: p.style.transform });
      p.style.transform = "none";
    }
    p = p.parentElement;
  }

  const h2c = await new Promise((res, rej) => {
    if (window.html2canvas) { res(window.html2canvas); return; }
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload = () => res(window.html2canvas);
    s.onerror = rej;
    document.head.appendChild(s);
  });

  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 2 : 2;
  const scale = Math.min(5, Math.max(4, dpr * 2));

  try {
    const rawCanvas = await h2c(el, {
      scale,
      useCORS: true,
      allowTaint: true,
      backgroundColor: null,
      logging: false,
      imageTimeout: 25000,
      removeContainer: true,
      foreignObjectRendering: false,
      onclone: (_doc, clone) => {
        clone.style.webkitFontSmoothing = "antialiased";
        const nodes = [clone, ...clone.querySelectorAll("*")];
        nodes.forEach((node) => {
          if (!(node instanceof HTMLElement)) return;
          const st = node.style;
          if (st.backdropFilter || st.webkitBackdropFilter) {
            st.backdropFilter = "none";
            st.webkitBackdropFilter = "none";
            if (!st.backgroundColor || st.backgroundColor === "transparent") {
              st.backgroundColor = "rgba(0,0,0,0.52)";
            }
          }
        });
      },
    });

    const canvas = normalizeWaCardCanvas(rawCanvas);

    const triggerDownload = (blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.download = filename;
      a.href = url;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
    };

    if (canvas.toBlob) {
      await new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
          if (!blob) reject(new Error("PNG export failed"));
          else {
            triggerDownload(blob);
            resolve();
          }
        }, "image/png");
      });
    } else {
      const a = document.createElement("a");
      a.download = filename;
      a.href = canvas.toDataURL("image/png");
      a.click();
    }
  } finally {
    ancestors.forEach(({ node, prev }) => { node.style.transform = prev || ""; });
  }
};

const formToDb = (form, agentId) => ({
  agent_id: agentId, title: form.title, location: form.location,
  property_type: form.propertyType, listing_type: form.listingType,
  price: Number(form.price) || 0, size_sqft: Number(form.sizesqft) || null,
  bedrooms: Number(form.bedrooms) || 0, bathrooms: Number(form.bathrooms) || 0,
  furnishing_status: form.furnishingStatus, status: form.status || "Active",
  description: form.description, highlights: form.highlights || [],
  agent_name: form.agentName, agent_phone: form.agentPhone,
  agent_email: form.agentEmail, agency_name: form.agencyName,
  photos: form.photos || [],
  details: { toilets:form.toilets, condition:form.condition, builtYear:form.builtYear,
    modernKitchen:form.modernKitchen, wcType:form.wcType, superBuiltUp:form.superBuiltUp,
    carpetArea:form.carpetArea, parkingType:form.parkingType, vastuDirection:form.vastuDirection,
    totalFloors:form.totalFloors, propertyFloor:form.propertyFloor, maintenance:form.maintenance,
    societyFormed:form.societyFormed, ocReceived:form.ocReceived,
    reraRegistered:form.reraRegistered, reraNumber:form.reraNumber,
    logoUrl:form.logoUrl||null, agentAddress:form.agentAddress||null, agentWebsite:form.agentWebsite||null }
});
const dbToForm = (l) => ({
  ...l.details, title:l.title, location:l.location, propertyType:l.property_type,
  listingType:l.listing_type, price:l.price, sizesqft:l.size_sqft,
  bedrooms:l.bedrooms, bathrooms:l.bathrooms, furnishingStatus:l.furnishing_status,
  status:l.status, description:l.description, highlights:l.highlights||[],
  agentName:l.agent_name, agentPhone:l.agent_phone, agentEmail:l.agent_email,
  agencyName:l.agency_name, photos:l.photos||[]
});

const uploadPhoto = async (file) => {
  const ext = file.name.split(".").pop().toLowerCase() || "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).substr(2,7)}.${ext}`;
  const { error } = await supabase.storage.from("property-photos").upload(name, file, { contentType: file.type, upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("property-photos").getPublicUrl(name);
  return data.publicUrl;
};

const burnWatermark = (file, { logoUrl, brandName } = {}) => new Promise((resolve) => {
  const img = new Image();
  const objectUrl = URL.createObjectURL(file);
  img.crossOrigin = "anonymous";
  img.onload = () => {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth; canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);
    URL.revokeObjectURL(objectUrl);
    const w = canvas.width, h = canvas.height;
    const pad = Math.round(w * 0.025);
    const logoSize = Math.round(w * 0.10);
    const fontSize = Math.max(14, Math.round(w * 0.030));
    const drawBottomRight = () => {
      if (!brandName) return;
      ctx.save();
      ctx.font = `700 ${fontSize}px Inter, sans-serif`;
      const textW = ctx.measureText(brandName).width;
      const bw = textW + pad * 1.6, bh = fontSize + pad * 1.2;
      const bx = w - bw - pad * 0.6, by = h - bh - pad * 0.6;
      ctx.globalAlpha = 0.72;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(bx, by, bw, bh, 8) : ctx.rect(bx, by, bw, bh);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffffff";
      ctx.fillText(brandName, bx + pad * 0.8, by + bh - pad * 0.55);
      ctx.restore();
    };
    const finish = () => {
      drawBottomRight();
      canvas.toBlob(blob => resolve(new File([blob], file.name, { type: "image/jpeg" })), "image/jpeg", 0.92);
    };
    if (!logoUrl) {
      finish();
      return;
    }
    const li = new Image();
    li.crossOrigin = "anonymous";
    li.onload = () => {
      ctx.save();
      const bw = logoSize + pad * 1.2, bh = logoSize + pad * 1.2;
      ctx.globalAlpha = 0.75;
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.roundRect ? ctx.roundRect(pad * 0.6, pad * 0.6, bw, bh, 10) : ctx.rect(pad * 0.6, pad * 0.6, bw, bh);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.drawImage(li, pad * 0.8, pad * 0.8, logoSize, logoSize);
      ctx.restore();
      finish();
    };
    li.onerror = finish;
    li.src = logoUrl;
  };
  img.onerror = () => resolve(file);
  img.src = objectUrl;
});

const uploadWatermarked = async (file, wmOptions) => {
  const watermarked = await burnWatermark(file, wmOptions);
  return uploadPhoto(watermarked);
};

const _h = { openWA: ()=>{}, openPDF: ()=>{}, openKit: ()=>{} };
const showWACard = (l) => _h.openWA(l);
const showPDF    = (l) => _h.openPDF(l);

const track = async (listingId, type, platform = 'web', brokerId = null) => {
  if (!listingId) return;
  const key = `tracked_${listingId}_${type}`;
  if (localStorage.getItem(key)) return;
  localStorage.setItem(key, '1');
  const visitorId = getVisitorId();
  await supabase.from('shareevents').insert({
    listing_id: listingId,
    broker_id: brokerId,
    visitor_id: visitorId,
    event_type: type,
    platform,
  });
  const col = type === 'pageview' ? 'view_count'
            : type === 'whatsappclick' ? 'wa_count'
            : type === 'brochuredownload' ? 'pdf_count'
            : null;
  if (col) supabase.rpc('incrementcount', { rowid: listingId, colname: col });
};

const WALogo = ({size=16}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" style={{flexShrink:0}}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const Toast = ({msg,type,onClose}) => (
  <div className="asl" style={{position:"fixed",bottom:28,right:28,zIndex:9999,padding:"13px 18px",borderRadius:12,display:"flex",alignItems:"center",gap:10,maxWidth:340,fontSize:14,fontWeight:600,boxShadow:"0 8px 32px rgba(27,58,45,0.18)",background:type==="error"?"#FEF2F2":type==="success"?"#ECFDF5":"#EFF6FF",border:`1.5px solid ${type==="error"?"#FCA5A5":type==="success"?"#6EE7B7":"#BFDBFE"}`,color:type==="error"?"#DC2626":type==="success"?"#059669":"#1D4ED8"}}>
    <span>{type==="error"?"⚠️":type==="success"?"✅":"ℹ️"}</span>
    <span style={{flex:1}}>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,opacity:0.5}}>×</button>
  </div>
);

const ConfirmModal = ({message,onConfirm,onCancel}) => (
  <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.45)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
    <div className="card asl" style={{padding:28,maxWidth:360,width:"100%"}}>
      <div style={{textAlign:"center",marginBottom:20}}>
        <div style={{width:46,height:46,borderRadius:"50%",background:"#FEF2F2",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:22}}>🗑️</div>
        <h3 style={{fontFamily:"'Fraunces',serif",fontSize:18,fontWeight:700,color:"var(--navy)",marginBottom:6}}>Delete Listing</h3>
        <p style={{fontSize:13,color:"var(--muted)"}}>{message}</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button onClick={onCancel} className="btn-ghost" style={{padding:"10px",borderRadius:9,fontSize:14}}>Cancel</button>
        <button onClick={onConfirm} className="btn-danger" style={{padding:"10px",borderRadius:9,fontSize:14}}>Yes, Delete</button>
      </div>
    </div>
  </div>
);

const DupModal = ({dups,onProceed,onCancel}) => (
  <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.4)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
    <div className="card asl" style={{padding:32,maxWidth:500,width:"100%",boxShadow:"0 24px 80px rgba(27,58,45,0.2)"}}>
      <div style={{textAlign:"center",marginBottom:22}}>
        <div style={{width:52,height:52,borderRadius:"50%",background:"#FEF3C7",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24}}>⚠️</div>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:7}}>Possible Duplicate Detected</h2>
        <p style={{fontSize:14,color:"var(--muted)",lineHeight:1.6}}>We found {dups.length} similar listing{dups.length>1?"s":""} already on the platform. Please review before saving.</p>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:22,maxHeight:200,overflow:"auto"}}>
        {dups.map(d=>(
          <div key={d.id} className="card-flat" style={{padding:"12px 14px"}}>
            <div style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:2}}>{d.title}</div>
            <div style={{fontSize:12,color:"var(--muted)"}}>📍 {d.location} · <strong style={{color:"var(--green)"}}>{fmtP(d.price)}</strong> · by {d.agentName}</div>
          </div>
        ))}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
        <button onClick={onCancel} className="btn-ghost" style={{padding:"11px",borderRadius:10,fontSize:14}}>← Go Back</button>
        <button onClick={onProceed} className="btn-primary" style={{padding:"11px",borderRadius:10,fontSize:14}}>Save Anyway</button>
      </div>
    </div>
  </div>
);

const PropCard = ({listing,currentUser,savedIds,onSave,onView}) => {
  const agentBrand = useListingAgentBrand(listing, currentUser);
  const wlLogo = agentBrand?.logoUrl || null;
  const isSaved = savedIds?.includes(listing.id);
  const statusColor = listing.status==="Active"?"#059669":listing.status==="Rented"?"#D97706":"#7C3AED";
  const statusBg = listing.status==="Active"?"#ECFDF5":listing.status==="Rented"?"#FFFBEB":"#F5F3FF";
  return (
    <div className="card" style={{overflow:"hidden"}}>
      <div style={{height:195,position:"relative",background:"linear-gradient(135deg,#E8F5EE,#C2E8D4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {listing.photos?.[0] ? <img src={listing.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <div style={{fontSize:48,opacity:0.4}}>🏠</div>}
        <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(27,58,45,0.5) 0%,transparent 55%)"}} />
        <div style={{position:"absolute",top:12,left:12}}>
          <span className="badge" style={{background:listing.listingType==="Rent"?"#FFFBEB":"#ECFDF5",color:listing.listingType==="Rent"?"#B45309":"#059669",border:`1px solid ${listing.listingType==="Rent"?"#FDE68A":"#A7F3D0"}`}}>{listing.listingType}</span>
        </div>
        <div style={{position:"absolute",top:44,left:12,zIndex:2,background:"rgba(255,255,255,0.94)",borderRadius:9,padding:5,boxShadow:"0 2px 10px rgba(0,0,0,0.12)",border:"1px solid rgba(226,232,240,0.9)",minWidth:34,minHeight:34,display:"flex",alignItems:"center",justifyContent:"center"}}>
          {wlLogo ? <img src={wlLogo} alt="" style={{width:34,height:34,objectFit:"contain",display:"block"}}/> : null}
        </div>
        <div style={{position:"absolute",top:12,right:12}}>
          <span className="badge" style={{background:statusBg,color:statusColor,border:`1px solid ${listing.status==="Active"?"#A7F3D0":listing.status==="Rented"?"#FDE68A":"#DDD6FE"}`}}>{listing.status}</span>
        </div>
        {currentUser?.role==="user"&&(
          <button onClick={e=>{e.stopPropagation();onSave(listing.id)}} style={{position:"absolute",bottom:12,right:12,background:"rgba(255,255,255,0.92)",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:16,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}>{isSaved?"❤️":"🤍"}</button>
        )}
        <div style={{position:"absolute",bottom:12,left:12,fontSize:20,fontWeight:800,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:12,fontWeight:500}}>/mo</span>}</div>
      </div>
      <div style={{padding:"16px 18px"}}>
        <h3 style={{fontSize:15,fontWeight:700,color:"var(--navy)",marginBottom:4,lineHeight:1.3}}>{listing.title}</h3>
        <div style={{fontSize:13,color:"var(--muted)",marginBottom:12}}>📍 {listing.location}</div>
        <div style={{display:"flex",gap:16,fontSize:12,color:"var(--muted)",marginBottom:14,paddingBottom:14,borderBottom:"1px solid var(--border)"}}>
          {listing.bedrooms>0&&<span>🛏 {listing.bedrooms} Beds</span>}
          {listing.bathrooms>0&&<span>🚿 {listing.bathrooms} Baths</span>}
          {listing.sizesqft&&<span>📐 {listing.sizesqft} sqft</span>}
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
          <button onClick={()=>onView(listing)} className="btn-ghost" style={{padding:"8px",borderRadius:9,fontSize:11}}>View</button>
          <button onClick={()=>showWACard(listing)} style={{padding:"8px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><WALogo size={12}/>WA</button>
          <button onClick={()=>showPDF(listing)} className="btn-primary" style={{padding:"8px",borderRadius:9,fontSize:11,border:"none"}}>📄 PDF</button>
        </div>
      </div>
    </div>
  );
};

const PropModal = ({listing,onClose}) => {
  useEffect(()=>{if(listing?.id)track(listing.id,"view");},[listing?.id]);
  if(!listing) return null;
  const fields=[["Type",listing.propertyType],["Listing",listing.listingType],["Size",listing.sizesqft?`${listing.sizesqft} sqft`:null],["Beds",listing.bedrooms||null],["Baths",listing.bathrooms||null],["Furnishing",listing.furnishingStatus],["Condition",listing.condition],["Built Year",listing.builtYear],["Floor",listing.propertyFloor],["Total Floors",listing.totalFloors],["Parking",listing.parkingType],["Vastu",listing.vastuDirection],["RERA",listing.reraRegistered==="Yes"?`Yes – ${listing.reraNumber||""}`:listing.reraRegistered]].filter(([,v])=>v);
  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div className="card asl" style={{maxWidth:640,width:"100%",maxHeight:"92vh",overflow:"auto",padding:32,boxShadow:"0 32px 80px rgba(27,58,45,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:20}}>
          <div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,color:"var(--navy)",marginBottom:4}}>{listing.title}</h2>
            <div style={{color:"var(--muted)",fontSize:14}}>📍 {listing.location}</div>
          </div>
          <button onClick={onClose} className="btn-ghost" style={{borderRadius:"50%",width:36,height:36,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,padding:0}}>×</button>
        </div>
        <div style={{fontSize:32,fontWeight:800,color:"var(--green2)",marginBottom:20,fontFamily:"'Fraunces',serif"}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:14,fontWeight:500,color:"var(--muted)"}}>/month</span>}</div>
        {listing.description&&<p style={{fontSize:14,color:"var(--muted)",lineHeight:1.75,marginBottom:20,background:"var(--cream)",padding:14,borderRadius:10,border:"1px solid var(--border)"}}>{listing.description}</p>}
        {fields.length>0&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"6px 24px",marginBottom:20}}>{fields.map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"9px 0",borderBottom:"1px solid var(--border)",fontSize:13}}><span style={{color:"var(--muted)"}}>{k}</span><span style={{fontWeight:700,color:"var(--navy)"}}>{v}</span></div>)}</div>}
        {listing.highlights?.length>0&&<div style={{marginBottom:20}}><p className="section-label">Key Highlights</p>{listing.highlights.map((h,i)=><div key={i} style={{fontSize:13,color:"var(--text)",marginBottom:6,display:"flex",gap:8,alignItems:"flex-start"}}><span style={{color:"var(--green)",fontWeight:700,marginTop:1}}>✓</span>{h}</div>)}</div>}
        <div style={{background:"var(--green-light)",borderRadius:14,padding:20,border:"1px solid var(--green-mid)"}}>
          <p className="section-label">Contact Agent</p>
          <div style={{fontSize:14,color:"var(--text)",display:"flex",flexDirection:"column",gap:8}}>
            <div style={{fontWeight:700,fontSize:15}}>👤 {listing.agentName} <span style={{fontWeight:400,color:"var(--muted)"}}>· {listing.agencyName}</span></div>
            {listing.agentPhone&&<div style={{color:"var(--muted)"}}>📞 <a href={`tel:${listing.agentPhone}`} style={{color:"var(--green2)",fontWeight:600}}>{listing.agentPhone}</a></div>}
            <div style={{display:"flex",gap:10,marginTop:4,flexWrap:"wrap"}}>
              {listing.agentPhone&&<a href={`https://wa.me/${listing.agentPhone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" style={{display:"inline-flex",alignItems:"center",gap:7,background:"#25D366",color:"#fff",padding:"10px 16px",borderRadius:9,textDecoration:"none",fontWeight:700,fontSize:13}}><WALogo size={15}/>WhatsApp Agent</a>}
              <button onClick={()=>showWACard(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"#128C7E",color:"#fff",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}><WALogo size={15}/>WhatsApp Card</button>
              <button onClick={()=>showPDF(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"var(--navy)",color:"#fff",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"none",cursor:"pointer",fontFamily:"inherit"}}>📄 PDF Report</button>
              <button onClick={()=>_h.openKit(listing)} style={{display:"inline-flex",alignItems:"center",gap:7,background:"var(--primary-light)",color:"var(--primary)",padding:"10px 16px",borderRadius:9,fontWeight:700,fontSize:13,border:"1px solid var(--primary-mid)",cursor:"pointer",fontFamily:"inherit"}}>📦 Marketing Kit</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const WACardModal = ({listing,onClose,currentUser}) => {
  const agentBrand = useListingAgentBrand(listing, currentUser);
  const wlLogo = agentBrand?.logoUrl || null;
  const [copied,setCopied]=useState(false);
  const [downloading,setDownloading]=useState(false);
  useEffect(()=>{if(listing?.id)track(listing.id,"wa");},[listing?.id]);
  if(!listing) return null;

  const loadH2C=()=>new Promise((res,rej)=>{
    if(window.html2canvas){res(window.html2canvas);return;}
    const s=document.createElement("script");
    s.src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
    s.onload=()=>res(window.html2canvas); s.onerror=rej;
    document.head.appendChild(s);
  });

  const captureCard=async()=>{
    const h2c=await loadH2C();
    const card=document.getElementById("wa-card");
    if(!card) throw new Error("Card not found");
    if(document.fonts?.ready) await document.fonts.ready.catch(()=>{});
    await waitForImagesInElement(card);
    const dpr=typeof window!=="undefined"?window.devicePixelRatio||2:2;
    const scale=Math.min(5,Math.max(4,dpr*2));
    const raw=await h2c(card,{
      scale,
      useCORS:true,
      allowTaint:true,
      backgroundColor:null,
      logging:false,
      imageTimeout:25000,
      removeContainer:true,
      foreignObjectRendering:false,
      onclone:(_doc,clone)=>{
        clone.style.webkitFontSmoothing="antialiased";
        const nodes=[clone,...clone.querySelectorAll("*")];
        nodes.forEach((node)=>{
          if(!(node instanceof HTMLElement))return;
          const st=node.style;
          if(st.backdropFilter||st.webkitBackdropFilter){
            st.backdropFilter="none";
            st.webkitBackdropFilter="none";
            if(!st.backgroundColor||st.backgroundColor==="transparent")st.backgroundColor="rgba(0,0,0,0.52)";
          }
        });
      },
    });
    return normalizeWaCardCanvas(raw);
  };

  const downloadImage=async()=>{
    setDownloading(true);
    try{
      const canvas=await captureCard();
      const name=`Northing-${(listing.title||"property").replace(/\s+/g,"-").toLowerCase()}.png`;
      if(canvas.toBlob){
        await new Promise((res,rej)=>{
          canvas.toBlob((blob)=>{
            if(!blob){rej();return;}
            const url=URL.createObjectURL(blob);
            const a=document.createElement("a");
            a.download=name;
            a.href=url;
            a.click();
            setTimeout(()=>URL.revokeObjectURL(url),3000);
            res();
          },"image/png");
        });
      }else{
        const a=document.createElement("a");
        a.download=name;
        a.href=canvas.toDataURL("image/png");
        a.click();
      }
    }catch(e){alert("Download failed — try screenshotting the card manually.");}
    setDownloading(false);
  };

  const shareOnWA=async()=>{
    setDownloading(true);
    try{
      const canvas=await captureCard();
      canvas.toBlob(async(blob)=>{
        const file=new File([blob],"Northing-card.png",{type:"image/png"});
        if(navigator.share&&navigator.canShare&&navigator.canShare({files:[file]})){
          await navigator.share({files:[file],title:listing.title,text:buildText()});
        } else {
          const a=document.createElement("a"); a.download="Northing-card.png";
          a.href=canvas.toDataURL(); a.click();
          setTimeout(()=>window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`,"_blank"),800);
        }
      },"image/png");
    }catch(e){alert("Share failed — try downloading the image instead.");}
    setDownloading(false);
  };

  const price=fmtP(listing.price);
  const details=[listing.bedrooms>0?`🛏 ${listing.bedrooms} Bed${listing.bedrooms>1?"s":""}`:null,listing.bathrooms>0?`🚿 ${listing.bathrooms} Bath${listing.bathrooms>1?"s":""}`:null,listing.sizesqft?`📐 ${listing.sizesqft} sqft`:null,listing.furnishingStatus?`🛋 ${listing.furnishingStatus}`:null].filter(Boolean);
  const highlights=(listing.highlights||[]).slice(0,3);

  const buildText=()=>{
    const lines=[];
    lines.push('*' + listing.title + '*');
    lines.push('Location: ' + listing.location);
    lines.push('');
    lines.push('Price: *' + price + '*' + (listing.listingType==='Rent' ? ' / month' : ''));
    lines.push('Type: For ' + listing.listingType);
    const dc=details.map(d=>d.replace(/[^\w\s.,:%\/\-]/g,'').trim()).filter(Boolean);
    if(dc.length>0) lines.push('Details: ' + dc.join(' | '));
    if(listing.description){lines.push('');lines.push(listing.description);}
    if(highlights.length>0){lines.push('');lines.push('Highlights:');highlights.forEach(h=>lines.push('  - '+h));}
    lines.push('');
    lines.push('Contact:');
    lines.push('  Agent: *' + (listing.agentName||'') + '*');
    if(listing.agentPhone) lines.push('  Phone: ' + listing.agentPhone);
    if(listing.agencyName) lines.push('  Agency: ' + listing.agencyName);
    lines.push('');
    lines.push('_Powered by Northing_');
    return lines.join('\n');
  };

  const copyText=()=>{
    navigator.clipboard?.writeText(buildText()).then(()=>{setCopied(true);setTimeout(()=>setCopied(false),2500);}).catch(()=>{});
  };
  const openWA=()=>window.open(`https://wa.me/?text=${encodeURIComponent(buildText())}`,"_blank");

  const cardW=420;
  const cardH=420;
  const btnW=420;

  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(10,5,2,0.75)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div className="asl" style={{display:"flex",flexDirection:"column",alignItems:"center",gap:12,maxHeight:"95vh",overflow:"auto"}} onClick={e=>e.stopPropagation()}>

        {/* THE CARD */}
        <div id="wa-card" style={{width:cardW,height:cardH,borderRadius:20,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",position:"relative",flexShrink:0,background:"#1a1410"}}>
          {/* Photo */}
          {listing.photos?.[0]
            ?<img src={listing.photos[0]} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
            :<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#2d2118,#1a1410)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:72,opacity:0.08}}>🏠</div></div>
          }
          {/* Gradient overlay */}
          <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.05) 35%,rgba(10,5,2,0.92) 68%,rgba(10,5,2,1) 100%)"}}/>

          {/* Top badges */}
          <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <span style={{background:"var(--primary)",color:"#fff",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:20,letterSpacing:"0.5px"}}>FOR {listing.listingType?.toUpperCase()}</span>
            <div style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"center",minHeight:26,minWidth:40}}>
              {wlLogo ? <img src={wlLogo} alt="" style={{height:26,maxWidth:120,width:"auto",objectFit:"contain",display:"block"}}/> : null}
            </div>
          </div>

          {/* Bottom content */}
          <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 18px 16px"}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:8,letterSpacing:"-1px"}}>
              {price}{listing.listingType==="Rent"&&<span style={{fontSize:14,fontWeight:400,color:"rgba(255,255,255,0.6)"}}>/mo</span>}
            </div>
            <div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:3,lineHeight:1.3}}>{listing.title}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:10}}>📍 {listing.location}</div>
            {details.length>0&&<div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
              {details.map((d,i)=><span key={i} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,color:"#fff"}}>{d}</span>)}
            </div>}
            <div style={{height:1,background:"rgba(255,255,255,0.12)",marginBottom:12}}/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>{listing.agentName}</div>
                <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>{listing.agencyName}{listing.agentPhone?` · ${listing.agentPhone}`:""}</div>
              </div>

            </div>
          </div>
        </div>

        {/* Action buttons */}
        <button onClick={downloadImage} disabled={downloading} style={{width:btnW,padding:"12px 8px",borderRadius:10,fontSize:13,fontWeight:700,cursor:downloading?"not-allowed":"pointer",background:"rgba(255,255,255,0.15)",color:"#fff",border:"1px solid rgba(255,255,255,0.25)",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:downloading?0.6:1}}>
          {downloading?"Processing...":"⬇️ Download Property Card"}
        </button>
        <button onClick={shareOnWA} disabled={downloading} style={{width:btnW,padding:"12px 8px",borderRadius:10,fontSize:13,fontWeight:700,cursor:downloading?"not-allowed":"pointer",background:downloading?"rgba(37,211,102,0.5)":"#25D366",color:"#fff",border:"none",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:8,opacity:downloading?0.7:1}}>
          {downloading?"⏳ Processing…":<><WALogo size={15}/>Share on WhatsApp</>}
        </button>
        <button onClick={onClose} style={{width:btnW,padding:"10px 8px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:"rgba(255,255,255,0.07)",color:"rgba(255,255,255,0.7)",border:"1px solid rgba(255,255,255,0.15)",fontFamily:"inherit"}}>✕ Close</button>
      </div>
    </div>
  );
};

const PDFModal = ({listing,onClose,currentUser}) => {
  const agentBrand = useListingAgentBrand(listing, currentUser);
  const headerLogoSrc = agentBrand?.logoUrl || null;
  const [pdfLoading,setPdfLoading]=useState(false);
  const [mapSrc,setMapSrc]=useState(null);
  useEffect(()=>{if(listing?.id)track(listing.id,"pdf");},[listing?.id]);
  const gMapsKey=import.meta.env?.VITE_GOOGLE_MAPS_API_KEY;
  useEffect(()=>{
    if(!listing?.location||!gMapsKey){setMapSrc(null);return;}
    setMapSrc(`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(listing.location)}&zoom=15&size=640x220&scale=2&maptype=roadmap&markers=color:0xFF6B00|${encodeURIComponent(listing.location)}&key=${encodeURIComponent(gMapsKey)}`);
  },[listing?.location,gMapsKey]);
  if(!listing) return null;
  const td=new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  const ref=`PHQ-${String(listing.id||"").slice(-6).toUpperCase()||"000000"}`;
  const fields=[["Type",listing.propertyType],["Listing",listing.listingType],["Size",listing.sizesqft?`${listing.sizesqft} sqft`:null],["Carpet Area",listing.carpetArea?`${listing.carpetArea} sqft`:null],["Super Built-up",listing.superBuiltUp?`${listing.superBuiltUp} sqft`:null],["Beds",listing.bedrooms||null],["Baths",listing.bathrooms||null],["Toilets",listing.toilets||null],["Furnishing",listing.furnishingStatus],["Condition",listing.condition],["Modern Kitchen",listing.modernKitchen],["WC Type",listing.wcType],["Built Year",listing.builtYear],["Property Floor",listing.propertyFloor],["Total Floors",listing.totalFloors],["Parking",listing.parkingType],["Vastu",listing.vastuDirection],["Maintenance",listing.maintenance?`₹${listing.maintenance}/mo`:null],["Society",listing.societyFormed],["OC Received",listing.ocReceived],["RERA",listing.reraRegistered==="Yes"?`Yes – ${listing.reraNumber||""}`:listing.reraRegistered]].filter(([,v])=>v);
  const hasAgentBrand=listing.agencyName||listing.agentName||!!headerLogoSrc;

  const downloadPDF=async()=>{
    if(!document.getElementById('pdf-print-area')) return;
    setPdfLoading(true);
    try{
      await exportElementToPdfById('pdf-print-area','Northing-'+((listing.title||'property').replace(/\s+/g,'-').toLowerCase()));
    }catch(err){console.error(err);window.print();}
    finally{setPdfLoading(false);}
  };

  const shell=(
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:12000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div className="asl" style={{background:"#fff",borderRadius:18,maxWidth:720,width:"100%",maxHeight:"92vh",overflow:"auto",boxShadow:"0 32px 80px rgba(0,0,0,0.25)"}} onClick={e=>e.stopPropagation()}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"12px 20px",borderBottom:"1px solid #eee",position:"sticky",top:0,background:"#fff",zIndex:1}}>
          <div style={{fontWeight:800,fontSize:14,color:"var(--navy)"}}>PDF Preview</div>
          <div style={{display:"flex",gap:8}}>
            <button onClick={downloadPDF} disabled={pdfLoading} style={{background:"var(--primary)",color:"#fff",border:"none",padding:"8px 18px",borderRadius:8,fontSize:13,fontWeight:700,cursor:pdfLoading?"not-allowed":"pointer",fontFamily:"inherit",display:"flex",alignItems:"center",gap:6,opacity:pdfLoading?0.7:1}}>{pdfLoading?<><span className="spin"/>Generating PDF…</>:<>⬇️ Download PDF</>}</button>
            <button onClick={onClose} style={{background:"#f4f4f4",border:"1px solid #ddd",color:"#666",padding:"8px 14px",borderRadius:8,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"}}>✕ Close</button>
          </div>
        </div>
        <div id="pdf-print-area" style={{padding:"36px 44px",fontFamily:"'Inter',sans-serif",color:"#1a1410"}}>
          {hasAgentBrand?(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,paddingBottom:20,borderBottom:"3px solid var(--primary)"}}>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                {headerLogoSrc ? (
                  <img src={headerLogoSrc} alt="Brand" style={{width:64,height:64,objectFit:"contain",borderRadius:10,border:"1px solid #eee",background:"#fff"}}/>
                ) : (
                  <div style={{width:64,height:64,borderRadius:10,border:"1px solid #eee",background:"#fafafa",flexShrink:0}} aria-hidden />
                )}
                <div>
                  <div style={{fontWeight:900,fontSize:22,color:"var(--navy)",letterSpacing:"-0.5px"}}>{listing.agencyName||listing.agentName}</div>
                  {listing.agentPhone&&<div style={{fontSize:13,color:"#666",marginTop:2}}>📞 {listing.agentPhone}</div>}
                  {listing.agentAddress&&<div style={{fontSize:12,color:"#666"}}>📍 {listing.agentAddress}</div>}
                  {listing.agentWebsite&&<div style={{fontSize:12,color:"var(--primary)"}}>{listing.agentWebsite}</div>}
                </div>
              </div>
              <div style={{textAlign:"right"}}>
                <div style={{fontSize:11,color:"#aaa"}}>{td}</div>
                <div style={{fontSize:11,color:"#aaa",marginTop:2}}>Ref: {ref}</div>
              </div>
            </div>
          ):(
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,paddingBottom:20,borderBottom:"3px solid var(--primary)"}}>
              <div>
                <img src={DEFAULT_NORTHING_LOGO_SRC} alt="Northing" style={{height:36,width:"auto",maxWidth:220,objectFit:"contain",display:"block"}}/>
                <div style={{fontSize:10,color:"#888",letterSpacing:"1.5px",marginTop:6,textTransform:"uppercase"}}>Professional Property Marketing</div>
              </div>
              <div style={{textAlign:"right",fontSize:12,color:"#888"}}><div>{td}</div><div style={{marginTop:3}}>{ref}</div></div>
            </div>
          )}
          {/* ── PROPERTY INFO ── */}
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,margin:"0 0 4px",color:"var(--navy)",lineHeight:1.15}}>{listing.title}</h1>
          <div style={{color:"#888",fontSize:14,marginBottom:12}}>📍 {listing.location}</div>
          <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:6,flexWrap:"wrap"}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:900,color:"var(--primary)"}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:15,fontWeight:400,color:"#888"}}>/month</span>}</div>
            <div style={{display:"inline-block",background:"var(--primary-light)",color:"var(--primary)",border:"1px solid var(--primary-mid)",borderRadius:20,padding:"3px 14px",fontSize:12,fontWeight:700}}>For {listing.listingType}</div>
          </div>

          {listing.description&&<div style={{background:"#fafafa",padding:16,borderRadius:10,fontSize:13,lineHeight:1.8,marginBottom:20,marginTop:14,border:"1px solid #eee",color:"#444"}}>{listing.description}</div>}

          {fields.length>0&&<div style={{marginBottom:20}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:12}}>Property Details</div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 40px"}}>
              {fields.map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f4f4f4",fontSize:13}}><span style={{color:"#888"}}>{k}</span><span style={{fontWeight:700,color:"var(--navy)"}}>{v}</span></div>)}
            </div>
          </div>}

          {listing.highlights?.length>0&&<div style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:12}}>Key Highlights</div>
            {listing.highlights.map((h,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7,fontSize:13,alignItems:"flex-start"}}><span style={{color:"var(--primary)",fontWeight:700,flexShrink:0}}>✓</span>{h}</div>)}
          </div>}

          {/* ── PHOTOS stacked vertically ── */}
          {listing.photos?.length>0&&(
            <div style={{marginBottom:24}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:14}}>Property Photos</div>
              <div style={{display:"flex",flexDirection:"column",gap:12}}>
                {listing.photos.map((p,i)=>(
                  <div key={i} data-pdf-photo="1" style={{position:"relative"}}>
                    <img src={p} alt={`Photo ${i+1}`} style={{width:"100%",height:320,objectFit:"cover",borderRadius:12,border:"1px solid #eee",display:"block"}}/>
                    {i===0&&<div style={{position:"absolute",top:10,left:10,background:"var(--primary)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20}}>Cover Photo</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Location map: Static API if VITE_GOOGLE_MAPS_API_KEY (best for PDF capture); else free Google Maps embed (no API key) ── */}
          <div style={{marginBottom:24}}>
            <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:14}}>Location Map</div>
            {listing.location?(
              gMapsKey&&mapSrc?(
                <img
                  src={mapSrc}
                  alt="Property location map"
                  style={{width:"100%",height:220,objectFit:"cover",borderRadius:12,border:"1px solid #eee",display:"block"}}
                />
              ):(
                <iframe
                  title="Property location map"
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location)}&output=embed`}
                  style={{width:"100%",height:220,border:"1px solid #eee",borderRadius:12,display:"block"}}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              )
            ):null}
            {listing.location&&<div style={{marginTop:8,textAlign:"right"}}><a href={googleMapsSearchUrl(listing.location)} target="_blank" rel="noreferrer" style={{fontSize:12,fontWeight:600,color:"var(--primary)"}}>Open in Google Maps →</a></div>}
          </div>

          {/* ── AGENT FOOTER ── */}
          <div style={{borderTop:"2px solid #f0f0f0",paddingTop:16,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"var(--navy)"}}>{listing.agentName||""}</div>
              {listing.agentEmail&&<div style={{fontSize:12,color:"#888"}}>{listing.agentEmail}</div>}
              {listing.agentPhone&&<div style={{fontSize:12,color:"#888"}}>📞 {listing.agentPhone}</div>}
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"#ccc"}}>Northing</div>
              <div style={{fontSize:10,color:"#ccc"}}>Powered by Northing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  return typeof document!=="undefined"&&document.body?createPortal(shell,document.body):shell;
};

const useSecretAdmin = (cb) => {
  const c=useRef(0),t=useRef(null);
  return ()=>{c.current++;clearTimeout(t.current);t.current=setTimeout(()=>{c.current=0;},1500);if(c.current>=5){c.current=0;cb();}};
};

const SecretAdminModal = ({onLogin,onClose,showToast}) => {
  const [email,setEmail]=useState("");const [pass,setPass]=useState("");const [shake,setShake]=useState(false);const [loading,setLoading]=useState(false);
  const attempt=async()=>{
    setLoading(true);
    try {
      const {data,error}=await supabase.auth.signInWithPassword({email,password:pass});
      if(error) throw error;
      const {data:profile,error:pe}=await supabase.from("profiles").select("*").eq("id",data.user.id).single();
      if(pe||!profile) throw new Error("Profile not found");
      if(profile.role!=="master") throw new Error("Not authorised");
      onLogin({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,savedListings:[]});
      onClose();
    } catch(err){setShake(true);setTimeout(()=>setShake(false),500);showToast(err.message||"Invalid credentials","error");}
    setLoading(false);
  };
  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.5)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div className={`card asl ${shake?"shk":""}`} style={{padding:"40px 36px",maxWidth:380,width:"100%",boxShadow:"0 32px 80px rgba(27,58,45,0.2)"}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{width:52,height:52,borderRadius:"50%",background:"var(--green-light)",display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px",fontSize:24,border:"2px solid var(--green-mid)"}}>🔐</div>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:21,fontWeight:700,color:"var(--navy)",marginBottom:5}}>Secure Access</h2>
          <p style={{fontSize:13,color:"var(--muted)"}}>Authorised personnel only</p>
        </div>
        <div style={{marginBottom:12}}><input className="inp" type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} /></div>
        <div style={{marginBottom:20}}><input className="inp" type="password" placeholder="Password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&attempt()} /></div>
        <button onClick={attempt} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:10,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Please wait…</>:"Access Platform →"}</button>
        <button onClick={onClose} style={{width:"100%",marginTop:8,background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:8}}>Cancel</button>
      </div>
    </div>
  );
};

const LoginPage = ({onLogin,showToast,onNavigate}) => {
  const [mode,setMode]=useState("login");const [role,setRole]=useState("user");
  const [form,setForm]=useState({name:"",email:"",password:"",phone:"",agencyName:""});const [loading,setLoading]=useState(false);
  const [loginChannel,setLoginChannel]=useState("phone");
  const [phoneLogin,setPhoneLogin]=useState("");
  const [otpCode,setOtpCode]=useState("");
  const [otpStep,setOtpStep]=useState("phone");
  const [otpCooldown,setOtpCooldown]=useState(0);
  const setF=(k,v)=>setForm(f=>({...f,[k]:v}));

  const finishSession=async(userId)=>{
    const {data:profile,error:pe}=await supabase.from("profiles").select("*").eq("id",userId).single();
    if(pe||!profile) throw new Error("Could not load your profile.");
    const savedRes=await supabase.from("saved_listings").select("listing_id").eq("user_id",userId);
    const savedIds=(savedRes.data||[]).map(r=>r.listing_id);
    showToast(`Welcome back, ${profile.name}!`,"success");
    onLogin({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,logoUrl:profile.logo_url||null,agentAddress:profile.address||null,agentWebsite:profile.website||null,savedListings:savedIds});
  };

  const sendPhoneOtp=async()=>{
    const e164=toE164Phone(phoneLogin);
    if(!e164){showToast("Enter a valid 10-digit mobile number","error");return;}
    if(mode==="register"){
      if(!form.name?.trim()){showToast("Enter your name","error");return;}
    }
    setLoading(true);
    try{
      const {error}=await supabase.auth.signInWithOtp({phone:e164});
      if(error) throw error;
      showToast("OTP sent! Check your SMS.","success");
      setOtpStep("otp");
      setOtpCooldown(45);
      let left=45;
      const id=setInterval(()=>{left-=1;setOtpCooldown(left);if(left<=0)clearInterval(id);},1000);
    }catch(err){showToast(err.message||"Could not send OTP (enable Phone provider + SMS in Supabase)","error");}
    setLoading(false);
  };

  const verifyPhoneOtp=async()=>{
    const e164=toE164Phone(phoneLogin);
    if(!e164||!otpCode.replace(/\s/g,"")){showToast("Enter the 6-digit code","error");return;}
    setLoading(true);
    try{
      const {data,error}=await supabase.auth.verifyOtp({phone:e164,token:otpCode.replace(/\s/g,""),type:"sms"});
      if(error) throw error;
      const uid=data?.session?.user?.id||data?.user?.id;
      if(!uid) throw new Error("Login incomplete — try again");
      const national=nationalDigitsFromE164(e164);
      const {data:existing}=await supabase.from("profiles").select("id").eq("id",uid).maybeSingle();
      if(!existing){
        if(mode==="register"){
          const emailTrim=form.email?.trim()||null;
          const {error:insErr}=await supabase.from("profiles").insert({
            id:uid,
            name:form.name.trim(),
            email:emailTrim,
            role,
            phone:national,
            agency_name:form.agencyName?.trim()||null,
          });
          if(insErr) throw insErr;
        }else{
          const last4=national||"0000";
          const {error:insErr}=await supabase.from("profiles").insert({
            id:uid,
            name:`User ${last4}`,
            email:null,
            role:"user",
            phone:national,
            agency_name:null,
          });
          if(insErr) throw insErr;
        }
      }
      await finishSession(uid);
    }catch(err){showToast(err.message||"Invalid or expired code","error");}
    setLoading(false);
  };

  const submit=async()=>{
    if(!form.email||!form.password){showToast("Email and password required","error");return;}
    setLoading(true);
    try{
      const {data,error}=await supabase.auth.signInWithPassword({email:form.email,password:form.password});
      if(error) throw error;
      await finishSession(data.user.id);
    }catch(err){showToast(err.message||"Something went wrong","error");}
    setLoading(false);
  };
  const roles=[
    {id:"user",icon:"🔍",label:"Buyer",desc:"Browse & save properties"},
    {id:"seller",icon:"🏠",label:"Individual Seller",desc:"List up to 2 properties"},
    {id:"agent",icon:"🏢",label:"Agent / Firm",desc:"Unlimited listings + white-label"},
  ];
  return (
    <div className="login-page" style={{minHeight:"100vh",background:"var(--cream)",display:"flex",flexWrap:"nowrap"}}>
      <div className="login-hero-col" style={{width:"45%",minHeight:"100vh",alignSelf:"stretch",background:"var(--navy)",padding:"60px 48px",display:"flex",flexDirection:"column",justifyContent:"space-between",position:"relative",overflow:"hidden",flexShrink:0}}>
        <LoginParticles />
        <div style={{position:"absolute",top:-60,right:-60,width:300,height:300,borderRadius:"50%",background:"rgba(234,88,12,0.08)",zIndex:1}}/>
        <div style={{position:"absolute",bottom:-80,left:-40,width:250,height:250,borderRadius:"50%",background:"rgba(148,163,184,0.12)",zIndex:1}}/>
        <div style={{position:"relative",zIndex:2}}><div className="login-heading-serif" style={{fontWeight:700,fontSize:28,color:"#fff",marginBottom:4}}>Northing</div><div style={{fontSize:13,color:"rgba(255,255,255,0.45)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Professional Property Marketing</div></div>
        <div style={{position:"relative",zIndex:2}}>
          <h2 className="login-heading-serif" style={{fontSize:34,fontWeight:600,color:"#fff",lineHeight:1.25,marginBottom:16}}>Buy, Sell, or Rent — all in one place.</h2>
          <p style={{fontSize:14,color:"rgba(255,255,255,0.5)",lineHeight:1.75}}>Instant brochures, WhatsApp cards, and verified listings — built for Indian real estate.</p>
          <div style={{marginTop:36,display:"flex",flexDirection:"column",gap:12}}>
            {[["🔍","Buyers","Browse verified listings and download reports"],["🏠","Sellers","List your property and reach thousands"],["🏢","Agents","White-label brochures and full firm profile"]].map(([icon,title,desc])=>(
              <div key={title} style={{display:"flex",gap:12,alignItems:"flex-start"}}>
                <span style={{fontSize:20}}>{icon}</span>
                <div><div style={{fontWeight:700,fontSize:14,color:"#fff"}}>{title}</div><div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>{desc}</div></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="login-form-col" style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",padding:32,overflowY:"auto",minWidth:0}}>
        <div style={{maxWidth:440,width:"100%"}}>
          <div style={{marginBottom:16}}>
            <button onClick={()=>onNavigate&&onNavigate("home")} style={{background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:"4px 0",display:"flex",alignItems:"center",gap:6,fontFamily:"inherit",fontWeight:600}}>← Back to Home</button>
          </div>
          <div style={{marginBottom:28}}>
            <div className="login-heading-serif" style={{fontWeight:700,fontSize:22,color:"var(--navy)",marginBottom:2}}>Northing</div>
            <h2 className="login-heading-serif" style={{fontSize:28,fontWeight:600,color:"var(--navy)",marginBottom:6}}><ShinyText text={mode==="login"?"Welcome back.":"Create account."} color="#0f172a" shineColor="#ea580c" speed={3} spread={140}/></h2>
            <p style={{fontSize:14,color:"var(--muted)"}}>{mode==="login"?"Sign in with your mobile number":"Create your account — mobile is required, email optional"}</p>
          </div>
          {mode==="login"&&(
            <div style={{display:"flex",gap:8,marginBottom:18,padding:5,background:"var(--gray)",borderRadius:12,border:"1px solid var(--border)"}}>
              {[{id:"phone",label:"Mobile OTP"},{id:"email",label:"Email & password"}].map(({id,label})=>(
                <button key={id} type="button" onClick={()=>{setLoginChannel(id);setOtpStep("phone");setOtpCode("");}} style={{flex:1,padding:"10px 10px",borderRadius:10,border:"none",cursor:"pointer",fontWeight:700,fontSize:12,fontFamily:"inherit",background:loginChannel===id?"var(--white)":"transparent",color:loginChannel===id?"var(--primary)":"var(--muted)",boxShadow:loginChannel===id?"0 2px 10px rgba(15,23,42,0.08)":"none",transition:"all 0.2s"}}>{label}</button>
              ))}
            </div>
          )}
          {mode==="register"&&(
            <div style={{marginBottom:18}}>
              <div style={{fontSize:11,fontWeight:700,color:"var(--muted)",textTransform:"uppercase",letterSpacing:0.5,marginBottom:8}}>I am a…</div>
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {roles.map(r=>(
                  <button key={r.id} onClick={()=>setRole(r.id)} style={{padding:"12px 14px",borderRadius:12,border:`2px solid ${role===r.id?"var(--primary)":"var(--border)"}`,background:role===r.id?"var(--primary-light)":"var(--white)",cursor:"pointer",display:"flex",alignItems:"center",gap:12,textAlign:"left",transition:"all 0.2s"}}>
                    <span style={{fontSize:22}}>{r.icon}</span>
                    <div><div style={{fontWeight:700,fontSize:14,color:role===r.id?"var(--primary)":"var(--navy)"}}>{r.label}</div><div style={{fontSize:11,color:"var(--muted)"}}>{r.desc}</div></div>
                  </button>
                ))}
              </div>
            </div>
          )}
          {mode==="register"&&(
            <>
              <div style={{marginBottom:12}}><input className="inp" placeholder="Full name *" value={form.name} onChange={e=>setF("name",e.target.value)} /></div>
              <div style={{marginBottom:12}}><input className="inp" type="email" placeholder="Email (optional)" value={form.email} onChange={e=>setF("email",e.target.value)} /></div>
              {(role==="agent"||role==="seller")&&<div style={{marginBottom:12}}><input className="inp" placeholder={role==="agent"?"Agency / Firm name (optional)":"Your name or firm (optional)"} value={form.agencyName} onChange={e=>setF("agencyName",e.target.value)} /></div>}
            </>
          )}
          {(mode==="login"&&loginChannel==="phone")||mode==="register"?(
            <>
              {mode==="login"&&<p style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.45}}>We’ll text you a one-time code.</p>}
              {mode==="register"&&<p style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.45}}>We’ll send a code to verify your number.</p>}
              {otpStep==="phone"?(
                <>
                  <div style={{marginBottom:12}}><input className="inp" type="tel" placeholder="Mobile (10 digits, India +91)" value={phoneLogin} onChange={e=>setPhoneLogin(e.target.value)} /></div>
                  <button type="button" onClick={sendPhoneOtp} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:11,fontSize:15,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Sending…</>:"Send OTP →"}</button>
                </>
              ):(
                <>
                  <div style={{marginBottom:12}}><input className="inp" inputMode="numeric" autoComplete="one-time-code" placeholder="Enter 6-digit OTP" value={otpCode} onChange={e=>setOtpCode(e.target.value)} maxLength={10} onKeyDown={e=>e.key==="Enter"&&verifyPhoneOtp()} /></div>
                  <button type="button" onClick={verifyPhoneOtp} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:11,fontSize:15,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Verifying…</>:mode==="register"?"Verify & create account →":"Verify & Sign In →"}</button>
                  <button type="button" onClick={()=>{setOtpStep("phone");setOtpCode("");}} className="btn-ghost" style={{width:"100%",padding:"10px",borderRadius:9,fontSize:13,marginBottom:10}}>← Use different number</button>
                  {otpCooldown>0?<p style={{fontSize:12,color:"var(--muted)",textAlign:"center",marginBottom:8}}>Resend OTP in {otpCooldown}s</p>:<button type="button" onClick={sendPhoneOtp} disabled={loading} className="btn-outline" style={{width:"100%",padding:"10px",borderRadius:9,fontSize:13,marginBottom:12}}>Resend OTP</button>}
                </>
              )}
            </>
          ):null}
          {mode==="login"&&loginChannel==="email"&&(
            <>
              <p style={{fontSize:12,color:"var(--muted)",marginBottom:14,lineHeight:1.45}}>Sign in with email and password.</p>
              <div style={{marginBottom:12}}><input className="inp" type="email" placeholder="Email address" value={form.email} onChange={e=>setF("email",e.target.value)} /></div>
              <div style={{marginBottom:20}}><input className="inp" type="password" placeholder="Password" value={form.password} onChange={e=>setF("password",e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()} /></div>
              <button onClick={submit} disabled={loading} className="btn-primary" style={{width:"100%",padding:"13px",borderRadius:11,fontSize:15,marginBottom:12,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Please wait…</>:"Sign In →"}</button>
            </>
          )}
          <button onClick={()=>{setMode(m=>m==="login"?"register":"login");setLoginChannel("phone");setOtpStep("phone");setOtpCode("");}} style={{width:"100%",background:"none",border:"none",color:"var(--muted)",fontSize:13,cursor:"pointer",padding:6}}>{mode==="login"?"Don't have an account? Register →":"Already registered? Sign in →"}</button>
        </div>
      </div>
    </div>
  );
};

const FI=({label,k,form,set,type="text",placeholder="",err,span})=>(<div style={{marginBottom:13,gridColumn:span?"1/-1":"auto"}}>{label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>}<input type={type} placeholder={placeholder} value={form[k]||""} onChange={e=>set(k,e.target.value)} className="inp" style={{borderColor:err?"#FCA5A5":"var(--border)"}} />{err&&<div style={{fontSize:11,color:"#DC2626",marginTop:3}}>{err}</div>}</div>);
const FS=({label,k,form,set,opts,fmtLabel})=>(<div style={{marginBottom:13}}>{label&&<label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>}<select value={form[k]||""} onChange={e=>set(k,e.target.value)} className="inp"><option value="">Select…</option>{opts.map(o=><option key={o} value={o}>{fmtLabel?fmtLabel(o):o}</option>)}</select></div>);
const FormSec=({title,children})=>(<div className="card-flat" style={{padding:"20px 22px",marginBottom:14}}><h3 style={{margin:"0 0 14px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9}}>{title}</h3><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 18px"}}>{children}</div></div>);

const scorePhotoWithClaude=async(base64,mediaType)=>{
  try{
    const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:300,messages:[{role:"user",content:[{type:"image",source:{type:"base64",media_type:mediaType,data:base64}},{type:"text",text:`You are a real estate photography expert. Score this property photo for use as a listing cover image. Rate each from 1-10: lighting, angle, appeal, clarity. Respond ONLY with valid JSON no markdown: {"lighting":7,"angle":8,"appeal":9,"clarity":8,"overall":8,"reason":"one sentence"}`}]}]})});
    const data=await res.json();
    const text=data.content?.[0]?.text||"{}";
    return JSON.parse(text.replace(/```json|```/g,"").trim());
  }catch{return{overall:5,lighting:5,angle:5,appeal:5,clarity:5,reason:"Could not score"};}
};

const ListingForm = ({currentUser,listingId,allListings,showToast,onBack,onSaved}) => {
  const isEdit=!!listingId; const fileRef=useRef(); const [hl,setHl]=useState(""); const [dupModal,setDupModal]=useState(null); const [saving,setSaving]=useState(false); const [photoLoading,setPhotoLoading]=useState(false);
  const [aiStatus,setAiStatus]=useState("idle"); // idle | analyzing | done
  const [coverIdx,setCoverIdx]=useState(0);
  const [aiPick,setAiPick]=useState(null);
  const [scoringIdx,setScoringIdx]=useState(null);
  const [photoMeta,setPhotoMeta]=useState([]); // [{url,score}] parallel to form.photos
  const [form,setForm]=useState({title:"",location:"",propertyType:"",listingType:"",price:"",sizesqft:"",bedrooms:"",bathrooms:"",toilets:"",furnishingStatus:"",condition:"",builtYear:"",modernKitchen:"",wcType:"",superBuiltUp:"",carpetArea:"",parkingType:"",vastuDirection:"",totalFloors:"",propertyFloor:"",maintenance:"",societyFormed:"",ocReceived:"",reraRegistered:"",reraNumber:"",description:"",highlights:[],status:"Active",agentName:currentUser?.name||"",agentPhone:currentUser?.phone||"",agencyName:currentUser?.agencyName||"",agentEmail:currentUser?.email||"",photos:[]});
  const [errs,setErrs]=useState({});
  const set=(k,v)=>setForm(f=>({...f,[k]:v}));
  useEffect(()=>{if(isEdit){const raw=allListings.find(l=>l.id===listingId);if(raw)setForm(dbToForm(raw));}},[listingId,allListings]);
  const addHl=()=>{if(hl.trim()){set("highlights",[...(form.highlights||[]),hl.trim()]);setHl("");}};
  const rmHl=(i)=>set("highlights",form.highlights.filter((_,idx)=>idx!==i));
  const handlePhotos=async(e)=>{
    const files=Array.from(e.target.files);
    if((form.photos?.length||0)+files.length>10){showToast("Max 10 photos allowed","error");return;}
    setPhotoLoading(true);
    try{
      // 1. Upload all to Supabase first
      const newUrls=[]; const newMeta=[];
      for(const file of files){
        if(file.size>5*1024*1024){showToast(`${file.name} is over 5MB, skipped`,"error");continue;}
        const wmOptions=watermarkOptionsForProfileUpload(currentUser);
        const url=await uploadWatermarked(file,wmOptions);
        // Read base64 for scoring
        const b64=await new Promise(res=>{const r=new FileReader();r.onload=ev=>{const[,d]=ev.target.result.split(",");res({base64:d,mediaType:file.type});};r.readAsDataURL(file);});
        newUrls.push(url);
        newMeta.push({url,score:null,base64:b64.base64,mediaType:b64.mediaType});
      }
      const allUrls=[...(form.photos||[]),...newUrls];
      const allMeta=[...photoMeta,...newMeta];
      setForm(f=>({...f,photos:allUrls}));
      setPhotoMeta(allMeta);
      setPhotoLoading(false);
      e.target.value="";
      if(!newUrls.length) return;
      // 2. Silently score all unscored photos
      setAiStatus("analyzing");
      const scored=[...allMeta];
      for(let i=0;i<scored.length;i++){
        if(scored[i].score) continue;
        setScoringIdx(i);
        const result=await scorePhotoWithClaude(scored[i].base64,scored[i].mediaType);
        scored[i]={...scored[i],score:result};
        setPhotoMeta([...scored]);
      }
      setScoringIdx(null);
      // 3. Pick best, move to index 0
      const bestIdx=scored.reduce((b,p,i)=>(p.score?.overall||0)>(scored[b].score?.overall||0)?i:b,0);
      setAiPick(bestIdx);
      setCoverIdx(bestIdx);
      // Reorder photos so best is first
      const reordered=[...allUrls];
      const [best]=reordered.splice(bestIdx,1);
      reordered.unshift(best);
      const reorderedMeta=[...scored];
      const [bestM]=reorderedMeta.splice(bestIdx,1);
      reorderedMeta.unshift(bestM);
      setForm(f=>({...f,photos:reordered}));
      setPhotoMeta(reorderedMeta);
      setCoverIdx(0);
      setAiPick(0);
      setAiStatus("done");
      showToast(`✨ Best cover auto-selected (${scored[bestIdx].score?.overall}/10) — you can change it anytime`,"success");
    }catch(err){showToast("Photo upload failed: "+err.message,"error");setPhotoLoading(false);}
  };
  const rmPhoto=(i)=>{setForm(f=>({...f,photos:f.photos.filter((_,idx)=>idx!==i)}));setPhotoMeta(m=>m.filter((_,idx)=>idx!==i));if(coverIdx>=( form.photos?.length||1)-1)setCoverIdx(0);};
  const validate=()=>{const e={};if(!form.title)e.title="Required";if(!form.location)e.location="Required";if(!form.propertyType)e.propertyType="Required";if(!form.listingType)e.listingType="Required";if(!form.price)e.price="Required";if(!form.description||!form.description.trim())e.description="Description is required";if(!form.photos?.length)e.photos="At least 1 photo is required";setErrs(e);return !Object.keys(e).length;};
  const doSave=async()=>{
    setSaving(true);
    try{
      if(isEdit){
        const {error}=await supabase.from("listings").update(formToDb(form,currentUser.id)).eq("id",listingId);
        if(error) throw error;
      } else {
        const {error}=await supabase.from("listings").insert(formToDb(form,currentUser.id));
        if(error) throw error;
      }
      showToast(isEdit?"Listing updated!":"Listing created!","success");
      onSaved();
    }catch(err){showToast("Save failed: "+err.message,"error");}
    setSaving(false);
  };
  const handleSave=async()=>{
    if(!validate()){showToast("Please fill required fields","error");return;}
    if(!isEdit){
      const dups=findDups(form,allListings.map(mapListing),null);
      if(dups.length>0){setDupModal(dups);return;}
    }
    await doSave();
  };
  return (
    <div style={{maxWidth:860,margin:"0 auto",padding:"28px 20px"}}>
      {dupModal&&<DupModal dups={dupModal} onProceed={()=>{setDupModal(null);doSave();}} onCancel={()=>setDupModal(null)} />}
      <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:24}}>
        <button onClick={onBack} className="btn-ghost" style={{padding:"7px 16px",borderRadius:9,fontSize:13}}>← Back</button>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:24,fontWeight:700,color:"var(--navy)",margin:0}}>{isEdit?"Edit":"New"} Listing</h1>
      </div>
      <FormSec title="📌 Basic Info">
        <div style={{gridColumn:"1/-1",marginBottom:13}}><label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>Property Title *</label><input value={form.title} onChange={e=>set("title",e.target.value)} placeholder="e.g. 2BHK Apartment in Bandra West" className="inp" style={{borderColor:errs.title?"#FCA5A5":"var(--border)"}} />{errs.title&&<div style={{fontSize:11,color:"#DC2626",marginTop:3}}>{errs.title}</div>}</div>
        <FI label="Location *" k="location" form={form} set={set} placeholder="Area, City" err={errs.location}/>
        <FS label="Property Type *" k="propertyType" form={form} set={set} opts={["Apartment","Villa","Plot","Commercial"]}/>
        <FS label="Listing Type *" k="listingType" form={form} set={set} opts={["Rent","Sale"]}/>
        <FI label={form.listingType==="Rent"?"Monthly Rent ₹ *":"Sale Price ₹ *"} k="price" form={form} set={set} type="number" err={errs.price}/>
        <FI label="Size (sqft)" k="sizesqft" form={form} set={set} type="number"/>
      </FormSec>
      <FormSec title="🏠 Property Details">
        <FS label="Bedrooms" k="bedrooms" form={form} set={set} opts={["1","2","3","4","5","6"]}/>
        <FS label="Bathrooms" k="bathrooms" form={form} set={set} opts={["1","2","3","4","5"]}/>
        <FS label="Furnishing" k="furnishingStatus" form={form} set={set} opts={["Furnished","Semi-Furnished","Unfurnished"]}/>
        <FS label="Condition" k="condition" form={form} set={set} opts={["New","Under Construction","Resale","Renovation"]}/>
        <FI label="Built Year" k="builtYear" form={form} set={set} type="number" placeholder="e.g. 2018"/>
        <FS label="Parking" k="parkingType" form={form} set={set} opts={["Covered","Open","No Parking"]}/>
        <FS label="Vastu" k="vastuDirection" form={form} set={set} opts={["East","West","North","South","Not Applicable"]}/>
        <FI label="Total Floors" k="totalFloors" form={form} set={set} type="number"/>
        <FI label="Property Floor" k="propertyFloor" form={form} set={set} type="number"/>
        <FI label="Carpet Area (sqft)" k="carpetArea" form={form} set={set} type="number"/>
      </FormSec>
      <FormSec title="🏢 Society & Compliance">
        <FI label="Society Name" k="societyFormed" form={form} set={set}/>
        <FI label="Maintenance ₹/mo" k="maintenance" form={form} set={set} type="number"/>
        <FS label="OC Received" k="ocReceived" form={form} set={set} opts={["Yes","No","Applied"]}/>
        <FS label="RERA Registered" k="reraRegistered" form={form} set={set} opts={["Yes","No","Exempt"]}/>
        {form.reraRegistered==="Yes"&&<FI label="RERA Number" k="reraNumber" form={form} set={set} span/>}
      </FormSec>
      <div className="card-flat" style={{padding:"20px 22px",marginBottom:14}}>
        <h3 style={{margin:"0 0 14px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9}}>📝 Description *</h3>
        <textarea value={form.description||""} onChange={e=>set("description",e.target.value)} placeholder="Describe the property — highlights, neighbourhood, amenities…" className="inp" rows={4} style={{resize:"vertical",borderColor:errs.description?"#FCA5A5":"var(--border)"}}/>
        {errs.description&&<div style={{fontSize:11,color:"#DC2626",marginTop:4}}>{errs.description}</div>}
      </div>
      <div className="card-flat" style={{padding:"20px 22px",marginBottom:14}}>
        <h3 style={{margin:"0 0 14px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9}}>✨ Key Highlights</h3>
        <div style={{display:"flex",gap:8,marginBottom:10}}><input value={hl} onChange={e=>setHl(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(e.preventDefault(),addHl())} placeholder="e.g. Sea View" className="inp"/><button onClick={addHl} className="btn-green" style={{padding:"10px 16px",borderRadius:10,fontSize:13,whiteSpace:"nowrap"}}>+ Add</button></div>
        {(form.highlights||[]).map((h,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 12px",background:"var(--green-light)",borderRadius:8,marginBottom:5,border:"1px solid var(--green-mid)"}}><span style={{fontSize:13,color:"var(--text)"}}>{h}</span><button onClick={()=>rmHl(i)} style={{background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontSize:16}}>×</button></div>)}
      </div>
      <FormSec title="👤 Agent Contact">
        <FI label="Agent Name" k="agentName" form={form} set={set}/>
        <FI label="Phone" k="agentPhone" form={form} set={set} type="tel"/>
        <FI label="Agency Name" k="agencyName" form={form} set={set}/>
        <FI label="Email" k="agentEmail" form={form} set={set} type="email"/>
      </FormSec>
      <div className="card-flat" style={{padding:"20px 22px",marginBottom:14}}>
        <h3 style={{margin:"0 0 14px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>📸 Photos * (min 1, max 10)</span>
          {aiStatus==="analyzing"&&<span style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--primary)",fontWeight:600,textTransform:"none",letterSpacing:0}}><span className="spin"/>Claude picking best cover…</span>}
          {aiStatus==="done"&&<span style={{fontSize:11,color:"#059669",fontWeight:600,textTransform:"none",letterSpacing:0}}>✨ Best cover auto-selected</span>}
        </h3>
        {photoLoading&&<div style={{textAlign:"center",padding:"16px",color:"var(--green)",fontWeight:600,fontSize:13}}>⬆ Uploading photos… please wait</div>}
        {(form.photos||[]).length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:10,marginBottom:12}}>
          {form.photos.map((p,i)=>{
            const meta=photoMeta[i];
            const isCover=coverIdx===i;
            const isScoring=scoringIdx===i;
            return(
              <div key={i} style={{position:"relative",flexShrink:0}}>
                <img src={p} alt="" style={{width:100,height:80,objectFit:"cover",borderRadius:8,border:`2px solid ${isCover?"var(--primary)":"var(--border)"}`,display:"block",transition:"border 0.2s"}}/>
                {isScoring&&<div style={{position:"absolute",inset:0,borderRadius:8,background:"rgba(234,88,12,0.12)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="spin"/></div>}
                {isCover&&<div style={{position:"absolute",top:4,left:4,background:"var(--primary)",color:"#fff",fontSize:8,fontWeight:800,padding:"2px 6px",borderRadius:8}}>⭐ COVER</div>}
                {meta?.score&&!isScoring&&<div style={{position:"absolute",bottom:4,right:4,background:"rgba(0,0,0,0.6)",color:"#fff",fontSize:8,fontWeight:700,padding:"2px 5px",borderRadius:6}}>{meta.score.overall}/10</div>}
                <button onClick={()=>rmPhoto(i)} style={{position:"absolute",top:-6,right:-6,background:"#DC2626",color:"#fff",border:"none",borderRadius:"50%",width:18,height:18,cursor:"pointer",fontSize:10,display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                {!isCover&&meta?.score&&<button onClick={()=>setCoverIdx(i)} style={{width:"100%",marginTop:3,padding:"3px",borderRadius:6,fontSize:9,fontWeight:700,cursor:"pointer",background:"var(--primary-light)",color:"var(--primary)",border:"1px solid var(--primary-mid)",fontFamily:"inherit"}}>Set Cover</button>}
                {isCover&&<div style={{width:"100%",marginTop:3,fontSize:9,fontWeight:700,textAlign:"center",color:"var(--primary)"}}>✓ Cover</div>}
              </div>
            );
          })}
        </div>}
        {aiStatus==="done"&&aiPick!==null&&<div style={{marginBottom:10,padding:"8px 12px",background:"var(--primary-light)",borderRadius:8,border:"1px solid var(--primary-mid)",fontSize:11,color:"var(--muted)"}}>🤖 <strong style={{color:"var(--navy)"}}>AI picked Photo {aiPick+1} as cover</strong>{photoMeta[aiPick]?.score?.reason?` — ${photoMeta[aiPick].score.reason}`:""}</div>}
        <input type="file" ref={fileRef} multiple accept="image/*" onChange={handlePhotos} style={{display:"none"}}/>
        <button onClick={()=>fileRef.current?.click()} disabled={photoLoading||aiStatus==="analyzing"} className="btn-ghost" style={{padding:"10px 20px",borderRadius:10,fontSize:13,borderColor:errs.photos?"#FCA5A5":"var(--border)"}}>📁 {photoLoading?"Uploading…":aiStatus==="analyzing"?"Analysing…":"Choose Photos"}</button>
        {errs.photos&&<div style={{fontSize:11,color:"#DC2626",marginTop:6}}>{errs.photos}</div>}
      </div>
      <div className="card-flat" style={{padding:"16px 22px",marginBottom:24}}>
        <h3 style={{margin:"0 0 12px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1}}>Status</h3>
        <div style={{display:"flex",gap:8}}>{["Active","Rented","Sold"].map(s=><button key={s} onClick={()=>set("status",s)} style={{padding:"8px 18px",borderRadius:9,border:`2px solid ${form.status===s?"var(--green)":"var(--border)"}`,background:form.status===s?"var(--green-light)":"var(--white)",color:form.status===s?"var(--green2)":"var(--muted)",fontWeight:700,fontSize:13,cursor:"pointer"}}>{s}</button>)}</div>
      </div>
      <div style={{display:"flex",gap:12,justifyContent:"flex-end"}}>
        <button onClick={onBack} className="btn-ghost" style={{padding:"12px 24px",borderRadius:10,fontSize:14}}>Cancel</button>
        <button onClick={handleSave} disabled={saving||photoLoading} className="btn-primary" style={{padding:"12px 28px",borderRadius:10,fontSize:14,display:"flex",alignItems:"center",gap:8}}>{saving?<><span className="spin"/>Saving…</>:(isEdit?"Save Changes":"Create Listing")}</button>
      </div>
    </div>
  );
};

/** After email sign-in, link E.164 phone via Supabase Auth so Mobile OTP uses the same user id as profiles. */
const LinkPhoneForOtpSection = ({showToast,onLinked,currentUserId}) => {
  const [authPhone,setAuthPhone]=useState(null);
  const [phone,setPhone]=useState("");
  const [otp,setOtp]=useState("");
  const [linkStep,setLinkStep]=useState("phone");
  const [changeMode,setChangeMode]=useState(false);
  const [loading,setLoading]=useState(false);
  const [cooldown,setCooldown]=useState(0);
  const refreshAuth=async()=>{const {data:{user}}=await supabase.auth.getUser();setAuthPhone(user?.phone??null);};
  useEffect(()=>{refreshAuth();},[]);
  const startCooldown=()=>{setCooldown(45);let left=45;const id=setInterval(()=>{left-=1;setCooldown(left);if(left<=0)clearInterval(id);},1000);};
  const sendLinkOtp=async()=>{
    const e164=toE164Phone(phone);
    if(!e164){showToast("Enter a valid 10-digit mobile number","error");return;}
    setLoading(true);
    try{
      const {error}=await supabase.auth.updateUser({phone:e164});
      if(error) throw error;
      showToast("Verification code sent — check SMS","success");
      setLinkStep("otp");
      startCooldown();
    }catch(err){showToast(err.message||"Could not send code (number may already be on another account)","error");}
    setLoading(false);
  };
  const verifyLinkOtp=async()=>{
    const e164=toE164Phone(phone);
    const token=otp.replace(/\s/g,"");
    if(!e164||!token){showToast("Enter the 6-digit code","error");return;}
    setLoading(true);
    try{
      const {data,error}=await supabase.auth.verifyOtp({phone:e164,token,type:"phone_change"});
      if(error) throw error;
      const uid=data?.user?.id;
      if(!uid||uid!==currentUserId) throw new Error("Verification incomplete — try again");
      const national=e164.replace(/\D/g,"").slice(-10);
      const {error:updErr}=await supabase.from("profiles").update({phone:national}).eq("id",uid);
      if(updErr) throw updErr;
      showToast("Mobile linked — you can use Mobile OTP on the sign-in page","success");
      setPhone("");setOtp("");setLinkStep("phone");setChangeMode(false);
      await refreshAuth();
      onLinked?.();
    }catch(err){showToast(err.message||"Invalid or expired code","error");}
    setLoading(false);
  };
  const showStatusOnly=authPhone&&!changeMode&&linkStep==="phone";
  return (
    <div className="card-flat" style={{padding:22,marginBottom:16,border:"1px solid var(--border)"}}>
      <h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:800,color:"var(--navy)",marginBottom:8}}>📱 Mobile OTP sign-in</h3>
      <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.55,marginBottom:14}}>Link your mobile to <strong>this account</strong> so <strong>Mobile OTP</strong> on the login page opens the same profile as email. Use a 10-digit India number.</p>
      {showStatusOnly?(
        <div>
          <div style={{fontSize:14,fontWeight:700,color:"#059669",marginBottom:10}}>✓ Linked for OTP: {authPhone}</div>
          <button type="button" className="btn-ghost" style={{padding:"9px 16px",borderRadius:9,fontSize:13}} onClick={()=>{setChangeMode(true);setPhone("");setOtp("");setLinkStep("phone");}}>Change number…</button>
        </div>
      ):linkStep==="phone"?(
        <>
          <div style={{marginBottom:12}}><input className="inp" type="tel" placeholder="Mobile (10 digits)" value={phone} onChange={e=>setPhone(e.target.value)} /></div>
          <button type="button" onClick={sendLinkOtp} disabled={loading} className="btn-primary" style={{width:"100%",padding:"12px",borderRadius:10,fontSize:14,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Sending…</>:"Send verification code →"}</button>
          {(authPhone&&changeMode)&&<button type="button" className="btn-ghost" style={{width:"100%",padding:"8px",fontSize:12}} onClick={()=>{setChangeMode(false);setLinkStep("phone");setOtp("");}}>Cancel</button>}
        </>
      ):(
        <>
          <div style={{marginBottom:12}}><input className="inp" inputMode="numeric" autoComplete="one-time-code" placeholder="6-digit code" value={otp} onChange={e=>setOtp(e.target.value)} maxLength={10} onKeyDown={e=>e.key==="Enter"&&verifyLinkOtp()} /></div>
          <button type="button" onClick={verifyLinkOtp} disabled={loading} className="btn-primary" style={{width:"100%",padding:"12px",borderRadius:10,fontSize:14,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>{loading?<><span className="spin"/>Verifying…</>:"Verify & link →"}</button>
          <button type="button" className="btn-ghost" style={{width:"100%",padding:"8px",fontSize:13,marginBottom:6}} onClick={()=>{setLinkStep("phone");setOtp("");}}>← Different number</button>
          {cooldown>0?<p style={{fontSize:12,color:"var(--muted)",textAlign:"center"}}>Resend in {cooldown}s</p>:<button type="button" onClick={sendLinkOtp} disabled={loading} className="btn-outline" style={{width:"100%",padding:"10px",borderRadius:9,fontSize:13}}>Resend code</button>}
        </>
      )}
    </div>
  );
};

const AgentDash = ({currentUser,showToast,onPhoneLinked}) => {
  const isSeller=currentUser.role==="seller";
  const maxListings=isSeller?2:9999;
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [view,setView]=useState("grid");const [editId,setEditId]=useState(null);const [modal,setModal]=useState(null);const [deleteTarget,setDeleteTarget]=useState(null);const [tab,setTab]=useState("listings");const [statusChanging,setStatusChanging]=useState(null);
  const logoRef=useRef();
  const [profile,setProfile]=useState({agencyName:currentUser.agencyName||"",phone:currentUser.phone||"",address:currentUser.agentAddress||"",website:currentUser.agentWebsite||"",logoUrl:currentUser.logoUrl||null});
  const [logoLoading,setLogoLoading]=useState(false);const [profileSaving,setProfileSaving]=useState(false);
  useEffect(()=>{setProfile(p=>({...p,phone:currentUser.phone||p.phone}));},[currentUser.phone]);
  const load=async()=>{
    setLoading(true);
    const {data,error}=await supabase.from("listings").select("*").eq("agent_id",currentUser.id).order("created_at",{ascending:false});
    if(!error) setListings(data||[]);
    setLoading(false);
  };
  useEffect(()=>{load();},[]);
  const quickStatus=async(id,newStatus)=>{
    setStatusChanging(id);
    const {error}=await supabase.from("listings").update({status:newStatus}).eq("id",id);
    if(error){showToast("Update failed","error");}
    else{setListings(ls=>ls.map(l=>l.id===id?{...l,status:newStatus}:l));showToast(`Marked as ${newStatus} ✓`,"success");}
    setStatusChanging(null);
  };
  const delL=async(id)=>{
    const {error}=await supabase.from("listings").delete().eq("id",id);
    if(error){showToast("Delete failed: "+error.message,"error");return;}
    setListings(l=>l.filter(x=>x.id!==id));showToast("Listing deleted","success");setDeleteTarget(null);
  };
  const handleLogoUpload=async(e)=>{
    const file=e.target.files?.[0]; if(!file) return;
    if(file.size>2*1024*1024){showToast("Logo must be under 2MB","error");return;}
    setLogoLoading(true);
    try{const url=await uploadPhoto(file);setProfile(p=>({...p,logoUrl:url}));showToast("Logo uploaded ✓","success");}
    catch(err){showToast("Upload failed: "+err.message,"error");}
    setLogoLoading(false); e.target.value="";
  };
  const saveProfile=async()=>{
    setProfileSaving(true);
    try{
      const {error}=await supabase.from("profiles").update({agency_name:profile.agencyName,phone:profile.phone,logo_url:profile.logoUrl,address:profile.address,website:profile.website}).eq("id",currentUser.id);
      if(error) throw error;
      showToast("Profile saved ✓","success");
    }catch(err){showToast("Save failed: "+err.message,"error");}
    setProfileSaving(false);
  };
  const enrichedUser={...currentUser,...profile};
  if(editId!==undefined&&editId!==null) return <ListingForm currentUser={enrichedUser} listingId={editId} allListings={listings} showToast={showToast} onBack={()=>setEditId(null)} onSaved={()=>{setEditId(null);load();}}/>;
  if(view==="create") return <ListingForm currentUser={enrichedUser} listingId={null} allListings={listings} showToast={showToast} onBack={()=>setView("grid")} onSaved={()=>{setView("grid");load();}}/>;
  const stats=[["Total",listings.length,"📊"],["Active",listings.filter(l=>l.status==="Active").length,"✅"],["Rented",listings.filter(l=>l.status==="Rented").length,"🏠"],["Sold",listings.filter(l=>l.status==="Sold").length,"🏆"]];
  const canAddMore=listings.length<maxListings;
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px"}}>
      {deleteTarget&&<ConfirmModal message={`Delete "${deleteTarget.title}"?`} onConfirm={()=>delL(deleteTarget.id)} onCancel={()=>setDeleteTarget(null)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>{isSeller?"My Properties":"My Listings"}</h1>
          <p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>{isSeller?`Individual seller · ${listings.length}/${maxListings} properties used`:"Manage and market your properties"}</p>
        </div>
        {canAddMore
          ?<button onClick={()=>setView("create")} className="btn-green" style={{padding:"11px 22px",borderRadius:11,fontSize:14}}>+ New Listing</button>
          :<div style={{background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:10,padding:"10px 16px",fontSize:13,color:"#92400E",fontWeight:600}}>⚠️ Limit reached ({maxListings}/{maxListings})</div>
        }
      </div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--gray)",padding:4,borderRadius:12,border:"1px solid var(--border)",width:"fit-content"}}>
        {[["listings","🏠 Listings"],...(!isSeller?[["profile","🏢 Profile"]]:[]),...(isSeller?[["signin","📱 Mobile login"]]:[])].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 20px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t?"var(--white)":"transparent",color:tab===t?"var(--navy)":"var(--muted)",border:tab===t?"1px solid var(--border)":"none"}}>{l}</button>
        ))}
      </div>
      {tab==="listings"&&<>
        <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:24}} className="gr">
          {stats.map(([label,val,icon])=>(
            <div key={label} className="card" style={{padding:"20px 22px"}}>
              <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:800,color:"var(--navy)"}}>{val}</div>
              <div style={{fontSize:13,color:"var(--muted)",marginTop:2}}>{label}</div>
            </div>
          ))}
        </div>
        {loading?<div style={{textAlign:"center",padding:48,color:"var(--muted)"}}>Loading…</div>:listings.length===0
          ?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🏠</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No listings yet</h3><p style={{color:"var(--muted)",marginBottom:20,fontSize:14}}>Create your first listing and start marketing it instantly.</p><button onClick={()=>setView("create")} className="btn-primary" style={{padding:"12px 28px",borderRadius:10,fontSize:14}}>+ Create First Listing</button></div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(310px,1fr))",gap:20}} className="gr">
            {listings.map(raw=>{const l=mapListing(raw);return(
              <div key={l.id} className="card" style={{overflow:"hidden"}}>
                <div style={{height:160,background:"linear-gradient(135deg,var(--primary-light),var(--primary-mid))",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{fontSize:40,opacity:0.35}}>🏠</div>}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.4) 0%,transparent 60%)"}}/>
                  <span className="badge" style={{position:"absolute",top:10,left:10,background:"var(--primary-light)",color:"var(--primary)",border:"1px solid var(--primary-mid)"}}>{l.status}</span>
                  <span className="badge" style={{position:"absolute",top:10,right:10,background:"#fff",color:"var(--navy)",border:"1px solid var(--border)"}}>{l.listingType}</span>
                </div>
                <div style={{padding:"16px 18px"}}>
                  <div style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:800,color:"var(--primary)",marginBottom:2}}>{fmtP(l.price)}</div>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:4}}>{l.title}</h3>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:8}}>📍 {l.location}</div>
                  <div style={{display:"flex",gap:10,fontSize:11,marginBottom:10,padding:"6px 10px",background:"var(--gray)",borderRadius:8}}>
                    <span style={{color:"var(--muted)"}}>👁 {l.viewCount||0}</span>
                    <span style={{color:"#25D366",fontWeight:700}}>📲 {l.waCount||0} WA</span>
                    <span style={{color:"var(--muted)"}}>📄 {l.pdfCount||0} PDF</span>
                  </div>
                  {l.status==="Active"?(
                    <div style={{display:"flex",gap:5,marginBottom:8}}>
                      <button onClick={()=>quickStatus(l.id,"Sold")} disabled={statusChanging===l.id} style={{flex:1,padding:"6px 2px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#F5F3FF",border:"1px solid #DDD6FE",color:"#7C3AED",fontFamily:"inherit"}}>🏆 Sold</button>
                      <button onClick={()=>quickStatus(l.id,"Rented")} disabled={statusChanging===l.id} style={{flex:1,padding:"6px 2px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#FFFBEB",border:"1px solid #FDE68A",color:"#D97706",fontFamily:"inherit"}}>🔑 Rented</button>
                      <button onClick={()=>quickStatus(l.id,"Inactive")} disabled={statusChanging===l.id} style={{flex:1,padding:"6px 2px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"var(--gray)",border:"1px solid var(--border)",color:"var(--muted)",fontFamily:"inherit"}}>⏸</button>
                    </div>
                  ):(
                    <div style={{marginBottom:8}}>
                      <button onClick={()=>quickStatus(l.id,"Active")} disabled={statusChanging===l.id} style={{width:"100%",padding:"6px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"var(--primary-light)",border:"1px solid var(--primary-mid)",color:"var(--primary)",fontFamily:"inherit"}}>▶ Re-activate</button>
                    </div>
                  )}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr 1fr",gap:5}}>
                    <button onClick={()=>setModal(l)} className="btn-ghost" style={{padding:"7px 4px",borderRadius:8,fontSize:11}}>View</button>
                    <button onClick={()=>setEditId(l.id)} className="btn-ghost" style={{padding:"7px 4px",borderRadius:8,fontSize:11}}>Edit</button>
                    <button onClick={()=>showWACard(l)} style={{padding:"7px 4px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><WALogo size={10}/>WA</button>
                    <button onClick={()=>setDeleteTarget(l)} className="btn-danger" style={{padding:"7px 4px",borderRadius:8,fontSize:11}}>Del</button>
                  </div>
                </div>
              </div>
            );})}
          </div>
        }
      </>}
      {tab==="profile"&&!isSeller&&(
        <div style={{maxWidth:620}}>
          <LinkPhoneForOtpSection showToast={showToast} onLinked={onPhoneLinked} currentUserId={currentUser.id} />
          <div className="card" style={{padding:28,marginBottom:16}}>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:800,color:"var(--navy)",marginBottom:20}}>🏢 Agency / Firm Profile</h2>
            <p style={{fontSize:13,color:"var(--muted)",marginBottom:12,background:"var(--primary-light)",padding:"10px 14px",borderRadius:10,border:"1px solid var(--primary-mid)"}}>⭐ Your logo and details will appear as the <strong>header of every PDF brochure</strong> you generate.</p>
            <div style={{background:"var(--gray)",borderRadius:10,padding:"12px 14px",marginBottom:20,border:"1px solid var(--border)",display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
              <div>
                <div style={{fontSize:12,fontWeight:700,color:"var(--navy)",marginBottom:2}}>🔗 Your Public Profile Page</div>
                <div style={{fontSize:11,color:"var(--muted)"}}>{window.location.origin}?agent={currentUser.id}</div>
              </div>
              <button onClick={()=>{navigator.clipboard?.writeText(`${window.location.origin}?agent=${currentUser.id}`);showToast("Link copied! Share it on WhatsApp or Instagram bio ✓","success");}} style={{padding:"8px 16px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:"var(--primary)",color:"#fff",border:"none",fontFamily:"inherit",whiteSpace:"nowrap"}}>📋 Copy Link</button>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>Company Logo</label>
              <div style={{display:"flex",alignItems:"center",gap:16}}>
                <div style={{width:80,height:80,borderRadius:14,border:"2px dashed var(--border)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",background:"var(--gray)",flexShrink:0}}>
                  {profile.logoUrl?<img src={profile.logoUrl} alt="Logo" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{fontSize:28,opacity:0.4}}>🏢</span>}
                </div>
                <div>
                  <input type="file" ref={logoRef} accept="image/*" onChange={handleLogoUpload} style={{display:"none"}}/>
                  <button onClick={()=>logoRef.current?.click()} disabled={logoLoading} className="btn-ghost" style={{padding:"9px 18px",borderRadius:9,fontSize:13,marginBottom:6}}>
                    {logoLoading?"Uploading…":"📁 Upload Logo"}
                  </button>
                  <div style={{fontSize:11,color:"var(--muted)"}}>PNG or JPG · Max 2MB · Square recommended</div>
                </div>
              </div>
            </div>
            {[["Agency / Firm Name","agencyName","e.g. Sharma Realty"],["Phone","phone","10-digit mobile"],["Office Address","address","Full office address"],["Website","website","https://yoursite.com"]].map(([label,key,placeholder])=>(
              <div key={key} style={{marginBottom:14}}>
                <label style={{display:"block",fontSize:11,fontWeight:700,color:"var(--muted)",marginBottom:4,textTransform:"uppercase",letterSpacing:0.5}}>{label}</label>
                <input className="inp" placeholder={placeholder} value={profile[key]||""} onChange={e=>setProfile(p=>({...p,[key]:e.target.value}))}/>
              </div>
            ))}
            <button onClick={saveProfile} disabled={profileSaving} className="btn-primary" style={{padding:"12px 28px",borderRadius:10,fontSize:14,display:"flex",alignItems:"center",gap:8,marginTop:8}}>
              {profileSaving?<><span className="spin"/>Saving…</>:"Save Profile →"}
            </button>
          </div>
          <div className="card" style={{padding:20}}>
            <div style={{fontSize:12,fontWeight:700,color:"var(--muted)",marginBottom:12,textTransform:"uppercase",letterSpacing:0.5}}>PDF Header Preview</div>
            <div style={{background:"var(--gray)",borderRadius:12,padding:16,display:"flex",justifyContent:"space-between",alignItems:"center",border:"1px solid var(--border)"}}>
              <div style={{display:"flex",alignItems:"center",gap:12}}>
                {profile.logoUrl?<img src={profile.logoUrl} alt="" style={{width:52,height:52,objectFit:"contain",borderRadius:8,border:"1px solid var(--border)",background:"#fff"}}/>:<div style={{width:52,height:52,borderRadius:8,background:"var(--primary-light)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,border:"1px solid var(--primary-mid)"}}>🏢</div>}
                <div>
                  <div style={{fontWeight:800,fontSize:16,color:"var(--navy)"}}>{profile.agencyName||"Your Firm Name"}</div>
                  {profile.phone&&<div style={{fontSize:12,color:"var(--muted)"}}>📞 {profile.phone}</div>}
                  {profile.address&&<div style={{fontSize:11,color:"var(--muted)"}}>📍 {profile.address}</div>}
                  {profile.website&&<div style={{fontSize:11,color:"var(--primary)"}}>{profile.website}</div>}
                </div>
              </div>
              <div style={{textAlign:"right",fontSize:10,color:"var(--muted)"}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"var(--muted)"}}>Northing</div>
                <div>Powered by Northing</div>
              </div>
            </div>
          </div>
        </div>
      )}
      {tab==="signin"&&isSeller&&(
        <div style={{maxWidth:620}}>
          <LinkPhoneForOtpSection showToast={showToast} onLinked={onPhoneLinked} currentUserId={currentUser.id} />
        </div>
      )}
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

const UserDash = ({currentUser,showToast,onPhoneLinked}) => {
  const [saved,setSaved]=useState([]);const [loading,setLoading]=useState(true);const [tab,setTab]=useState("saved");const [modal,setModal]=useState(null);
  useEffect(()=>{
    (async()=>{
      const {data,error}=await supabase.from("saved_listings").select("listings(*)").eq("user_id",currentUser.id);
      if(!error) setSaved((data||[]).map(r=>mapListing(r.listings)).filter(Boolean));
      setLoading(false);
    })();
  },[]);
  const unsave=async(id)=>{
    await supabase.from("saved_listings").delete().eq("user_id",currentUser.id).eq("listing_id",id);
    setSaved(s=>s.filter(l=>l.id!==id));
    showToast("Removed from saved","success");
  };
  return (
    <div style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px"}}>
      <div style={{marginBottom:28}}><h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>My Account</h1><p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>Welcome back, {currentUser.name}</p></div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--gray)",padding:4,borderRadius:12,border:"1px solid var(--border)",width:"fit-content"}}>
        {[["saved","❤️ Saved"],["profile","👤 Profile"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 20px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t?"var(--white)":"transparent",color:tab===t?"var(--navy)":"var(--muted)",border:tab===t?"1px solid var(--border)":"none",boxShadow:tab===t?"0 1px 4px rgba(27,58,45,0.08)":"none"}}>{l}</button>)}
      </div>
      {tab==="saved"&&(
        loading?<div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Loading…</div>:saved.length===0?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>💔</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No saved listings</h3><p style={{color:"var(--muted)",fontSize:14}}>Browse properties and tap ❤️ to save them here.</p></div>:(
          <div className="gr gr-listings">
            {saved.map(l=>(
              <div key={l.id} className="card" style={{overflow:"hidden"}}>
                <div style={{height:155,background:"linear-gradient(135deg,#E8F5EE,#C2E8D4)",position:"relative",display:"flex",alignItems:"center",justifyContent:"center"}}>
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{fontSize:36,opacity:0.3}}>🏠</div>}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(27,58,45,0.4) 0%,transparent 60%)"}}/>
                  <div style={{position:"absolute",bottom:10,left:12,fontSize:18,fontWeight:800,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{fmtP(l.price)}</div>
                </div>
                <div style={{padding:"14px 16px"}}>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:3}}>{l.title}</h3>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:12}}>📍 {l.location}</div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6}}>
                    <button onClick={()=>setModal(l)} className="btn-ghost" style={{padding:"7px",borderRadius:8,fontSize:11}}>View</button>
                    <button onClick={()=>showWACard(l)} style={{padding:"7px",borderRadius:8,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><WALogo size={10}/>WA</button>
                    <button onClick={()=>unsave(l.id)} className="btn-danger" style={{padding:"7px",borderRadius:8,fontSize:11}}>Remove</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )
      )}
      {tab==="profile"&&(
        <div style={{maxWidth:520}}>
          <LinkPhoneForOtpSection showToast={showToast} onLinked={onPhoneLinked} currentUserId={currentUser.id} />
          <div className="card" style={{maxWidth:480,padding:28}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:20}}>Profile Info</h2>
          {[["Name",currentUser.name],["Email",currentUser.email],["Phone",currentUser.phone||"—"],["Role",currentUser.role]].map(([k,v])=>(
            <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"11px 0",borderBottom:"1px solid var(--border)",fontSize:14}}>
              <span style={{color:"var(--muted)",fontWeight:600}}>{k}</span>
              <span style={{fontWeight:700,color:"var(--navy)"}}>{v}</span>
            </div>
          ))}
        </div>
        </div>
      )}
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

const MasterDash = ({showToast}) => {
  const [listings,setListings]=useState([]);const [agents,setAgents]=useState([]);const [users,setUsers]=useState([]);const [tab,setTab]=useState("overview");const [search,setSearch]=useState("");const [modal,setModal]=useState(null);const [loading,setLoading]=useState(true);const [deleteTarget,setDeleteTarget]=useState(null);
  useEffect(()=>{
    (async()=>{
      const [lr,ar,ur]=await Promise.all([
        supabase.from("listings").select("*").order("created_at",{ascending:false}),
        supabase.from("profiles").select("*").eq("role","agent"),
        supabase.from("profiles").select("*").eq("role","user"),
      ]);
      setListings(lr.data||[]);setAgents(ar.data||[]);setUsers(ur.data||[]);
      setLoading(false);
    })();
  },[]);
  const delL=async(id)=>{
    await supabase.from("listings").delete().eq("id",id);
    setListings(l=>l.filter(x=>x.id!==id));
    setDeleteTarget(null);showToast("Listing deleted","success");
  };
  const delU=async(id)=>{
    await supabase.from("profiles").update({role:"disabled"}).eq("id",id);
    setAgents(a=>a.filter(x=>x.id!==id));setUsers(u=>u.filter(x=>x.id!==id));
    showToast("User removed","success");
  };
  const filtered=listings.filter(l=>!search||(mapListing(l).title||"").toLowerCase().includes(search.toLowerCase())||(l.location||"").toLowerCase().includes(search.toLowerCase()));
  const tabs=[["overview","📊 Overview"],["analytics","🔥 Analytics"],["listings","🏠 Listings"],["agents","🏢 Agents"],["users","👥 Users"]];
  return (
    <div style={{maxWidth:1200,margin:"0 auto",padding:"32px 20px"}}>
      {deleteTarget&&<ConfirmModal message={`Delete "${deleteTarget.title}"? This cannot be undone.`} onConfirm={()=>delL(deleteTarget.id)} onCancel={()=>setDeleteTarget(null)}/>}
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>Platform Control</h1>
        <p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>Full platform visibility and management</p>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:16,marginBottom:28}} className="gr">
        {[["Total Listings",listings.length,"📋"],["Active",listings.filter(l=>l.status==="Active").length,"✅"],["Agents",agents.length,"🏢"],["Users",users.length,"👥"]].map(([l,v,i])=>(
          <div key={l} className="card" style={{padding:"20px 22px"}}><div style={{fontSize:24,marginBottom:8}}>{i}</div><div style={{fontFamily:"'Fraunces',serif",fontSize:30,fontWeight:800,color:"var(--navy)"}}>{v}</div><div style={{fontSize:13,color:"var(--muted)",marginTop:2}}>{l}</div></div>
        ))}
      </div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--gray)",padding:4,borderRadius:12,border:"1px solid var(--border)",overflowX:"auto"}}>
        {tabs.map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 18px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t?"var(--white)":"transparent",color:tab===t?"var(--navy)":"var(--muted)",border:tab===t?"1px solid var(--border)":"none",whiteSpace:"nowrap"}}>{l}</button>)}
      </div>
      {loading?<div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Loading…</div>:(
        <>
          {tab==="overview"&&(
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}} className="gr">
              <div className="card" style={{padding:24}}><h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:700,color:"var(--navy)",marginBottom:18}}>Top Agents</h3>{agents.sort((a,b)=>listings.filter(l=>l.agent_id===b.id).length-listings.filter(l=>l.agent_id===a.id).length).slice(0,5).map(a=>{const c=listings.filter(l=>l.agent_id===a.id).length;return(<div key={a.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid var(--border)"}}><div><div style={{fontSize:14,fontWeight:700,color:"var(--navy)"}}>{a.name}</div><div style={{fontSize:12,color:"var(--muted)"}}>{a.agency_name||"Independent"}</div></div><span className="badge tag">{c} listings</span></div>);})}</div>
              <div className="card" style={{padding:24}}><h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:700,color:"var(--navy)",marginBottom:18}}>Status Distribution</h3>{[["Active","#059669","#ECFDF5"],["Rented","#D97706","#FFFBEB"],["Sold","#7C3AED","#F5F3FF"]].map(([s,c,bg])=>{const n=listings.filter(l=>l.status===s).length;const p=listings.length?Math.round(n/listings.length*100):0;return(<div key={s} style={{marginBottom:14}}><div style={{display:"flex",justifyContent:"space-between",fontSize:13,marginBottom:5,fontWeight:600}}><span style={{color:"var(--muted)"}}>{s}</span><span style={{color:c}}>{n} ({p}%)</span></div><div style={{height:6,background:"var(--border)",borderRadius:3}}><div style={{height:"100%",width:`${p}%`,background:c,borderRadius:3,transition:"width 0.5s"}}/></div></div>);})}</div>
            </div>
          )}
          {tab==="analytics"&&(
            <div>
              <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:16,marginBottom:24}} className="gr3">
                {[["Views",listings.reduce((s,l)=>s+(l.view_count||0),0)],["WA",listings.reduce((s,l)=>s+(l.wa_count||0),0)],["PDF",listings.reduce((s,l)=>s+(l.pdf_count||0),0)]].map(([label,val])=>(
                  <div key={label} className="card" style={{padding:"20px 22px"}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:32,fontWeight:900,color:"var(--navy)",marginBottom:4}}>{val}</div>
                    <div style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>{label}</div>
                  </div>
                ))}
              </div>
              <div className="card" style={{padding:24,marginTop:16}}>
                <h3 style={{fontFamily:"'Fraunces',serif",fontSize:17,fontWeight:700,color:"var(--navy)",marginBottom:16}}>Hottest Listings</h3>
                {[...listings].sort((a,b)=>(b.view_count+b.wa_count*2+b.pdf_count)-(a.view_count+a.wa_count*2+a.pdf_count)).slice(0,10).map((raw,i)=>{
                  const l=mapListing(raw);
                  return l?(
                    <div key={l.id} style={{display:"flex",alignItems:"center",gap:12,padding:"8px 0",borderBottom:"1px solid var(--border)"}}>
                      <span style={{fontWeight:800,color:"var(--muted)",width:20,textAlign:"center"}}>{i+1}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontSize:13,fontWeight:700,color:"var(--navy)",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{l.title}</div>
                        <div style={{fontSize:11,color:"var(--muted)"}}>{l.agentName}</div>
                      </div>
                      <div style={{fontSize:11,fontWeight:700,display:"flex",gap:8}}>
                        <span style={{color:"#0ea5e9"}}>{"👁️"}{l.viewCount}</span>
                        <span style={{color:"#25D366"}}>{"📲"}{l.waCount}</span>
                        <span style={{color:"var(--primary)"}}>{"📄"}{l.pdfCount}</span>
                      </div>
                    </div>
                  ):null;
                })}
                {listings.length===0&&<p style={{color:"var(--muted)",fontSize:13}}>No data yet.</p>}
              </div>
            </div>
          )}
          {tab==="listings"&&(
            <div>
              <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search listings…" className="inp" style={{maxWidth:340}}/><span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>{filtered.length} results</span></div>
              <div className="card" style={{overflow:"hidden"}}><div style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}><thead><tr style={{background:"var(--navy)"}}>{["Title","Location","Agent","Type","Price","Status","Actions"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{filtered.map((raw,i)=>{const l=mapListing(raw);return(<tr key={l.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{l.title}</td><td style={{padding:"11px 14px",fontSize:12,color:"var(--muted)"}}>{l.location}</td><td style={{padding:"11px 14px",fontSize:12,color:"var(--muted)"}}>{l.agentName}</td><td style={{padding:"11px 14px"}}><span className="badge" style={{background:l.listingType==="Rent"?"#FFFBEB":"#ECFDF5",color:l.listingType==="Rent"?"#B45309":"#059669",border:"1px solid rgba(0,0,0,0.06)"}}>{l.listingType}</span></td><td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"var(--green2)",fontFamily:"'Fraunces',serif"}}>{fmtP(l.price)}</td><td style={{padding:"11px 14px"}}><span className="badge tag">{l.status}</span></td><td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:5}}><button onClick={()=>setModal(l)} className="btn-ghost" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>View</button><button onClick={()=>showWACard(l)} style={{padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:3}}><WALogo size={10}/>WA</button><button onClick={()=>showPDF(l)} className="btn-ghost" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>📄</button><button onClick={()=>setDeleteTarget(l)} className="btn-danger" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>Del</button></div></td></tr>);})} </tbody></table></div>{filtered.length===0&&<div style={{textAlign:"center",padding:"36px",color:"var(--muted)"}}>No listings found</div>}</div>
            </div>
          )}
          {tab==="agents"&&(<div className="card" style={{overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:"var(--navy)"}}>{["Name","Email","Agency","Listings","Action"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{agents.map((a,i)=><tr key={a.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{a.name}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{a.email}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{a.agency_name||"—"}</td><td style={{padding:"12px 14px"}}><span className="badge tag">{listings.filter(l=>l.agent_id===a.id).length} listings</span></td><td style={{padding:"12px 14px"}}><button onClick={()=>delU(a.id)} className="btn-danger" style={{padding:"5px 12px",borderRadius:7,fontSize:11}}>Remove</button></td></tr>)}</tbody></table>{agents.length===0&&<div style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No agents yet</div>}</div>)}
          {tab==="users"&&(<div className="card" style={{overflow:"hidden"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:"var(--navy)"}}>{["Name","Email","Phone","Role","Action"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{users.map((u,i)=><tr key={u.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{u.name}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{u.email}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{u.phone||"—"}</td><td style={{padding:"12px 14px"}}><span className="badge tag-navy">{u.role}</span></td><td style={{padding:"12px 14px"}}><button onClick={()=>delU(u.id)} className="btn-danger" style={{padding:"5px 12px",borderRadius:7,fontSize:11}}>Remove</button></td></tr>)}</tbody></table>{users.length===0&&<div style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No users yet</div>}</div>)}
        </>
      )}
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

const Feed = ({currentUser,showToast,onNavigate}) => {
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [savedIds,setSavedIds]=useState(currentUser?.savedListings||[]);const [filters,setFilters]=useState({search:"",propertyType:"",listingType:"",city:"",minPrice:"",maxPrice:"",bedrooms:"",furnishing:""});const [sort,setSort]=useState("newest");const [modal,setModal]=useState(null);const [open,setOpen]=useState(false);
  const requireAuth=(fn)=>(...args)=>{if(!currentUser){showToast("Please sign in to access this feature","error");onNavigate&&onNavigate("login");return;}fn(...args);};
  useEffect(()=>{
    (async()=>{
      const {data}=await supabase.from("listings").select("*").eq("status","Active").order("created_at",{ascending:false});
      setListings((data||[]).map(mapListing));setLoading(false);
    })();
  },[]);
  const setF=(k,v)=>setFilters(f=>({...f,[k]:v}));
  const clear=()=>setFilters({search:"",propertyType:"",listingType:"",city:"",minPrice:"",maxPrice:"",bedrooms:"",furnishing:""});
  const af=Object.values(filters).filter(v=>v).length;
  const cities=[...new Set(listings.map(l=>l.location?.split(",")[1]?.trim()).filter(Boolean))];
  const filtered=listings.filter(l=>{const f=filters;if(f.search&&!l.title?.toLowerCase().includes(f.search.toLowerCase())&&!l.location?.toLowerCase().includes(f.search.toLowerCase())) return false;if(f.propertyType&&l.propertyType!==f.propertyType) return false;if(f.listingType&&l.listingType!==f.listingType) return false;if(f.city&&!l.location?.includes(f.city)) return false;if(f.minPrice&&l.price<Number(f.minPrice)) return false;if(f.maxPrice&&l.price>Number(f.maxPrice)) return false;if(f.bedrooms&&Number(l.bedrooms)<Number(f.bedrooms)) return false;if(f.furnishing&&l.furnishingStatus!==f.furnishing) return false;return true;}).sort((a,b)=>sort==="price_asc"?a.price-b.price:sort==="price_desc"?b.price-a.price:new Date(b.createdAt)-new Date(a.createdAt));
  const handleSave=async(id)=>{
    if(!currentUser){showToast("Sign in to save listings","error");return;}
    if(currentUser.role!=="user"){showToast("Only seekers can save listings","error");return;}
    const isSaved=savedIds.includes(id);
    if(isSaved){await supabase.from("saved_listings").delete().eq("user_id",currentUser.id).eq("listing_id",id);setSavedIds(s=>s.filter(x=>x!==id));showToast("Removed from saved","success");}
    else{await supabase.from("saved_listings").insert({user_id:currentUser.id,listing_id:id});setSavedIds(s=>[...s,id]);showToast("Saved! ❤️","success");}
  };
  return (
    <div className="feed-page" style={{minHeight:"100vh",background:"var(--cream)"}}>
      <div className="feed-page-hero" style={{background:"var(--navy)",padding:"80px 24px 110px",position:"relative",overflow:"hidden"}}>
        <div style={{position:"absolute",top:-100,right:-100,width:400,height:400,borderRadius:"50%",background:"rgba(61,170,126,0.1)"}} className="af"/>
        <div className="feed-page-hero-inner" style={{maxWidth:700,margin:"0 auto",position:"relative",textAlign:"center"}}>
          <span style={{fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:2,display:"block",marginBottom:12}}>India's Property Marketing Platform</span>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:48,fontWeight:800,color:"#fff",marginBottom:16,lineHeight:1.1}} className="h1big">Find Your <span style={{color:"var(--green)"}}>Dream</span> Property</h1>
          <p style={{fontSize:16,color:"rgba(255,255,255,0.6)",marginBottom:32}}>Browse verified listings from professional agents across India.</p>
          <div className="feed-search-tape" style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.12)",borderRadius:16,padding:8,display:"flex",gap:8,maxWidth:620,margin:"0 auto",backdropFilter:"blur(12px)",flexWrap:"wrap"}}>
            <select value={filters.listingType} onChange={e=>setF("listingType",e.target.value)} style={{background:"rgba(255,255,255,0.12)",border:"1px solid rgba(255,255,255,0.2)",color:"#fff",borderRadius:10,padding:"8px 12px",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minWidth:90}}>
              <option value="" style={{background:"#1a1410",color:"#fff"}}>All</option>
              <option value="Rent" style={{background:"#1a1410",color:"#fff"}}>Rent</option>
              <option value="Sale" style={{background:"#1a1410",color:"#fff"}}>Buy</option>
            </select>
            <input value={filters.search} onChange={e=>setF("search",e.target.value)} placeholder="Search by location or title…" className="inp feed-search-input" style={{flex:1,minWidth:160,background:"rgba(255,255,255,0.08)",border:"1px solid rgba(255,255,255,0.15)",color:"#fff"}}/>
            <div style={{display:"flex",gap:6}} className="hm">
              {["Apartment","Villa","Commercial"].map(t=><button key={t} onClick={()=>setF("propertyType",filters.propertyType===t?"":t)} style={{padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:filters.propertyType===t?"var(--green)":"rgba(255,255,255,0.08)",color:"#fff",border:`1px solid ${filters.propertyType===t?"var(--green)":"rgba(255,255,255,0.15)"}`,transition:"all 0.2s"}}>{t}</button>)}
            </div>
          </div>
        </div>
      </div>
      <div className="feed-page-inner" style={{maxWidth:1180,margin:"-50px auto 0",padding:"0 20px 60px",position:"relative"}}>
        <div className="card feed-toolbar-card" style={{padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div className="feed-toolbar-row" style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",flex:1}}>
            <button onClick={()=>setOpen(o=>!o)} style={{padding:"8px 16px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",background:open?"var(--navy)":"var(--gray)",color:open?"#fff":"var(--text)",border:`1px solid ${open?"var(--navy)":"var(--border)"}`,transition:"all 0.2s"}}>
              🔍 Filters {af>0&&<span style={{background:open?"rgba(255,255,255,0.2)":"var(--green-light)",color:open?"#fff":"var(--green)",borderRadius:10,padding:"1px 7px",fontSize:11,marginLeft:4}}>{af}</span>}
            </button>
            {af>0&&<button onClick={clear} style={{fontSize:12,color:"var(--muted)",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Clear all</button>}
            <span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>{loading?"Loading…":`${filtered.length} ${filtered.length===1?"property":"properties"} found`}</span>
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="inp feed-sort-select" style={{width:"auto",fontSize:13}}>
            <option value="newest">Newest First</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        {open&&(
          <div className="card gr" style={{padding:"20px 24px",marginBottom:20,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px 20px"}}>
            <FS label="City" k="city" form={filters} set={setF} opts={cities}/>
            <FS label="Property Type" k="propertyType" form={filters} set={setF} opts={["Apartment","Villa","Plot","Commercial"]}/>
            <FS label="Listing Type" k="listingType" form={filters} set={setF} opts={["Rent","Sale"]}/>
            <FS label="Min Beds" k="bedrooms" form={filters} set={setF} opts={["1","2","3","4","5"]}/>
            <FS label="Min Price ₹" k="minPrice" form={filters} set={setF} opts={["500000","1000000","2000000","3000000","5000000","7500000","10000000","20000000","50000000"]} fmtLabel={(v)=>fmtP(v)}/>
            <FS label="Max Price ₹" k="maxPrice" form={filters} set={setF} opts={["1000000","2000000","3000000","5000000","7500000","10000000","20000000","50000000","100000000"]} fmtLabel={(v)=>fmtP(v)}/>
            <FS label="Furnishing" k="furnishing" form={filters} set={setF} opts={["Furnished","Semi-Furnished","Unfurnished"]}/>
          </div>
        )}
        {loading?<div style={{textAlign:"center",padding:80,color:"var(--muted)"}}>Loading listings…</div>:filtered.length===0?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🔍</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No properties found</h3><p style={{color:"var(--muted)",fontSize:14,marginBottom:16}}>Try adjusting your filters.</p><button onClick={clear} className="btn-outline" style={{padding:"10px 24px",borderRadius:10,fontSize:13}}>Clear Filters</button></div>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:24}} className="gr">
            {filtered.map(l=><PropCard key={l.id} listing={l} currentUser={currentUser} savedIds={savedIds} onSave={handleSave} onView={setModal}/>)}
          </div>
        )}
      </div>
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

/** Homepage-only: first page of PDF brochure (matches in-app PDF styling). */
const HomePdfSamplePrint = () => {
  const listing = HOME_SAMPLE_BROCHURE;
  const td = new Date().toLocaleDateString("en-IN",{day:"numeric",month:"long",year:"numeric"});
  const ref = `PHQ-${String(listing.id||"").slice(-6).toUpperCase()||"000000"}`;
  const fields = [["Type",listing.propertyType],["Listing",listing.listingType],["Size",listing.sizesqft?`${listing.sizesqft} sqft`:null],["Beds",listing.bedrooms||null],["Baths",listing.bathrooms||null],["Furnishing",listing.furnishingStatus]].filter(([,v])=>v);
  const hasAgentBrand = listing.agencyName||listing.agentName;
  return (
    <div id="home-pdf-sample-print" style={{padding:"36px 44px",fontFamily:"'Inter',sans-serif",color:"#1a1410",background:"#fff",boxSizing:"border-box"}}>
      {hasAgentBrand?(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:28,paddingBottom:20,borderBottom:"3px solid var(--primary)"}}>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <div style={{width:64,height:64,borderRadius:10,border:"1px solid #eee",background:"#fafafa",flexShrink:0}} aria-hidden />
            <div>
              <div style={{fontWeight:900,fontSize:22,color:"var(--navy)",letterSpacing:"-0.5px"}}>{listing.agencyName||listing.agentName}</div>
              {listing.agentPhone&&<div style={{fontSize:13,color:"#666",marginTop:2}}>📞 {listing.agentPhone}</div>}
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontSize:11,color:"#aaa"}}>{td}</div>
            <div style={{fontSize:11,color:"#aaa",marginTop:2}}>Ref: {ref}</div>
          </div>
        </div>
      ):(
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:28,paddingBottom:20,borderBottom:"3px solid var(--primary)"}}>
          <div>
            <img src={DEFAULT_NORTHING_LOGO_SRC} alt="Northing" style={{height:36,width:"auto",maxWidth:220,objectFit:"contain",display:"block"}}/>
            <div style={{fontSize:10,color:"#888",letterSpacing:"1.5px",marginTop:6,textTransform:"uppercase"}}>Professional Property Marketing</div>
          </div>
          <div style={{textAlign:"right",fontSize:12,color:"#888"}}><div>{td}</div><div style={{marginTop:3}}>{ref}</div></div>
        </div>
      )}
      <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,margin:"0 0 4px",color:"var(--navy)",lineHeight:1.15}}>{listing.title}</h1>
      <div style={{color:"#888",fontSize:14,marginBottom:12}}>📍 {listing.location}</div>
      <div style={{display:"flex",alignItems:"baseline",gap:12,marginBottom:6,flexWrap:"wrap"}}>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:900,color:"var(--primary)"}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:15,fontWeight:400,color:"#888"}}>/month</span>}</div>
        <div style={{display:"inline-block",background:"var(--primary-light)",color:"var(--primary)",border:"1px solid var(--primary-mid)",borderRadius:20,padding:"3px 14px",fontSize:12,fontWeight:700}}>For {listing.listingType}</div>
      </div>
      {listing.description&&<div style={{background:"#fafafa",padding:16,borderRadius:10,fontSize:13,lineHeight:1.8,marginBottom:20,marginTop:14,border:"1px solid #eee",color:"#444"}}>{listing.description}</div>}
      {fields.length>0&&<div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:12}}>Property Details</div>
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 40px"}}>
          {fields.map(([k,v])=><div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:"1px solid #f4f4f4",fontSize:13}}><span style={{color:"#888"}}>{k}</span><span style={{fontWeight:700,color:"var(--navy)"}}>{v}</span></div>)}
        </div>
      </div>}
      {listing.highlights?.length>0&&<div style={{marginBottom:20}}>
        <div style={{fontSize:11,fontWeight:700,color:"var(--primary)",textTransform:"uppercase",letterSpacing:"1px",borderBottom:"1.5px solid var(--primary-mid)",paddingBottom:7,marginBottom:12}}>Key Highlights</div>
        {listing.highlights.map((h,i)=><div key={i} style={{display:"flex",gap:8,marginBottom:7,fontSize:13,alignItems:"flex-start"}}><span style={{color:"var(--primary)",fontWeight:700,flexShrink:0}}>✓</span>{h}</div>)}
      </div>}
      <div style={{fontSize:11,color:"#aaa",marginBottom:16,lineHeight:1.5}}>Full Northing PDFs add high-resolution photos, a location map, and extended specifications—this sample is page 1 only.</div>
      <div style={{borderTop:"2px solid #f0f0f0",paddingTop:16,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
        <div>
          <div style={{fontWeight:700,fontSize:14,color:"var(--navy)"}}>{listing.agentName||""}</div>
          {listing.agentPhone&&<div style={{fontSize:12,color:"#888"}}>📞 {listing.agentPhone}</div>}
        </div>
        <div style={{textAlign:"right"}}>
          <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"#ccc"}}>Northing</div>
          <div style={{fontSize:10,color:"#ccc"}}>Powered by Northing</div>
        </div>
      </div>
    </div>
  );
};

const Home = ({currentUser,onNavigate}) => {
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState({type:"",listing:"",location:"",minPrice:"",maxPrice:"",bedrooms:"",bathrooms:""});
  const priceMode=!filter.listing?"":filter.listing==="Rent"?"rent":"sale";
  const minPriceOpts=priceMode==="rent"?["5000","10000","15000","20000","25000","30000","40000","50000","75000","100000","150000","200000"]:["500000","1000000","2000000","3000000","5000000","7500000","10000000","20000000","50000000"];
  const maxPriceOpts=priceMode==="rent"?["15000","20000","25000","30000","40000","50000","75000","100000","150000","200000","300000","500000","750000","1000000"]:["1000000","2000000","3000000","5000000","7500000","10000000","20000000","50000000","100000000"];
  const fmtPriceOpt=(v)=>priceMode==="rent"?`${fmtP(v)} /mo`:fmtP(v);
  const [waListing,setWAListing]=useState(null);const [pdfListing,setPdfListing]=useState(null);const [modal,setModal]=useState(null);const [homeAssetDl,setHomeAssetDl]=useState(null);
  const [homeSamplesExpanded,setHomeSamplesExpanded]=useState(false);
  useEffect(()=>{
    (async()=>{
      const {data}=await supabase.from("listings").select("*").eq("status","Active").order("created_at",{ascending:false}).limit(24);
      setListings((data||[]).map(mapListing).filter(Boolean));
      setLoading(false);
    })();
  },[]);
  const filtered=listings.filter(l=>{
    if(filter.type&&l.propertyType!==filter.type) return false;
    if(filter.listing&&l.listingType!==filter.listing) return false;
    if(filter.location&&!l.location?.toLowerCase().includes(filter.location.toLowerCase())) return false;
    if(filter.listing&&(filter.minPrice||filter.maxPrice)){if(filter.minPrice&&Number(l.price)<Number(filter.minPrice)) return false;if(filter.maxPrice&&Number(l.price)>Number(filter.maxPrice)) return false;}
    if(filter.bedrooms){const need=filter.bedrooms==="5+"?5:Number(filter.bedrooms);const have=Number(l.bedrooms)||0;if(filter.bedrooms==="5+"){if(have<5)return false;}else if(have<need)return false;}
    if(filter.bathrooms&&Number(l.bathrooms||0)<Number(filter.bathrooms)) return false;
    return true;
  });
  const runHomeWaDownload=async(kind)=>{
    setHomeAssetDl(kind);
    try{
      await downloadHtmlElementAsPngById(
        kind==="sale"?"home-wa-card-sale":"home-wa-card-rent",
        kind==="sale"?"northing-sample-mumbai-sale-card.png":"northing-sample-mumbai-rent-card.png"
      );
    }catch(e){console.error(e); alert("Download failed — try again.");}
    finally{setHomeAssetDl(null);}
  };
  const runHomePdfDownload=async()=>{
    setHomeAssetDl("pdf");
    try{
      await exportElementToPdfById("home-pdf-sample-print","northing-sample-mumbai-brochure");
    }catch(e){console.error(e); alert("PDF export failed — try again.");}
    finally{setHomeAssetDl(null);}
  };
  const heroTabActive = filter.type === "Commercial" ? "commercial" : filter.listing === "Rent" ? "rent" : "buy";
  const setHeroTab = (tab) => {
    if (tab === "commercial") setFilter((f) => ({ ...f, type: "Commercial" }));
    else if (tab === "rent") setFilter((f) => ({ ...f, listing: "Rent", type: "" }));
    else setFilter((f) => ({ ...f, listing: "Sale", type: "" }));
  };
  const heroSectionRef = useRef(null);
  const heroParallaxImgRef = useRef(null);
  const heroParallaxInnerRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) return () => {};
    let raf = 0;
    const tick = () => {
      const sec = heroSectionRef.current;
      const img = heroParallaxImgRef.current;
      const inner = heroParallaxInnerRef.current;
      if (!sec || !img) return;
      const rect = sec.getBoundingClientRect();
      const y = -rect.top;
      const bgShift = y * 0.2;
      img.style.transform = `translate3d(0, ${bgShift}px, 0)`;
      if (inner) inner.style.transform = `translate3d(0, ${y * -0.045}px, 0)`;
    };
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    tick();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);
  const testimonials=[
    {name:"Ravi Sharma",agency:"Sharma Realty, Mumbai",text:"Generated my first brochure in 2 minutes. Clients were blown away!"},
    {name:"Priya Nair",agency:"NRI Homes, Pune",text:"WhatsApp cards get shared instantly. More enquiries same day."},
    {name:"Deepika Joshi",agency:"REO Properties",text:"RERA fields, Vastu, BHK — everything an Indian agent needs."},
  ];
  return (
    <div style={{background:"#ffffff",width:"100%",maxWidth:"100%",boxSizing:"border-box"}} className="home-page-shell">
      <section ref={heroSectionRef} className="h1big-hero home-hero-section" style={{position:"relative",width:"100%",maxWidth:"100%",overflow:"hidden"}}>
        {/* Hero bg */}
        <div className="home-hero-parallax-bg" aria-hidden="true">
        <img src="data:image/jpeg;base64,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" ref={heroParallaxImgRef} alt="Indian cityscape" />
        </div>
        {/* Content — split layout */}
        <div ref={heroParallaxInnerRef} className="home-hero-inner home-hero-parallax-inner">
          {/* Left side — text */}
          <div className="home-hero-text">
            <h1 className="h1big home-heading home-hero-headline">
              <span className="home-hero-headline-line">Northing to your</span>
              <span className="home-hero-headline-line">dream home</span>
            </h1>
            <div className="home-hero-actions">
              <button type="button" onClick={()=>onNavigate("feed")} className="btn-primary home-hero-cta">🏠 Browse Properties</button>
              <button type="button" onClick={()=>onNavigate(currentUser?"dashboard":"login")} className="btn-outline home-hero-cta">📋 List Your Property</button>
            </div>
          </div>
          {/* Right side — search card + listing-type tabs (NoBroker-style) */}
          <div className="home-hero-search-wrap">
          <div className="home-hero-tabs" role="tablist" aria-label="Listing type">
            {[{id:"buy",label:"Buy"},{id:"rent",label:"Rent"},{id:"commercial",label:"Commercial"}].map(({id,label})=>(
              <button key={id} type="button" role="tab" aria-selected={heroTabActive===id} className={"home-hero-tab"+(heroTabActive===id?" home-hero-tab-active":"")} onClick={()=>setHeroTab(id)}>{label}</button>
            ))}
          </div>
          <div className="home-hero-search">
            <div className="home-qs-inner">
              <div className="home-qs-head">
                <span className="home-qs-icon" aria-hidden>🔍</span>
                <h3 className="home-qs-title">Quick Search</h3>
              </div>
              <div className="home-qs-stack">
                <div>
                  <label className="home-qs-label home-qs-label-em" htmlFor="home-qs-type">Property type</label>
                  <select id="home-qs-type" className="inp home-qs-inp" value={filter.type} onChange={e=>setFilter(f=>({...f,type:e.target.value}))}>
                    <option value="">Any</option>
                    {["Apartment","Villa","Plot","Commercial"].map(t=><option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="home-qs-label home-qs-label-em" htmlFor="home-qs-listing">Buy or rent</label>
                  <select id="home-qs-listing" className="inp home-qs-inp" value={filter.listing} onChange={e=>setFilter(f=>({...f,listing:e.target.value,minPrice:"",maxPrice:""}))}>
                    <option value="">Any</option>
                    <option value="Sale">Buy (Sale)</option>
                    <option value="Rent">Rent</option>
                  </select>
                  {filter.listing===""&&<p className="home-qs-hint">Choose Buy or Rent to set min/max price (sale total vs monthly rent).</p>}
                </div>
                <div className="home-qs-grid2">
                  <div>
                    <label className="home-qs-label" htmlFor="home-qs-minp">Min price</label>
                    <select id="home-qs-minp" className="inp home-qs-inp" disabled={!filter.listing} value={filter.minPrice} onChange={e=>setFilter(f=>({...f,minPrice:e.target.value}))}>
                      <option value="">Any</option>
                      {minPriceOpts.map(o=><option key={o} value={o}>{fmtPriceOpt(o)}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="home-qs-label" htmlFor="home-qs-maxp">Max price</label>
                    <select id="home-qs-maxp" className="inp home-qs-inp" disabled={!filter.listing} value={filter.maxPrice} onChange={e=>setFilter(f=>({...f,maxPrice:e.target.value}))}>
                      <option value="">Any</option>
                      {maxPriceOpts.map(o=><option key={o} value={o}>{fmtPriceOpt(o)}</option>)}
                    </select>
                  </div>
                </div>
                <div className="home-qs-grid2">
                  <div>
                    <label className="home-qs-label" htmlFor="home-qs-beds">Bedrooms</label>
                    <select id="home-qs-beds" className="inp home-qs-inp" value={filter.bedrooms} onChange={e=>setFilter(f=>({...f,bedrooms:e.target.value}))}>
                      <option value="">Any</option>
                      {["1","2","3","4","5+"].map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="home-qs-label" htmlFor="home-qs-baths">Bathrooms</label>
                    <select id="home-qs-baths" className="inp home-qs-inp" value={filter.bathrooms} onChange={e=>setFilter(f=>({...f,bathrooms:e.target.value}))}>
                      <option value="">Any</option>
                      {["1","2","3","4"].map(b=><option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="home-qs-label home-qs-label-em" htmlFor="home-qs-loc">Location</label>
                  <input id="home-qs-loc" className="inp home-qs-inp" placeholder="Location" value={filter.location} onChange={e=>setFilter(f=>({...f,location:e.target.value}))}/>
                </div>
                <button type="button" onClick={()=>document.getElementById("prop-grid")?.scrollIntoView({behavior:"smooth"})} className="btn-primary home-qs-submit" style={{border:"none"}}>Search Properties</button>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>
      <section id="prop-grid" className="home-prop-section">
        <div className="home-featured-toolbar">
          <div>
            <div className="home-heading home-featured-title">Featured Properties</div>
            <div className="home-featured-sub">
              {loading?"Loading…":`Discover our handpicked selection of premium properties`}
            </div>
          </div>
          <div className="home-featured-actions">
            {(filter.type||filter.listing||filter.location||filter.minPrice||filter.maxPrice||filter.bedrooms||filter.bathrooms)&&<button type="button" onClick={()=>setFilter({type:"",listing:"",location:"",minPrice:"",maxPrice:"",bedrooms:"",bathrooms:""})} className="home-ui-clear-filters">✕ Clear Filters</button>}
            <button type="button" onClick={()=>onNavigate("feed")} className="btn-primary">View All Properties</button>
          </div>
        </div>
        {loading?(
          <div className="gr gr-listings">
            {[1,2,3,4,5,6].map(i=><div key={i} style={{height:280,borderRadius:18,background:"linear-gradient(90deg,#eef2f6 22%,#f8fafc 50%,#eef2f6 78%)",backgroundSize:"200% 100%",animation:"shimmer 1.5s infinite",border:"1px solid rgba(226,232,240,0.48)",boxShadow:"0 1px 2px rgba(15,23,42,0.03)"}}/>)}
          </div>
        ):filtered.length===0?(
          <div className="card home-empty-state-card">
            <div className="home-empty-icon" aria-hidden>🏘️</div>
            <h3>No properties found</h3>
            <p>Try clearing your filters or check back soon.</p>
          </div>
        ):(
          <div className="gr gr-listings">
            {filtered.map(l=>(
              <div key={l.id} className="card glass-card home-listing-card" style={{overflow:"hidden"}} onClick={()=>setModal(l)}>
                <div className="home-listing-media">
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div className="home-listing-photo-ph">🏠</div>}
                  <span className="home-listing-status" style={{background:l.status==="Active"?"#ECFDF5":l.status==="Rented"?"#FFFBEB":"#F5F3FF",color:l.status==="Active"?"#059669":l.status==="Rented"?"#D97706":"#7C3AED",border:`1px solid ${l.status==="Active"?"#A7F3D0":l.status==="Rented"?"#FDE68A":"#DDD6FE"}`}}>{l.status||"Available"}</span>
                </div>
                <div className="home-listing-body">
                  <h3 className="home-listing-title">{l.title}</h3>
                  <div className="home-listing-loc">📍 {l.location}</div>
                  <div className="home-listing-price">{fmtP(l.price)}{l.listingType==="Rent"&&<span className="home-listing-unit">/mo</span>}</div>
                  <div className="home-listing-meta">
                    <div className="home-listing-specs">
                      {l.bedrooms>0&&<span>🛏 {l.bedrooms}</span>}
                      {l.bathrooms>0&&<span>🚿 {l.bathrooms}</span>}
                      {l.sizesqft&&<span>📐 {l.sizesqft} sq ft</span>}
                    </div>
                    <span className="home-listing-badge">{l.propertyType||"Property"}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
      <section id="home-sample-outputs" className="home-sample-outputs" aria-labelledby="home-sample-outputs-heading">
        <div className="home-sample-outputs-inner">
          <header className="home-sample-outputs-head">
            <button type="button" className="home-sample-outputs-head-toggle" aria-expanded={homeSamplesExpanded} aria-controls="home-sample-outputs-panel" onClick={()=>setHomeSamplesExpanded(v=>!v)}>
              <span className="section-label">Sample outputs</span>
              <h2 id="home-sample-outputs-heading" className="home-heading" style={{margin:0}}>See What Northing Creates</h2>
              <span className="home-sample-outputs-chevron">{homeSamplesExpanded?"Show less ▲":"Tap to expand ▼"}</span>
            </button>
          </header>
          <div className="home-sample-outputs-clip">
          <div id="home-sample-outputs-panel" className={"home-sample-outputs-body "+(homeSamplesExpanded?"home-sample-outputs-body--expanded":"home-sample-outputs-body--collapsed")}>
          <div className="home-sample-block home-sample-block--wa" aria-labelledby="home-wa-sample-heading">
        <div className="home-wa-sample-inner">
          <div className="home-sample-intro">
            <span className="section-label">WhatsApp-ready</span>
            <h3 id="home-wa-sample-heading" className="home-heading">Listings that look sharp in chat</h3>
            <p style={{fontSize:14,color:"var(--text-readable)",lineHeight:1.65,margin:0}}>
              Northing generates a branded square card for every listing—the same layout agents download and share. Below are illustrative Mumbai samples for sale and rent.
            </p>
          </div>
          <div className="home-wa-sample-pair">
            <div className="home-wa-sample-col">
            <span className="home-wa-sample-kind" style={{fontSize:11,fontWeight:700,color:"var(--navy)",letterSpacing:"0.06em",textTransform:"uppercase"}}>Sale</span>
            <div className="home-wa-sample-frame">
              <div className="home-wa-sample-scale-wrap">
                <div id="home-wa-card-sale" className="home-wa-card-mock">
                  <img
                    src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1600&q=90&auto=format&fit=crop"
                    alt=""
                    crossOrigin="anonymous"
                    loading="lazy"
                    decoding="async"
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}
                  />
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.05) 35%,rgba(10,5,2,0.92) 68%,rgba(10,5,2,1) 100%)"}}/>
                  <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"nowrap",gap:8,minWidth:0}}>
                    <span style={{background:"var(--primary)",color:"#fff",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:20,letterSpacing:"0.5px",flexShrink:0,whiteSpace:"nowrap"}}>FOR SALE</span>
                    <WaSampleCardLogoChip />
                  </div>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 18px 16px"}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:8,letterSpacing:"-1px"}}>{fmtP(48500000)}</div>
                    <div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:3,lineHeight:1.35,letterSpacing:"0.015em"}}>3 BHK Sea-facing · Bandra West</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:10}}>📍 Pali Hill, Bandra West, Mumbai</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                      {["🛏 3 Beds","🚿 2 Baths","📐 1,250 sqft","🛋 Semi-Furnished"].map((d,i)=><span key={i} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,color:"#fff"}}>{d}</span>)}
                    </div>
                    <div style={{height:1,background:"rgba(255,255,255,0.12)",marginBottom:12}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Aditi Mehta</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>Harbourline Realty · +91 98201 44720</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
            <div className="home-wa-sample-col">
            <span className="home-wa-sample-kind" style={{fontSize:11,fontWeight:700,color:"var(--navy)",letterSpacing:"0.06em",textTransform:"uppercase"}}>Rent</span>
            <div className="home-wa-sample-frame">
              <div className="home-wa-sample-scale-wrap">
                <div id="home-wa-card-rent" className="home-wa-card-mock">
                  <img
                    src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600&q=90&auto=format&fit=crop"
                    alt=""
                    crossOrigin="anonymous"
                    loading="lazy"
                    decoding="async"
                    style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}
                  />
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.05) 35%,rgba(10,5,2,0.92) 68%,rgba(10,5,2,1) 100%)"}}/>
                  <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"nowrap",gap:8,minWidth:0}}>
                    <span style={{background:"var(--primary)",color:"#fff",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:20,letterSpacing:"0.5px",flexShrink:0,whiteSpace:"nowrap"}}>FOR RENT</span>
                    <WaSampleCardLogoChip />
                  </div>
                  <div style={{position:"absolute",bottom:0,left:0,right:0,padding:"18px 18px 16px"}}>
                    <div style={{fontFamily:"'Fraunces',serif",fontSize:34,fontWeight:900,color:"#fff",lineHeight:1,marginBottom:8,letterSpacing:"-1px"}}>
                      {fmtP(195000)}
                      <span style={{fontSize:14,fontWeight:400,color:"rgba(255,255,255,0.6)"}}>/mo</span>
                    </div>
                    <div style={{fontWeight:800,fontSize:15,color:"#fff",marginBottom:3,lineHeight:1.35,letterSpacing:"0.015em"}}>2 BHK Furnished · Lower Parel</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",marginBottom:10}}>📍 Indiabulls Sky, Lower Parel, Mumbai</div>
                    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:12}}>
                      {["🛏 2 Beds","🚿 2 Baths","📐 950 sqft","🛋 Fully Furnished"].map((d,i)=><span key={i} style={{background:"rgba(255,255,255,0.12)",backdropFilter:"blur(4px)",border:"1px solid rgba(255,255,255,0.18)",borderRadius:8,padding:"4px 10px",fontSize:11,fontWeight:600,color:"#fff"}}>{d}</span>)}
                    </div>
                    <div style={{height:1,background:"rgba(255,255,255,0.12)",marginBottom:12}}/>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <div>
                        <div style={{fontSize:12,fontWeight:700,color:"#fff"}}>Vikram Kulkarni</div>
                        <div style={{fontSize:11,color:"rgba(255,255,255,0.5)"}}>UrbanNest Realty · +91 98203 90112</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
          <div className="home-wa-sample-actions">
            <button type="button" className="btn-outline" disabled={homeAssetDl!==null} onClick={()=>runHomeWaDownload("sale")} style={{minHeight:44}}>{homeAssetDl==="sale"?"...":"Download sale card"}</button>
            <button type="button" className="btn-outline" disabled={homeAssetDl!==null} onClick={()=>runHomeWaDownload("rent")} style={{minHeight:44}}>{homeAssetDl==="rent"?"...":"Download rent card"}</button>
          </div>
        </div>
          </div>
          <div className="home-sample-block home-sample-block--pdf" aria-labelledby="home-pdf-sample-heading">
        <div className="home-wa-sample-inner">
          <div className="home-sample-intro">
            <span className="section-label">PDF-ready</span>
            <h3 id="home-pdf-sample-heading" className="home-heading">Polished PDF brochures</h3>
            <p style={{fontSize:14,color:"var(--text-readable)",lineHeight:1.65,margin:0}}>
              Northing generates print-ready A4 reports with your branding, structured specs, and space for photos and maps—same layout agents use for client packs.
            </p>
          </div>
          <div className="home-pdf-sample-frame">
            <HomePdfSamplePrint />
          </div>
          <div className="home-pdf-download-wrap">
            <button type="button" className="btn-primary" disabled={homeAssetDl!==null} onClick={runHomePdfDownload} style={{border:"none",minHeight:48,padding:"0 24px"}}>{homeAssetDl==="pdf"?"Generating...":"Download sample PDF"}</button>
          </div>
        </div>
          </div>
          </div>
          {!homeSamplesExpanded&&(
            <>
              <div className="home-sample-outputs-fade" aria-hidden />
              <button type="button" className="home-sample-outputs-reveal" onClick={()=>setHomeSamplesExpanded(true)}>Show all samples</button>
            </>
          )}
          </div>
        </div>
      </section>
      
      <section className="home-band-split">
        <div className="gr home-band-split-inner">
          {[
            {icon:"🏠",title:"Selling or Renting?",desc:"List your property in minutes. Individual sellers get 2 free listings. Instant PDF brochure included.",cta:"List My Property"},
            {icon:"🏢",title:"Real Estate Agent?",desc:"Unlimited listings, white-label PDF with your firm's logo, and WhatsApp cards. Built for professionals.",cta:"Join as Agent"},
          ].map(({icon,title,desc,cta})=>(
            <div key={title} className="card glass-card home-band-card">
              <div className="home-band-card-media" aria-hidden>{icon}</div>
              <div>
                <h3 className="home-heading">{title}</h3>
                <p>{desc}</p>
                <button type="button" onClick={()=>onNavigate(currentUser?"dashboard":"login")} className="btn-primary">{cta} →</button>
              </div>
            </div>
          ))}
        </div>
      </section>
      <section className="home-band-cta">
        <div style={{position:"absolute",top:-100,right:-60,width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle, rgba(251,146,60,0.2) 0%, transparent 68%)",pointerEvents:"none"}} />
        <div style={{position:"absolute",bottom:-80,left:-40,width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle, rgba(56,189,248,0.14) 0%, transparent 72%)",pointerEvents:"none"}} />
        <div className="home-cta-inner">
          <div className="home-cta-eyebrow">
            <span>Trusted by Agents Across India</span>
          </div>
          <div className="home-cta-grid gr3">
            {testimonials.map((t,i)=>(
              <div key={i} className="card glass-card">
                <div className="home-cta-testimonial-head">
                  <div className="home-cta-avatar" aria-hidden>{t.name.charAt(0)}</div>
                  <div><div className="home-cta-name">{t.name}</div><div className="home-cta-agency">{t.agency}</div></div>
                </div>
                <div className="home-cta-stars">⭐⭐⭐⭐⭐</div>
                <p className="home-cta-quote">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <footer className="glass-footer" style={{padding:"clamp(28px,4vw,44px) 0",position:"relative"}}>
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.92) 100%)",pointerEvents:"none"}} />
        <div className="home-footer-inner" style={{flexDirection:"column",alignItems:"stretch",gap:20}}>
          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:20,width:"100%"}}>
            <button type="button" onClick={()=>onNavigate("home")} style={{display:"flex",alignItems:"center",background:"none",border:"none",padding:0,cursor:"pointer"}} aria-label="Northing home">
              <img src="/northing-logo-light.svg" alt="Northing" style={{height:48,width:"auto",maxWidth:260,objectFit:"contain",display:"block"}} />
            </button>
            <nav aria-label="Quick links" style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"center",justifyContent:"flex-end"}}>
              {[
                ["Home","home"],
                ["Browse","feed"],
                ["Featured","home","prop-grid"],
                ["Samples","home","home-sample-outputs"],
                ["About","about"],
              ].map(([label,pg,anchor])=>(
                <button key={label} type="button" onClick={()=>anchor?onNavigate(pg,undefined,anchor):onNavigate(pg)} style={{background:"rgba(255,255,255,0.06)",border:"1px solid rgba(248,250,252,0.14)",borderRadius:10,padding:"8px 14px",cursor:"pointer",color:"rgba(248,250,252,0.88)",font:"inherit",fontSize:12,fontWeight:600,transition:"background 0.2s, color 0.2s, border-color 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,255,255,0.1)";e.currentTarget.style.color="#fff";}} onMouseLeave={e=>{e.currentTarget.style.background="rgba(255,255,255,0.06)";e.currentTarget.style.color="rgba(248,250,252,0.88)";}}>{label}</button>
              ))}
            </nav>
          </div>
          <div style={{display:"flex",flexWrap:"wrap",alignItems:"center",justifyContent:"space-between",gap:16,width:"100%"}}>
            <p style={{fontSize:12,color:"rgba(248,250,252,0.55)",fontWeight:500,margin:0}}>© 2026 Northing · Professional Property Marketing · Made in India</p>
            <div style={{display:"flex",gap:18,fontSize:12,color:"rgba(248,250,252,0.55)",fontWeight:500,alignItems:"center"}}>
              <button type="button" onClick={()=>onNavigate("privacy")} style={{background:"none",border:"none",padding:0,cursor:"pointer",color:"inherit",font:"inherit",fontWeight:500,transition:"color 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.color="rgba(248,250,252,0.95)";}} onMouseLeave={e=>{e.currentTarget.style.color="rgba(248,250,252,0.55)";}}>Privacy</button>
              <span style={{opacity:0.5}}>·</span>
              <button type="button" onClick={()=>onNavigate("terms")} style={{background:"none",border:"none",padding:0,cursor:"pointer",color:"inherit",font:"inherit",fontWeight:500,transition:"color 0.2s"}} onMouseEnter={e=>{e.currentTarget.style.color="rgba(248,250,252,0.95)";}} onMouseLeave={e=>{e.currentTarget.style.color="rgba(248,250,252,0.55)";}}>Terms</button>
            </div>
          </div>
        </div>
      </footer>
      <div style={{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid var(--border)",padding:"8px 0 max(12px, env(safe-area-inset-bottom))",zIndex:200,justifyContent:"space-around",boxSizing:"border-box"}} className="mob-nav">
        {[["🏠","Home","home"],["🔍","Browse","feed"],["➕","Sell","dashboard"],["👤","Account","dashboard"]].map(([icon,label,pg])=>(
          <button key={label} onClick={()=>onNavigate(pg)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:2,background:"none",border:"none",cursor:"pointer",color:"var(--muted)",fontFamily:"inherit",padding:"0 8px"}}>
            <span style={{fontSize:20}}>{icon}</span>
            <span style={{fontSize:10,fontWeight:700}}>{label}</span>
          </button>
        ))}
      </div>
      {modal&&<ErrorBoundary><PropModal listing={modal} onClose={()=>setModal(null)}/></ErrorBoundary>}
      {waListing&&<ErrorBoundary><WACardModal listing={waListing} onClose={()=>setWAListing(null)} currentUser={currentUser}/></ErrorBoundary>}
      {pdfListing&&<ErrorBoundary><PDFModal listing={pdfListing} onClose={()=>setPdfListing(null)} currentUser={currentUser}/></ErrorBoundary>}
    </div>
  );
};

const AgentPage = ({agentId,onNavigate,currentUser}) => {
  const [agent,setAgent]=useState(null);const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [modal,setModal]=useState(null);const [waL,setWaL]=useState(null);const [pdfL,setPdfL]=useState(null);const [copied,setCopied]=useState(false);
  useEffect(()=>{
    (async()=>{
      const [{data:a},{data:l}]=await Promise.all([
        supabase.from("profiles").select("*").eq("id",agentId).single(),
        supabase.from("listings").select("*").eq("agent_id",agentId).eq("status","Active").order("created_at",{ascending:false}),
      ]);
      setAgent(a);setListings((l||[]).map(mapListing).filter(Boolean));setLoading(false);
    })();
  },[agentId]);
  if(loading) return <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>Loading agent profile…</div>;
  if(!agent) return <div style={{minHeight:"60vh",display:"flex",alignItems:"center",justifyContent:"center",color:"var(--muted)"}}>Agent not found.</div>;
  const copyLink=()=>{navigator.clipboard?.writeText(`${window.location.origin}?agent=${agentId}`);setCopied(true);setTimeout(()=>setCopied(false),2000);};
  return (
    <div style={{background:"var(--cream)",minHeight:"100vh"}}>
      <div style={{background:"var(--navy)",padding:"48px 24px 40px"}}>
        <div style={{maxWidth:960,margin:"0 auto",display:"flex",alignItems:"center",gap:24,flexWrap:"wrap"}}>
          <div style={{width:88,height:88,borderRadius:20,background:agent.logo_url?"#fff":"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",overflow:"hidden",border:"3px solid rgba(255,255,255,0.15)",flexShrink:0}}>
            {agent.logo_url?<img src={agent.logo_url} alt="" style={{width:"100%",height:"100%",objectFit:"contain"}}/>:<span style={{color:"#fff",fontWeight:900,fontFamily:"'Fraunces',serif",fontSize:36}}>{agent.name?.charAt(0)}</span>}
          </div>
          <div style={{flex:1,minWidth:200}}>
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>Verified Agent · Northing</div>
            <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:900,color:"#fff",margin:"0 0 4px"}}>{agent.agency_name||agent.name}</h1>
            {agent.agency_name&&<div style={{fontSize:14,color:"rgba(255,255,255,0.5)",marginBottom:8}}>{agent.name}</div>}
            <div style={{display:"flex",gap:16,flexWrap:"wrap",marginTop:6}}>
              {agent.phone&&<span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>📞 {agent.phone}</span>}
              {agent.address&&<span style={{fontSize:13,color:"rgba(255,255,255,0.6)"}}>📍 {agent.address}</span>}
              {agent.website&&<a href={agent.website} target="_blank" rel="noreferrer" style={{fontSize:13,color:"var(--primary)",textDecoration:"none"}}>{agent.website}</a>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:8,alignItems:"stretch",minWidth:160}}>
            <div style={{background:"rgba(255,255,255,0.08)",borderRadius:12,padding:"10px 16px",textAlign:"center",border:"1px solid rgba(255,255,255,0.12)"}}>
              <div style={{fontFamily:"'Fraunces',serif",fontSize:26,fontWeight:900,color:"#fff"}}>{listings.length}</div>
              <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:0.8}}>Active Listings</div>
            </div>
            <button onClick={copyLink} style={{padding:"9px 14px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:copied?"#059669":"var(--primary)",color:"#fff",border:"none",fontFamily:"inherit",transition:"background 0.2s"}}>{copied?"✅ Copied!":"🔗 Copy Profile Link"}</button>
            {agent.phone&&<a href={`https://wa.me/${agent.phone.replace(/\D/g,"")}?text=${encodeURIComponent("Hi, I found your profile on Northing and would like to enquire about your properties.")}`} target="_blank" rel="noreferrer" style={{padding:"9px 14px",borderRadius:9,fontSize:12,fontWeight:700,background:"#25D366",color:"#fff",border:"none",fontFamily:"inherit",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center",gap:6}}><WALogo size={12}/>WhatsApp Agent</a>}
          </div>
        </div>
      </div>
      <div style={{maxWidth:960,margin:"0 auto",padding:"36px 24px"}}>
        <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:800,color:"var(--navy)",marginBottom:20}}>{listings.length} Active Listing{listings.length!==1?"s":""}</h2>
        {listings.length===0
          ?<div className="card" style={{padding:48,textAlign:"center"}}><div style={{fontSize:40,marginBottom:12}}>🏘️</div><p style={{color:"var(--muted)"}}>No active listings right now.</p></div>
          :<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(270px,1fr))",gap:20}} className="gr">
            {listings.map(l=>(
              <div key={l.id} className="card" style={{overflow:"hidden",cursor:"pointer"}} onClick={()=>setModal(l)}>
                <div style={{height:175,background:"linear-gradient(135deg,var(--primary-light),var(--primary-mid))",position:"relative",overflow:"hidden"}}>
                  {l.photos?.[0]?<img src={l.photos[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>:<div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:40,opacity:0.3}}>🏠</div>}
                  <div style={{position:"absolute",inset:0,background:"linear-gradient(to top,rgba(0,0,0,0.5) 0%,transparent 55%)"}}/>
                  <span style={{position:"absolute",top:10,left:10,background:l.listingType==="Sale"?"var(--primary)":"#0ea5e9",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:20}}>{l.listingType==="Sale"?"For Sale":"For Rent"}</span>
                  <div style={{position:"absolute",bottom:10,left:12,fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:900,color:"#fff"}}>{fmtP(l.price)}{l.listingType==="Rent"&&<span style={{fontSize:11,opacity:0.8}}>/mo</span>}</div>
                </div>
                <div style={{padding:"13px 15px"}}>
                  <h3 style={{fontSize:14,fontWeight:700,color:"var(--navy)",marginBottom:3}}>{l.title}</h3>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:10}}>📍 {l.location}</div>
                  <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:10}}>
                    {l.bedrooms>0&&<span style={{fontSize:10,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 7px",borderRadius:6}}>🛏 {l.bedrooms}</span>}
                    {l.bathrooms>0&&<span style={{fontSize:10,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 7px",borderRadius:6}}>🚿 {l.bathrooms}</span>}
                    {l.sizesqft&&<span style={{fontSize:10,fontWeight:600,color:"var(--muted)",background:"var(--gray)",padding:"3px 7px",borderRadius:6}}>📐 {l.sizesqft}sqft</span>}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:7}} onClick={e=>e.stopPropagation()}>
                    <button onClick={()=>setWaL(l)} style={{padding:"8px",borderRadius:9,fontSize:12,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><WALogo size={12}/>WA</button>
                    <button onClick={()=>setPdfL(l)} className="btn-primary" style={{padding:"8px",borderRadius:9,fontSize:12,border:"none"}}>📄 PDF</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        }
      </div>
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
      {waL&&<WACardModal listing={waL} onClose={()=>setWaL(null)} currentUser={currentUser}/>}
      {pdfL&&<PDFModal listing={pdfL} onClose={()=>setPdfL(null)} currentUser={currentUser}/>}
    </div>
  );
};

const Nav = ({currentUser,page,onNavigate,onLogout,onSecretClick}) => {
  const [scrolled,setScrolled]=useState(false);
  const [mobOpen,setMobOpen]=useState(false);
  useEffect(()=>{const h=()=>setScrolled(window.scrollY>10);window.addEventListener("scroll",h);return()=>window.removeEventListener("scroll",h);},[]);
  useEffect(()=>{setMobOpen(false);},[page]);
  useEffect(()=>{
    if(mobOpen){document.body.style.overflow="hidden";}else{document.body.style.overflow="";}
    return()=>{document.body.style.overflow="";};
  },[mobOpen]);
  useEffect(()=>{
    if(!mobOpen)return;
    const esc=(e)=>{if(e.key==="Escape")setMobOpen(false);};
    window.addEventListener("keydown",esc);
    return()=>window.removeEventListener("keydown",esc);
  },[mobOpen]);
  const navBrandSrc=(currentUser?.role==="agent"||currentUser?.role==="seller")&&currentUser?.logoUrl?currentUser.logoUrl:DEFAULT_NORTHING_LOGO_SRC;
  const closeMob=()=>setMobOpen(false);
  const wrapNav=(fn)=>()=>{fn();closeMob();};
  const deskBtn={padding:"7px 12px",borderRadius:8,fontWeight:600,fontSize:13,cursor:"pointer",border:"none",transition:"all 0.2s"};
  const mobDrawer=mobOpen?(
    <>
      <div className="nav-drawer-backdrop" onClick={closeMob} role="presentation" aria-hidden="true"/>
      <aside id="nav-mobile-drawer" className="nav-drawer-panel" role="dialog" aria-modal="true" aria-label="Main menu">
        <div className="nav-drawer-head">
          <p className="nav-drawer-title">Menu</p>
          <button type="button" className="nav-drawer-close" onClick={closeMob} aria-label="Close menu">×</button>
        </div>
        <div className="nav-drawer-links">
          <button type="button" className={page==="home"?"nav-drawer-link-active":""} onClick={wrapNav(()=>onNavigate("home"))}>Home</button>
          <button type="button" className={page==="feed"?"nav-drawer-link-active":""} onClick={wrapNav(()=>onNavigate("feed"))}>Browse</button>
          <button type="button" onClick={wrapNav(()=>onNavigate("home",undefined,"prop-grid"))}>Featured</button>
          <button type="button" onClick={wrapNav(()=>onNavigate("home",undefined,"home-sample-outputs"))}>Samples</button>
          <button type="button" className={page==="about"?"nav-drawer-link-active":""} onClick={wrapNav(()=>onNavigate("about"))}>About</button>
          {currentUser&&<button type="button" className={page==="dashboard"?"nav-drawer-link-active":""} onClick={wrapNav(()=>onNavigate("dashboard"))}>{currentUser.role==="master"?"Control":currentUser.role==="agent"?"Listings":currentUser.role==="seller"?"My Properties":"Account"}</button>}
        </div>
        <div className="nav-drawer-foot">
          {currentUser?(
            <button type="button" onClick={wrapNav(onLogout)} style={{padding:"12px 16px",borderRadius:12,fontWeight:600,fontSize:14,border:"1px solid var(--border)",background:"var(--gray)",cursor:"pointer",fontFamily:"inherit",color:"var(--muted)"}}>Sign out</button>
          ):(
            <>
              <button type="button" className="btn-outline" style={{padding:"12px 16px",borderRadius:12,fontWeight:600,fontSize:14,width:"100%",boxSizing:"border-box"}} onClick={wrapNav(()=>onNavigate("login"))}>Log In</button>
              <button type="button" className="btn-primary" style={{padding:"12px 16px",borderRadius:12,fontWeight:700,fontSize:14,border:"none",width:"100%",boxSizing:"border-box"}} onClick={wrapNav(()=>onNavigate("login"))}>Sign Up</button>
            </>
          )}
        </div>
      </aside>
    </>
  ):null;
  return (
    <>
    <nav className="glass-nav-enhance" style={{position:"sticky",top:0,zIndex:100,minHeight:64,height:"auto",paddingTop:8,paddingBottom:8,display:"flex",alignItems:"center",justifyContent:"space-between",paddingLeft:20,paddingRight:20,borderBottom:"1px solid rgba(148,163,184,0.22)",transition:"box-shadow 0.35s ease, border-color 0.3s",boxShadow:scrolled?"0 4px 20px rgba(15,23,42,0.05), 0 10px 40px rgba(15,23,42,0.04), 0 1px 0 rgba(255,255,255,0.85) inset":"0 1px 0 rgba(255,255,255,0.65) inset"}}>
      <button onClick={()=>{onNavigate("home");onSecretClick();}} style={{background:"none",border:"none",cursor:"pointer",display:"flex",alignItems:"center",gap:10,padding:"4px 0",flexShrink:0}} aria-label="Northing home">
        <img className="nav-logo-img" src={navBrandSrc} alt="Northing" style={{height:58,width:"auto",maxWidth:280,objectFit:"contain",display:"block"}} />
      </button>
      <div className="nav-desktop-cluster">
        {["home","feed"].map(p=><button key={p} onClick={()=>onNavigate(p)} style={{...deskBtn,background:page===p?"var(--primary-light)":"transparent",color:page===p?"var(--primary)":"var(--muted)",textTransform:"capitalize"}}>{p==="feed"?"Browse":p}</button>)}
        <button type="button" onClick={()=>onNavigate("home",undefined,"prop-grid")} style={{...deskBtn,background:"transparent",color:"var(--muted)"}}>Featured</button>
        <button type="button" onClick={()=>onNavigate("home",undefined,"home-sample-outputs")} style={{...deskBtn,background:"transparent",color:"var(--muted)"}}>Samples</button>
        <button type="button" onClick={()=>onNavigate("about")} style={{...deskBtn,background:page==="about"?"var(--primary-light)":"transparent",color:page==="about"?"var(--primary)":"var(--muted)"}}>About</button>
        {currentUser?<>
          <button onClick={()=>onNavigate("dashboard")} className="hm" style={{...deskBtn,background:"transparent",color:"var(--muted)"}}>{currentUser.role==="master"?"Control":currentUser.role==="agent"?"Listings":currentUser.role==="seller"?"My Properties":"Account"}</button>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--gray)",borderRadius:24,padding:"5px 12px 5px 5px",border:"1px solid var(--border)",cursor:"pointer"}} onClick={()=>onNavigate("dashboard")}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}>{currentUser.name?.charAt(0)}</div>
            <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}} className="hm">{currentUser.name?.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} style={{padding:"7px 13px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer",background:"var(--gray)",color:"var(--muted)",border:"1px solid var(--border)",transition:"all 0.2s"}}>Sign Out</button>
        </>:<>
          <button onClick={()=>onNavigate("login")} style={{padding:"7px 16px",borderRadius:9,fontWeight:600,fontSize:13,cursor:"pointer",background:"transparent",color:"var(--primary)",border:"none"}}>Log In</button>
          <button onClick={()=>onNavigate("login")} className="btn-green" style={{padding:"9px 20px",borderRadius:9,fontSize:13}}>Sign Up →</button>
        </>}
      </div>
      <div className="nav-mob-actions">
        <button type="button" className="nav-mob-toggle" aria-expanded={mobOpen} aria-controls="nav-mobile-drawer" aria-label={mobOpen?"Close menu":"Open menu"} onClick={()=>setMobOpen(o=>!o)}>
          {mobOpen?"✕":"☰"}
        </button>
      </div>
    </nav>
    {mobDrawer&&createPortal(mobDrawer,document.body)}
    </>
  );
};

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { crashed: false, error: null }; }
  static getDerivedStateFromError(error) { return { crashed: true, error }; }
  componentDidCatch(error, info) { console.error("Northing crash:", error, info); }
  render() {
    if (this.state.crashed) {
      return (
        <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--cream)",fontFamily:"'Inter',sans-serif",padding:24}}>
          <div style={{textAlign:"center",maxWidth:420}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",marginBottom:8}}>Northing</div>
            <div style={{fontSize:40,marginBottom:16}}>⚠️</div>
            <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>Something went wrong</h2>
            <p style={{fontSize:14,color:"#78716c",marginBottom:24,lineHeight:1.6}}>The app encountered an unexpected error. Your data is safe — just reload to continue.</p>
            <button onClick={()=>window.location.reload()} style={{background:"#FF6B00",color:"#fff",border:"none",padding:"12px 28px",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>↺ Reload App</button>
            {this.state.error && <details style={{marginTop:20,textAlign:"left",fontSize:11,color:"#aaa",background:"var(--gray)",padding:12,borderRadius:8,wordBreak:"break-all"}}><summary style={{cursor:"pointer",marginBottom:6}}>Error details</summary>{this.state.error.toString()}</details>}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MarketingKitModal = ({listing, onClose, currentUser}) => {
  const agentBrand = useListingAgentBrand(listing, currentUser);
  const [status,setStatus]=useState("idle");
  const [copied,setCopied]=useState(false);
  const shareUrl=`${getPublicSiteBase()}/share/${listing.id}`;
  const copyShareLink=()=>{
    const run=()=>{setCopied(true);setTimeout(()=>setCopied(false),2200);};
    if(navigator.clipboard?.writeText) navigator.clipboard.writeText(shareUrl).then(run).catch(()=>alert("Could not copy link"));
    else{const t=document.createElement("textarea");t.value=shareUrl;document.body.appendChild(t);t.select();try{document.execCommand("copy");run();}catch{alert("Could not copy link")}document.body.removeChild(t);}
  };
  const download=async()=>{
    setStatus("loading");
    try{
      const JSZip=await new Promise((res,rej)=>{
        if(window.JSZip){res(window.JSZip);return;}
        const s=document.createElement("script");
        s.src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
        s.onload=()=>res(window.JSZip);s.onerror=rej;document.head.appendChild(s);
      });
      const wmOptions=watermarkBrandOptionsFromAgent(listing, agentBrand);
      const zip=new JSZip();
      const imgFolder=zip.folder("photos");
      for(let i=0;i<(listing.photos||[]).length;i++){
        try{
          const resp=await fetch(listing.photos[i],{mode:"cors"});
          if(!resp.ok) continue;
          const blob=await resp.blob();
          const mime=blob.type&&blob.type.startsWith("image/")?blob.type:"image/jpeg";
          const rawFile=new File([blob],`raw-${i}`,{type:mime});
          const wmFile=await burnWatermark(rawFile,wmOptions);
          imgFolder.file(`photo-${i+1}.jpg`,wmFile);
        }catch(e){}
      }
      const info=[
        listing.title,
        `Location: ${listing.location}`,
        `Price: ${fmtP(listing.price)}${listing.listingType==="Rent"?" /month":""}`,
        `Type: ${listing.propertyType} · For ${listing.listingType}`,
        listing.bedrooms?`Beds: ${listing.bedrooms}`:"",
        listing.bathrooms?`Baths: ${listing.bathrooms}`:"",
        listing.sizesqft?`Size: ${listing.sizesqft} sqft`:"",
        "",
        `Agent: ${listing.agentName}`,
        listing.agentPhone?`Phone: ${listing.agentPhone}`:"",
        listing.agencyName?`Agency: ${listing.agencyName}`:"",
        "",
        `Shareable Link: ${shareUrl}`,
        "",
        "Powered by Northing"
      ].join("\n");
      zip.file("property-info.txt",info);
      const blob=await zip.generateAsync({type:"blob"});
      const a=document.createElement("a");
      a.href=URL.createObjectURL(blob);
      a.download=`marketing-kit-${(listing.title||"property").replace(/\s+/g,"-").toLowerCase()}.zip`;
      a.click();
      setStatus("done");
    }catch(e){alert("Download failed: "+e.message);setStatus("idle");}
  };
  return (
    <div className="afd" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:4500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={onClose}>
      <div className="card asl" style={{maxWidth:420,width:"100%",padding:32}} onClick={e=>e.stopPropagation()}>
        <div style={{textAlign:"center",marginBottom:24}}>
          <div style={{fontSize:44,marginBottom:10}}>📦</div>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:22,fontWeight:800,color:"var(--navy)",marginBottom:8}}>Marketing Kit</h2>
          <p style={{fontSize:13,color:"var(--muted)",lineHeight:1.7}}>Download all watermarked photos + property info as a ZIP. Ready to share on WhatsApp, Instagram or email.</p>
        </div>
        <div style={{background:"var(--cream)",borderRadius:12,padding:16,marginBottom:16,border:"1px solid var(--border)"}}>
          <div style={{fontSize:12,fontWeight:700,color:"var(--navy)",marginBottom:10,textTransform:"uppercase",letterSpacing:0.5}}>📁 Included in ZIP</div>
          {[
            `🖼 ${(listing.photos||[]).length} watermarked photo${(listing.photos||[]).length!==1?"s":""}`,
            "📄 Property info text file",
          ].map((item,i)=>(
            <div key={i} style={{fontSize:13,color:"var(--muted)",marginBottom:5,display:"flex",gap:6,alignItems:"flex-start"}}>{item}</div>
          ))}
          <div style={{fontSize:12,fontWeight:700,color:"var(--navy)",marginTop:12,marginBottom:6,textTransform:"uppercase",letterSpacing:0.5}}>🔗 Share link</div>
          <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
            <a href={shareUrl} target="_blank" rel="noreferrer" style={{fontSize:12,color:"var(--primary)",fontWeight:600,wordBreak:"break-all",flex:"1 1 180px"}}>{shareUrl}</a>
            <button type="button" onClick={copyShareLink} className="btn-ghost" style={{padding:"8px 14px",borderRadius:9,fontSize:12,fontWeight:700,flexShrink:0,whiteSpace:"nowrap"}}>{copied?"✓ Copied":"📋 Copy link"}</button>
          </div>
        </div>
        <button onClick={download} disabled={status==="loading"} className="btn-primary"
          style={{width:"100%",padding:"13px",borderRadius:10,fontSize:14,marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:8,border:"none"}}>
          {status==="loading"?<><span className="spin"/>Packaging…</>:status==="done"?"✅ Downloaded!":"⬇️ Download Marketing Kit"}
        </button>
        <button onClick={onClose} className="btn-ghost" style={{width:"100%",padding:"11px",borderRadius:10,fontSize:13}}>Close</button>
      </div>
    </div>
  );
};

const useViewerBrandProfile = () => {
  const [viewer, setViewer] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) return;
      const { data: p } = await supabase.from("profiles").select("id,logo_url,agency_name").eq("id", session.user.id).single();
      if (cancelled || !p) return;
      setViewer({ id: p.id, logoUrl: p.logo_url || null, agencyName: p.agency_name || null });
    })();
    return () => { cancelled = true; };
  }, []);
  return viewer;
};

const PropertyPublicPage = ({ id }) => {
  const navigate = (path) => { window.history.pushState({}, '', path); window.location.href = path; };
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waListing, setWaListing] = useState(null);
  const [pdfListing, setPdfListing] = useState(null);
  const [kitListing, setKitListing] = useState(null);
  const viewerBrand = useViewerBrandProfile();
  useEffect(() => { _h.openWA = (l) => setWaListing(l); _h.openPDF = (l) => setPdfListing(l); _h.openKit = (l) => setKitListing(l); }, []);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).single();
      setListing(mapListing(data));
      setLoading(false);
      if (data?.id) track(data.id, 'pageview');
    })();
  }, [id]);
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:'center',color:'var(--muted)'}}>
        <div style={{fontSize:32,marginBottom:12}}>🏠</div>
        <div style={{fontWeight:600}}>Loading property…</div>
      </div>
    </div>
  );
  if (!listing) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:'center',color:'var(--muted)'}}>
        <div style={{fontSize:48,marginBottom:12}}>🔍</div>
        <div style={{fontWeight:700,fontSize:18,color:'var(--navy)',marginBottom:6}}>Property not found</div>
        <button onClick={()=>navigate('/')} className="btn-primary" style={{padding:'10px 24px',borderRadius:10,fontSize:14,marginTop:8}}>← Back to Home</button>
      </div>
    </div>
  );
  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <div style={{background:'linear-gradient(90deg, #0f172a 0%, #1e293b 100%)',padding:'14px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
        <img src="/northing-logo.svg" alt="Northing" onClick={()=>navigate('/')} style={{height:40,maxWidth:200,width:'auto',objectFit:'contain',cursor:'pointer'}} />
        <button onClick={()=>navigate('/')} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.2)',color:'rgba(255,255,255,0.8)',padding:'7px 16px',borderRadius:9,fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>← Browse All</button>
      </div>
      <PropModal listing={listing} onClose={()=>navigate('/')} />
      {waListing && <WACardModal listing={waListing} onClose={()=>setWaListing(null)} currentUser={viewerBrand} />}
      {pdfListing && <PDFModal listing={pdfListing} onClose={()=>setPdfListing(null)} currentUser={viewerBrand} />}
      {kitListing && <MarketingKitModal listing={kitListing} onClose={()=>setKitListing(null)} currentUser={viewerBrand} />}
    </div>
  );
};

/** Public marketing landing page for shared links (e.g. from Marketing Kit). Distinct from /property/:id full modal experience. */
const ShareListingPage = ({ id }) => {
  const navigate = (path) => { window.history.pushState({}, '', path); window.location.href = path; };
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waListing, setWaListing] = useState(null);
  const [pdfListing, setPdfListing] = useState(null);
  const [kitListing, setKitListing] = useState(null);
  const viewerBrand = useViewerBrandProfile();
  useEffect(() => { _h.openWA = (l) => setWaListing(l); _h.openPDF = (l) => setPdfListing(l); _h.openKit = (l) => setKitListing(l); }, []);
  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('listings').select('*').eq('id', id).single();
      setListing(mapListing(data));
      setLoading(false);
      if (data?.id) track(data.id, 'pageview');
    })();
  }, [id]);
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:'center',color:'var(--muted)'}}>
        <div style={{fontSize:32,marginBottom:12}}>🏠</div>
        <div style={{fontWeight:600}}>Loading…</div>
      </div>
    </div>
  );
  if (!listing) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:'center',color:'var(--muted)'}}>
        <div style={{fontSize:48,marginBottom:12}}>🔍</div>
        <div style={{fontWeight:700,fontSize:18,color:'var(--navy)',marginBottom:6}}>Listing not found</div>
        <button onClick={()=>navigate('/')} className="btn-primary" style={{padding:'10px 24px',borderRadius:10,fontSize:14,marginTop:8}}>← Back to Northing</button>
      </div>
    </div>
  );
  const fields=[["Type",listing.propertyType],["Listing",listing.listingType],["Size",listing.sizesqft?`${listing.sizesqft} sqft`:null],["Beds",listing.bedrooms||null],["Baths",listing.bathrooms||null],["Furnishing",listing.furnishingStatus]].filter(([,v])=>v);
  const fullUrl=`${getPublicSiteBase()}/property/${listing.id}`;
  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <header style={{background:'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',flexWrap:'wrap',gap:12}}>
        <img src="/northing-logo.svg" alt="Northing" onClick={()=>navigate('/')} style={{height:48,maxWidth:260,width:'auto',objectFit:'contain',cursor:'pointer'}} />
        <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
          <a href={fullUrl} style={{color:'rgba(255,255,255,0.85)',fontSize:13,fontWeight:600}}>Full listing view →</a>
          <button type="button" onClick={()=>navigate('/')} style={{background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.25)',color:'#fff',padding:'8px 16px',borderRadius:9,fontSize:13,cursor:'pointer',fontFamily:'inherit',fontWeight:600}}>Browse all homes</button>
        </div>
      </header>
      <div style={{maxWidth:880,margin:'0 auto',padding:'28px 20px 48px'}}>
        <p style={{fontSize:11,fontWeight:700,color:'var(--primary)',textTransform:'uppercase',letterSpacing:2,marginBottom:10}}>Shared with you</p>
        {listing.photos?.[0]&&(
          <div style={{borderRadius:16,overflow:'hidden',marginBottom:24,boxShadow:'var(--shadow-lg)'}}>
            <img src={listing.photos[0]} alt="" style={{width:'100%',height:320,objectFit:'cover',display:'block'}} />
          </div>
        )}
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:"clamp(26px, 4vw, 34px)",fontWeight:900,color:'var(--navy)',lineHeight:1.2,marginBottom:8}}>{listing.title}</h1>
        <div style={{fontSize:15,color:'var(--muted)',marginBottom:16}}>📍 {listing.location}</div>
        <div style={{fontFamily:"'Fraunces',serif",fontSize:36,fontWeight:900,color:'var(--primary)',marginBottom:20}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:16,fontWeight:500,color:'var(--muted)'}}>/month</span>}</div>
        {listing.description&&<p style={{fontSize:15,color:'var(--text)',lineHeight:1.75,marginBottom:24,background:'#fff',padding:18,borderRadius:12,border:'1px solid var(--border)'}}>{listing.description}</p>}
        {fields.length>0&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:12,marginBottom:28}}>
            {fields.map(([k,v])=>(
              <div key={k} style={{background:'#fff',padding:'12px 14px',borderRadius:10,border:'1px solid var(--border)'}}>
                <div style={{fontSize:11,color:'var(--muted)',fontWeight:700}}>{k}</div>
                <div style={{fontWeight:700,color:'var(--navy)',marginTop:4}}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {listing.location&&(
          <div style={{marginBottom:28}}>
            <div style={{fontSize:12,fontWeight:700,color:'var(--primary)',textTransform:'uppercase',letterSpacing:1,marginBottom:10}}>Location</div>
            <iframe title="Map" src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location)}&output=embed`} style={{width:'100%',height:240,border:'1px solid var(--border)',borderRadius:12}} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
          </div>
        )}
        <div style={{background:'var(--primary-light)',borderRadius:16,padding:24,border:'1px solid var(--primary-mid)'}}>
          <p className="section-label" style={{marginBottom:12}}>Contact</p>
          <div style={{fontWeight:800,fontSize:17,color:'var(--navy)',marginBottom:6}}>{listing.agentName} <span style={{fontWeight:500,color:'var(--muted)'}}>· {listing.agencyName||"Agent"}</span></div>
          {listing.agentPhone&&<div style={{marginBottom:14}}>📞 <a href={`tel:${listing.agentPhone}`} style={{color:'var(--primary)',fontWeight:700}}>{listing.agentPhone}</a></div>}
          <div style={{display:'flex',gap:10,flexWrap:'wrap'}}>
            {listing.agentPhone&&<a href={`https://wa.me/${listing.agentPhone.replace(/\D/g,"")}`} target="_blank" rel="noreferrer" className="btn-primary" style={{padding:'11px 18px',borderRadius:10,fontSize:14,textDecoration:'none',display:'inline-flex',alignItems:'center',gap:8}}><WALogo size={16}/>WhatsApp</a>}
            <button type="button" onClick={()=>showWACard(listing)} style={{padding:'11px 18px',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',background:'#128C7E',color:'#fff',border:'none',fontFamily:'inherit'}}>WhatsApp Card</button>
            <button type="button" onClick={()=>showPDF(listing)} className="btn-outline" style={{padding:'11px 18px',borderRadius:10,fontSize:14,fontWeight:700}}>PDF report</button>
            <button type="button" onClick={()=>_h.openKit(listing)} style={{padding:'11px 18px',borderRadius:10,fontSize:14,fontWeight:700,cursor:'pointer',background:'#fff',color:'var(--primary)',border:'2px solid var(--primary)',fontFamily:'inherit'}}>Marketing kit</button>
          </div>
        </div>
        <p style={{textAlign:'center',fontSize:12,color:'var(--muted)',marginTop:32}}>Powered by Northing · <a href={fullUrl} style={{color:'var(--primary)',fontWeight:600}}>Open full listing</a></p>
      </div>
      {waListing && <WACardModal listing={waListing} onClose={()=>setWaListing(null)} currentUser={viewerBrand} />}
      {pdfListing && <PDFModal listing={pdfListing} onClose={()=>setPdfListing(null)} currentUser={viewerBrand} />}
      {kitListing && <MarketingKitModal listing={kitListing} onClose={()=>setKitListing(null)} currentUser={viewerBrand} />}
    </div>
  );
};

const BrokerPublicPage = ({ name }) => {
  const navigate = (path) => { window.history.pushState({}, '', path); window.location.href = path; };
  const [agentId, setAgentId] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    (async () => {
      const slug = decodeURIComponent(name).replace(/-/g,' ');
      const { data } = await supabase.from('profiles').select('id,name').ilike('name', slug);
      setAgentId(data?.[0]?.id || null);
      setLoading(false);
    })();
  }, [name]);
  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:'center',color:'var(--muted)'}}><div style={{fontSize:32,marginBottom:12}}>🏢</div><div style={{fontWeight:600}}>Loading broker profile…</div></div>
    </div>
  );
  if (!agentId) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:'center',color:'var(--muted)'}}><div style={{fontSize:48,marginBottom:12}}>👤</div><div style={{fontWeight:700,fontSize:18,color:'var(--navy)',marginBottom:6}}>Broker not found</div><button onClick={()=>navigate('/')} className="btn-primary" style={{padding:'10px 24px',borderRadius:10,fontSize:14,marginTop:8}}>← Back to Home</button></div>
    </div>
  );
  return (
    <div style={{minHeight:'100vh',background:'var(--cream)',fontFamily:"'Inter',sans-serif"}}>
      <style>{G}</style>
      <AgentPage agentId={agentId} onNavigate={(p)=>navigate(p==='home'?'/':'/'+p)} currentUser={null} />
    </div>
  );
};

/** Parse shell URL: public broker profile `/?agent=id`, or /feed, /login, /dashboard, else home. */
const parseShellLocation = () => {
  const path = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
  const agent = new URLSearchParams(window.location.search).get("agent");
  if (agent) return { page: "agentpage", agentId: agent };
  if (path === "/feed") return { page: "feed", agentId: null };
  if (path === "/login") return { page: "login", agentId: null };
  if (path === "/dashboard") return { page: "dashboard", agentId: null };
  if (path === "/privacy") return { page: "privacy", agentId: null };
  if (path === "/terms") return { page: "terms", agentId: null };
  if (path === "/about") return { page: "about", agentId: null };
  return { page: "home", agentId: null };
};

const shellPathForPage = (page, agentId) => {
  if (page === "agentpage" && agentId) return `/?agent=${encodeURIComponent(agentId)}`;
  if (page === "feed") return "/feed";
  if (page === "login") return "/login";
  if (page === "dashboard") return "/dashboard";
  if (page === "privacy") return "/privacy";
  if (page === "terms") return "/terms";
  if (page === "about") return "/about";
  return "/";
};

export default function App() {
  const shellInit = parseShellLocation();
  const [page,setPage]=useState(shellInit.page);
  const [agentPageId,setAgentPageId]=useState(shellInit.agentId);
  const [user,setUser]=useState(null);
  const [authLoading,setAuthLoading]=useState(true);
  const [toast,setToast]=useState(null);
  const [adminModal,setAdminModal]=useState(false);
  const [waListing,setWAListing]=useState(null);
  const [pdfListing,setPDFListing]=useState(null);
  const [kitListing,setKitListing]=useState(null);

  useEffect(()=>{
    supabase.auth.getSession().then(async({data:{session}})=>{
      if(session){
        const {data:profile}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
        if(profile){
          const savedRes=await supabase.from("saved_listings").select("listing_id").eq("user_id",profile.id);
          const savedIds=(savedRes.data||[]).map(r=>r.listing_id);
          setUser({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,logoUrl:profile.logo_url||null,agentAddress:profile.address||null,agentWebsite:profile.website||null,savedListings:savedIds});
        }
      }
      setAuthLoading(false);
    }).catch(()=>setAuthLoading(false));
    _h.openWA=(l)=>setWAListing(l);
    _h.openPDF=(l)=>setPDFListing(l);
    _h.openKit=(l)=>setKitListing(l);
  },[]);

  /** Logged-out users must not stay on /dashboard (direct URL or refresh). */
  useLayoutEffect(() => {
    if (authLoading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("agent")) return;
    if (window.location.pathname === "/dashboard" && !user) {
      window.history.replaceState(null, "", "/login");
      setPage("login");
      setAgentPageId(null);
    }
  }, [authLoading, user]);

  useEffect(() => {
    const onPop = () => {
      const { page: nextPage, agentId } = parseShellLocation();
      if (nextPage === "dashboard" && !user) {
        window.history.replaceState(null, "", "/login");
        setPage("login");
        setAgentPageId(null);
        return;
      }
      setPage(nextPage);
      setAgentPageId(agentId);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [user]);

  const showToast=(msg,type="info")=>{setToast({msg,type});setTimeout(()=>setToast(null),3500);};
  /** `userOverride` avoids stale closure right after login (setUser + nav in same tick). */
  const nav=(p,userOverride,homeAnchorId)=>{
    const effectiveUser = userOverride !== undefined ? userOverride : user;
    if (p === "dashboard" && !effectiveUser) {
      setPage("login");
      setAgentPageId(null);
      window.history.pushState(null, "", "/login");
      window.scrollTo(0, 0);
      return;
    }
    setPage(p);
    if (p === "home" || p === "feed" || p === "login" || p === "dashboard" || p === "privacy" || p === "terms" || p === "about") {
      setAgentPageId(null);
      window.history.pushState(null, "", shellPathForPage(p, null));
    }
    if (p === "home" && homeAnchorId) {
      setTimeout(()=>document.getElementById(homeAnchorId)?.scrollIntoView({behavior:"smooth"}), 140);
      return;
    }
    window.scrollTo(0, 0);
  };
  const login=(u)=>{setUser(u);nav("dashboard", u);};
  const refreshSessionUser=async()=>{
    const {data:{session}}=await supabase.auth.getSession();
    if(!session?.user) return;
    const {data:profile}=await supabase.from("profiles").select("*").eq("id",session.user.id).single();
    if(!profile) return;
    const savedRes=await supabase.from("saved_listings").select("listing_id").eq("user_id",profile.id);
    const savedIds=(savedRes.data||[]).map(r=>r.listing_id);
    setUser({id:profile.id,name:profile.name,email:profile.email,role:profile.role,phone:profile.phone,agencyName:profile.agency_name,logoUrl:profile.logo_url||null,agentAddress:profile.address||null,agentWebsite:profile.website||null,savedListings:savedIds});
  };
  const logout=async()=>{await supabase.auth.signOut();setUser(null);nav("home");showToast("Signed out successfully","success");};
  const secretTrigger=useSecretAdmin(()=>{if(!user||user.role!=="master") setAdminModal(true);});

  if(authLoading) return (
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"var(--cream)",fontFamily:"'Plus Jakarta Sans',sans-serif"}}>
      <style>{G}</style>
      <div style={{textAlign:"center"}}><div style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",marginBottom:12}}>Northing</div><div style={{width:28,height:28,border:"3px solid var(--border)",borderTopColor:"var(--green)",borderRadius:"50%",animation:"spin 0.8s linear infinite",margin:"0 auto"}}></div></div>
    </div>
  );

  // Mini client-side router using window.location
  const pathname = window.location.pathname;
  const shareMatch = pathname.match(/^\/share\/([^/]+)$/);
  const propMatch = pathname.match(/^\/property\/([^/]+)$/);
  const brokerMatch = pathname.match(/^\/broker\/([^/]+)$/);
  if (shareMatch) return <ErrorBoundary><ShareListingPage id={shareMatch[1]} /></ErrorBoundary>;
  if (propMatch) return <ErrorBoundary><PropertyPublicPage id={propMatch[1]} /></ErrorBoundary>;
  if (brokerMatch) return <ErrorBoundary><BrokerPublicPage name={brokerMatch[1]} /></ErrorBoundary>;
  return (
    <ErrorBoundary>
    <div style={{minHeight:"100vh",background:"var(--cream)",color:"var(--text)",width:"100%",maxWidth:"100%"}}>
      <style>{G}</style>
      {page!=="login"&&<Nav currentUser={user} page={page} onNavigate={nav} onLogout={logout} onSecretClick={secretTrigger}/>}
      {page==="home"&&<Home currentUser={user} onNavigate={nav}/>}
      {page==="privacy"&&<PrivacyPolicyPage onNavigate={nav}/>}
      {page==="terms"&&<TermsOfServicePage onNavigate={nav}/>}
      {page==="about"&&<AboutPage onNavigate={nav}/>}
      {page==="feed"&&<Feed currentUser={user} showToast={showToast} onNavigate={nav}/>}
      {page==="login"&&<LoginPage onLogin={login} showToast={showToast} onNavigate={nav}/>}
      {page==="agentpage"&&agentPageId&&<AgentPage agentId={agentPageId} onNavigate={nav} currentUser={user}/>}
      {page==="dashboard"&&user?.role==="agent"&&<AgentDash currentUser={user} showToast={showToast} onPhoneLinked={refreshSessionUser}/>}
      {page==="dashboard"&&user?.role==="seller"&&<AgentDash currentUser={user} showToast={showToast} onPhoneLinked={refreshSessionUser}/>}
      {page==="dashboard"&&user?.role==="user"&&<UserDash currentUser={user} showToast={showToast} onPhoneLinked={refreshSessionUser}/>}
      {page==="dashboard"&&user?.role==="master"&&<MasterDash showToast={showToast}/>}
      {adminModal&&<SecretAdminModal onLogin={login} onClose={()=>setAdminModal(false)} showToast={showToast}/>}
      {waListing&&<WACardModal listing={waListing} onClose={()=>setWAListing(null)} currentUser={user}/>}
      {pdfListing&&<PDFModal listing={pdfListing} onClose={()=>setPDFListing(null)} currentUser={user}/>}
      {kitListing&&<MarketingKitModal listing={kitListing} onClose={()=>setKitListing(null)} currentUser={user}/>}
      {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
    </div>
    </ErrorBoundary>
  );
}
