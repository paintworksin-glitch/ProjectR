import { useState, useEffect, useLayoutEffect, useRef, useReducer, Component } from 'react'
import { createPortal } from 'react-dom'
import { createClient } from "@supabase/supabase-js";
import LoginParticles from "./LoginParticles.jsx";
import PrivacyPolicyPage from "./PrivacyPolicyPage.jsx";
import TermsOfServicePage from "./TermsOfServicePage.jsx";
import AboutPage from "./AboutPage.jsx";
import { HomeHeroIllustration, SkylineHeroBackdrop, SkylineRibbon } from "./SkylineIllustration.jsx";
import {
  listingAiConfigured,
  scorePhotoWithListingAi,
  generateListingAiDescription,
} from "./listingAi.js";

const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || "https://thgnziutmpmnsrkjoext.supabase.co";
const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRoZ256aXV0bXBtbnNya2pvZXh0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MTUwOTcsImV4cCI6MjA4ODA5MTA5N30.SYLiGFgGChnibmEP5RQVmJzlfr_nBDpJJCOmTCZgZ9Y";
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/** Where to return from /property/:id Back (set when opening a listing from feed or home). */
const PROPERTY_BACK_STORAGE_KEY = "northingPropertyBack";

const G = `
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
    .h1big-hero.home-hero-section .home-hero-marquee-root { will-change: auto; }
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
    .h1big-hero.home-hero-section{align-items:stretch!important;min-height:clamp(448px, 58dvh, 600px)!important}
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
    .home-hero-qs-dock{position:absolute!important;left:auto!important;right:max(14px, env(safe-area-inset-right))!important;bottom:calc(52px + max(8px, env(safe-area-inset-bottom)))!important;width:min(400px, calc(100vw - 28px))!important;margin:0!important;z-index:4!important;pointer-events:none!important;align-self:auto!important;flex-shrink:0!important}
    .home-hero-qs-toggle{min-height:48px!important;padding:13px 16px!important;touch-action:manipulation!important}
    .h1big-hero.home-hero-section .home-hero-overlay--light{background:linear-gradient(180deg, rgba(255,255,255,0.82) 0%, rgba(255,255,255,0.52) 36%, rgba(255,255,255,0.24) 56%, rgba(255,255,255,0.11) 100%)!important}
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration{align-items:flex-end!important;justify-content:center!important;padding-bottom:env(safe-area-inset-bottom, 0px)!important;overflow:hidden!important}
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration .home-hero-illustration-svg{width:min(148vw, 860px)!important;min-height:0!important;max-height:min(28vh, 232px)!important;opacity:0.94!important;transform:translateY(10px)!important}
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
    @supports not (width: 1cqi) {
      .home-wa-sample-scale-wrap{transform:scale(min(0.85, calc((100vw - 96px) / 420)))!important}
    }
  }
  @media(max-width:640px){.h1big:not(.home-hero-headline){font-size:32px!important}}
  @media(max-width:480px){
    .home-hero-inner{padding-top:clamp(16px,4vw,24px)!important;gap:clamp(16px,4vw,24px)!important}
    .home-hero-headline-line--sans{font-size:clamp(24px,6.8vw,34px)!important;line-height:1.06!important}
    .home-hero-headline-line--serif{font-size:clamp(20px,5.2vw,28px)!important;line-height:1.1!important}
    .h1big-hero.home-hero-section .home-hero-parallax-bg--illustration .home-hero-illustration-svg{max-height:min(26vh,200px)!important;opacity:0.93!important;transform:translateY(12px)!important}
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
  .property-detail-carousel-outer { position: relative; width: 100%; background: #0f0f0f; overflow: hidden; touch-action: pan-y; border-radius: 14px; box-shadow: 0 8px 32px rgba(15,23,42,0.12); }
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

/** Allowed keys from `listings.details` JSONB — arbitrary keys cannot override table-backed fields. */
const LISTING_DETAIL_KEYS = [
  "toilets", "condition", "builtYear", "modernKitchen", "wcType", "superBuiltUp", "carpetArea",
  "parkingType", "vastuDirection", "totalFloors", "propertyFloor", "maintenance", "societyFormed",
  "ocReceived", "reraRegistered", "reraNumber", "logoUrl", "agentAddress", "agentWebsite", "aiDescription",
];
const pickListingDetails = (raw) => {
  const d = raw && typeof raw === "object" ? raw : null;
  if (!d) return {};
  const out = {};
  for (const k of LISTING_DETAIL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(d, k) && d[k] !== undefined) out[k] = d[k];
  }
  return out;
};

const mapListing = (l) => !l ? null : ({
  id: l.id, agentId: l.agent_id, title: l.title, location: l.location,
  propertyType: l.property_type, listingType: l.listing_type,
  price: l.price, sizesqft: l.size_sqft, bedrooms: l.bedrooms, bathrooms: l.bathrooms,
  furnishingStatus: l.furnishing_status, status: l.status,
  description: l.description, highlights: l.highlights || [],
  agentName: l.agent_name, agentPhone: l.agent_phone, agentEmail: l.agent_email,
  agencyName: l.agency_name, photos: l.photos || [], createdAt: l.created_at,
  ...pickListingDetails(l.details),
  logoUrl: l.details?.logoUrl ?? null,
  agentAddress: l.details?.agentAddress ?? null,
  agentWebsite: l.details?.agentWebsite ?? null,
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

/** Static rent listing for homepage sample WhatsApp PNG export. */
const HOME_SAMPLE_RENT = {
  id: "samp-rent-001",
  title: "2 BHK near metro · Andheri West",
  location: "Andheri West, Mumbai",
  propertyType: "Apartment",
  listingType: "Rent",
  price: 92000,
  sizesqft: 980,
  bedrooms: 2,
  bathrooms: 2,
  furnishingStatus: "Unfurnished",
  description: "Bright cross-ventilated unit with modular kitchen platform. Society security, lift, and covered parking.",
  highlights: ["3 min walk to Metro", "24/7 security", "Modular kitchen platform"],
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
    logoUrl:form.logoUrl||null, agentAddress:form.agentAddress||null, agentWebsite:form.agentWebsite||null,
    aiDescription: form.aiDescription && String(form.aiDescription).trim() ? String(form.aiDescription).trim() : null }
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
    <div className="card" style={{overflow:"hidden",cursor:"pointer"}} onClick={()=>onView(listing)} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onView(listing);}}}>
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
          <button type="button" onClick={(e)=>{e.stopPropagation();onView(listing);}} className="btn-ghost" style={{padding:"8px",borderRadius:9,fontSize:11}}>View</button>
          <button type="button" onClick={(e)=>{e.stopPropagation();showWACard(listing);}} style={{padding:"8px",borderRadius:9,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"flex",alignItems:"center",justifyContent:"center",gap:4}}><WALogo size={12}/>WA</button>
          <button type="button" onClick={(e)=>{e.stopPropagation();showPDF(listing);}} className="btn-primary" style={{padding:"8px",borderRadius:9,fontSize:11,border:"none"}}>📄 PDF</button>
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
    setMapSrc(`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(listing.location)}&zoom=15&size=640x220&scale=2&maptype=roadmap&markers=color:0x1A1A1A|${encodeURIComponent(listing.location)}&key=${encodeURIComponent(gMapsKey)}`);
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

          {/* ── FOOTER: Northing lockup only for non–agent-branded PDFs ── */}
          <div style={{borderTop:"2px solid #f0f0f0",paddingTop:16,marginTop:8,display:"flex",justifyContent:"space-between",alignItems:"flex-end"}}>
            <div>
              <div style={{fontWeight:700,fontSize:14,color:"var(--navy)"}}>{listing.agentName||""}</div>
              {listing.agentEmail&&<div style={{fontSize:12,color:"#888"}}>{listing.agentEmail}</div>}
              {listing.agentPhone&&<div style={{fontSize:12,color:"#888"}}>📞 {listing.agentPhone}</div>}
            </div>
            {!hasAgentBrand ? (
              <div style={{textAlign:"right"}}>
                <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"#ccc"}}>Northing</div>
                <div style={{fontSize:10,color:"#ccc"}}>Powered by Northing</div>
              </div>
            ) : null}
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
        <SkylineHeroBackdrop tone="standard" />
        <div style={{position:"absolute",inset:0,zIndex:2,pointerEvents:"none"}}><LoginParticles /></div>
        <div style={{position:"relative",zIndex:3}}><div className="login-heading-serif" style={{fontWeight:700,fontSize:28,color:"#fff",marginBottom:4}}>Northing</div><div style={{fontSize:13,color:"rgba(255,255,255,0.45)",letterSpacing:"1.5px",textTransform:"uppercase"}}>Professional Property Marketing</div></div>
        <div style={{position:"relative",zIndex:3}}>
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
            <h2 className="login-heading-serif" style={{fontSize:28,fontWeight:600,color:"var(--navy)",marginBottom:6}}><ShinyText text={mode==="login"?"Welcome back.":"Create account."} color="#0f172a" shineColor="#333333" speed={3} spread={140}/></h2>
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

const ListingForm = ({currentUser,listingId,allListings,showToast,onBack,onSaved}) => {
  const isEdit=!!listingId; const fileRef=useRef(); const [hl,setHl]=useState(""); const [dupModal,setDupModal]=useState(null); const [saving,setSaving]=useState(false); const [photoLoading,setPhotoLoading]=useState(false); const [aiDescBusy,setAiDescBusy]=useState(false);
  const [aiStatus,setAiStatus]=useState("idle"); // idle | analyzing | done
  const [coverIdx,setCoverIdx]=useState(0);
  const [aiPick,setAiPick]=useState(null);
  const [scoringIdx,setScoringIdx]=useState(null);
  const [photoMeta,setPhotoMeta]=useState([]); // [{url,score}] parallel to form.photos
  const [form,setForm]=useState({title:"",location:"",propertyType:"",listingType:"",price:"",sizesqft:"",bedrooms:"",bathrooms:"",toilets:"",furnishingStatus:"",condition:"",builtYear:"",modernKitchen:"",wcType:"",superBuiltUp:"",carpetArea:"",parkingType:"",vastuDirection:"",totalFloors:"",propertyFloor:"",maintenance:"",societyFormed:"",ocReceived:"",reraRegistered:"",reraNumber:"",description:"",aiDescription:"",highlights:[],status:"Active",agentName:currentUser?.name||"",agentPhone:currentUser?.phone||"",agencyName:currentUser?.agencyName||"",agentEmail:currentUser?.email||"",photos:[]});
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
      if (!listingAiConfigured()) {
        setAiStatus("idle");
        setAiPick(null);
        setCoverIdx(0);
        showToast("Photos uploaded ✓ (set VITE_LISTING_AI_URL + listing-ai function for AI cover pick)","success");
        return;
      }
      // 2. Silently score all unscored photos
      setAiStatus("analyzing");
      const scored=[...allMeta];
      for(let i=0;i<scored.length;i++){
        if(scored[i].score) continue;
        setScoringIdx(i);
        const result=await scorePhotoWithListingAi(supabase,scored[i].base64,scored[i].mediaType);
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
        const row = formToDb(form, currentUser.id);
        const { data: inserted, error } = await supabase.from("listings").insert(row).select("id").single();
        if (error) throw error;
        if (inserted?.id && listingAiConfigured()) {
          const aiText = await generateListingAiDescription(supabase, form);
          if (aiText) {
            const mergedDetails = { ...(row.details || {}), aiDescription: aiText };
            const { error: patchErr } = await supabase.from("listings").update({ details: mergedDetails }).eq("id", inserted.id);
            if (patchErr) console.warn("AI description save:", patchErr);
          }
        }
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
        <h3 style={{margin:"0 0 10px",fontSize:12,fontWeight:700,color:"var(--green)",textTransform:"uppercase",letterSpacing:1,borderBottom:"1px solid var(--border)",paddingBottom:9}}>✨ AI property summary</h3>
        <p style={{margin:"0 0 14px",fontSize:13,color:"var(--muted)",lineHeight:1.5}}>Shown on the public property page. New listings get a draft automatically when <code style={{fontSize:12,background:"var(--cream)",padding:"2px 6px",borderRadius:4}}>VITE_LISTING_AI_URL</code> points at your deployed listing-ai edge function.</p>
        {form.aiDescription ? (
          <textarea value={form.aiDescription} onChange={(e) => set("aiDescription", e.target.value)} className="inp" rows={5} style={{resize:"vertical",marginBottom:12,fontSize:14,lineHeight:1.55}} placeholder="AI-generated summary…" />
        ) : (
          <p style={{margin:"0 0 12px",fontSize:13,color:"var(--muted)"}}>No summary yet. Generate one below, or publish a new listing with the API key configured.</p>
        )}
        <div style={{display:"flex",flexWrap:"wrap",gap:10,alignItems:"center"}}>
          <button
            type="button"
            className="btn-green"
            style={{padding:"10px 18px",borderRadius:10,fontSize:13,opacity:listingAiConfigured()?1:0.55}}
            disabled={aiDescBusy || !listingAiConfigured()}
            onClick={async () => {
              if (!listingAiConfigured()) { showToast("Set VITE_LISTING_AI_URL and deploy the listing-ai Supabase function", "error"); return; }
              setAiDescBusy(true);
              try {
                const t = await generateListingAiDescription(supabase, form);
                if (t) {
                  set("aiDescription", t);
                  showToast(isEdit ? "Summary ready — tap Save to update the listing" : "Summary ready — it will be saved when you create the listing", "success");
                } else showToast("Could not generate summary", "error");
              } finally {
                setAiDescBusy(false);
              }
            }}
          >
            {aiDescBusy ? "Generating…" : form.aiDescription ? "Regenerate" : "Generate now"}
          </button>
          {!listingAiConfigured() ? <span style={{fontSize:12,color:"var(--muted)"}}>Listing AI URL not configured</span> : null}
        </div>
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
          {aiStatus==="analyzing"&&<span style={{display:"flex",alignItems:"center",gap:6,fontSize:11,color:"var(--primary)",fontWeight:600,textTransform:"none",letterSpacing:0}}><span className="spin"/>AI picking best cover…</span>}
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
                {isScoring&&<div style={{position:"absolute",inset:0,borderRadius:8,background:"rgba(26,26,26,0.1)",display:"flex",alignItems:"center",justifyContent:"center"}}><span className="spin"/></div>}
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
                <div>{new Date().toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</div>
                <div style={{marginTop:4,fontWeight:600}}>Brochure header preview</div>
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

const Feed = ({currentUser,showToast,onNavigate,onOpenProperty}) => {
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [savedIds,setSavedIds]=useState(currentUser?.savedListings||[]);const [filters,setFilters]=useState({search:"",propertyType:"",listingType:"",city:"",minPrice:"",maxPrice:"",bedrooms:"",furnishing:""});const [sort,setSort]=useState("newest");const [open,setOpen]=useState(false);
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
        <SkylineHeroBackdrop tone="soft" />
        <div className="feed-page-hero-inner" style={{maxWidth:700,margin:"0 auto",position:"relative",zIndex:1,textAlign:"center"}}>
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
            {filtered.map(l=><PropCard key={l.id} listing={l} currentUser={currentUser} savedIds={savedIds} onSave={handleSave} onView={onOpenProperty}/>)}
          </div>
        )}
      </div>
    </div>
  );
};

/** Off-screen WA card for homepage PNG export (layout aligned with WACardModal). */
const HomeSampleWaCardForExport = ({ listing, cardId }) => {
  const price = fmtP(listing.price);
  const details = [listing.bedrooms>0?`🛏 ${listing.bedrooms} Bed${listing.bedrooms>1?"s":""}`:null,listing.bathrooms>0?`🚿 ${listing.bathrooms} Bath${listing.bathrooms>1?"s":""}`:null,listing.sizesqft?`📐 ${listing.sizesqft} sqft`:null,listing.furnishingStatus?`🛋 ${listing.furnishingStatus}`:null].filter(Boolean);
  const cardW = 420;
  const cardH = 420;
  return (
    <div id={cardId} style={{width:cardW,height:cardH,borderRadius:20,overflow:"hidden",boxShadow:"0 32px 80px rgba(0,0,0,0.7)",position:"relative",flexShrink:0,background:"#1a1410"}}>
      {listing.photos?.[0]
        ?<img src={listing.photos[0]} alt="" style={{position:"absolute",inset:0,width:"100%",height:"100%",objectFit:"cover"}}/>
        :<div style={{position:"absolute",inset:0,background:"linear-gradient(135deg,#2d2118,#1a1410)",display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{fontSize:72,opacity:0.08}}>🏠</div></div>
      }
      <div style={{position:"absolute",inset:0,background:"linear-gradient(to bottom,rgba(0,0,0,0.18) 0%,rgba(0,0,0,0.05) 35%,rgba(10,5,2,0.92) 68%,rgba(10,5,2,1) 100%)"}}/>
      <div style={{position:"absolute",top:16,left:16,right:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{background:"var(--primary)",color:"#fff",fontSize:11,fontWeight:800,padding:"5px 12px",borderRadius:20,letterSpacing:"0.5px"}}>FOR {listing.listingType?.toUpperCase()}</span>
        <div style={{background:"rgba(0,0,0,0.5)",backdropFilter:"blur(8px)",border:"1px solid rgba(255,255,255,0.15)",borderRadius:10,padding:"5px 10px",display:"flex",alignItems:"center",justifyContent:"center",minHeight:26,minWidth:40}} aria-hidden />
      </div>
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
        {!hasAgentBrand ? (
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"'Fraunces',serif",fontSize:13,fontWeight:800,color:"#ccc"}}>Northing</div>
            <div style={{fontSize:10,color:"#ccc"}}>Powered by Northing</div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** Pollinations.ai — prompt-based illustrative images for sample cards (results vary by request). */
const sampleOutputAiImageUrl = (prompt, w, h) =>
  `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=${w}&height=${h}&nologo=true&seed=42`;

const SAMPLE_CARD_AI_IMAGES = {
  sale: sampleOutputAiImageUrl(
    "photorealistic luxury Indian apartment living room interior for sale real estate hero photo warm golden hour soft light square composition no text no watermark",
    640,
    640
  ),
  rent: sampleOutputAiImageUrl(
    "photorealistic bright rental apartment living space India city daylight welcoming real estate photography square composition no text no watermark",
    640,
    640
  ),
  pdf: sampleOutputAiImageUrl(
    "elegant property brochure documents flat lay on marble desk professional real estate marketing top view soft shadow warm palette stylized no legible text",
    640,
    640
  ),
};

/** Stable placeholders when Pollinations or CDN fails (seeded picsum). */
const SAMPLE_CARD_IMAGE_FALLBACK = {
  sale: "https://picsum.photos/seed/northing-wa-sale-v3/640/640",
  rent: "https://picsum.photos/seed/northing-wa-rent-v3/640/640",
  pdf: "https://picsum.photos/seed/northing-pdf-hero-v3/640/640",
};

/** AI hero image composited with WA-style overlay (same visual language as exported card). */
const HomeSampleWaMockPreview = ({ listing, aiSrc, variant }) => {
  const [imgTier, setImgTier] = useState(0);
  const price = fmtP(listing.price);
  const src = imgTier === 0 ? aiSrc : SAMPLE_CARD_IMAGE_FALLBACK[variant];
  return (
    <div className="home-sample-wa-mock">
      {imgTier < 2 ? (
        <img
          src={src}
          alt=""
          className="home-sample-wa-mock-img"
          width={640}
          height={640}
          loading="eager"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={() => setImgTier((t) => t + 1)}
        />
      ) : (
        <div className="home-sample-wa-mock-fallback" aria-hidden />
      )}
      <div className="home-sample-wa-mock-scrim" aria-hidden />
      <div className="home-sample-wa-mock-row">
        <span className="home-sample-wa-mock-pill">FOR {listing.listingType?.toUpperCase() || "SALE"}</span>
      </div>
      <div className="home-sample-wa-mock-bottom">
        <div className="home-sample-wa-mock-price">
          {price}
          {listing.listingType === "Rent" && <span>/mo</span>}
        </div>
        <div className="home-sample-wa-mock-ttl">{listing.title}</div>
        <div className="home-sample-wa-mock-loc">📍 {listing.location}</div>
      </div>
    </div>
  );
};

/** AI image as brochure cover strip over a paper mock. */
const HomeSamplePdfMockPreview = ({ aiSrc }) => {
  const [imgTier, setImgTier] = useState(0);
  const src = imgTier === 0 ? aiSrc : SAMPLE_CARD_IMAGE_FALLBACK.pdf;
  return (
    <div className="home-sample-pdf-mock">
      <div className="home-sample-pdf-mock-hero">
        {imgTier < 2 ? (
          <img
            src={src}
            alt=""
            className="home-sample-pdf-mock-img"
            width={640}
            height={640}
            loading="eager"
            decoding="async"
            referrerPolicy="no-referrer"
            onError={() => setImgTier((t) => t + 1)}
          />
        ) : (
          <div className="home-sample-pdf-mock-fallback" aria-hidden />
        )}
        <div className="home-sample-pdf-mock-hero-scrim" aria-hidden />
        <span className="home-sample-pdf-mock-label">Brochure preview</span>
      </div>
      <div className="home-sample-pdf-mock-body" aria-hidden>
        <div className="home-sample-pdf-mock-line" />
        <div className="home-sample-pdf-mock-line short" />
        <div className="home-sample-pdf-mock-line short" />
      </div>
    </div>
  );
};

const SAMPLE_OUTPUT_MODAL = {
  sale: {
    title: "Sale WhatsApp card",
    tagline: "A single square graphic for every for-sale listing—readable at a glance in chat.",
    benefits: [
      "Price, location, and key specs are visible without opening a link.",
      "Your agency chip stays visible so every forward carries your brand.",
      "Styling aligns with your PDF brochure so online and offline materials feel unified.",
    ],
    process: [
      "Create or open a for-sale listing in your Northing dashboard.",
      "We compose the hero photo, price strip, spec chips, and broker line into the standard layout.",
      "Share the image to WhatsApp, Instagram, or save it for print handouts.",
    ],
  },
  rent: {
    title: "Rent WhatsApp card",
    tagline: "Monthly rent, deposit, and context in one shareable square—same format as your sale cards.",
    benefits: [
      "Rent per month and locality read clearly on small phone screens.",
      "Furnishing and BHK chips answer the first questions seekers ask.",
      "A consistent layout with sale cards keeps your social feed looking professional.",
    ],
    process: [
      "Set listing type to Rent and enter rent, deposit, and property details.",
      "Northing generates the rent-specific card with /mo pricing and location.",
      "Share to seekers or post to your team channels from the listing.",
    ],
  },
  pdf: {
    title: "PDF brochure",
    tagline: "Print-ready A4 pages with your branding, structured specs, and space for photos and maps.",
    benefits: [
      "Clients receive a formal document for high-stakes decisions—not only a chat screenshot.",
      "Agency header, reference codes, and fields match how Indian brokers present stock.",
      "One export from the same listing data that powers WhatsApp cards—no duplicate entry.",
    ],
    process: [
      "Complete listing details and upload photos in the dashboard.",
      "Generate PDF; we merge branding, copy, and specs into the brochure template.",
      "Download or share for site visits, bank packets, or NRI clients.",
    ],
  },
};

const Home = ({currentUser,onNavigate,onOpenProperty}) => {
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);
  const [filter,setFilter]=useState({type:"",listing:"",location:"",minPrice:"",maxPrice:"",bedrooms:"",bathrooms:""});
  const priceMode=!filter.listing?"":filter.listing==="Rent"?"rent":"sale";
  const minPriceOpts=priceMode==="rent"?["5000","10000","15000","20000","25000","30000","40000","50000","75000","100000","150000","200000"]:["500000","1000000","2000000","3000000","5000000","7500000","10000000","20000000","50000000"];
  const maxPriceOpts=priceMode==="rent"?["15000","20000","25000","30000","40000","50000","75000","100000","150000","200000","300000","500000","750000","1000000"]:["1000000","2000000","3000000","5000000","7500000","10000000","20000000","50000000","100000000"];
  const fmtPriceOpt=(v)=>priceMode==="rent"?`${fmtP(v)} /mo`:fmtP(v);
  const [waListing,setWAListing]=useState(null);const [pdfListing,setPdfListing]=useState(null);
  const [sampleDetailModal,setSampleDetailModal]=useState(null);
  const [homeSampleDl,setHomeSampleDl]=useState(null);
  const runHomeSampleSalePng=async()=>{
    setHomeSampleDl("sale");
    try{await downloadHtmlElementAsPngById("home-sample-wa-sale","northing-sample-sale-card.png");}
    catch(e){alert("Could not download the sample card. Please try again.");}
    setHomeSampleDl(null);
  };
  const runHomeSampleRentPng=async()=>{
    setHomeSampleDl("rent");
    try{await downloadHtmlElementAsPngById("home-sample-wa-rent","northing-sample-rent-card.png");}
    catch(e){alert("Could not download the sample card. Please try again.");}
    setHomeSampleDl(null);
  };
  const runHomeSamplePdf=async()=>{
    setHomeSampleDl("pdf");
    try{await exportElementToPdfById("home-pdf-sample-print","northing-sample-brochure");}
    catch(e){alert("Could not generate the sample PDF. Please try again.");}
    setHomeSampleDl(null);
  };
  useEffect(()=>{
    if(!sampleDetailModal) return;
    const onKey=(e)=>{if(e.key==="Escape") setSampleDetailModal(null);};
    window.addEventListener("keydown",onKey);
    return()=>window.removeEventListener("keydown",onKey);
  },[sampleDetailModal]);
  const [homeQsOpen,setHomeQsOpen]=useState(false);
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
  const heroTabActive = filter.type === "Commercial" ? "commercial" : filter.listing === "Rent" ? "rent" : "buy";
  const setHeroTab = (tab) => {
    if (tab === "commercial") setFilter((f) => ({ ...f, type: "Commercial" }));
    else if (tab === "rent") setFilter((f) => ({ ...f, listing: "Rent", type: "" }));
    else setFilter((f) => ({ ...f, listing: "Sale", type: "" }));
  };
  const heroSectionRef = useRef(null);
  const heroParallaxIllustrationRef = useRef(null);
  const heroParallaxInnerRef = useRef(null);
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return () => {};
    const mqRm = window.matchMedia("(prefers-reduced-motion: reduce)");
    let raf = 0;
    const clearParallax = () => {
      cancelAnimationFrame(raf);
      const ill = heroParallaxIllustrationRef.current;
      const inner = heroParallaxInnerRef.current;
      if (ill) {
        ill.style.removeProperty("transform");
        ill.style.removeProperty("top");
        ill.style.removeProperty("bottom");
      }
      if (inner) inner.style.removeProperty("transform");
    };
    const tick = () => {
      if (mqRm.matches) return;
      const sec = heroSectionRef.current;
      const ill = heroParallaxIllustrationRef.current;
      const inner = heroParallaxInnerRef.current;
      if (!sec || !ill) return;
      const narrow = window.matchMedia("(max-width: 768px)").matches;
      if (narrow) {
        ill.style.removeProperty("top");
        ill.style.removeProperty("bottom");
        if (inner) inner.style.removeProperty("transform");
        return;
      }
      const rect = sec.getBoundingClientRect();
      const y = -rect.top;
      const bgFactor = 0.14;
      const innerFactor = -0.045;
      const bgShift = y * bgFactor;
      ill.style.removeProperty("transform");
      ill.style.top = `${bgShift}px`;
      ill.style.bottom = `${-bgShift}px`;
      if (inner) inner.style.transform = `translate3d(0, ${y * innerFactor}px, 0)`;
    };
    const onScroll = () => {
      if (mqRm.matches) return;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(tick);
    };
    const bindParallax = () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      clearParallax();
      if (mqRm.matches) return;
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onScroll, { passive: true });
      tick();
    };
    const onMq = () => bindParallax();
    mqRm.addEventListener("change", onMq);
    bindParallax();
    return () => {
      mqRm.removeEventListener("change", onMq);
      clearParallax();
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
      <section ref={heroSectionRef} className="h1big-hero home-hero-section home-hero-section--light" style={{position:"relative",width:"100%",maxWidth:"100%",overflow:"hidden"}}>
        <div ref={heroParallaxIllustrationRef} className="home-hero-parallax-bg home-hero-parallax-bg--illustration" aria-hidden="true">
          <HomeHeroIllustration variant="homeHero" />
        </div>
        <div className="home-hero-overlay home-hero-overlay--light" aria-hidden="true" />
        <div ref={heroParallaxInnerRef} className="home-hero-inner home-hero-parallax-inner">
          <div className="home-hero-copy">
            <h1 className="home-hero-headline">
              <span className="home-hero-headline-line home-hero-headline-line--sans">Northing to your</span>
              <span className="home-hero-headline-line home-hero-headline-line--serif">dream home</span>
            </h1>
            <div className="home-hero-actions">
              <button type="button" onClick={()=>onNavigate("feed")} className="home-hero-cta home-hero-cta--primary">🏠 Browse Properties</button>
              <button type="button" onClick={()=>onNavigate(currentUser?"dashboard":"login")} className="home-hero-cta home-hero-cta--secondary">📋 List Your Property</button>
            </div>
          </div>
        </div>
        <div className="home-hero-qs-dock">
          <button type="button" className="home-hero-qs-toggle" id="home-hero-qs-toggle" aria-expanded={homeQsOpen} aria-controls="home-hero-qs-panel" onClick={()=>setHomeQsOpen((v)=>!v)}>
            <span className="home-hero-qs-toggle-icon" aria-hidden>🔍</span>
            <span>Quick search</span>
            <span className="home-hero-qs-toggle-chevron" aria-hidden>{homeQsOpen?"▲":"▼"}</span>
          </button>
          <div className={"home-hero-qs-panel"+(homeQsOpen?" home-hero-qs-panel--open":"")} id="home-hero-qs-panel" role="region" aria-labelledby="home-hero-qs-toggle" aria-hidden={!homeQsOpen}>
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
                    <button type="button" onClick={()=>{ document.getElementById("prop-grid")?.scrollIntoView({behavior:"smooth"}); setHomeQsOpen(false); }} className="btn-primary home-qs-submit" style={{border:"none"}}>Search Properties</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <nav className="home-section-subnav" aria-label="On this page">
        <div className="home-section-subnav-inner">
          <a href="#prop-grid">Featured</a>
          <a href="#home-sample-outputs">Samples</a>
          <a href="#home-band-split">List &amp; agents</a>
          <a href="#home-testimonials">Trust</a>
        </div>
      </nav>
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
              <div key={l.id} className="card glass-card home-listing-card" style={{overflow:"hidden"}} onClick={()=>onOpenProperty(l)} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" ") { e.preventDefault(); onOpenProperty(l); }}}>
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
      <SkylineRibbon variant="light" />
      <section id="home-sample-outputs" className="home-sample-pane" aria-labelledby="home-sample-outputs-heading">
        <div className="home-sample-pane-bg-artifacts" aria-hidden="true">
          <SkylineHeroBackdrop tone="soft" />
          <div className="home-sample-pane-bg-orb home-sample-pane-bg-orb--a" />
          <div className="home-sample-pane-bg-orb home-sample-pane-bg-orb--b" />
        </div>
        <div className="home-sample-pane-inner">
          <div className="home-sample-pane-shell">
            <header className="home-sample-pane-head">
              <p className="home-sample-pane-eyebrow">Sample outputs</p>
              <h2 id="home-sample-outputs-heading" className="home-sample-pane-title">Get a taste of what Northing builds</h2>
            </header>
          </div>
          <div className="home-sample-pane-grid-outer">
            <div className="home-sample-pane-grid">
              <div className="home-sample-pane-card-wrap" id="home-sample-card-sale">
                <div className="home-sample-pane-card home-sample-pane-card--stack">
                  <button type="button" className="home-sample-pane-card-open" onClick={()=>setSampleDetailModal("sale")} aria-label="Sale WhatsApp card — details, benefits, and download">
                    <HomeSampleWaMockPreview listing={HOME_SAMPLE_BROCHURE} aiSrc={SAMPLE_CARD_AI_IMAGES.sale} variant="sale" />
                    <span className="home-sample-pane-card-title">Sale card</span>
                    <span className="home-sample-pane-card-desc">Tap for details — download is in the panel below.</span>
                  </button>
                </div>
              </div>
              <div className="home-sample-pane-card-wrap" id="home-sample-card-rent">
                <div className="home-sample-pane-card home-sample-pane-card--stack">
                  <button type="button" className="home-sample-pane-card-open" onClick={()=>setSampleDetailModal("rent")} aria-label="Rent WhatsApp card — details, benefits, and download">
                    <HomeSampleWaMockPreview listing={HOME_SAMPLE_RENT} aiSrc={SAMPLE_CARD_AI_IMAGES.rent} variant="rent" />
                    <span className="home-sample-pane-card-title">Rent card</span>
                    <span className="home-sample-pane-card-desc">Tap for details — download is in the panel below.</span>
                  </button>
                </div>
              </div>
              <div className="home-sample-pane-card-wrap" id="home-sample-card-pdf">
                <div className="home-sample-pane-card home-sample-pane-card--stack">
                  <button type="button" className="home-sample-pane-card-open" onClick={()=>setSampleDetailModal("pdf")} aria-label="PDF brochure — details, benefits, and download">
                    <HomeSamplePdfMockPreview aiSrc={SAMPLE_CARD_AI_IMAGES.pdf} />
                    <span className="home-sample-pane-card-title" id="home-pdf-sample-heading">PDF brochure</span>
                    <span className="home-sample-pane-card-desc">Tap for details — download is in the panel below.</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
          <div aria-hidden="true">
            <div style={{position:"fixed",left:-9999,top:0,width:420,height:420,overflow:"hidden",pointerEvents:"none"}}>
              <HomeSampleWaCardForExport listing={HOME_SAMPLE_BROCHURE} cardId="home-sample-wa-sale" />
            </div>
            <div style={{position:"fixed",left:-9999,top:480,width:420,height:420,overflow:"hidden",pointerEvents:"none"}}>
              <HomeSampleWaCardForExport listing={HOME_SAMPLE_RENT} cardId="home-sample-wa-rent" />
            </div>
            <div style={{position:"fixed",left:-9999,top:960,width:720,pointerEvents:"none"}}>
              <HomePdfSamplePrint />
            </div>
          </div>
        </div>
      </section>
      
      <section id="home-band-split" className="home-band-split">
        <SkylineRibbon variant="band" />
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
      <section id="home-testimonials" className="home-band-cta">
        <div style={{position:"absolute",top:-100,right:-60,width:380,height:380,borderRadius:"50%",background:"radial-gradient(circle, rgba(26,26,26,0.06) 0%, transparent 68%)",pointerEvents:"none"}} />
        <div style={{position:"absolute",bottom:-80,left:-40,width:340,height:340,borderRadius:"50%",background:"radial-gradient(circle, rgba(15,23,42,0.05) 0%, transparent 72%)",pointerEvents:"none"}} />
        <SkylineRibbon variant="trust" />
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
      <footer className="glass-footer" style={{padding:"clamp(28px,4vw,44px) 0",position:"relative",overflow:"hidden"}}>
        <SkylineRibbon variant="footer" />
        <div style={{position:"absolute",inset:0,background:"linear-gradient(180deg, rgba(15,23,42,0.5) 0%, rgba(15,23,42,0.92) 100%)",pointerEvents:"none",zIndex:1}} />
        <div className="home-footer-inner" style={{flexDirection:"column",alignItems:"stretch",gap:20,position:"relative",zIndex:2}}>
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
      {waListing&&<ErrorBoundary><WACardModal listing={waListing} onClose={()=>setWAListing(null)} currentUser={currentUser}/></ErrorBoundary>}
      {pdfListing&&<ErrorBoundary><PDFModal listing={pdfListing} onClose={()=>setPdfListing(null)} currentUser={currentUser}/></ErrorBoundary>}
      {sampleDetailModal&&(
        <div className="home-sample-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="home-sample-modal-title" onClick={()=>setSampleDetailModal(null)}>
          <div className="home-sample-modal-panel" onClick={e=>e.stopPropagation()}>
            <button type="button" className="home-sample-modal-close" onClick={()=>setSampleDetailModal(null)} aria-label="Close">×</button>
            <div className="home-sample-modal-scroll">
              <h3 id="home-sample-modal-title">{SAMPLE_OUTPUT_MODAL[sampleDetailModal].title}</h3>
              <p className="home-sample-modal-tag">{SAMPLE_OUTPUT_MODAL[sampleDetailModal].tagline}</p>
              <h4>Benefits</h4>
              <ul>{SAMPLE_OUTPUT_MODAL[sampleDetailModal].benefits.map((b,i)=><li key={i}>{b}</li>)}</ul>
              <h4>How it works in Northing</h4>
              <ul>{SAMPLE_OUTPUT_MODAL[sampleDetailModal].process.map((p,i)=><li key={i}>{p}</li>)}</ul>
            </div>
            <div className="home-sample-modal-dl">
              <button
                type="button"
                className="home-sample-modal-dl-btn"
                disabled={homeSampleDl!==null}
                onClick={()=>{
                  if(sampleDetailModal==="sale") runHomeSampleSalePng();
                  else if(sampleDetailModal==="rent") runHomeSampleRentPng();
                  else runHomeSamplePdf();
                }}
              >
                {homeSampleDl!==null ? "Preparing…" : sampleDetailModal==="pdf" ? "⬇ Download sample report (PDF)" : "⬇ Download sample WhatsApp card (PNG)"}
              </button>
            </div>
          </div>
        </div>
      )}
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
            <button onClick={()=>window.location.reload()} style={{background:"#1a1a1a",color:"#fff",border:"none",padding:"12px 28px",borderRadius:10,fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>↺ Reload App</button>
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

/** Narrow carousel with prev/next, dots + swipe for /property/:id */
const PropertyDetailCarousel = ({ photos, title }) => {
  const list = Array.isArray(photos) && photos.length > 0 ? photos : [];
  const [idx, setIdx] = useState(0);
  const touchStart = useRef(null);
  const go = (d) => {
    if (list.length === 0) return;
    setIdx((i) => Math.max(0, Math.min(list.length - 1, i + d)));
  };
  useEffect(() => { setIdx(0); }, [photos]);
  return (
    <div className="property-detail-carousel-shell">
      <div
        className="property-detail-carousel-outer"
        onTouchStart={(e) => { touchStart.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchStart.current == null) return;
          const dx = e.changedTouches[0].clientX - touchStart.current;
          touchStart.current = null;
          if (dx > 50) go(-1);
          else if (dx < -50) go(1);
        }}
      >
        {list.length > 1 ? (
          <>
            <button type="button" className="property-detail-carousel-btn property-detail-carousel-btn--prev" aria-label="Previous photo" disabled={idx <= 0} onClick={() => go(-1)}>
              ‹
            </button>
            <button type="button" className="property-detail-carousel-btn property-detail-carousel-btn--next" aria-label="Next photo" disabled={idx >= list.length - 1} onClick={() => go(1)}>
              ›
            </button>
          </>
        ) : null}
        <div className="property-detail-carousel-track" style={{ transform: `translateX(-${idx * 100}%)` }}>
          {list.length === 0 ? (
            <div className="property-detail-carousel-slide">
              <div className="property-detail-carousel-ph" aria-hidden>🏠</div>
            </div>
          ) : (
            list.map((src, i) => (
              <div key={i} className="property-detail-carousel-slide">
                <img src={src} alt={i === 0 ? (title || "Property") : ""} loading={i === 0 ? "eager" : "lazy"} decoding="async" />
              </div>
            ))
          )}
        </div>
      </div>
      {list.length > 1 ? (
        <div className="property-detail-dots" role="tablist" aria-label="Photos">
          {list.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              aria-selected={i === idx}
              aria-label={`Photo ${i + 1}`}
              className={"property-detail-dot" + (i === idx ? " property-detail-dot--active" : "")}
              onClick={() => setIdx(i)}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
};

const PropertyPublicPage = ({ id }) => {
  const goHome = () => { window.location.href = "/"; };
  const goBack = () => {
    try {
      const target = sessionStorage.getItem(PROPERTY_BACK_STORAGE_KEY);
      if (target) {
        sessionStorage.removeItem(PROPERTY_BACK_STORAGE_KEY);
        window.location.assign(target);
        return;
      }
    } catch { /* ignore */ }
    if (window.history.length > 1) window.history.back();
    else goHome();
  };
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [waListing, setWaListing] = useState(null);
  const [pdfListing, setPdfListing] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const viewerBrand = useViewerBrandProfile();
  const agentBrand = useListingAgentBrand(listing, null);
  useEffect(() => { _h.openWA = (l) => setWaListing(l); _h.openPDF = (l) => setPdfListing(l); _h.openKit = () => {}; }, []);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase.from("listings").select("*").eq("id", id).single();
      if (cancelled) return;
      setListing(mapListing(data));
      setLoading(false);
      if (data?.id) {
        track(data.id, "pageview");
        track(data.id, "view");
      }
    })();
    return () => { cancelled = true; };
  }, [id]);
  useEffect(() => { setDescExpanded(false); }, [id]);
  useEffect(() => {
    if (listing) window.scrollTo(0, 0);
  }, [listing?.id]);

  const contactBroker = () => {
    if (!listing?.agentPhone) return;
    const digits = String(listing.agentPhone).replace(/\D/g, "");
    if (digits.length >= 10) window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
    else window.location.href = `tel:${listing.agentPhone}`;
  };

  if (loading) {
    return (
      <div className="property-detail-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" }}>
        <style>{G}</style>
        <div style={{ textAlign: "center", color: "#64748b" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏠</div>
          <div style={{ fontWeight: 600 }}>Loading property…</div>
        </div>
      </div>
    );
  }
  if (!listing) {
    return (
      <div className="property-detail-page" style={{ display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Inter',sans-serif" }}>
        <style>{G}</style>
        <div style={{ textAlign: "center", color: "#64748b", padding: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
          <div style={{ fontWeight: 700, fontSize: 18, color: "#1a1a1a", marginBottom: 16 }}>Property not found</div>
          <button type="button" onClick={goBack} className="property-detail-back">← Go back</button>
        </div>
      </div>
    );
  }

  const desc = (listing.description || "").trim();
  const descLong = desc.length > 280;
  const descShown = descExpanded || !descLong ? desc : `${desc.slice(0, 280).trim()}…`;

  const chips = [];
  if (listing.bedrooms) chips.push({ icon: "🛏", label: `${listing.bedrooms} BHK` });
  if (listing.carpetArea) chips.push({ icon: "📐", label: `Carpet ${listing.carpetArea} sqft` });
  if (listing.propertyFloor !== undefined && listing.propertyFloor !== null && listing.propertyFloor !== "") chips.push({ icon: "🏢", label: `Floor ${listing.propertyFloor}` });
  if (listing.parkingType) chips.push({ icon: "🅿", label: String(listing.parkingType) });
  if (listing.propertyType) chips.push({ icon: "🏠", label: listing.propertyType });
  if (listing.vastuDirection) chips.push({ icon: "🧭", label: `Facing ${listing.vastuDirection}` });

  const brokerInitial = (listing.agentName || "?").charAt(0).toUpperCase();

  return (
    <div className="property-detail-page" style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{G}</style>
      <header className="property-detail-topbar">
        <button type="button" className="property-detail-back" onClick={goBack} aria-label="Back">
          ← Back
        </button>
        <img className="property-detail-logo" src="/northing-logo.svg" alt="Northing" onClick={goHome} />
      </header>

      <PropertyDetailCarousel photos={listing.photos} title={listing.title} />

      <div className="property-detail-main">
        <h1 className="property-detail-title">{listing.title}</h1>
        <p className="property-detail-loc">📍 {listing.location}</p>
        <p className="property-detail-price">
          {fmtP(listing.price)}
          {listing.listingType === "Rent" ? <span className="property-detail-price-unit">/month</span> : null}
        </p>

        {chips.length > 0 ? (
          <div className="property-detail-chip-row" aria-label="Key details">
            {chips.map((c) => (
              <span key={c.label} className="property-detail-chip">
                <span aria-hidden>{c.icon}</span>
                {c.label}
              </span>
            ))}
          </div>
        ) : null}

        {listing.aiDescription ? (
          <div className="property-detail-ai" aria-labelledby="property-ai-heading">
            <h2 id="property-ai-heading" className="property-detail-ai-title">
              AI summary
            </h2>
            <p className="property-detail-ai-text">{listing.aiDescription}</p>
            <p className="property-detail-ai-note">This text is auto-generated for readability. Always confirm details with the broker.</p>
          </div>
        ) : null}

        {desc ? (
          <>
            <p className="property-detail-desc">{descShown}</p>
            {descLong ? (
              <button type="button" className="property-detail-desc-toggle" onClick={() => setDescExpanded((e) => !e)}>
                {descExpanded ? "Show less" : "Read more"}
              </button>
            ) : null}
          </>
        ) : null}

        <div className="property-detail-actions">
          <button type="button" className="btn-outline" onClick={() => showWACard(listing)}>
            <WALogo size={16} /> Download WhatsApp Card
          </button>
          <button type="button" className="btn-outline" onClick={() => showPDF(listing)}>
            📄 Download PDF
          </button>
          <button type="button" className="btn-primary" onClick={contactBroker} disabled={!listing.agentPhone}>
            Contact Broker
          </button>
        </div>

        <section className="property-detail-broker" aria-labelledby="property-broker-heading">
          <h2 id="property-broker-heading" className="section-label" style={{ marginBottom: 14 }}>
            Broker
          </h2>
          <div className="property-detail-broker-row">
            <div className="property-detail-broker-photo">
              {agentBrand?.logoUrl ? <img src={agentBrand.logoUrl} alt="" /> : brokerInitial}
            </div>
            <div>
              <p className="property-detail-broker-name">{listing.agentName || "Agent"}</p>
              <p className="property-detail-broker-meta">{listing.agencyName || "—"}</p>
            </div>
          </div>
          {listing.agentPhone ? (
            <p className="property-detail-broker-phone">
              📞 <a href={`tel:${listing.agentPhone.replace(/\s/g, "")}`}>{listing.agentPhone}</a>
            </p>
          ) : (
            <p className="property-detail-broker-meta" style={{ marginTop: 12 }}>Phone on request</p>
          )}
        </section>
      </div>

      <div className="property-detail-bottom-cta">
        <button type="button" className="btn-primary" onClick={contactBroker} disabled={!listing.agentPhone}>
          Contact Broker
        </button>
      </div>

      {waListing ? <WACardModal listing={waListing} onClose={() => setWaListing(null)} currentUser={viewerBrand} /> : null}
      {pdfListing ? <PDFModal listing={pdfListing} onClose={() => setPdfListing(null)} currentUser={viewerBrand} /> : null}
    </div>
  );
};

/** Public marketing landing page for shared links (e.g. from Marketing Kit). Distinct from /property/:id full listing page. */
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
  const [, bumpShellPath] = useReducer((x) => x + 1, 0);
  const openPropertyPage = (listing) => {
    if (!listing?.id) return;
    try {
      if (page === "feed") sessionStorage.setItem(PROPERTY_BACK_STORAGE_KEY, "/feed");
      else if (page === "home") sessionStorage.setItem(PROPERTY_BACK_STORAGE_KEY, "/");
      else sessionStorage.removeItem(PROPERTY_BACK_STORAGE_KEY);
    } catch { /* ignore */ }
    window.history.pushState(null, "", `/property/${listing.id}`);
    bumpShellPath();
  };
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
      {page==="home"&&<Home currentUser={user} onNavigate={nav} onOpenProperty={openPropertyPage}/>}
      {page==="privacy"&&<PrivacyPolicyPage onNavigate={nav}/>}
      {page==="terms"&&<TermsOfServicePage onNavigate={nav}/>}
      {page==="about"&&<AboutPage onNavigate={nav}/>}
      {page==="feed"&&<Feed currentUser={user} showToast={showToast} onNavigate={nav} onOpenProperty={openPropertyPage}/>}
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
