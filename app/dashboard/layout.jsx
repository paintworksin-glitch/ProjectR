export const runtime = "nodejs";

export const metadata = {
  title: "Dashboard — Northing",
  description: "Manage your listings, profile, and property marketing on Northing.",
  openGraph: {
    title: "Dashboard — Northing",
    description: "Manage your listings, profile, and property marketing on Northing.",
    siteName: "Northing",
  },
};

export default function DashboardLayout({ children }) {
  return children;
}
