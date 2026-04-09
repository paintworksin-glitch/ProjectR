/** User-facing copy (signup / profile forms). */
export const PHONE_INLINE_ERROR = "Please enter a valid 10-digit mobile number";

/** Server / save validation message. */
export const PHONE_SERVER_ERROR = "Mobile number must be exactly 10 digits";

/** Last 10 digits from normalized input, or "" if fewer than 10 digits available. */
export function digits10From(input) {
  const d = String(input ?? "").replace(/\D/g, "");
  return d.length >= 10 ? d.slice(-10) : "";
}

/** True if empty or exactly 10 digits (national). */
export function isEmptyOrTenDigitMobile(input) {
  const d = String(input ?? "").replace(/\D/g, "");
  if (!d) return true;
  return d.length >= 10 && /^\d{10}$/.test(d.slice(-10));
}

/**
 * For optional phone fields: null if blank, else 10-digit string or throws PHONE_SERVER_ERROR.
 */
export function parseMobile10StrictOrNull(input) {
  const s = String(input ?? "").trim();
  if (!s) return null;
  const d = digits10From(s);
  if (d.length !== 10) {
    throw new Error(PHONE_SERVER_ERROR);
  }
  return d;
}
