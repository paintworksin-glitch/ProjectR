"use client";

import { ErrorBoundary, PropertyPublicPage } from "@/modules/NorthingApp.jsx";

export default function PropertyPageClient({ id }) {
  return (
    <ErrorBoundary>
      <PropertyPublicPage id={id} />
    </ErrorBoundary>
  );
}
