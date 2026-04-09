import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export const runtime = "nodejs";

export default function OnboardingLayout({ children }) {
  return <RouteErrorBoundary>{children}</RouteErrorBoundary>;
}
