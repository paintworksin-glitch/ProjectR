const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

/**
 * Escape text for HTML body content (emails, etc.).
 */
export function escapeHtml(value) {
  if (value == null) return "";
  return String(value).replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch] || ch);
}

/**
 * Strip control chars and newlines from email subjects (avoid header injection).
 */
export function safeEmailSubject(value, maxLen = 200) {
  return String(value ?? "")
    .replace(/[\r\n]+/g, " ")
    .replace(/[\x00-\x1f\x7f]/g, "")
    .slice(0, maxLen);
}
