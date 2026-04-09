import { RouteErrorBoundary } from "@/components/RouteErrorBoundary";

export const dynamic = "force-dynamic";

export default function ResetPasswordLayout({ children }) {
  return <RouteErrorBoundary>{children}</RouteErrorBoundary>;
}
