import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export default async function AuthCallbackPage({ searchParams }) {
  const supabase = await createSupabaseServerClient();
  const params = await searchParams;
  const code = params?.code;

  if (!code) {
    redirect("/login");
  }

  const { data: exchangeData, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
  if (exchangeError || !exchangeData?.user) {
    redirect("/login");
  }

  const user = exchangeData.user;
  const { data: existingProfile, error: profileReadError } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .maybeSingle();

  if (profileReadError) {
    redirect("/login");
  }

  if (!existingProfile) {
    const fullName =
      user.user_metadata?.full_name ||
      user.user_metadata?.name ||
      user.email?.split("@")[0] ||
      "User";
    const { error: insertError } = await supabase.from("profiles").insert({
      id: user.id,
      name: fullName,
      email: user.email ?? null,
      role: null,
    });
    if (insertError) {
      redirect("/login");
    }
    redirect("/onboarding");
  }

  if (!existingProfile.role) {
    redirect("/onboarding");
  }

  redirect("/dashboard");
}
