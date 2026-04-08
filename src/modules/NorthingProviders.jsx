"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import SearchParamsHandler from "./SearchParamsHandler";
import { supabase } from "@/lib/supabaseClient";
import { G } from "./globalStyles.js";
import { PROPERTY_BACK_STORAGE_KEY } from "./northingConstants.js";
import { shellPathForPage, resolveNavPage } from "./northingNavUtils.js";
import { NorthingContext } from "./NorthingContext.jsx";
import {
  Nav,
  Toast,
  SecretAdminModal,
  WACardModal,
  PDFModal,
  MarketingKitModal,
  ErrorBoundary,
  useSecretAdmin,
  _h,
} from "./NorthingApp.jsx";
import { useNorthing } from "./NorthingContext.jsx";

function AppChrome({ children, agent }) {
  const pathname = usePathname();
  const { user, nav, logout, secretTrigger } = useNorthing();

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/reset-password" ||
    pathname === "/onboarding" ||
    pathname.startsWith("/share/") ||
    pathname.startsWith("/property/") ||
    pathname.startsWith("/agent/") ||
    pathname.startsWith("/broker/")
  ) {
    return <>{children}</>;
  }

  const { page } = resolveNavPage(pathname, agent);

  return (
    <>
      <Nav
        currentUser={user}
        page={page}
        onNavigate={nav}
        onLogout={logout}
        onSecretClick={secretTrigger}
      />
      <ErrorBoundary>{children}</ErrorBoundary>
    </>
  );
}

function DashboardAuthRedirect({ authLoading, user, pathname, agent }) {
  const router = useRouter();

  useLayoutEffect(() => {
    if (authLoading) return;
    if (agent) return;
    if ((pathname === "/dashboard" || pathname === "/admin") && !user) {
      router.replace(pathname === "/admin" ? "/login?next=/admin" : "/login");
    }
  }, [authLoading, user, pathname, router, agent]);

  return null;
}

