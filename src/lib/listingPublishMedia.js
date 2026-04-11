/** Shown when publish is blocked (client toasts + field errors + API responses). */
export const LISTING_PUBLISH_MEDIA_ERROR =
  "Please add at least one photo or a video tour before publishing";

/** Server / API validation when status is not draft. */
export const LISTING_PUBLISH_SERVER_ERROR = "Cannot publish listing without photos or video";

/**
 * @param {{ status?: string | null, photos?: unknown, video_id?: string | null }} payload
 */
export function validateListingPublishPayload(payload) {
  const st = String(payload?.status ?? "").trim();
  if (st.toLowerCase() === "draft") return { ok: true };
  const photos = Array.isArray(payload?.photos) ? payload.photos : [];
  const photoCount = photos.filter(Boolean).length;
  const hasVideo = payload?.video_id != null && String(payload.video_id).trim() !== "";
  if (photoCount === 0 && !hasVideo) {
    return { ok: false, error: LISTING_PUBLISH_SERVER_ERROR };
  }
  return { ok: true };
}

/**
 * @param {{ photos?: unknown, video_id?: string | null, video_status?: string | null }} row
 * Supabase listing row (snake_case).
 */
export function listingRowHasPublishableMedia(row) {
  const photos = Array.isArray(row?.photos) ? row.photos : [];
  if (photos.filter(Boolean).length > 0) return true;
  const vid = row?.video_id != null && String(row.video_id).trim() !== "";
  const vs = row?.video_status;
  if (vid && vs !== "failed") return true;
  return false;
}

/**
 * @param {object} form Listing form state (camelCase, muxVideoAssetId = DB video_id).
 * @param {boolean} [pendingVideoFile] Selected file that will upload after save/publish.
 */
export function listingFormHasPublishableMedia(form, pendingVideoFile) {
  if (pendingVideoFile) return true;
  const photos = Array.isArray(form?.photos) ? form.photos : [];
  if (photos.filter(Boolean).length > 0) return true;
  const vid = form?.muxVideoAssetId != null && String(form.muxVideoAssetId).trim() !== "";
  const vs = form?.videoStatus;
  if (vid && vs !== "failed") return true;
  return false;
}
