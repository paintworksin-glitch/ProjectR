import HomePageClient from "./HomePageClient";

export const runtime = "nodejs";
// Never serve a stale CDN-cached shell — always SSR fresh on every request.
// The homepage has user-auth state and ?agent= params so dynamic is correct.
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Northing — Find, List & Share Properties",
  description:
    "Find, list and share properties with independent brokers across Mumbai, Thane and Navi Mumbai. WhatsApp cards, PDF brochures, and listings built for the Indian market.",
};

export default function Page() {
  return <HomePageClient />;
}
