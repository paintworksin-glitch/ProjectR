export const runtime = "nodejs";

export const metadata = {
  title: "Pricing — Northing",
  description: "Simple plans for buyers, sellers, and agents using Northing.",
  openGraph: {
    title: "Pricing — Northing",
    description: "Simple plans for buyers, sellers, and agents using Northing.",
    siteName: "Northing",
  },
  alternates: {
    canonical: "/pricing",
  },
};

export default function PricingLayout({ children }) {
  return children;
}
