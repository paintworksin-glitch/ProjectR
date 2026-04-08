import { redirect } from "next/navigation";

/** Account settings live on the dashboard; /profile was redundant with the header link removed. */
export default function ProfileRedirectPage() {
  redirect("/dashboard");
}
