export const LEAD_STAGES = ["New", "Contacted", "Site Visit", "Offer", "Closed", "Lost"];
export const BROKER_TABS = [
  ["listings", "🏠", "Listings"],
  ["market", "🎨", "Market"],
  ["leads", "📇", "Leads"],
  ["docs", "📁", "Docs"],
  ["insights", "📈", "Insights"],
];

export const normalizeListingStatus = (status) => {
  const s = String(status || "").toLowerCase();
  if (["sold", "closed"].includes(s)) return "sold";
  if (["offer", "rented"].includes(s)) return "offer";
   if (["inactive"].includes(s)) return "inactive"; 
  return "active";
};

export const formatConversionRate = (closed = 0, total = 0) => {
  if (!total) return "0%";
  return `${Math.round((closed / total) * 100)}%`;
};
