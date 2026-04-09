import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export default function ShareSegmentLayout({ children }) {
  return <RouteErrorBoundary>{children}</RouteErrorBoundary>;
}