export default function NorthingProviders({ children }) {
  const router = useRouter();
  const pathname = usePathname();

  const [agentParam, setAgentParam] = useState(null);
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [adminModal, setAdminModal] = useState(false);
  const [waListing, setWaListing] = useState(null);
  const [pdfListing, setPdfListing] = useState(null);
  const [kitListing, setKitListing] = useState(null);

  const insertProfileSafely = useCallback(async (row) => {
    let candidate = { ...row };
    for (let i = 0; i < 4; i += 1) {
      const { data, error } = await supabase.from("profiles").insert(candidate).select("*").single();
      if (!error) return data;
      const msg = String(error.message || "").toLowerCase();
      if (msg.includes("mobile_number")) {
        const next = { ...candidate };
        delete next.mobile_number;
        candidate = next;
        continue;
      }
      if (msg.includes("role") && msg.includes("null")) {
        candidate = { ...candidate, role: "user" };
        continue;
      }
      if (msg.includes("agent_verified") && msg.includes("null")) {
        candidate = { ...candidate, agent_verified: false };
        continue;
      }
      throw error;
    }
    return null;
  }, []);

  const hydrateUserFromProfile = useCallback(async (profile) => {
    if (!profile) return;
    const savedRes = await supabase.from("saved_listings").select("listing_id").eq("user_id", profile.id);
    const savedIds = (savedRes.data || []).map((r) => r.listing_id);
    setUser({
      id: profile.id,
      name: profile.name,
      email: profile.email,
      role: profile.role,
      phone: profile.phone ?? profile.mobile_number,
      mobileNumber: profile.mobile_number ?? profile.phone,
      agencyName: profile.agency_name,
      logoUrl: profile.logo_url || null,
      agentAddress: profile.address || null,
      agentWebsite: profile.website || null,
      agentVerified: profile.agent_verified === true,
      plan: profile.plan || "free",
      reraNumber: profile.rera_number || null,
      city: profile.city || null,
      avatarUrl: profile.avatar_url || null,
      savedListings: savedIds,
    });
  }, []);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(async ({ data: { session } }) => {
        if (session) {
          let { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
          if (!profile) {
            const md = session.user.user_metadata || {};
            const phoneNational = md.phone ? String(md.phone).replace(/\D/g, "").slice(-10) : null;
            const inserted = await insertProfileSafely({
              id: session.user.id,
              name: md.full_name || md.name || session.user.email?.split("@")[0] || "User",
              email: session.user.email ?? null,
              role: "user",
              phone: phoneNational,
              mobile_number: phoneNational,
              agency_name: null,
            });
            profile = inserted || null;
          }
          if (profile) {
            await hydrateUserFromProfile(profile);
          }
        }
        setAuthLoading(false);
      })
      .catch(() => setAuthLoading(false));
    _h.openWA = (l) => setWaListing(l);
    _h.openPDF = (l) => setPdfListing(l);
    _h.openKit = (l) => setKitListing(l);
  }, [hydrateUserFromProfile, insertProfileSafely]);

  const showToast = useCallback((msg, type = "info") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const nav = useCallback(
    (p, userOverride, homeAnchorId) => {
      const effectiveUser = userOverride !== undefined ? userOverride : user;
      if (p === "dashboard") {
        if (!effectiveUser) {
          router.push("/login");
          window.scrollTo(0, 0);
          return;
        }
        router.push(effectiveUser.role === "master" ? "/admin" : "/dashboard");
        window.scrollTo(0, 0);
        return;
      }
      if (
        p === "home" ||
        p === "feed" ||
        p === "login" ||
        p === "signup" ||
        p === "privacy" ||
        p === "terms" ||
        p === "about" ||
        p === "pricing" ||
        p === "contact"
      ) {
        router.push(shellPathForPage(p, null));
      }
      if (p === "home" && homeAnchorId) {
        setTimeout(() => document.getElementById(homeAnchorId)?.scrollIntoView({ behavior: "smooth" }), 140);
        return;
      }
      window.scrollTo(0, 0);
    },
    [user, router]
  );

  const login = useCallback(
    (u, nextPath) => {
      setUser(u);
      if (typeof nextPath === "string" && nextPath.startsWith("/")) {
        router.push(nextPath);
      } else {
        nav("dashboard", u);
      }
      window.scrollTo(0, 0);
    },
    [nav, router]
  );

  const refreshSessionUser = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) return;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    if (!profile) return;
    await hydrateUserFromProfile(profile);
  }, [hydrateUserFromProfile]);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    nav("home");
    showToast("Signed out successfully", "success");
  }, [nav, showToast]);

  const secretTrigger = useSecretAdmin(() => {
    if (!user || user.role !== "master") setAdminModal(true);
  });

  const openPropertyPage = useCallback(
    (listing) => {
      if (!listing?.id) return;
      try {
        if (pathname === "/feed" || pathname.startsWith("/feed")) {
          sessionStorage.setItem(PROPERTY_BACK_STORAGE_KEY, "/feed");
        } else if (pathname === "/" || pathname === "") {
          sessionStorage.setItem(PROPERTY_BACK_STORAGE_KEY, "/");
        } else {
          sessionStorage.removeItem(PROPERTY_BACK_STORAGE_KEY);
        }
      } catch {
        /* ignore */
      }
      router.push(`/property/${listing.id}`);
    },
    [pathname, router]
  );

  const value = {
    agentParam,
    setAgentParam,
    user,
    setUser,
    authLoading,
    toast,
    showToast,
    nav,
    login,
    logout,
    refreshSessionUser,
    openPropertyPage,
    secretTrigger,
    adminModal,
    setAdminModal,
    waListing,
    pdfListing,
    kitListing,
  };

  return (
    <NorthingContext.Provider value={value}>
      <div style={{ minHeight: "100vh", background: "var(--cream)", color: "var(--text)", width: "100%", maxWidth: "100%" }}>
        <style>{G}</style>
        <SearchParamsHandler />
        <DashboardAuthRedirect authLoading={authLoading} user={user} pathname={pathname} agent={agentParam} />
        <AppChrome agent={agentParam}>{children}</AppChrome>
        {adminModal && (
          <SecretAdminModal onLogin={login} onClose={() => setAdminModal(false)} showToast={showToast} />
        )}
        {waListing && <WACardModal listing={waListing} onClose={() => setWaListing(null)} currentUser={user} />}
        {pdfListing && <PDFModal listing={pdfListing} onClose={() => setPdfListing(null)} currentUser={user} />}
        {kitListing && (
          <MarketingKitModal listing={kitListing} onClose={() => setKitListing(null)} currentUser={user} />
        )}
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </div>
    </NorthingContext.Provider>
  );
}
