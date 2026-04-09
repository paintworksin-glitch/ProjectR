import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export const runtime = "nodejs";

export const metadata = {
  title: "Create account — Northing",
  description: "Join Northing to list properties, save favourites, and manage your broker profile.",
  openGraph: {
    title: "Create account — Northing",
    description: "Join Northing to list properties, save favourites, and manage your broker profile.",
    siteName: "Northing",
  },
};

export default function SignupLayout({ children }) {
  return <RouteErrorBoundary>{children}</RouteErrorBoundary>;
}
