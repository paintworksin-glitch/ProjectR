export const runtime = "nodejs";

export const metadata = {
  title: "Contact — Northing",
  description: "Contact Northing for product support, onboarding, and partnership requests.",
  openGraph: {
    title: "Contact — Northing",
    description: "Contact Northing for product support, onboarding, and partnership requests.",
    siteName: "Northing",
  },
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactLayout({ children }) {
  return children;
}
