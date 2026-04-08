"use client";

import { useState, useEffect, useLayoutEffect, useRef, useReducer, Component } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import AuthLeftPanel from "./AuthLeftPanel.jsx";
import PrivacyPolicyPage from "../PrivacyPolicyPage.jsx";
import TermsOfServicePage from "../TermsOfServicePage.jsx";
import AboutPage from "../AboutPage.jsx";
import { HomeHeroIllustration, SkylineHeroBackdrop, SkylineRibbon } from "../SkylineIllustration.jsx";
import {
  listingAiConfigured,
  scorePhotoWithListingAi,
  generateListingAiDescription,
} from "../listingAi.js";
import { G } from "./globalStyles.js";
import { supabase } from "@/lib/supabaseClient";
import { fmtP } from "@/lib/formatPrice";
import { mapListing } from "@/lib/mapListing";
import { canCreateListing } from "@/lib/listingEligibility";
import { PROPERTY_BACK_STORAGE_KEY } from "./northingConstants.js";

export { PROPERTY_BACK_STORAGE_KEY };

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

const getPublicSiteBase = () => {
  try {
    const v = process.env.NEXT_PUBLIC_PUBLIC_SITE_URL;
    if (v && String(v).trim()) return String(v).replace(/\/$/, "");
  } catch (_) {}
  return typeof window !== "undefined" ? window.location.origin : "";
};
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
export const useListingAgentBrand = (listing, sessionProfile) => {
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

export const _h = { openWA: () => {}, openPDF: () => {}, openKit: () => {} };
const showWACard = (l) => _h.openWA(l);
const showPDF    = (l) => _h.openPDF(l);

export const track = async (listingId, type, platform = 'web', brokerId = null) => {
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

export const WALogo = ({size=16}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="#fff" style={{flexShrink:0}}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

export const Toast = ({msg,type,onClose}) => (
  <div className="asl" style={{position:"fixed",bottom:28,right:28,zIndex:9999,padding:"13px 18px",borderRadius:12,display:"flex",alignItems:"center",gap:10,maxWidth:340,fontSize:14,fontWeight:600,boxShadow:"0 8px 32px rgba(27,58,45,0.18)",background:type==="error"?"#FEF2F2":type==="success"?"#ECFDF5":"#EFF6FF",border:`1.5px solid ${type==="error"?"#FCA5A5":type==="success"?"#6EE7B7":"#BFDBFE"}`,color:type==="error"?"#DC2626":type==="success"?"#059669":"#1D4ED8"}}>
    <span>{type==="error"?"⚠️":type==="success"?"✅":"ℹ️"}</span>
    <span style={{flex:1}}>{msg}</span>
    <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",fontSize:18,opacity:0.5}}>×</button>
  </div>
);

const ConfirmModal = ({message,onConfirm,onCancel}) => (
  <div className="afd northing-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.45)",zIndex:4000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
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
  <div className="afd northing-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.4)",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)"}}>
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

const PropCard = ({listing,currentUser,savedIds,onSave,onView,onLoginRedirect}) => {
  const agentBrand = useListingAgentBrand(listing, currentUser);
  const wlLogo = agentBrand?.logoUrl || null;
  const isSaved = savedIds?.includes(listing.id);
  const verifiedBadge = listing.ownerAgentVerified === true;
  const statusColor = listing.status==="Active"?"#059669":listing.status==="Rented"?"#D97706":"#7C3AED";
  const statusBg = listing.status==="Active"?"#ECFDF5":listing.status==="Rented"?"#FFFBEB":"#F5F3FF";
  return (
    <div className="card" style={{overflow:"hidden",cursor:"pointer"}} onClick={()=>onView(listing)} role="button" tabIndex={0} onKeyDown={(e)=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();onView(listing);}}}>
      <div style={{height:195,position:"relative",background:"linear-gradient(135deg,#E8F5EE,#C2E8D4)",display:"flex",alignItems:"center",justifyContent:"center"}}>
        {listing.photos?.[0] ? <img src={listing.photos[0]} alt="" loading="lazy" decoding="async" style={{width:"100%",height:"100%",objectFit:"cover"}} /> : <div style={{fontSize:48,opacity:0.4}}>🏠</div>}
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
        <button
          type="button"
          onClick={e=>{
            e.stopPropagation();
            if(!currentUser){onLoginRedirect&&onLoginRedirect();return;}
            if(currentUser.role!=="user"){return;}
            onSave(listing.id);
          }}
          title={!currentUser?"Sign in to save":undefined}
          style={{position:"absolute",bottom:12,right:12,background:"rgba(255,255,255,0.92)",border:"none",borderRadius:"50%",width:34,height:34,cursor:"pointer",fontSize:16,boxShadow:"0 2px 8px rgba(0,0,0,0.15)",display:"flex",alignItems:"center",justifyContent:"center"}}
        >
          {!currentUser?"🤍":currentUser.role==="user"?(isSaved?"❤️":"🤍"):"🤍"}
        </button>
        <div style={{position:"absolute",bottom:12,left:12,fontSize:20,fontWeight:800,color:"#fff",textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>{fmtP(listing.price)}{listing.listingType==="Rent"&&<span style={{fontSize:12,fontWeight:500}}>/mo</span>}</div>
      </div>
      <div style={{padding:"16px 18px"}}>
        <h3 style={{fontSize:15,fontWeight:700,color:"var(--navy)",marginBottom:4,lineHeight:1.3}}>{listing.title}</h3>
              <div style={{fontSize:13,color:"var(--muted)",marginBottom:8}}>📍 {listing.location}</div>
        {verifiedBadge&&(
          <div style={{marginBottom:10}}>
            <span style={{fontSize:10,fontWeight:800,background:"#059669",color:"#fff",padding:"3px 8px",borderRadius:999,letterSpacing:0.02}}>✅ Verified Agent</span>
          </div>
        )}
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
    <div className="afd northing-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.35)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={onClose}>
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

export const WACardModal = ({listing,onClose,currentUser}) => {
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
    <div className="afd northing-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(10,5,2,0.75)",zIndex:3000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(8px)"}} onClick={onClose}>
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

export const PDFModal = ({listing,onClose,currentUser}) => {
  const agentBrand = useListingAgentBrand(listing, currentUser);
  const headerLogoSrc = agentBrand?.logoUrl || null;
  const [pdfLoading,setPdfLoading]=useState(false);
  const [mapSrc,setMapSrc]=useState(null);
  useEffect(()=>{if(listing?.id)track(listing.id,"pdf");},[listing?.id]);
  const gMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
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
    <div className="afd northing-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.55)",zIndex:12000,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(6px)"}} onClick={onClose}>
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

          {/* ── Location map: Static API if NEXT_PUBLIC_GOOGLE_MAPS_API_KEY (best for PDF capture); else free Google Maps embed (no API key) ── */}
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

export const useSecretAdmin = (cb) => {
  const c=useRef(0),t=useRef(null);
  return ()=>{c.current++;clearTimeout(t.current);t.current=setTimeout(()=>{c.current=0;},1500);if(c.current>=5){c.current=0;cb();}};
};

export const SecretAdminModal = ({onLogin,onClose,showToast}) => {
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
    <div className="afd northing-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(27,58,45,0.5)",zIndex:9998,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={onClose}>
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

export const LoginPage = ({ onLogin, showToast, onNavigate, initialMode = "login", redirectTo = "/dashboard", forcedMode = null }) => {
  const [mode, setMode] = useState(initialMode === "register" ? "register" : "login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const sessionHandledRef = useRef(false);
  const setF = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (forcedMode) return;
    setMode(initialMode === "register" ? "register" : "login");
  }, [initialMode, forcedMode]);
  const currentMode = forcedMode || mode;

  const insertProfileSafely = async (row) => {
    let candidate = { ...row };
    for (let i = 0; i < 4; i += 1) {
      const { error } = await supabase.from("profiles").insert(candidate);
      if (!error) return;
      const msg = String(error.message || "").toLowerCase();
      if (msg.includes("mobile_number")) {
        const next = { ...candidate };
        delete next.mobile_number;
        candidate = next;
        continue;
      }
      if (msg.includes("role") && msg.includes("null")) {
        candidate = { ...candidate, role: "user" };
        continue;
      }
      if (msg.includes("agent_verified") && msg.includes("null")) {
        candidate = { ...candidate, agent_verified: false };
        continue;
      }
      throw error;
    }
  };

  const finishSession = async (userId) => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user?.id === userId) {
      const { data: existing } = await supabase.from("profiles").select("id").eq("id", userId).maybeSingle();
      if (!existing) {
        const md = user.user_metadata || {};
        const phoneNational = md.phone ? String(md.phone).replace(/\D/g, "").slice(-10) : null;
        const r = ["user", "seller", "agent"].includes(md.role) ? md.role : "user";
        await insertProfileSafely({
          id: userId,
          name: md.full_name || md.name || user.email?.split("@")[0] || "User",
          email: user.email ?? null,
          role: r,
          phone: phoneNational,
          mobile_number: phoneNational,
          agency_name: null,
        });
      }
    }
    const { data: profile, error: pe } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (pe || !profile) throw new Error("Could not load your profile.");
    const savedRes = await supabase.from("saved_listings").select("listing_id").eq("user_id", userId);
    const savedIds = (savedRes.data || []).map((r) => r.listing_id);
    showToast(`Welcome back, ${profile.name}!`, "success");
    onLogin(
      {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        phone: profile.phone ?? profile.mobile_number,
        mobileNumber: profile.mobile_number ?? profile.phone,
        agencyName: profile.agency_name,
        logoUrl: profile.logo_url || null,
        agentAddress: profile.address || null,
        agentWebsite: profile.website || null,
        agentVerified: profile.agent_verified === true,
        plan: profile.plan || "free",
        reraNumber: profile.rera_number || null,
        city: profile.city || null,
        avatarUrl: profile.avatar_url || null,
        savedListings: savedIds,
      },
      redirectTo
    );
  };

  const submitLogin = async () => {
    if (!form.email?.trim() || !form.password) {
      showToast("Email and password required", "error");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: form.email.trim(),
        password: form.password,
      });
      if (error) throw error;
      await finishSession(data.user.id);
    } catch (err) {
      showToast(err.message || "Something went wrong", "error");
    }
    setLoading(false);
  };

  const submitRegister = async () => {
    if (!form.name?.trim() || !form.email?.trim()) {
      showToast("Full name and email are required", "error");
      return;
    }
    const phoneDigits = form.phone.replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      showToast("Enter a valid 10-digit Indian mobile number", "error");
      return;
    }
    if (form.password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    if (form.password !== form.confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }
    setLoading(true);
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const { data, error } = await supabase.auth.signUp({
        email: form.email.trim(),
        password: form.password,
        options: {
          data: {
            full_name: form.name.trim(),
            phone: phoneDigits,
            role_selected: false,
          },
          emailRedirectTo: `${origin}/login`,
        },
      });
      if (error) {
        const em = String(error.message || "").toLowerCase();
        if (em.includes("already registered") || em.includes("already been registered")) {
          showToast("Account already exists. Please sign in.", "error");
          onNavigate && onNavigate("login");
          setF("password", "");
          setF("confirmPassword", "");
          setLoading(false);
          return;
        }
        throw error;
      }
      if (data.session && data.user) {
        await insertProfileSafely({
          id: data.user.id,
          name: form.name.trim(),
          email: form.email.trim(),
          role: "user",
          phone: phoneDigits,
          mobile_number: phoneDigits,
          agency_name: null,
        });
        await finishSession(data.user.id);
      } else {
        showToast("Check your email to confirm your account, then sign in.", "success");
      }
    } catch (err) {
      showToast(err.message || "Sign up failed", "error");
    }
    setLoading(false);
  };

  const googleLogin = async () => {
    const configuredSiteUrl =
      (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
    const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
    const callbackBase = configuredSiteUrl || browserOrigin;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${callbackBase}/auth/callback`,
      },
    });
    if (error) showToast(error.message, "error");
  };

  const sendForgotPassword = async () => {
    if (!form.email?.trim()) {
      showToast("Enter your email in the field above", "error");
      return;
    }
    setLoading(true);
    try {
      const configuredSiteUrl =
        (process.env.NEXT_PUBLIC_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
      const browserOrigin = typeof window !== "undefined" ? window.location.origin : "";
      const callbackBase = configuredSiteUrl || browserOrigin;
      const { error } = await supabase.auth.resetPasswordForEmail(form.email.trim(), {
        redirectTo: `${callbackBase}/auth/confirm?next=${encodeURIComponent("/reset-password")}`,
      });
      if (error) throw error;
      showToast("Check your email for a password reset link.", "success");
    } catch (err) {
      showToast(err.message || "Could not send reset email", "error");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (sessionHandledRef.current) return;
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (cancelled || !session?.user) return;
      sessionHandledRef.current = true;
      try {
        await finishSession(session.user.id);
      } catch {
        sessionHandledRef.current = false;
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- run once on mount for OAuth redirect completion
  }, []);

  const orDivider = (
    <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "18px 0" }}>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
      <span style={{ fontSize: 12, color: "var(--muted)", fontWeight: 700 }}>or</span>
      <div style={{ flex: 1, height: 1, background: "var(--border)" }} />
    </div>
  );

  return (
    <div className="login-page" style={{ minHeight: "100vh", background: "var(--cream)", display: "flex", flexWrap: "nowrap" }}>
      <AuthLeftPanel />
      <div className="login-form-col" style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: 32, overflowY: "auto", minWidth: 0 }}>
        <div style={{ maxWidth: 440, width: "100%" }}>
          <div style={{ marginBottom: 16 }}>
            <button
              type="button"
              onClick={() => onNavigate && onNavigate("home")}
              style={{
                background: "none",
                border: "none",
                color: "var(--muted)",
                fontSize: 13,
                cursor: "pointer",
                padding: "4px 0",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              ← Back to Home
            </button>
          </div>
          <div style={{ marginBottom: 24 }}>
            <div className="login-heading-serif" style={{ fontWeight: 700, fontSize: 22, color: "var(--navy)", marginBottom: 2 }}>
              Northing
            </div>
            <h2 className="login-heading-serif" style={{ fontSize: 28, fontWeight: 600, color: "var(--navy)", marginBottom: 6 }}>
              <ShinyText text={currentMode === "login" ? "Welcome back." : "Create your account."} color="#0f172a" shineColor="#333333" speed={3} spread={140} />
            </h2>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              {currentMode === "login" ? "Sign in with email and password." : "Tell us who you are and how to reach you."}
            </p>
          </div>

          {currentMode === "login" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <input className="inp" type="email" autoComplete="email" placeholder="Email address" value={form.email} onChange={(e) => setF("email", e.target.value)} />
              </div>
              <div style={{ marginBottom: 8 }}>
                <input
                  className="inp"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={form.password}
                  onChange={(e) => setF("password", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitLogin()}
                />
              </div>
              <div style={{ marginBottom: 16, textAlign: "right" }}>
                <button
                  type="button"
                  onClick={sendForgotPassword}
                  disabled={loading}
                  style={{ background: "none", border: "none", color: "var(--primary)", fontSize: 13, fontWeight: 600, cursor: "pointer", padding: 0, fontFamily: "inherit" }}
                >
                  Forgot password?
                </button>
              </div>
              <button onClick={submitLogin} disabled={loading} className="btn-primary" style={{ width: "100%", padding: "13px", borderRadius: 11, fontSize: 15, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? (
                  <>
                    <span className="spin" />
                    Please wait…
                  </>
                ) : (
                  "Sign In →"
                )}
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("signup")}
                style={{ width: "100%", background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", padding: 6 }}
              >
                Don&apos;t have an account? Register →
              </button>
            </>
          )}

          {currentMode === "register" && (
            <>
              <div style={{ marginBottom: 12 }}>
                <input className="inp" placeholder="Full name *" autoComplete="name" value={form.name} onChange={(e) => setF("name", e.target.value)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input className="inp" type="email" placeholder="Email *" autoComplete="email" value={form.email} onChange={(e) => setF("email", e.target.value)} />
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontSize: 11, fontWeight: 700, color: "var(--muted)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Mobile Number (10 digits, India +91) <span style={{ color: "#DC2626" }}>*</span>
                </label>
                <input
                  className="inp"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  placeholder="10-digit mobile number"
                  value={form.phone}
                  onChange={(e) => setF("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                />
              </div>
              <div style={{ marginBottom: 12 }}>
                <input className="inp" type="password" autoComplete="new-password" placeholder="Password *" value={form.password} onChange={(e) => setF("password", e.target.value)} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <input
                  className="inp"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Confirm password *"
                  value={form.confirmPassword}
                  onChange={(e) => setF("confirmPassword", e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && submitRegister()}
                />
              </div>
              <button onClick={submitRegister} disabled={loading} className="btn-primary" style={{ width: "100%", padding: "13px", borderRadius: 11, fontSize: 15, marginBottom: 14, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {loading ? (
                  <>
                    <span className="spin" />
                    Please wait…
                  </>
                ) : (
                  "Create Account →"
                )}
              </button>
              <button
                type="button"
                onClick={() => onNavigate && onNavigate("login")}
                style={{ width: "100%", background: "none", border: "none", color: "var(--muted)", fontSize: 13, cursor: "pointer", padding: 6 }}
              >
                Already have an account? Sign in →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/*
  --- Legacy Mobile OTP login (signInWithOtp / verifyOtp) — kept for reference; hidden from UI per product spec. ---
  const sendPhoneOtp = async () => { ... toE164Phone(phoneLogin); supabase.auth.signInWithOtp({ phone: e164 }); ... };
  const verifyPhoneOtp = async () => { ... supabase.auth.verifyOtp({ phone: e164, token: otpCode, type: "sms" }); ... };
*/

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
        showToast("Photos uploaded ✓ (set NEXT_PUBLIC_LISTING_AI_URL + listing-ai function for AI cover pick)","success");
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
      if(!isEdit){
        const gate=await canCreateListing(supabase,currentUser.id);
        if(!gate.ok){showToast(gate.message,"error");setSaving(false);return;}
      }
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
        <p style={{margin:"0 0 14px",fontSize:13,color:"var(--muted)",lineHeight:1.5}}>Shown on the public property page. New listings get a draft automatically when <code style={{fontSize:12,background:"var(--cream)",padding:"2px 6px",borderRadius:4}}>NEXT_PUBLIC_LISTING_AI_URL</code> points at your deployed listing-ai edge function.</p>
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
              if (!listingAiConfigured()) { showToast("Set NEXT_PUBLIC_LISTING_AI_URL and deploy the listing-ai Supabase function", "error"); return; }
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

export const AgentDash = ({currentUser,showToast}) => {
  const isSeller=currentUser.role==="seller";
  const isAgent=currentUser.role==="agent";
  const [profRow,setProfRow]=useState(null);
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [view,setView]=useState("grid");const [editId,setEditId]=useState(null);const [modal,setModal]=useState(null);const [deleteTarget,setDeleteTarget]=useState(null);const [tab,setTab]=useState("listings");const [statusChanging,setStatusChanging]=useState(null);
  const [enquiries,setEnquiries]=useState([]);const [enquiriesLoading,setEnquiriesLoading]=useState(false);
  const [enquiryStatusUpdating,setEnquiryStatusUpdating]=useState(null);
  const [upgradeRequesting,setUpgradeRequesting]=useState(false);
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
  useEffect(()=>{supabase.from("profiles").select("agent_verified").eq("id",currentUser.id).single().then(({data})=>setProfRow(data));},[currentUser.id]);
  useEffect(()=>{
    if(tab!=="enquiries") return;
    (async()=>{
      setEnquiriesLoading(true);
      const {data}=await supabase.from("enquiries").select("id,listing_id,buyer_id,message,status,created_at").eq("seller_id",currentUser.id).order("created_at",{ascending:false});
      const rows=data||[];
      const bids=[...new Set(rows.map(r=>r.buyer_id).filter(Boolean))];
      const lids=[...new Set(rows.map(r=>r.listing_id).filter(Boolean))];
      let bmap={};
      let lmap={};
      if(bids.length){
        const {data:bp}=await supabase.from("profiles").select("id,name,phone,mobile_number").in("id",bids);
        bmap=Object.fromEntries((bp||[]).map(p=>[p.id,p]));
      }
      if(lids.length){
        const {data:ls}=await supabase.from("listings").select("id,title").in("id",lids);
        lmap=Object.fromEntries((ls||[]).map(l=>[l.id,l.title]));
      }
      setEnquiries(rows.map(r=>({...r,buyer:bmap[r.buyer_id],listingTitle:lmap[r.listing_id]})));
      setEnquiriesLoading(false);
    })();
  },[tab,currentUser.id]);
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
  const requestUpgrade=async()=>{
    setUpgradeRequesting(true);
    try{
      const res=await fetch("/api/upgrade-request",{method:"POST"});
      const json=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(json?.error||"Could not submit request");
      showToast("Upgrade request sent. Our team will contact you.","success");
    }catch(err){
      showToast(err.message||"Upgrade request failed","error");
    }
    setUpgradeRequesting(false);
  };
  const updateEnquiryStatus=async(enquiryId,status)=>{
    setEnquiryStatusUpdating(enquiryId);
    try{
      const res=await fetch("/api/enquiry-status",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({enquiry_id:enquiryId,status}),
      });
      const json=await res.json().catch(()=>({}));
      if(!res.ok) throw new Error(json?.error||"Could not update enquiry");
      setEnquiries(es=>es.map(e=>e.id===enquiryId?{...e,status}:e));
      showToast(`Enquiry marked as ${status}`,"success");
    }catch(err){
      showToast(err.message||"Update failed","error");
    }
    setEnquiryStatusUpdating(null);
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
  const unverifiedAgent=isAgent&&profRow&&!profRow.agent_verified;
  const lockedVerifiedAgent=isAgent&&currentUser.agentVerified===true;
  const activeCount=listings.filter(l=>l.status==="Active").length;
  const maxListings=isSeller?2:9999;
  const canAddMore=unverifiedAgent?false:isSeller?activeCount<maxListings:true;
  return (
    <div className="dashboard-page-shell" style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px"}}>
      {deleteTarget&&<ConfirmModal message={`Delete "${deleteTarget.title}"?`} onConfirm={()=>delL(deleteTarget.id)} onCancel={()=>setDeleteTarget(null)}/>}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:24,flexWrap:"wrap",gap:12}}>
        <div>
          <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>{isSeller?"My Properties":"My Listings"}</h1>
          <p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>{isSeller?`Individual seller · ${listings.length}/${maxListings} properties used`:"Manage and market your properties"}</p>
          <p style={{marginTop:10}}>
            {lockedVerifiedAgent?(
              <span style={{fontSize:13,color:"var(--muted)",display:"block",maxWidth:440}}>Verified agent accounts cannot switch to Buyer or Seller. Contact Northing admin if you need a change.</span>
            ):(
              <button type="button" className="btn-outline" onClick={()=>{window.location.assign("/dashboard?changeRole=1");}} style={{padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:600}}>
                Change account type
              </button>
            )}
          </p>
        </div>
        {unverifiedAgent
          ?<div style={{background:"#F3F4F6",border:"1px solid var(--border)",borderRadius:10,padding:"10px 16px",fontSize:13,color:"var(--muted)",fontWeight:600}}>Your agent account is pending activation.</div>
          :canAddMore
          ?<button onClick={()=>setView("create")} className="btn-green" style={{padding:"11px 22px",borderRadius:11,fontSize:14}}>+ New Listing</button>
          :<div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <div style={{background:"#FEF3C7",border:"1px solid #FDE68A",borderRadius:10,padding:"10px 16px",fontSize:13,color:"#92400E",fontWeight:600}}>⚠️ Listing limit reached</div>
            <button type="button" className="btn-outline" disabled={upgradeRequesting} onClick={requestUpgrade} style={{padding:"9px 14px",borderRadius:10,fontSize:12}}>
              {upgradeRequesting?"Sending...":"Request upgrade"}
            </button>
          </div>
        }
      </div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--gray)",padding:4,borderRadius:12,border:"1px solid var(--border)",width:"fit-content"}}>
        {[["listings","🏠 Listings"],["enquiries","✉️ Enquiries"],...(!isSeller?[["profile","🏢 Profile"]]:[])].map(([t,l])=>(
          <button key={t} onClick={()=>setTab(t)} style={{padding:"8px 20px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t?"var(--white)":"transparent",color:tab===t?"var(--navy)":"var(--muted)",border:tab===t?"1px solid var(--border)":"none"}}>{l}</button>
        ))}
      </div>
      {tab==="enquiries"&&(
        <div className="card" style={{padding:24}}>
          {enquiriesLoading?<p style={{color:"var(--muted)"}}>Loading…</p>:enquiries.length===0?<p style={{color:"var(--muted)"}}>No enquiries yet.</p>:(
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {enquiries.map((e)=>(
                <div key={e.id} style={{borderBottom:"1px solid var(--border)",paddingBottom:16}}>
                  <div style={{fontWeight:800,color:"var(--navy)"}}>{e.listingTitle||"Listing"}</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginTop:4}}>{e.buyer?.name||"Buyer"} · {e.buyer?.mobile_number||e.buyer?.phone||"—"}</div>
                  <p style={{fontSize:14,margin:"10px 0",lineHeight:1.5}}>{e.message}</p>
                  <div style={{fontSize:12,color:"var(--muted)"}}>{new Date(e.created_at).toLocaleString()}</div>
                  <div style={{display:"flex",alignItems:"center",gap:8,marginTop:8,flexWrap:"wrap"}}>
                    <span className="badge tag" style={{display:"inline-block"}}>{e.status}</span>
                    <button type="button" disabled={enquiryStatusUpdating===e.id||e.status==="replied"} onClick={()=>updateEnquiryStatus(e.id,"replied")} className="btn-outline" style={{padding:"5px 10px",fontSize:11,borderRadius:8}}>
                      Mark replied
                    </button>
                    <button type="button" disabled={enquiryStatusUpdating===e.id||e.status==="closed"} onClick={()=>updateEnquiryStatus(e.id,"closed")} className="btn-outline" style={{padding:"5px 10px",fontSize:11,borderRadius:8}}>
                      Mark closed
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
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
          ?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🏠</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No listings yet</h3><p style={{color:"var(--muted)",marginBottom:20,fontSize:14}}>{unverifiedAgent?"Your agent account must be approved before you can add listings.":"Create your first listing and start marketing it instantly."}</p>{unverifiedAgent?null:<button onClick={()=>setView("create")} className="btn-primary" style={{padding:"12px 28px",borderRadius:10,fontSize:14}}>+ Create First Listing</button>}</div>
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
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

export const UserDash = ({currentUser,showToast}) => {
  const [saved,setSaved]=useState([]);const [loading,setLoading]=useState(true);const [tab,setTab]=useState("saved");const [modal,setModal]=useState(null);
  const [enquiries,setEnquiries]=useState([]);const [enquiriesLoading,setEnquiriesLoading]=useState(false);
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
  useEffect(()=>{
    if(tab!=="enquiries") return;
    setEnquiriesLoading(true);
    (async()=>{
      const {data}=await supabase
        .from("enquiries")
        .select("id,message,status,created_at,listings(title,location)")
        .eq("buyer_id",currentUser.id)
        .order("created_at",{ascending:false});
      setEnquiries(data||[]);
      setEnquiriesLoading(false);
    })();
  },[tab,currentUser.id]);
  return (
    <div className="dashboard-page-shell" style={{maxWidth:1100,margin:"0 auto",padding:"32px 20px"}}>
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>My Account</h1>
        <p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>Welcome back, {currentUser.name}</p>
        <p style={{fontSize:13,marginTop:10}}>
          <button
            type="button"
            className="btn-outline"
            onClick={()=>{window.location.assign("/dashboard?changeRole=1");}}
            style={{padding:"8px 14px",borderRadius:10,fontSize:13,fontWeight:600}}
          >
            Change account type
          </button>
        </p>
      </div>
      <div style={{display:"flex",gap:4,marginBottom:20,background:"var(--gray)",padding:4,borderRadius:12,border:"1px solid var(--border)",width:"fit-content"}}>
        {[["saved","❤️ Saved"],["enquiries","✉️ Enquiries"],["profile","👤 Profile"]].map(([t,l])=><button key={t} onClick={()=>setTab(t)} style={{padding:"8px 20px",borderRadius:9,fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t?"var(--white)":"transparent",color:tab===t?"var(--navy)":"var(--muted)",border:tab===t?"1px solid var(--border)":"none",boxShadow:tab===t?"0 1px 4px rgba(27,58,45,0.08)":"none"}}>{l}</button>)}
      </div>
      {tab==="saved"&&(
        loading?<div style={{textAlign:"center",padding:40,color:"var(--muted)"}}>Loading…</div>:saved.length===0?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>💔</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No saved listings</h3><p style={{color:"var(--muted)",fontSize:14,marginBottom:16}}>You haven&apos;t saved any properties yet.</p><button type="button" className="btn-primary" onClick={()=>window.location.assign("/feed")}>Browse listings →</button></div>:(
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
      {tab==="enquiries"&&(
        <div className="card" style={{padding:20}}>
          <h2 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:12}}>My Enquiries</h2>
          {enquiriesLoading ? (
            <p style={{color:"var(--muted)"}}>Loading…</p>
          ) : enquiries.length===0 ? (
            <p style={{color:"var(--muted)"}}>No enquiries sent yet.</p>
          ) : (
            <div style={{display:"flex",flexDirection:"column",gap:10}}>
              {enquiries.map((e)=>(
                <div key={e.id} style={{padding:12,borderRadius:12,border:"1px solid var(--border)",background:"#fff"}}>
                  <div style={{display:"flex",justifyContent:"space-between",gap:10,alignItems:"center",marginBottom:4}}>
                    <div style={{fontWeight:700,color:"var(--navy)",fontSize:14}}>{e.listings?.title||"Listing enquiry"}</div>
                    <span className="badge tag">{e.status||"new"}</span>
                  </div>
                  <div style={{fontSize:12,color:"var(--muted)",marginBottom:6}}>{e.listings?.location||"—"} · {new Date(e.created_at).toLocaleString()}</div>
                  <div style={{fontSize:13,color:"var(--text-body)"}}>{e.message}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {tab==="profile"&&(
        <div style={{maxWidth:520}}>
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

export const MasterDash = ({showToast}) => {
  const [listings,setListings]=useState([]);const [agents,setAgents]=useState([]);const [users,setUsers]=useState([]);const [tab,setTab]=useState("overview");const [search,setSearch]=useState("");const [modal,setModal]=useState(null);const [loading,setLoading]=useState(true);const [deleteTarget,setDeleteTarget]=useState(null);const [dashNarrow,setDashNarrow]=useState(false);
  useEffect(()=>{
    if(typeof window==="undefined")return;
    const mq=window.matchMedia("(max-width: 768px)");
    const fn=()=>setDashNarrow(mq.matches);
    fn();
    mq.addEventListener("change",fn);
    return()=>mq.removeEventListener("change",fn);
  },[]);
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
    const { error } = await supabase.rpc("master_disable_user", { target_id: id });
    if (error) {
      showToast(error.message || "Remove failed", "error");
      return;
    }
    setAgents(a=>a.filter(x=>x.id!==id));setUsers(u=>u.filter(x=>x.id!==id));
    showToast("User removed","success");
  };
  const approveAgent=async(id)=>{
    const { error } = await supabase.rpc("master_approve_agent", { target_id: id });
    if (error) {
      showToast(error.message || "Approval failed", "error");
      return;
    }
    setAgents(a=>a.map(x=>x.id===id?{...x,agent_verified:true}:x));
    showToast("Agent approved","success");
  };
  const filtered=listings.filter(l=>!search||(mapListing(l).title||"").toLowerCase().includes(search.toLowerCase())||(l.location||"").toLowerCase().includes(search.toLowerCase()));
  const tabs=[["overview","📊 Overview"],["analytics","🔥 Analytics"],["listings","🏠 Listings"],["agents","🏢 Agents"],["users","👥 Users"]];
  return (
    <div className="dashboard-page-shell" style={{maxWidth:1200,margin:"0 auto",padding:"32px 20px"}}>
      {deleteTarget&&<ConfirmModal message={`Delete "${deleteTarget.title}"? This cannot be undone.`} onConfirm={()=>delL(deleteTarget.id)} onCancel={()=>setDeleteTarget(null)}/>}
      <div style={{marginBottom:28}}>
        <h1 style={{fontFamily:"'Fraunces',serif",fontSize:28,fontWeight:800,color:"var(--navy)",margin:0}}>Overview</h1>
        <p style={{fontSize:14,color:"var(--muted)",marginTop:4}}>Listings, agents, and activity</p>
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
              <div style={{display:"flex",gap:10,marginBottom:16,alignItems:"center",flexWrap:"wrap"}}><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search listings…" className="inp" style={{maxWidth:dashNarrow?undefined:340,width:dashNarrow?"100%":undefined,boxSizing:"border-box"}}/><span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>{filtered.length} results</span></div>
              {dashNarrow?(
                <div style={{display:"flex",flexDirection:"column",gap:12}}>
                  {filtered.map((raw)=>{const l=mapListing(raw);return(
                    <div key={l.id} className="card" style={{padding:16}}>
                      <div style={{fontSize:15,fontWeight:700,color:"var(--navy)",marginBottom:6,lineHeight:1.35}}>{l.title}</div>
                      <div style={{fontSize:13,color:"var(--muted)",marginBottom:4}}>📍 {l.location}</div>
                      <div style={{fontSize:12,color:"var(--muted)",marginBottom:8}}>{l.agentName}</div>
                      <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center",marginBottom:10}}>
                        <span className="badge" style={{background:l.listingType==="Rent"?"#FFFBEB":"#ECFDF5",color:l.listingType==="Rent"?"#B45309":"#059669",border:"1px solid rgba(0,0,0,0.06)"}}>{l.listingType}</span>
                        <span className="badge tag">{l.status}</span>
                        <span style={{fontSize:15,fontWeight:700,color:"var(--green2)",fontFamily:"'Fraunces',serif"}}>{fmtP(l.price)}</span>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                        <button type="button" onClick={()=>setModal(l)} className="btn-ghost" style={{padding:"10px",borderRadius:8,fontSize:13,minHeight:44}}>View</button>
                        <button type="button" onClick={()=>showWACard(l)} style={{padding:"10px",borderRadius:8,fontSize:13,minHeight:44,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"inline-flex",alignItems:"center",justifyContent:"center",gap:4}}><WALogo size={12}/>WA</button>
                        <button type="button" onClick={()=>showPDF(l)} className="btn-ghost" style={{padding:"10px",borderRadius:8,fontSize:13,minHeight:44}}>📄 PDF</button>
                        <button type="button" onClick={()=>setDeleteTarget(l)} className="btn-danger" style={{padding:"10px",borderRadius:8,fontSize:13,minHeight:44}}>Delete</button>
                      </div>
                    </div>
                  );})}
                  {filtered.length===0&&<div className="card" style={{textAlign:"center",padding:"36px",color:"var(--muted)"}}>No listings found</div>}
                </div>
              ):(
                <div className="card" style={{overflow:"hidden"}}><div className="master-dash-table-wrap" style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse",minWidth:650}}><thead><tr style={{background:"var(--navy)"}}>{["Title","Location","Agent","Type","Price","Status","Actions"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{filtered.map((raw,i)=>{const l=mapListing(raw);return(<tr key={l.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{l.title}</td><td style={{padding:"11px 14px",fontSize:12,color:"var(--muted)"}}>{l.location}</td><td style={{padding:"11px 14px",fontSize:12,color:"var(--muted)"}}>{l.agentName}</td><td style={{padding:"11px 14px"}}><span className="badge" style={{background:l.listingType==="Rent"?"#FFFBEB":"#ECFDF5",color:l.listingType==="Rent"?"#B45309":"#059669",border:"1px solid rgba(0,0,0,0.06)"}}>{l.listingType}</span></td><td style={{padding:"11px 14px",fontSize:13,fontWeight:700,color:"var(--green2)",fontFamily:"'Fraunces',serif"}}>{fmtP(l.price)}</td><td style={{padding:"11px 14px"}}><span className="badge tag">{l.status}</span></td><td style={{padding:"11px 14px"}}><div style={{display:"flex",gap:5}}><button type="button" onClick={()=>setModal(l)} className="btn-ghost" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>View</button><button type="button" onClick={()=>showWACard(l)} style={{padding:"4px 9px",borderRadius:6,fontSize:11,fontWeight:700,cursor:"pointer",background:"#25D366",border:"none",color:"#fff",fontFamily:"inherit",display:"inline-flex",alignItems:"center",gap:3}}><WALogo size={10}/>WA</button><button type="button" onClick={()=>showPDF(l)} className="btn-ghost" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>📄</button><button type="button" onClick={()=>setDeleteTarget(l)} className="btn-danger" style={{padding:"4px 9px",borderRadius:6,fontSize:11}}>Del</button></div></td></tr>);})} </tbody></table></div>{filtered.length===0&&<div style={{textAlign:"center",padding:"36px",color:"var(--muted)"}}>No listings found</div>}</div>
              )}
            </div>
          )}
          {tab==="agents"&&(dashNarrow?(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {agents.map((a)=>(
                <div key={a.id} className="card" style={{padding:16}}>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--navy)",marginBottom:4}}>{a.name}</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginBottom:4,wordBreak:"break-word"}}>{a.email}</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginBottom:10}}>{a.agency_name||"—"}</div>
                  <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap",marginBottom:12}}>
                    <span className="badge tag">{listings.filter(l=>l.agent_id===a.id).length} listings</span>
                    <span className="badge tag-navy">{a.agent_verified?"verified":"pending"}</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                    <button type="button" onClick={()=>approveAgent(a.id)} disabled={a.agent_verified===true} className="btn-outline" style={{padding:"12px",borderRadius:8,fontSize:13,minHeight:44}}>
                      {a.agent_verified?"Approved":"Approve"}
                    </button>
                    <button type="button" onClick={()=>delU(a.id)} className="btn-danger" style={{padding:"12px",borderRadius:8,fontSize:14,minHeight:44}}>Remove</button>
                  </div>
                </div>
              ))}
              {agents.length===0&&<div className="card" style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No agents yet</div>}
            </div>
          ):(
            <div className="card" style={{overflow:"hidden"}}><div className="master-dash-table-wrap" style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:"var(--navy)"}}>{["Name","Email","Agency","Listings","Verification","Action"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{agents.map((a,i)=><tr key={a.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{a.name}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{a.email}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{a.agency_name||"—"}</td><td style={{padding:"12px 14px"}}><span className="badge tag">{listings.filter(l=>l.agent_id===a.id).length} listings</span></td><td style={{padding:"12px 14px"}}><span className="badge tag-navy">{a.agent_verified?"verified":"pending"}</span></td><td style={{padding:"12px 14px"}}><div style={{display:"flex",gap:6}}><button type="button" onClick={()=>approveAgent(a.id)} disabled={a.agent_verified===true} className="btn-outline" style={{padding:"5px 10px",borderRadius:7,fontSize:11}}>{a.agent_verified?"Approved":"Approve"}</button><button type="button" onClick={()=>delU(a.id)} className="btn-danger" style={{padding:"5px 12px",borderRadius:7,fontSize:11}}>Remove</button></div></td></tr>)}</tbody></table></div>{agents.length===0&&<div style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No agents yet</div>}</div>
          ))}
          {tab==="users"&&(dashNarrow?(
            <div style={{display:"flex",flexDirection:"column",gap:12}}>
              {users.map((u)=>(
                <div key={u.id} className="card" style={{padding:16}}>
                  <div style={{fontSize:15,fontWeight:700,color:"var(--navy)",marginBottom:4}}>{u.name}</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginBottom:4,wordBreak:"break-word"}}>{u.email}</div>
                  <div style={{fontSize:13,color:"var(--muted)",marginBottom:10}}>{u.phone||"—"}</div>
                  <span className="badge tag-navy" style={{marginBottom:12,display:"inline-block"}}>{u.role}</span>
                  <button type="button" onClick={()=>delU(u.id)} className="btn-danger" style={{width:"100%",padding:"12px",borderRadius:8,fontSize:14,minHeight:44}}>Remove</button>
                </div>
              ))}
              {users.length===0&&<div className="card" style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No users yet</div>}
            </div>
          ):(
            <div className="card" style={{overflow:"hidden"}}><div className="master-dash-table-wrap" style={{overflowX:"auto"}}><table style={{width:"100%",borderCollapse:"collapse"}}><thead><tr style={{background:"var(--navy)"}}>{["Name","Email","Phone","Role","Action"].map(h=><th key={h} style={{padding:"12px 14px",fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.7)",textAlign:"left",textTransform:"uppercase",letterSpacing:0.5}}>{h}</th>)}</tr></thead><tbody>{users.map((u,i)=><tr key={u.id} style={{borderBottom:"1px solid var(--border)",background:i%2===0?"var(--white)":"var(--cream)"}}><td style={{padding:"12px 14px",fontSize:13,fontWeight:700,color:"var(--navy)"}}>{u.name}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{u.email}</td><td style={{padding:"12px 14px",fontSize:12,color:"var(--muted)"}}>{u.phone||"—"}</td><td style={{padding:"12px 14px"}}><span className="badge tag-navy">{u.role}</span></td><td style={{padding:"12px 14px"}}><button type="button" onClick={()=>delU(u.id)} className="btn-danger" style={{padding:"5px 12px",borderRadius:7,fontSize:11}}>Remove</button></td></tr>)}</tbody></table></div>{users.length===0&&<div style={{textAlign:"center",padding:32,color:"var(--muted)"}}>No users yet</div>}</div>
          ))}
        </>
      )}
      {modal&&<PropModal listing={modal} onClose={()=>setModal(null)}/>}
    </div>
  );
};

export const Feed = ({currentUser,showToast,onNavigate,onOpenProperty}) => {
  const router=useRouter();
  const [listings,setListings]=useState([]);const [loading,setLoading]=useState(true);const [savedIds,setSavedIds]=useState(currentUser?.savedListings||[]);const [filters,setFilters]=useState({search:"",propertyType:"",listingType:"",city:"",minPrice:"",maxPrice:"",bedrooms:"",furnishing:""});const [sort,setSort]=useState("newest");const [open,setOpen]=useState(false);const [feedMobile,setFeedMobile]=useState(false);const [page,setPage]=useState(1);const [totalCount,setTotalCount]=useState(0);
  const pageSize=18;
  useEffect(()=>{
    if(typeof window==="undefined")return;
    const mq=window.matchMedia("(max-width: 768px)");
    const fn=()=>setFeedMobile(mq.matches);
    fn();
    mq.addEventListener("change",fn);
    return()=>mq.removeEventListener("change",fn);
  },[]);
  useEffect(()=>{
    if(!open||!feedMobile)return;
    const p=document.body.style.overflow;
    document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow=p;};
  },[open,feedMobile]);
  const requireAuth=(fn)=>(...args)=>{if(!currentUser){showToast("Please sign in to access this feature","error");onNavigate&&onNavigate("login");return;}fn(...args);};
  useEffect(()=>{setPage(1);},[filters,sort]);
  useEffect(()=>{
    let cancelled=false;
    (async()=>{
      setLoading(true);
      const qs=new URLSearchParams();
      qs.set("page",String(page));
      qs.set("pageSize",String(pageSize));
      qs.set("sort",sort);
      Object.entries(filters).forEach(([k,v])=>{if(v)qs.set(k,String(v));});
      const res=await fetch(`/api/listings?${qs.toString()}`,{cache:"no-store"});
      const json=await res.json().catch(()=>({}));
      if(cancelled)return;
      if(!res.ok){showToast(json?.error||"Could not load listings","error");setListings([]);setTotalCount(0);setLoading(false);return;}
      setListings((json.items||[]).map(mapListing).filter(Boolean));
      setTotalCount(Number(json.totalCount||0));
      setLoading(false);
    })();
    return()=>{cancelled=true;};
  },[filters,sort,page,showToast]);
  const setF=(k,v)=>setFilters(f=>({...f,[k]:v}));
  const clear=()=>{setFilters({search:"",propertyType:"",listingType:"",city:"",minPrice:"",maxPrice:"",bedrooms:"",furnishing:""});setPage(1);};
  const af=Object.values(filters).filter(v=>v).length;
  const cities=[...new Set(listings.map(l=>l.location?.split(",")[1]?.trim()).filter(Boolean))];
  const totalPages=Math.max(1,Math.ceil(totalCount/pageSize));
  const handleSave=async(id)=>{
    if(!currentUser){router.push(`/login?next=${encodeURIComponent("/feed")}`);return;}
    if(currentUser.role!=="user"){showToast("Only buyers can save listings","error");return;}
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
            <div style={{display:"flex",gap:6,flexWrap:"wrap"}} className="feed-search-prop-pills">
              {["Apartment","Villa","Commercial"].map(t=><button key={t} type="button" onClick={()=>setF("propertyType",filters.propertyType===t?"":t)} style={{padding:"8px 14px",borderRadius:10,fontSize:12,fontWeight:700,cursor:"pointer",background:filters.propertyType===t?"var(--green)":"rgba(255,255,255,0.08)",color:"#fff",border:`1px solid ${filters.propertyType===t?"var(--green)":"rgba(255,255,255,0.15)"}`,transition:"all 0.2s"}}>{t}</button>)}
            </div>
          </div>
        </div>
      </div>
      <div className="feed-page-inner" style={{maxWidth:1180,margin:"-50px auto 0",padding:"0 20px 60px",position:"relative"}}>
        {open&&feedMobile&&<div className="feed-filter-backdrop" onClick={()=>setOpen(false)} aria-hidden role="presentation"/>}
        <div className="card feed-toolbar-card" style={{padding:"16px 20px",marginBottom:20,display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:12}}>
          <div className="feed-toolbar-row" style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",flex:1}}>
            <button type="button" onClick={()=>setOpen(o=>!o)} style={{padding:"8px 16px",borderRadius:9,fontSize:13,fontWeight:700,cursor:"pointer",background:open?"var(--navy)":"var(--gray)",color:open?"#fff":"var(--text)",border:`1px solid ${open?"var(--navy)":"var(--border)"}`,transition:"all 0.2s",minHeight:44}}>
              <span className="feed-filter-label-long">🔍 Filters {af>0&&<span style={{background:open?"rgba(255,255,255,0.2)":"var(--green-light)",color:open?"#fff":"var(--green)",borderRadius:10,padding:"1px 7px",fontSize:11,marginLeft:4}}>{af}</span>}</span>
              <span className="feed-filter-label-short">Filter{af>0?` (${af})`:""}</span>
            </button>
            {af>0&&<button onClick={clear} style={{fontSize:12,color:"var(--muted)",background:"none",border:"none",cursor:"pointer",textDecoration:"underline"}}>Clear all</button>}
            <span style={{fontSize:13,color:"var(--muted)",fontWeight:600}}>{loading?"Loading…":`${totalCount} ${totalCount===1?"property":"properties"} found`}</span>
          </div>
          <select value={sort} onChange={e=>setSort(e.target.value)} className="inp feed-sort-select" style={{width:"auto",fontSize:13}}>
            <option value="newest">Newest First</option><option value="price_asc">Price: Low to High</option><option value="price_desc">Price: High to Low</option>
          </select>
        </div>
        {open&&(
          <div className={"card gr"+(feedMobile?" feed-filter-drawer":"")} style={{padding:"20px 24px",marginBottom:20,display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"12px 20px"}}>
            <FS label="City" k="city" form={filters} set={setF} opts={cities}/>
            <FS label="Property Type" k="propertyType" form={filters} set={setF} opts={["Apartment","Villa","Plot","Commercial"]}/>
            <FS label="Listing Type" k="listingType" form={filters} set={setF} opts={["Rent","Sale"]}/>
            <FS label="Min Beds" k="bedrooms" form={filters} set={setF} opts={["1","2","3","4","5"]}/>
            <FS label="Min Price ₹" k="minPrice" form={filters} set={setF} opts={["500000","1000000","2000000","3000000","5000000","7500000","10000000","20000000","50000000"]} fmtLabel={(v)=>fmtP(v)}/>
            <FS label="Max Price ₹" k="maxPrice" form={filters} set={setF} opts={["1000000","2000000","3000000","5000000","7500000","10000000","20000000","50000000","100000000"]} fmtLabel={(v)=>fmtP(v)}/>
            <FS label="Furnishing" k="furnishing" form={filters} set={setF} opts={["Furnished","Semi-Furnished","Unfurnished"]}/>
          </div>
        )}
        {loading?<div style={{textAlign:"center",padding:80,color:"var(--muted)"}}>Loading listings…</div>:listings.length===0?<div className="card" style={{padding:56,textAlign:"center"}}><div style={{fontSize:48,marginBottom:16}}>🔍</div><h3 style={{fontFamily:"'Fraunces',serif",fontSize:20,fontWeight:700,color:"var(--navy)",marginBottom:8}}>No properties found</h3><p style={{color:"var(--muted)",fontSize:14,marginBottom:16}}>Try adjusting your filters.</p><button onClick={clear} className="btn-outline" style={{padding:"10px 24px",borderRadius:10,fontSize:13}}>Clear Filters</button></div>:(
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(320px,1fr))",gap:24}} className="gr">
            {listings.map(l=><PropCard key={l.id} listing={l} currentUser={currentUser} savedIds={savedIds} onSave={handleSave} onView={onOpenProperty} onLoginRedirect={()=>router.push(`/login?next=${encodeURIComponent("/feed")}`)}/>)}
          </div>
        )}
        {!loading&&totalCount>0&&(
          <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:10,marginTop:20}}>
            <button type="button" className="btn-outline" disabled={page<=1} onClick={()=>setPage(p=>Math.max(1,p-1))} style={{padding:"8px 14px",borderRadius:9,fontSize:13,opacity:page<=1?0.6:1}}>← Prev</button>
            <span style={{fontSize:13,color:"var(--muted)",fontWeight:700}}>Page {page} of {totalPages}</span>
            <button type="button" className="btn-outline" disabled={page>=totalPages} onClick={()=>setPage(p=>Math.min(totalPages,p+1))} style={{padding:"8px 14px",borderRadius:9,fontSize:13,opacity:page>=totalPages?0.6:1}}>Next →</button>
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

export const Home = ({currentUser,onNavigate,onOpenProperty}) => {
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
        <div ref={heroParallaxIllustrationRef} className="home-hero-parallax-bg home-hero-parallax-bg--illustration home-hero-decor-layer" aria-hidden="true">
          <div className="home-hero-parallax-bg-inner">
            <HomeHeroIllustration variant="homeHero" />
          </div>
        </div>
        <div className="home-hero-overlay home-hero-overlay--light" aria-hidden="true" />
        <div ref={heroParallaxInnerRef} className="home-hero-inner home-hero-parallax-inner">
          <div className="home-hero-copy">
            <h1 className="home-hero-headline">
              <span className="home-hero-headline-line home-hero-headline-line--sans">Northing to your</span>
              <span className="home-hero-headline-line home-hero-headline-line--serif">dream home</span>
            </h1>
            <p className="home-hero-tagline">
              Listings, verified agents, PDFs &amp; WhatsApp cards — built for Indian real estate.
            </p>
            <div className="home-hero-actions">
              <button type="button" onClick={()=>onNavigate("feed")} className="home-hero-cta home-hero-cta--primary">🏠 Browse Properties</button>
              <button type="button" onClick={()=>onNavigate(currentUser?"dashboard":"login")} className="home-hero-cta home-hero-cta--secondary">📋 List Your Property</button>
            </div>
          </div>
          <div className="home-hero-mobile-art-rail" aria-hidden="true" />
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
                ["Pricing","pricing"],
                ["Contact","contact"],
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

export const AgentPage = ({agentId,onNavigate,currentUser}) => {
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
            <div style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.4)",textTransform:"uppercase",letterSpacing:1.5,marginBottom:4}}>
              {agent.agent_verified===true?"Verified Agent":"Independent Broker"} · Northing
            </div>
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

export const Nav = ({currentUser,page,onNavigate,onLogout,onSecretClick}) => {
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
          <button type="button" className={page==="pricing"?"nav-drawer-link-active":""} onClick={wrapNav(()=>onNavigate("pricing"))}>Pricing</button>
          <button type="button" className={page==="contact"?"nav-drawer-link-active":""} onClick={wrapNav(()=>onNavigate("contact"))}>Contact</button>
          {currentUser&&<button type="button" className={page==="dashboard"?"nav-drawer-link-active":""} onClick={wrapNav(()=>onNavigate("dashboard"))}>{currentUser.role==="agent"?"Listings":currentUser.role==="seller"?"My Properties":"Account"}</button>}
        </div>
        <div className="nav-drawer-foot">
          {currentUser?(
            <button type="button" onClick={wrapNav(onLogout)} style={{padding:"12px 16px",borderRadius:12,fontWeight:600,fontSize:14,border:"1px solid var(--border)",background:"var(--gray)",cursor:"pointer",fontFamily:"inherit",color:"var(--muted)"}}>Sign out</button>
          ):(
            <>
              <button type="button" className="btn-outline" style={{padding:"12px 16px",borderRadius:12,fontWeight:600,fontSize:14,width:"100%",boxSizing:"border-box"}} onClick={wrapNav(()=>onNavigate("login"))}>Log In</button>
              <button type="button" className="btn-primary" style={{padding:"12px 16px",borderRadius:12,fontWeight:700,fontSize:14,border:"none",width:"100%",boxSizing:"border-box"}} onClick={wrapNav(()=>onNavigate("signup"))}>Sign Up</button>
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
        <button type="button" onClick={()=>onNavigate("pricing")} style={{...deskBtn,background:page==="pricing"?"var(--primary-light)":"transparent",color:page==="pricing"?"var(--primary)":"var(--muted)"}}>Pricing</button>
        <button type="button" onClick={()=>onNavigate("contact")} style={{...deskBtn,background:page==="contact"?"var(--primary-light)":"transparent",color:page==="contact"?"var(--primary)":"var(--muted)"}}>Contact</button>
        {currentUser?<>
          <button onClick={()=>onNavigate("dashboard")} className="hm" style={{...deskBtn,background:"transparent",color:"var(--muted)"}}>{currentUser.role==="agent"?"Listings":currentUser.role==="seller"?"My Properties":"Account"}</button>
          <div style={{display:"flex",alignItems:"center",gap:8,background:"var(--gray)",borderRadius:24,padding:"5px 12px 5px 5px",border:"1px solid var(--border)",cursor:"pointer"}} onClick={()=>onNavigate("dashboard")}>
            <div style={{width:28,height:28,borderRadius:"50%",background:"var(--primary)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:800}}>{currentUser.name?.charAt(0)}</div>
            <span style={{fontSize:12,fontWeight:600,color:"var(--text)"}} className="hm">{currentUser.name?.split(" ")[0]}</span>
          </div>
          <button onClick={onLogout} style={{padding:"7px 13px",borderRadius:8,fontWeight:600,fontSize:12,cursor:"pointer",background:"var(--gray)",color:"var(--muted)",border:"1px solid var(--border)",transition:"all 0.2s"}}>Sign Out</button>
        </>:<>
          <button onClick={()=>onNavigate("login")} style={{padding:"7px 16px",borderRadius:9,fontWeight:600,fontSize:13,cursor:"pointer",background:"transparent",color:"var(--primary)",border:"none"}}>Log In</button>
          <button onClick={()=>onNavigate("signup")} className="btn-green" style={{padding:"9px 20px",borderRadius:9,fontSize:13}}>Sign Up →</button>
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

export class ErrorBoundary extends Component {
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

export const MarketingKitModal = ({listing, onClose, currentUser}) => {
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
    <div className="afd northing-modal-overlay" style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:4500,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(6px)"}} onClick={onClose}>
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

export const useViewerBrandProfile = () => {
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
export const PropertyDetailCarousel = ({ photos, title }) => {
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

export const BrokerPublicPage = ({ name }) => {
  const router = useRouter();
  const navigate = (path) => {
    router.push(path);
  };
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
