/**
 * Allow only same-origin relative paths (blocks open redirects to //evil.com).
 */
export function safeNextPath(next, fallback = "/dashboard") {
  if (!next || typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}
