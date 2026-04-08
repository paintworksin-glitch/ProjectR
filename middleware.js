import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const recoveryCode = request.nextUrl.searchParams.get("code");
  if (pathname === "/reset-password" && recoveryCode) {
    const confirmUrl = new URL("/auth/confirm", request.url);
    confirmUrl.searchParams.set("code", recoveryCode);
    confirmUrl.searchParams.set("next", "/reset-password");
    return NextResponse.redirect(confirmUrl);
  }

  const response = NextResponse.next();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return response;

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAdminRoute = pathname.startsWith("/admin");

  if (isAdminRoute) {
    if (!user) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    const { data: prof, error } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle();
    if (error || prof?.role !== "master") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return response;
  }

  const isProtected =
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/onboarding");

  if (isProtected && !user) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
    "/onboarding",
    "/login",
    "/signup",
    "/reset-password",
  ],
};
