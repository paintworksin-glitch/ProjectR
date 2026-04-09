"use client";

import { NorthingErrorBoundary } from "./NorthingErrorBoundary";

/** Server layouts can wrap pages that skip AppChrome so crashes still get a recovery UI. */
export function RouteErrorBoundary({ children }) {
  return <NorthingErrorBoundary>{children}</NorthingErrorBoundary>;
}
