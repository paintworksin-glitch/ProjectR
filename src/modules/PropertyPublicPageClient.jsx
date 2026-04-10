"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { fmtP } from "@/lib/formatPrice";
import { G } from "./globalStyles.js";
import { OPEN_ENQUIRIES_TAB_STORAGE_KEY, PROPERTY_BACK_STORAGE_KEY } from "./northingConstants.js";
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
import { NorthingMuxPlayer } from "@/components/NorthingMuxPlayer";

/**
 * Public property detail — data from server (SSR + OG); client UI, auth gates, enquiry, save.
 */
export default function PropertyPublicPageClient({ id, initialListing }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, showToast, refreshSessionUser } = useNorthing();
  const listing = initialListing;
  const [toolTab, setToolTab] = useState("wa");

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
  const [enquirySent, setEnquirySent] = useState(false);
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
    setEnquirySent(false);
  }, [id]);

  useEffect(() => {
    const t = searchParams.get("tab");
    if (t === "video" && listing?.videoPlaybackId) setToolTab("video");
    else if (t === "pdf") setToolTab("pdf");
    else if (t === "wa") setToolTab("wa");
  }, [searchParams, listing?.videoPlaybackId]);

  const syncToolTab = (t) => {
    setToolTab(t);
    if (listing?.id) {
      router.replace(`/property/${listing.id}?tab=${encodeURIComponent(t)}`, { scroll: false });
    }
  };

  useEffect(() => {
    if (listing) window.scrollTo(0, 0);
  }, [listing?.id]);

  if (!listing) return null;

  const listingActive = listing.status === "Active";
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
    if (!listingActive) {
      showToast("This listing is not active.", "error");
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
      try {
        sessionStorage.setItem(OPEN_ENQUIRIES_TAB_STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
      setEnquirySent(true);
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
  const breadcrumbTitle =
    (listing.title || "Listing").length > 52
      ? `${(listing.title || "Listing").slice(0, 49)}…`
      : listing.title || "Listing";

  const statusLabel =
    listing.status === "Active"
      ? { text: "Active listing", tone: "ok" }
      : listing.status === "Sold"
        ? { text: "Sold", tone: "muted" }
        : listing.status === "Rented"
          ? { text: "Rented", tone: "muted" }
          : listing.status === "Inactive"
            ? { text: "Inactive", tone: "warn" }
            : { text: listing.status || "Listing", tone: "muted" };

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
        <nav className="property-detail-breadcrumb" aria-label="Breadcrumb">
          <button type="button" className="property-detail-breadcrumb__link" onClick={() => router.push("/")}>
            Home
          </button>
          <span className="property-detail-breadcrumb__sep" aria-hidden>
            /
          </span>
          <button type="button" className="property-detail-breadcrumb__link" onClick={() => router.push("/feed")}>
            Browse
          </button>
          <span className="property-detail-breadcrumb__sep" aria-hidden>
            /
          </span>
          <span className="property-detail-breadcrumb__current" title={listing.title || ""}>
            {breadcrumbTitle}
          </span>
        </nav>
        <h1 className="property-detail-title">{listing.title}</h1>
        <p className="property-detail-loc">📍 {listing.location}</p>
        <p style={{ margin: "8px 0 0", fontSize: 13, fontWeight: 600 }}>
          <span
            style={{
              display: "inline-block",
              padding: "4px 10px",
              borderRadius: 999,
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 0.02,
              background:
                statusLabel.tone === "ok"
                  ? "#ECFDF5"
                  : statusLabel.tone === "warn"
                    ? "#FEF3C7"
                    : "#F3F4F6",
              color: statusLabel.tone === "ok" ? "#065F46" : statusLabel.tone === "warn" ? "#92400E" : "#475569",
              border:
                statusLabel.tone === "ok"
                  ? "1px solid #A7F3D0"
                  : statusLabel.tone === "warn"
                    ? "1px solid #FDE68A"
                    : "1px solid #E5E7EB",
            }}
          >
            {statusLabel.text}
          </span>
          {listing.listingType ? (
            <span style={{ marginLeft: 8, color: "var(--muted)", fontWeight: 600 }}>{listing.listingType}</span>
          ) : null}
        </p>
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

        <div
          className="property-detail-actions property-detail-actions--tools"
          style={{
            display: "grid",
            gridTemplateColumns: listing.videoPlaybackId ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
            gap: 8,
          }}
        >
          <button
            type="button"
            className={`property-detail-tool-btn ${toolTab === "wa" ? "btn-primary" : "btn-outline"}`}
            onClick={() => {
              syncToolTab("wa");
              _h.openWA(listing);
            }}
          >
            <WALogo size={15} /> WhatsApp card
          </button>
          <button
            type="button"
            className={`property-detail-tool-btn ${toolTab === "pdf" ? "btn-primary" : "btn-outline"}`}
            onClick={() => {
              syncToolTab("pdf");
              _h.openPDF(listing);
            }}
          >
            📄 PDF brochure
          </button>
          {listing.videoPlaybackId ? (
            <button
              type="button"
              className={`property-detail-tool-btn ${toolTab === "video" ? "btn-primary" : "btn-outline"}`}
              onClick={() => syncToolTab("video")}
            >
              🎥 Video Tour
            </button>
          ) : null}
        </div>

        {toolTab === "video" && listing.videoPlaybackId ? (
          <div style={{ margin: "0 0 24px" }} className="property-detail-video-panel">
            <NorthingMuxPlayer
              playbackId={listing.videoPlaybackId}
              aspectRatio="16 / 9"
              onPlay={() => {
                fetch("/api/video/view", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ listingId: listing.id }),
                }).catch(() => {});
              }}
            />
          </div>
        ) : null}

        <section className="property-detail-card-block" aria-labelledby="enquiry-heading">
          <h2 id="enquiry-heading" className="section-label property-detail-card-block__title">
            Enquiry
          </h2>
          {!listingActive ? (
            <p className="property-detail-guest-note" role="status">
              This listing is not active ({String(listing.status || "unknown")}). The broker may not monitor new enquiries here—use contact options only if still shown.
            </p>
          ) : !user ? (
            <p className="property-detail-guest-note">Sign in once to message the broker — use the bar at the bottom of the screen.</p>
          ) : enquirySent ? (
            <div
              role="status"
              style={{
                padding: 14,
                borderRadius: 12,
                border: "1px solid #A7F3D0",
                background: "#ECFDF5",
                color: "#065F46",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              <strong>Enquiry sent.</strong> The listing agent can reply by phone or email. Track status anytime under{" "}
              <strong>Account → Enquiries</strong>.
              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  className="btn-outline"
                  style={{ padding: "8px 14px", borderRadius: 10, fontSize: 13, fontWeight: 700 }}
                  onClick={() => router.push("/dashboard")}
                >
                  Open My Enquiries →
                </button>
              </div>
            </div>
          ) : (
            <>
              <textarea
                className="inp"
                rows={4}
                value={enquiryMsg}
                onChange={(e) => setEnquiryMsg(e.target.value)}
                disabled={!listingActive}
                style={{ width: "100%", marginBottom: 12, resize: "vertical" }}
              />
              <button
                type="button"
                className="btn-primary"
                onClick={sendEnquiry}
                disabled={enquiryBusy || !listingActive}
                style={{ width: "100%", padding: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
              >
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
                ) : (
                  <span style={{ fontSize: 10, fontWeight: 700, color: "var(--muted)" }}>Independent broker</span>
                )}
              </p>
              <p className="property-detail-broker-meta">{listing.agencyName || "—"}</p>
              <p className="property-detail-guest-note property-detail-guest-note--tight" style={{ marginTop: 8 }}>
                Listed on Northing by this contact. Northing does not own the property; confirm details directly with the broker.
              </p>
            </div>
          </div>
          {user && listing.agentPhone ? (
            <p className="property-detail-broker-phone">
              📞 <a href={`tel:${listing.agentPhone.replace(/\s/g, "")}`}>{listing.agentPhone}</a>
            </p>
          ) : listing.agentPhone ? (
            <p className="property-detail-guest-note property-detail-guest-note--tight">Phone number unlocks after sign in (same sign-in as enquiry).</p>
          ) : (
            <p className="property-detail-broker-meta property-detail-broker-meta--spaced">Phone on request</p>
          )}
        </section>
      </div>

      <div className="property-detail-bottom-cta">
        <button
          type="button"
          className="btn-primary property-detail-bottom-cta__btn"
          onClick={() => (user ? contactBroker() : router.push(loginNext))}
          disabled={Boolean(user && (!listing.agentPhone || !listingActive))}
        >
          {user ? (
            !listingActive ? (
              "Listing not active"
            ) : !listing.agentPhone ? (
              "Phone unavailable"
            ) : (
              <>
                <span className="northing-show-desktop">Contact broker</span>
                <span className="northing-show-mobile">📞 Contact broker</span>
              </>
            )
          ) : (
            "Sign in to unlock contact"
          )}
        </button>
      </div>

      {waListing ? <WACardModal listing={waListing} onClose={() => setWaListing(null)} currentUser={viewerBrand} /> : null}
      {pdfListing ? <PDFModal listing={pdfListing} onClose={() => setPdfListing(null)} currentUser={viewerBrand} /> : null}
    </div>
  );
}
