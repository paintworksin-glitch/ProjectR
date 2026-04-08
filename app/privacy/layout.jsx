export const runtime = "nodejs";

export const metadata = {
  title: "Privacy Policy — Northing",
  description: "How Northing collects, uses, and protects your information.",
  openGraph: {
    title: "Privacy Policy — Northing",
    description: "How Northing collects, uses, and protects your information.",
    siteName: "Northing",
  },
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyLayout({ children }) {
  return children;
}
