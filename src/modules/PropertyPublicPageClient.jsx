"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { fmtP } from "@/lib/formatPrice";
import { G } from "./globalStyles.js";
import { PROPERTY_BACK_STORAGE_KEY } from "./northingConstants.js";
import {
  _h,
  PDFModal,
  WACardModal,
  PropertyDetailCarousel,
  WALogo,
  useViewerBrandProfile,
  useListingAgentBrand,
  track,
} from "./NorthingApp.jsx";

/**
 * Public property detail — data from server (SSR + OG); this file is UI + client analytics only.
 */
export default function PropertyPublicPageClient({ id, initialListing }) {
  const router = useRouter();
  const listing = initialListing;

  const goHome = () => {
    router.push("/");
  };
  const goBack = () => {
    try {
      const target = sessionStorage.getItem(PROPERTY_BACK_STORAGE_KEY);
      if (target) {
        sessionStorage.removeItem(PROPERTY_BACK_STORAGE_KEY);
        router.push(target);
        return;
      }
    } catch {
      /* ignore */
    }
    if (typeof window !== "undefined" && window.history.length > 1) router.back();
    else goHome();
  };

  const [waListing, setWaListing] = useState(null);
  const [pdfListing, setPdfListing] = useState(null);
  const [descExpanded, setDescExpanded] = useState(false);
  const viewerBrand = useViewerBrandProfile();
  const agentBrand = useListingAgentBrand(listing, null);

  useEffect(() => {
    _h.openWA = (l) => setWaListing(l);
    _h.openPDF = (l) => setPdfListing(l);
    _h.openKit = () => {};
  }, []);

  useEffect(() => {
    if (listing?.id) {
      track(listing.id, "pageview");
      track(listing.id, "view");
    }
  }, [listing?.id]);

  useEffect(() => {
    setDescExpanded(false);
  }, [id]);

  useEffect(() => {
    if (listing) window.scrollTo(0, 0);
  }, [listing?.id]);

  if (!listing) return null;

  const contactBroker = () => {
    if (!listing?.agentPhone) return;
    const digits = String(listing.agentPhone).replace(/\D/g, "");
    if (digits.length >= 10) window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
    else window.location.href = `tel:${listing.agentPhone}`;
  };

  const desc = (listing.description || "").trim();
  const descLong = desc.length > 280;
  const descShown = descExpanded || !descLong ? desc : `${desc.slice(0, 280).trim()}…`;

  const chips = [];
  if (listing.bedrooms) chips.push({ icon: "🛏", label: `${listing.bedrooms} BHK` });
  if (listing.carpetArea) chips.push({ icon: "📐", label: `Carpet ${listing.carpetArea} sqft` });
  if (listing.propertyFloor !== undefined && listing.propertyFloor !== null && listing.propertyFloor !== "")
    chips.push({ icon: "🏢", label: `Floor ${listing.propertyFloor}` });
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
        <p className="property-detail-price" suppressHydrationWarning>
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
            <p className="property-detail-ai-note">
              This text is auto-generated for readability. Always confirm details with the broker.
            </p>
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
          <button type="button" className="btn-outline" onClick={() => _h.openWA(listing)}>
            <WALogo size={16} /> Download WhatsApp Card
          </button>
          <button type="button" className="btn-outline" onClick={() => _h.openPDF(listing)}>
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
            <div className="property-detail-broker-photo" suppressHydrationWarning>
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
            <p className="property-detail-broker-meta" style={{ marginTop: 12 }}>
              Phone on request
            </p>
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
}
