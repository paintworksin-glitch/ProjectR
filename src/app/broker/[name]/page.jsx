"use client";

import { ErrorBoundary, BrokerPublicPage } from "@/modules/NorthingApp.jsx";

export default function BrokerPage({ params }) {
  return (
    <ErrorBoundary>
      <BrokerPublicPage name={params.name} />
    </ErrorBoundary>
  );
}
