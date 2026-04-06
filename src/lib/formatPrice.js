/**
 * Indian digit grouping (12,34,567) without toLocaleString — same output on Node SSR and browsers
 * (avoids React hydration mismatches from locale engine differences).
 */
function formatIndianIntegerDigits(intDigits) {
  const s = String(intDigits).replace(/\D/g, "");
  if (s.length <= 3) return s;
  const last3 = s.slice(-3);
  let rest = s.slice(0, -3);
  const parts = [last3];
  while (rest.length > 0) {
    parts.unshift(rest.slice(-2));
    rest = rest.slice(0, -2);
  }
  return parts.join(",");
}

/** Indian real estate price formatting (₹ Cr / L / locale). */
export function fmtP(p) {
  if (!p) return "POA";
  const n = Number(p);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  const neg = n < 0;
  const abs = Math.abs(n);
  // Round to 2 decimals first — avoids float string drift between Node and browser
  const rounded2 = Number(abs.toFixed(2));
  const intPart = Math.floor(rounded2 + 1e-9);
  const frac = rounded2 - intPart;
  const intGrouped = formatIndianIntegerDigits(intPart);
  if (frac < 1e-9) return `₹${neg ? "-" : ""}${intGrouped}`;
  const fracStr = frac.toFixed(2).slice(2).replace(/0+$/, "") || "0";
  return `₹${neg ? "-" : ""}${intGrouped}.${fracStr}`;
}
