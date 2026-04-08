export const runtime = "nodejs";

export const metadata = {
  title: "Terms of Service — Northing",
  description: "Terms and conditions for using the Northing property marketing platform.",
  openGraph: {
    title: "Terms of Service — Northing",
    description: "Terms and conditions for using the Northing property marketing platform.",
    siteName: "Northing",
  },
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsLayout({ children }) {
  return children;
}
