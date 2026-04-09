import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export default function PropertySegmentLayout({ children }) {
  return <RouteErrorBoundary>{children}</RouteErrorBoundary>;
}
