/** Indian real estate price formatting (₹ Cr / L / locale). */
export function fmtP(p) {
  if (!p) return "POA";
  const n = Number(p);
  if (n >= 10000000) return `₹${(n / 10000000).toFixed(2)} Cr`;
  if (n >= 100000) return `₹${(n / 100000).toFixed(2)} L`;
  return `₹${n.toLocaleString("en-IN")}`;
}
