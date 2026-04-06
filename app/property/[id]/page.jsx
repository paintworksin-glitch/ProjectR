import { PropertyPublicPage } from "@/modules/NorthingApp";

export default function PropertyRoutePage({ params }) {
  return <PropertyPublicPage id={params.id} />;
}
