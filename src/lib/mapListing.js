/** Allowed keys from `listings.details` JSONB — arbitrary keys cannot override table-backed fields. */
const LISTING_DETAIL_KEYS = [
  "toilets", "condition", "builtYear", "modernKitchen", "wcType", "superBuiltUp", "carpetArea",
  "parkingType", "vastuDirection", "totalFloors", "propertyFloor", "maintenance", "societyFormed",
  "ocReceived", "reraRegistered", "reraNumber", "logoUrl", "agentAddress", "agentWebsite", "aiDescription",
  "videoFramePhotos",
];

function pickListingDetails(raw) {
  const d = raw && typeof raw === "object" ? raw : null;
  if (!d) return {};
  const out = {};
  for (const k of LISTING_DETAIL_KEYS) {
    if (Object.prototype.hasOwnProperty.call(d, k) && d[k] !== undefined) out[k] = d[k];
  }
  return out;
}

export function mapListing(l) {
  if (!l) return null;
  return {
    id: l.id,
    agentId: l.agent_id,
    title: l.title,
    location: l.location,
    propertyType: l.property_type,
    listingType: l.listing_type,
    price: l.price,
    sizesqft: l.size_sqft,
    bedrooms: l.bedrooms,
    bathrooms: l.bathrooms,
    furnishingStatus: l.furnishing_status,
    status: l.status,
    featured: l.featured === true,
    description: l.description,
    highlights: l.highlights || [],
    agentName: l.agent_name,
    agentPhone: l.agent_phone,
    agentEmail: l.agent_email,
    agencyName: l.agency_name,
    photos: l.photos || [],
    createdAt: l.created_at,
    ...pickListingDetails(l.details),
    logoUrl: l.details?.logoUrl ?? null,
    agentAddress: l.details?.agentAddress ?? null,
    agentWebsite: l.details?.agentWebsite ?? null,
    viewCount: l.view_count || 0,
    waCount: l.wa_count || 0,
    pdfCount: l.pdf_count || 0,
    ownerAgentVerified: l._ownerAgentVerified === true,
    muxVideoAssetId: l.video_id || null,
    videoPlaybackId: l.video_playback_id || null,
    videoProvider: l.video_provider || "mux",
    videoStatus: l.video_status || "processing",
    videoViewCount: l.video_view_count ?? 0,
  };
}
