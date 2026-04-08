"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { fmtP } from "@/lib/formatPrice";
import { G } from "./globalStyles.js";
import { PROPERTY_BACK_STORAGE_KEY } from "./northingConstants.js";
import { supabase } from "@/lib/supabaseClient";
import { useNorthing } from "./NorthingContext.jsx";
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
 * Public property detail — data from server (SSR + OG); client UI, auth gates, enquiry, save.
 */
export default function PropertyPublicPageClient({ id, initialListing }) {
  const router = useRouter();
  const { user, showToast, refreshSessionUser } = useNorthing();
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
  const [enquiryMsg, setEnquiryMsg] = useState("Hi, I am interested in this property");
  const [enquiryBusy, setEnquiryBusy] = useState(false);
  const [saveBusy, setSaveBusy] = useState(false);
  const [savedLocal, setSavedLocal] = useState(null);

  const viewerBrand = useViewerBrandProfile();
  const agentBrand = useListingAgentBrand(listing, null);

  const isSaved =
    savedLocal !== null ? savedLocal : !!(user?.savedListings && user.savedListings.includes(listing?.id));

  useEffect(() => {
    setSavedLocal(null);
  }, [listing?.id, user?.id]);

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

  const loginNext = `/login?next=${encodeURIComponent(`/property/${listing.id}`)}`;

  const contactBroker = () => {
    if (!user) {
      router.push(loginNext);
      return;
    }
    if (!listing?.agentPhone) return;
    const digits = String(listing.agentPhone).replace(/\D/g, "");
    if (digits.length >= 10) window.open(`https://wa.me/${digits}`, "_blank", "noopener,noreferrer");
    else window.location.href = `tel:${listing.agentPhone}`;
  };

  const toggleSave = async () => {
    if (!user) {
      router.push(loginNext);
      return;
    }
    if (user.role !== "user") {
      showToast("Only buyers can save listings", "error");
      return;
    }
    setSaveBusy(true);
    try {
      const sid = listing.id;
      if (isSaved) {
        await supabase.from("saved_listings").delete().eq("user_id", user.id).eq("listing_id", sid);
        setSavedLocal(false);
        await refreshSessionUser?.();
        showToast("Removed from saved", "success");
      } else {
        await supabase.from("saved_listings").insert({ user_id: user.id, listing_id: sid });
        setSavedLocal(true);
        await refreshSessionUser?.();
        showToast("Saved", "success");
      }
    } catch (e) {
      showToast(e.message || "Could not update", "error");
    }
    setSaveBusy(false);
  };

  const sendEnquiry = async () => {
    if (!user) {
      router.push(loginNext);
      return;
    }
    const msg = enquiryMsg.trim();
    if (!msg) {
      showToast("Enter a message", "error");
      return;
    }
    setEnquiryBusy(true);
    try {
      const res = await fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing_id: listing.id, message: msg }),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(j.error || "Failed to send");
      showToast("Your enquiry has been sent. The agent will contact you shortly.", "success");
      setEnquiryMsg("Hi, I am interested in this property");
    } catch (e) {
      showToast(e.message || "Enquiry failed", "error");
    }
    setEnquiryBusy(false);
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
  const verifiedBadge = listing.ownerAgentVerified === true;

  return (
    <div className="property-detail-page" style={{ fontFamily: "'Inter',sans-serif" }}>
      <style>{G}</style>
      <header className="property-detail-topbar">
        <button type="button" className="property-detail-back" onClick={goBack} aria-label="Back">
          ← Back
        </button>
        <Image
          className="property-detail-logo"
          src="/northing-logo.svg"
          alt="Northing"
          onClick={goHome}
          width={160}
          height={36}
          priority
        />
        <button
          type="button"
          onClick={toggleSave}
          disabled={saveBusy}
          style={{
            marginLeft: "auto",
            background: "rgba(255,255,255,0.95)",
            border: "1px solid var(--border)",
            borderRadius: 999,
            width: 40,
            height: 40,
            cursor: "pointer",
            fontSize: 18,
          }}
          title={!user ? "Sign in to save" : "Save listing"}
          aria-label="Save listing"
        >
          {!user ? "🤍" : user.role === "user" ? (isSaved ? "❤️" : "🤍") : "🤍"}
        </button>
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
            <span className="northing-show-desktop">{user ? "Contact Broker" : "🔒 Login to view contact"}</span>
            <span className="northing-show-mobile">{user ? "📞 View Contact" : "🔒 Login to view contact"}</span>
          </button>
        </div>

        <section style={{ marginTop: 28, padding: 20, borderRadius: 12, border: "1px solid var(--border)", background: "var(--white)" }} aria-labelledby="enquiry-heading">
          <h2 id="enquiry-heading" className="section-label" style={{ marginBottom: 12 }}>
            Enquiry
          </h2>
          {!user ? (
            <button type="button" className="btn-primary" onClick={() => router.push(loginNext)} style={{ width: "100%", padding: 12 }}>
              Login to send enquiry
            </button>
          ) : (
            <>
              <textarea
                className="inp"
                rows={4}
                value={enquiryMsg}
                onChange={(e) => setEnquiryMsg(e.target.value)}
                style={{ width: "100%", marginBottom: 12, resize: "vertical" }}
              />
              <button type="button" className="btn-primary" onClick={sendEnquiry} disabled={enquiryBusy} style={{ width: "100%", padding: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
                {enquiryBusy ? (
                  <>
                    <span className="spin" /> Sending…
                  </>
                ) : (
                  "Send Enquiry →"
                )}
              </button>
            </>
          )}
        </section>

        <section className="property-detail-broker" aria-labelledby="property-broker-heading">
          <h2 id="property-broker-heading" className="section-label" style={{ marginBottom: 14 }}>
            Broker
          </h2>
          <div className="property-detail-broker-row">
            <div className="property-detail-broker-photo" suppressHydrationWarning>
              {agentBrand?.logoUrl ? (
                <Image src={agentBrand.logoUrl} alt="" width={56} height={56} style={{ width: "100%", height: "100%", objectFit: "contain", boxSizing: "border-box", padding: 2 }} />
              ) : (
                brokerInitial
              )}
            </div>
            <div>
              <p className="property-detail-broker-name" style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                {listing.agentName || "Agent"}
                {verifiedBadge ? (
                  <span style={{ fontSize: 10, fontWeight: 800, background: "#059669", color: "#fff", padding: "3px 8px", borderRadius: 999 }}>✅ Verified Agent</span>
                ) : null}
              </p>
              <p className="property-detail-broker-meta">{listing.agencyName || "—"}</p>
            </div>
          </div>
          {user && listing.agentPhone ? (
            <p className="property-detail-broker-phone">
              📞 <a href={`tel:${listing.agentPhone.replace(/\s/g, "")}`}>{listing.agentPhone}</a>
            </p>
          ) : listing.agentPhone ? (
            <button type="button" className="btn-primary" onClick={() => router.push(loginNext)} style={{ marginTop: 12, width: "100%" }}>
              🔒 Login to view contact
            </button>
          ) : (
            <p className="property-detail-broker-meta" style={{ marginTop: 12 }}>
              Phone on request
            </p>
          )}
        </section>
      </div>

      <div className="property-detail-bottom-cta">
        <button type="button" className="btn-primary" onClick={contactBroker} disabled={!listing.agentPhone}>
          <span className="northing-show-desktop">{user ? "Contact Broker" : "🔒 Login to view contact"}</span>
          <span className="northing-show-mobile">{user ? "📞 View Contact" : "🔒 Login to view contact"}</span>
        </button>
      </div>

      {waListing ? <WACardModal listing={waListing} onClose={() => setWaListing(null)} currentUser={viewerBrand} /> : null}
      {pdfListing ? <PDFModal listing={pdfListing} onClose={() => setPdfListing(null)} currentUser={viewerBrand} /> : null}
    </div>
  );
}
