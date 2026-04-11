"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fmtP } from "@/lib/formatPrice";
import { G } from "./globalStyles.js";
import { _h, PDFModal, WACardModal, MarketingKitModal, WALogo, useViewerBrandProfile, track } from "./NorthingApp.jsx";
import { supabase } from "@/lib/supabaseClient";

/**
 * Marketing share view — data from server (SSR + OG); UI + modals only.
 */
export default function ShareListingPageClient({ initialListing, fullListingUrl }) {
  const router = useRouter();
  const listing = initialListing;
  const [sessionUser, setSessionUser] = useState(null);
  const navigate = (path) => {
    router.push(path);
  };

  const [waListing, setWaListing] = useState(null);
  const [pdfListing, setPdfListing] = useState(null);
  const [kitListing, setKitListing] = useState(null);
  const viewerBrand = useViewerBrandProfile();

  useEffect(() => {
    _h.openWA = (l) => setWaListing(l);
    _h.openPDF = (l) => setPdfListing(l);
    _h.openKit = (l) => setKitListing(l);
  }, []);

  useEffect(() => {
    if (listing?.id) track(listing.id, "pageview");
  }, [listing?.id]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!cancelled) setSessionUser(session?.user || null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (!listing) return null;
  const loginNext = `/login?next=${encodeURIComponent(`/share/${listing.id}`)}`;
  /* VIDEO TOUR - temporarily hidden
  let videoTourUrl = fullListingUrl;
  try {
    const u = new URL(fullListingUrl);
    u.searchParams.set("tab", "video");
    videoTourUrl = u.toString();
  } catch {
    videoTourUrl = `${String(fullListingUrl).replace(/\/?$/, "")}?tab=video`;
  }
  */

  const fields = [
    ["Type", listing.propertyType],
    ["Listing", listing.listingType],
    ["Size", listing.sizesqft ? `${listing.sizesqft} sqft` : null],
    ["Beds", listing.bedrooms || null],
    ["Baths", listing.bathrooms || null],
    ["Furnishing", listing.furnishingStatus],
  ].filter(([, v]) => v);

  return (
    <div style={{ minHeight: "100vh", background: "var(--cream)", fontFamily: "'Inter',sans-serif" }}>
      <style>{G}</style>
      <header
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          padding: "18px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <Image
          src="/northing-logo.svg"
          alt="Northing"
          onClick={() => navigate("/")}
          width={220}
          height={48}
          style={{ height: 48, maxWidth: 260, width: "auto", objectFit: "contain", cursor: "pointer" }}
          priority
        />
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <a href={fullListingUrl} style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: 600 }}>
            Full listing view →
          </a>
          <button
            type="button"
            onClick={() => navigate("/")}
            style={{
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.25)",
              color: "#fff",
              padding: "8px 16px",
              borderRadius: 9,
              fontSize: 13,
              cursor: "pointer",
              fontFamily: "inherit",
              fontWeight: 600,
            }}
          >
            Browse all homes
          </button>
        </div>
      </header>
      <div style={{ maxWidth: 880, margin: "0 auto", padding: "28px 20px 48px" }}>
        <p
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: "var(--primary)",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 10,
          }}
        >
          Shared with you
        </p>
        {listing.photos?.[0] && (
          <div style={{ borderRadius: 16, overflow: "hidden", marginBottom: 24, boxShadow: "var(--shadow-lg)" }}>
            <Image
              src={listing.photos[0]}
              alt={listing.title || "Property photo"}
              width={1200}
              height={640}
              style={{ width: "100%", height: 320, objectFit: "cover", display: "block" }}
            />
          </div>
        )}
        <h1
          style={{
            fontFamily: "'Fraunces',serif",
            fontSize: "clamp(26px, 4vw, 34px)",
            fontWeight: 900,
            color: "var(--navy)",
            lineHeight: 1.2,
            marginBottom: 8,
          }}
        >
          {listing.title}
        </h1>
        <div style={{ fontSize: 15, color: "var(--muted)", marginBottom: 16 }}>📍 {listing.location}</div>
        <div
          style={{
            fontFamily: "'Fraunces',serif",
            fontSize: 36,
            fontWeight: 900,
            color: "var(--primary)",
            marginBottom: 20,
          }}
          suppressHydrationWarning
        >
          {fmtP(listing.price)}
          {listing.listingType === "Rent" && (
            <span style={{ fontSize: 16, fontWeight: 500, color: "var(--muted)" }}>/month</span>
          )}
        </div>
        {listing.description && (
          <p
            style={{
              fontSize: 15,
              color: "var(--text)",
              lineHeight: 1.75,
              marginBottom: 24,
              background: "#fff",
              padding: 18,
              borderRadius: 12,
              border: "1px solid var(--border)",
            }}
          >
            {listing.description}
          </p>
        )}
        {fields.length > 0 && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))",
              gap: 12,
              marginBottom: 28,
            }}
          >
            {fields.map(([k, v]) => (
              <div key={k} style={{ background: "#fff", padding: "12px 14px", borderRadius: 10, border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 700 }}>{k}</div>
                <div style={{ fontWeight: 700, color: "var(--navy)", marginTop: 4 }}>{v}</div>
              </div>
            ))}
          </div>
        )}
        {listing.location && (
          <div style={{ marginBottom: 28 }}>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: "var(--primary)",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 10,
              }}
            >
              Location
            </div>
            <iframe
              title="Map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location)}&output=embed`}
              style={{ width: "100%", height: 240, border: "1px solid var(--border)", borderRadius: 12 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        )}
        <div style={{ background: "var(--primary-light)", borderRadius: 16, padding: 24, border: "1px solid var(--primary-mid)" }}>
          <p className="section-label" style={{ marginBottom: 12 }}>
            Contact
          </p>
          <div style={{ fontWeight: 800, fontSize: 17, color: "var(--navy)", marginBottom: 6 }}>
            {listing.agentName}{" "}
            <span style={{ fontWeight: 500, color: "var(--muted)" }}>· {listing.agencyName || "Agent"}</span>
          </div>
          {listing.agentPhone && (
            <div style={{ marginBottom: 14 }}>
              {sessionUser ? (
                <>
                  📞{" "}
                  <a href={`tel:${listing.agentPhone}`} style={{ color: "var(--primary)", fontWeight: 700 }}>
                    {listing.agentPhone}
                  </a>
                </>
              ) : (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => navigate(loginNext)}
                  style={{ padding: "8px 14px", borderRadius: 9, fontSize: 13 }}
                >
                  🔒 Login to view contact
                </button>
              )}
            </div>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {listing.agentPhone && sessionUser && (
              <a
                href={`https://wa.me/${listing.agentPhone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="btn-primary"
                style={{
                  padding: "11px 18px",
                  borderRadius: 10,
                  fontSize: 14,
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <WALogo size={16} />
                WhatsApp
              </a>
            )}
            <button
              type="button"
              onClick={() => _h.openWA(listing)}
              style={{
                padding: "11px 18px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                background: "#128C7E",
                color: "#fff",
                border: "none",
                fontFamily: "inherit",
              }}
            >
              WhatsApp
            </button>
            {listing.agentPhone && !sessionUser ? (
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(loginNext)}
                style={{ padding: "11px 18px", borderRadius: 10, fontSize: 14 }}
              >
                Login to contact broker
              </button>
            ) : null}
            <button type="button" onClick={() => _h.openPDF(listing)} className="btn-outline" style={{ padding: "11px 18px", borderRadius: 10, fontSize: 14, fontWeight: 700 }}>
              PDF
            </button>
            {/* VIDEO TOUR - temporarily hidden
            {listing.videoPlaybackId ? (
              <a
                href={videoTourUrl}
                style={{
                  padding: "11px 18px",
                  borderRadius: 10,
                  fontSize: 14,
                  fontWeight: 700,
                  cursor: "pointer",
                  background: "#0f172a",
                  color: "#fff",
                  border: "none",
                  fontFamily: "inherit",
                  textDecoration: "none",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                🎥 Video
              </a>
            ) : null}
            */}
            <button
              type="button"
              onClick={() => _h.openKit(listing)}
              style={{
                padding: "11px 18px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                background: "#fff",
                color: "var(--primary)",
                border: "2px solid var(--primary)",
                fontFamily: "inherit",
              }}
            >
              Marketing kit
            </button>
          </div>
        </div>
        <p style={{ textAlign: "center", fontSize: 12, color: "var(--muted)", marginTop: 32 }}>
          Powered by Northing ·{" "}
          <a href={fullListingUrl} style={{ color: "var(--primary)", fontWeight: 600 }}>
            Open full listing
          </a>
        </p>
      </div>
      {waListing && <WACardModal listing={waListing} onClose={() => setWaListing(null)} currentUser={viewerBrand} />}
      {pdfListing && <PDFModal listing={pdfListing} onClose={() => setPdfListing(null)} currentUser={viewerBrand} />}
      {kitListing && <MarketingKitModal listing={kitListing} onClose={() => setKitListing(null)} currentUser={viewerBrand} />}
    </div>
  );
}
