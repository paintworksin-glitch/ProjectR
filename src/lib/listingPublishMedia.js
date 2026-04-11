/** Shown when publish is blocked (client toasts + field errors + API responses). */
export const LISTING_PUBLISH_MEDIA_ERROR =
  "Please add at least one photo or a video tour before publishing";

/**
 * @param {{ photos?: unknown, video_id?: string | null, video_status?: string | null }} row
 * Supabase listing row (snake_case).
 */
export function listingRowHasPublishableMedia(row) {
  const photos = Array.isArray(row?.photos) ? row.photos : [];
  if (photos.filter(Boolean).length > 0) return true;
  const vid = row?.video_id != null && String(row.video_id).trim() !== "";
  const vs = row?.video_status;
  if (vid && (vs === "ready" || vs === "processing")) return true;
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
  if (vid && (vs === "ready" || vs === "processing")) return true;
  return false;
}
