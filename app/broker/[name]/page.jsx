import { BrokerPublicPage } from "@/modules/NorthingApp";

export default function BrokerRoutePage({ params }) {
  return <BrokerPublicPage name={params.name} />;
}
