/**
 * Format @mux/mux-node errors for logs and safe client responses (no secrets).
 * @param {unknown} err
 */
export function muxErrorForLog(err) {
  if (err && typeof err === "object") {
    const o = /** @type {{ message?: string; status?: number; name?: string; error?: unknown; stack?: string }} */ (err);
    return {
      message: o.message,
      status: o.status,
      name: o.name,
      error: o.error,
      stack: o.stack,
    };
  }
  return { message: String(err) };
}

/**
 * Single-line message suitable for JSON `error` (truncated, no stack).
 * @param {unknown} err
 */
export function muxErrorForClient(err) {
  const { message, status, error } = muxErrorForLog(err);
  const parts = [];
  if (status != null) parts.push(`Mux ${status}`);
  if (message) parts.push(String(message));
  if (error && typeof error === "object" && error !== null) {
    const e = /** @type {{ type?: string; messages?: string[] }} */ (error);
    if (e.type) parts.push(String(e.type));
    if (Array.isArray(e.messages) && e.messages.length) parts.push(e.messages.join("; "));
  }
  let s = parts.join(" — ").replace(/\s+/g, " ").trim();
  if (s.length > 480) s = `${s.slice(0, 477)}...`;
  return s || "Mux API request failed";
}
