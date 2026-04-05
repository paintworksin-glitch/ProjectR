"use client";

import { ErrorBoundary, ShareListingPage } from "@/modules/NorthingApp.jsx";

export default function SharePage({ params }) {
  return (
    <ErrorBoundary>
      <ShareListingPage id={params.id} />
    </ErrorBoundary>
  );
}
