"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";
import { supabase } from "@/lib/supabaseClient";
import { mapListing } from "@/lib/mapListing";
import { fmtP } from "@/lib/formatPrice";
import { NorthingRemoteImage } from "@/components/NorthingRemoteImage";
import { uploadPropertyPhoto } from "@/lib/uploadPropertyPhoto";
import { muxThumbnailUrl } from "@/lib/muxThumbnailUrl.js";
import { PropModal, ConfirmModal, WALogo, _h } from "@/modules/NorthingApp.jsx";

const PAGE_SIZE = 10;
const PLAN_PRICE_INR = Number(process.env.NEXT_PUBLIC_AGENT_PLAN_INR) || 4999;

const ROLE_OPTIONS = [
  { value: "user", label: "Buyer" },
  { value: "seller", label: "Seller" },
  { value: "agent", label: "Agent" },
  { value: "master", label: "Master" },
  { value: "disabled", label: "Disabled" },
];

function cityFromLocation(loc) {
  if (!loc || typeof loc !== "string") return "—";
  const parts = loc.split(",").map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return parts[parts.length - 1];
  return parts[0] || "—";
}

function formatRole(r) {
  if (r === "user") return "Buyer";
  if (r === "disabled") return "Disabled";
  return r || "—";
}

function lastNDates(n) {
  const out = [];
  for (let i = n - 1; i >= 0; i -= 1) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - i);
    out.push(d.toISOString().slice(0, 10));
  }
  return out;
}

function countByDay(rows, dateKey) {
  const days = lastNDates(30);
  const map = Object.fromEntries(days.map((d) => [d, 0]));
  for (const row of rows || []) {
    const raw = row[dateKey];
    if (!raw) continue;
    const day = String(raw).slice(0, 10);
    if (map[day] !== undefined) map[day] += 1;
  }
  return days.map((d) => ({ date: d.slice(5), full: d, count: map[d] }));
}

function downloadCsv(filename, headers, rows) {
  const esc = (c) => `"${String(c ?? "").replace(/"/g, '""')}"`;
  const csv = [headers.join(","), ...rows.map((r) => r.map(esc).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

const badge = (label, bg, color, border) => (
  <span
    style={{
      display: "inline-block",
      fontSize: 10,
      fontWeight: 700,
      padding: "3px 8px",
      borderRadius: 999,
      background: bg,
      color,
      border: border || "1px solid transparent",
      textTransform: "capitalize",
    }}
  >
    {label}
  </span>
);

export function MasterDash({ showToast }) {
  const [listingsRaw, setListingsRaw] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [enquiryCount, setEnquiryCount] = useState(0);
  const [enquiriesRecent, setEnquiriesRecent] = useState([]);
  const [enquiriesForChart, setEnquiriesForChart] = useState([]);
  const [tab, setTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [dashNarrow, setDashNarrow] = useState(false);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [myId, setMyId] = useState(null);

  const [searchListings, setSearchListings] = useState("");
  const [searchUsers, setSearchUsers] = useState("");
  const [searchAgents, setSearchAgents] = useState("");
  const [pageListings, setPageListings] = useState(1);
  const [pageUsers, setPageUsers] = useState(1);
  const [pageAgents, setPageAgents] = useState(1);
  const [roleBusy, setRoleBusy] = useState(null);
  const [listingBusy, setListingBusy] = useState(null);
  const [agentBusy, setAgentBusy] = useState(null);
  const [creatingUser, setCreatingUser] = useState(false);
  const [showNewUserPw, setShowNewUserPw] = useState(false);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    phone: "",
    role: "user",
    password: "",
    createListing: false,
    listingTitle: "",
    listingCity: "",
    listingPrice: "",
    listingType: "Sale",
    propertyType: "Apartment",
    agencyName: "",
    address: "",
    website: "",
    logoUrl: "",
    reraNumber: "",
    agentVerified: false,
  });
  const [agentProfileEdit, setAgentProfileEdit] = useState(null);
  const [savingAgentProfile, setSavingAgentProfile] = useState(false);
  const [newUserLogoLoading, setNewUserLogoLoading] = useState(false);
  const [agentModalLogoLoading, setAgentModalLogoLoading] = useState(false);
  const newUserLogoInputRef = useRef(null);
  const agentModalLogoInputRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(max-width: 768px)");
    const fn = () => setDashNarrow(mq.matches);
    fn();
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setMyId(session?.user?.id ?? null);

      const lr = await supabase.from("listings").select("*").order("created_at", { ascending: false });
      if (lr.error) throw lr.error;

      const pr = await supabase
        .from("profiles")
        .select("*")
        .neq("role", "master")
        .order("created_at", { ascending: false });
      if (pr.error) throw pr.error;

      let enq = { count: 0, rows: [], chart: [] };
      try {
        const since = new Date();
        since.setDate(since.getDate() - 30);
        const sinceIso = since.toISOString();
        const c = await supabase.from("enquiries").select("id", { count: "exact", head: true });
        const r = await supabase
          .from("enquiries")
          .select("id,created_at,message")
          .order("created_at", { ascending: false })
          .limit(8);
        const ch = await supabase.from("enquiries").select("created_at").gte("created_at", sinceIso);
        enq = { count: c.count || 0, rows: r.data || [], chart: ch.data || [] };
      } catch {
        enq = { count: 0, rows: [], chart: [] };
      }

      setListingsRaw(lr.data || []);
      setProfiles(pr.data || []);
      setEnquiryCount(enq.count);
      setEnquiriesRecent(enq.rows);
      setEnquiriesForChart(enq.chart);
    } catch (e) {
      showToast(e?.message || "Could not load admin data", "error");
      setListingsRaw([]);
      setProfiles([]);
      setEnquiryCount(0);
      setEnquiriesRecent([]);
      setEnquiriesForChart([]);
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  const deleteListingVideoMaster = useCallback(
    async (listingId) => {
      if (!window.confirm("Remove this listing’s video from Mux and clear it in the database?")) return;
      try {
        const res = await fetch("/api/video/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, master: true }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || "Failed");
        showToast("Listing video removed", "success");
        await load();
      } catch (e) {
        showToast(e?.message || "Delete failed", "error");
      }
    },
    [load, showToast]
  );

  const deleteIntroVideoMaster = useCallback(
    async (userId) => {
      if (!window.confirm("Remove this agent’s introduction video?")) return;
      try {
        const res = await fetch("/api/video/delete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ introVideo: true, master: true, targetUserId: userId }),
        });
        const j = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(j.error || "Failed");
        showToast("Intro video removed", "success");
        await load();
      } catch (e) {
        showToast(e?.message || "Delete failed", "error");
      }
    },
    [load, showToast]
  );

  useEffect(() => {
    load();
  }, [load]);

  const listings = useMemo(() => (listingsRaw || []).map(mapListing).filter(Boolean), [listingsRaw]);
  const agents = useMemo(() => (profiles || []).filter((p) => p.role === "agent"), [profiles]);
  const usersAll = useMemo(() => profiles || [], [profiles]);

  const stats = useMemo(() => {
    const act = listingsRaw.filter((l) => l.status === "Active").length;
    const inact = listingsRaw.filter((l) => l.status === "Inactive").length;
    const buyers = profiles.filter((p) => p.role === "user").length;
    const sellers = profiles.filter((p) => p.role === "seller").length;
    const ag = profiles.filter((p) => p.role === "agent").length;
    const paidAgents = profiles.filter((p) => p.role === "agent" && p.plan === "paid").length;
    return {
      totalListings: listingsRaw.length,
      activeListings: act,
      inactiveListings: inact,
      buyers,
      sellers,
      agents: ag,
      totalUsers: profiles.length,
      enquiries: enquiryCount,
      revenue: paidAgents * PLAN_PRICE_INR,
    };
  }, [listingsRaw, profiles, enquiryCount]);

  const activityItems = useMemo(() => {
    const items = [];
    for (const p of profiles.slice(0, 6)) {
      items.push({
        t: p.created_at ? new Date(p.created_at).getTime() : 0,
        text: `New signup: ${p.name || p.email || p.id?.slice(0, 8)} (${formatRole(p.role)})`,
      });
    }
    for (const raw of listingsRaw.slice(0, 6)) {
      const l = mapListing(raw);
      if (!l) continue;
      items.push({
        t: raw.created_at ? new Date(raw.created_at).getTime() : 0,
        text: `New listing: ${l.title}`,
      });
    }
    for (const e of enquiriesRecent) {
      items.push({
        t: e.created_at ? new Date(e.created_at).getTime() : 0,
        text: `New enquiry`,
      });
    }
    return items.sort((a, b) => b.t - a.t).slice(0, 12);
  }, [profiles, listingsRaw, enquiriesRecent]);

  const chartSignups = useMemo(() => countByDay(profiles, "created_at"), [profiles]);
  const chartListings = useMemo(() => countByDay(listingsRaw, "created_at"), [listingsRaw]);
  const chartEnquiries = useMemo(() => countByDay(enquiriesForChart, "created_at"), [enquiriesForChart]);

  const topCities = useMemo(() => {
    const m = {};
    for (const raw of listingsRaw) {
      const c = cityFromLocation(raw.location);
      m[c] = (m[c] || 0) + 1;
    }
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([city, count]) => ({ city, count }));
  }, [listingsRaw]);

  const filteredListings = useMemo(() => {
    const q = searchListings.trim().toLowerCase();
    return listingsRaw.filter((raw) => {
      const l = mapListing(raw);
      if (!l) return false;
      if (!q) return true;
      return (
        (l.title || "").toLowerCase().includes(q) ||
        (l.location || "").toLowerCase().includes(q) ||
        (l.agentName || "").toLowerCase().includes(q)
      );
    });
  }, [listingsRaw, searchListings]);

  const filteredUsers = useMemo(() => {
    const q = searchUsers.trim().toLowerCase();
    return usersAll.filter((u) => {
      if (!q) return true;
      const phone = u.phone || u.mobile_number || "";
      return (
        (u.name || "").toLowerCase().includes(q) ||
        (u.email || "").toLowerCase().includes(q) ||
        String(phone).toLowerCase().includes(q)
      );
    });
  }, [usersAll, searchUsers]);

  const filteredAgents = useMemo(() => {
    const q = searchAgents.trim().toLowerCase();
    return agents.filter((a) => {
      if (!q) return true;
      return (
        (a.name || "").toLowerCase().includes(q) ||
        (a.email || "").toLowerCase().includes(q) ||
        String(a.phone || a.mobile_number || "").toLowerCase().includes(q) ||
        String(a.rera_number || "").toLowerCase().includes(q)
      );
    });
  }, [agents, searchAgents]);

  const paginate = (arr, page) => arr.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const totalPages = (n) => Math.max(1, Math.ceil(n / PAGE_SIZE));

  const delL = async (id) => {
    const { error } = await supabase.rpc("master_delete_listing", { p_listing_id: id });
    if (error) {
      showToast(error.message || "Delete failed", "error");
      return;
    }
    setListingsRaw((l) => l.filter((x) => x.id !== id));
    setDeleteTarget(null);
    showToast("Listing deleted", "success");
  };

  const delU = async (id) => {
    if (id === myId) {
      showToast("You cannot remove your own account", "error");
      return;
    }
    const ok = typeof window === "undefined" ? true : window.confirm("Permanently delete this user account? This cannot be undone.");
    if (!ok) return;
    const resp = await fetch("/api/admin/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetId: id, hardDelete: true }),
    });
    const payload = await resp.json().catch(() => ({}));
    if (!resp.ok) {
      showToast(payload?.error || "Delete failed", "error");
      return;
    }
    setProfiles((p) => p.filter((x) => x.id !== id));
    showToast("User deleted permanently", "success");
  };

  const createUserFromAdmin = async () => {
    if (!newUser.email.trim() || !newUser.password.trim()) {
      showToast("Email and password are required", "error");
      return;
    }
    if (newUser.createListing && (!newUser.listingTitle.trim() || !newUser.listingCity.trim() || Number(newUser.listingPrice) <= 0)) {
      showToast("Listing title, city and valid price are required", "error");
      return;
    }
    setCreatingUser(true);
    try {
      const resp = await fetch("/api/admin/users/create-with-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUser.name,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          password: newUser.password,
          createListing: newUser.createListing,
          listing: newUser.createListing
            ? {
                title: newUser.listingTitle,
                city: newUser.listingCity,
                price: Number(newUser.listingPrice),
                listingType: newUser.listingType,
                propertyType: newUser.propertyType,
              }
            : null,
          ...(newUser.role === "agent"
            ? {
                agentProfile: {
                  agencyName: newUser.agencyName,
                  address: newUser.address,
                  website: newUser.website,
                  logoUrl: newUser.logoUrl,
                  reraNumber: newUser.reraNumber,
                  agentVerified: newUser.agentVerified,
                },
              }
            : {}),
        }),
      });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(payload?.error || "User creation failed");
      showToast(newUser.createListing ? "User and listing created" : "User created", "success");
      setNewUser({
        name: "",
        email: "",
        phone: "",
        role: "user",
        password: "",
        createListing: false,
        listingTitle: "",
        listingCity: "",
        listingPrice: "",
        listingType: "Sale",
        propertyType: "Apartment",
        agencyName: "",
        address: "",
        website: "",
        logoUrl: "",
        reraNumber: "",
        agentVerified: false,
      });
      await load();
    } catch (e) {
      showToast(e?.message || "Could not create user", "error");
    } finally {
      setCreatingUser(false);
    }
  };

  const updateListing = async (id, { status, featured }) => {
    setListingBusy(id);
    try {
      const { error } = await supabase.rpc("master_update_listing", {
        p_listing_id: id,
        p_status: status ?? null,
        p_featured: featured ?? null,
      });
      if (error) throw error;
      setListingsRaw((rows) =>
        rows.map((r) =>
          r.id === id
            ? {
                ...r,
                ...(status != null ? { status } : {}),
                ...(featured != null ? { featured } : {}),
              }
            : r
        )
      );
      showToast(
        status !== undefined
          ? `Listing status set to ${status}`
          : featured !== undefined
            ? featured
              ? "Listing marked as featured"
              : "Listing removed from featured"
            : "Updated",
        "success"
      );
    } catch (e) {
      showToast(e?.message || "Update failed", "error");
    } finally {
      setListingBusy(null);
    }
  };

  const setUserRole = async (id, role) => {
    if (id === myId && role !== "master") {
      showToast("You cannot demote yourself", "error");
      return;
    }
    setRoleBusy(id);
    try {
      const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
      if (error) throw error;
      setProfiles((rows) => rows.map((r) => (r.id === id ? { ...r, role } : r)));
      showToast(`Role updated to ${formatRole(role)}`, "success");
    } catch (e) {
      showToast(e?.message || "Role update failed", "error");
    } finally {
      setRoleBusy(null);
    }
  };

  const setAgentVerified = async (id, verified) => {
    setAgentBusy(id);
    try {
      const { error } = await supabase.from("profiles").update({ agent_verified: verified }).eq("id", id);
      if (error) throw error;
      setProfiles((rows) => rows.map((r) => (r.id === id ? { ...r, agent_verified: verified } : r)));
      showToast(verified ? "Agent verified" : "Verification removed", "success");
    } catch (e) {
      showToast(e?.message || "Update failed", "error");
    } finally {
      setAgentBusy(null);
    }
  };

  const setAgentPlan = async (id, plan) => {
    setAgentBusy(id);
    try {
      const { error } = await supabase.from("profiles").update({ plan }).eq("id", id);
      if (error) throw error;
      setProfiles((rows) => rows.map((r) => (r.id === id ? { ...r, plan } : r)));
      showToast(`Plan set to ${plan}`, "success");
    } catch (e) {
      showToast(e?.message || "Plan update failed", "error");
    } finally {
      setAgentBusy(null);
    }
  };

  const approveAgent = async (id) => {
    const { error } = await supabase.rpc("master_approve_agent", { target_id: id });
    if (error) {
      showToast(error.message || "Approval failed", "error");
      return;
    }
    setProfiles((rows) => rows.map((x) => (x.id === id ? { ...x, agent_verified: true } : x)));
    showToast("Agent approved", "success");
  };

  const saveAgentProfileFromAdmin = async () => {
    if (!agentProfileEdit) return;
    setSavingAgentProfile(true);
    try {
      const resp = await fetch("/api/admin/users/agent-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetId: agentProfileEdit.id,
          agencyName: agentProfileEdit.agencyName,
          address: agentProfileEdit.address,
          website: agentProfileEdit.website,
          logoUrl: agentProfileEdit.logoUrl,
          reraNumber: agentProfileEdit.reraNumber,
          agentVerified: agentProfileEdit.agentVerified,
          phone: agentProfileEdit.phone,
        }),
      });
      const payload = await resp.json().catch(() => ({}));
      if (!resp.ok) throw new Error(payload?.error || "Save failed");
      showToast("Agent profile saved", "success");
      setAgentProfileEdit(null);
      await load();
    } catch (e) {
      showToast(e?.message || "Could not save profile", "error");
    } finally {
      setSavingAgentProfile(false);
    }
  };

  const handleNewUserLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Logo must be under 2MB", "error");
      return;
    }
    setNewUserLogoLoading(true);
    try {
      const url = await uploadPropertyPhoto(file);
      setNewUser((s) => ({ ...s, logoUrl: url }));
      showToast("Logo uploaded ✓", "success");
    } catch (err) {
      showToast("Upload failed: " + (err?.message || ""), "error");
    }
    setNewUserLogoLoading(false);
    e.target.value = "";
  };

  const handleAgentModalLogoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      showToast("Logo must be under 2MB", "error");
      return;
    }
    setAgentModalLogoLoading(true);
    try {
      const url = await uploadPropertyPhoto(file);
      setAgentProfileEdit((s) => (s ? { ...s, logoUrl: url } : s));
      showToast("Logo uploaded ✓", "success");
    } catch (err) {
      showToast("Upload failed: " + (err?.message || ""), "error");
    }
    setAgentModalLogoLoading(false);
    e.target.value = "";
  };

  const agentPublicProfileHref =
    agentProfileEdit && typeof window !== "undefined" ? `${window.location.origin}?agent=${agentProfileEdit.id}` : "";

  const exportUsersCsv = () => {
    const headers = ["Name", "Email", "Phone", "Role", "Created", "Status"];
    const rows = filteredUsers.map((u) => [
      u.name || "",
      u.email || "",
      u.phone || u.mobile_number || "",
      u.role || "",
      u.created_at ? new Date(u.created_at).toISOString() : "",
      u.role === "disabled" ? "disabled" : "active",
    ]);
    downloadCsv("northing-users.csv", headers, rows);
  };

  const exportListingsCsv = () => {
    const headers = ["Title", "Agent", "City", "Price", "Status", "Featured", "Created"];
    const rows = filteredListings.map((raw) => {
      const l = mapListing(raw);
      return [
        l?.title || "",
        l?.agentName || "",
        cityFromLocation(raw.location),
        l?.price ?? "",
        raw.status || "",
        raw.featured ? "yes" : "no",
        raw.created_at ? new Date(raw.created_at).toISOString() : "",
      ];
    });
    downloadCsv("northing-listings.csv", headers, rows);
  };

  const tabs = [
    ["overview", "Overview"],
    ["analytics", "Analytics"],
    ["listings", "Listings"],
    ["agents", "Agents"],
    ["users", "Users"],
  ];

  const trHover = { transition: "background 0.15s" };

  return (
    <div className="dashboard-page-shell admin-dash-shell" style={{ maxWidth: 1200, margin: "0 auto", padding: "32px 20px" }}>
      {deleteTarget && (
        <ConfirmModal
          message={`Delete "${deleteTarget.title}"? This cannot be undone.`}
          onConfirm={() => delL(deleteTarget.id)}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 800, color: "var(--navy)", margin: 0 }}>
          Admin
        </h1>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>Listings, agents, users, and activity</p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: 16, marginBottom: 28 }}>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>Listings</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 800, color: "var(--navy)", marginTop: 6 }}>{stats.totalListings}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Active {stats.activeListings} · Inactive {stats.inactiveListings}
          </div>
        </div>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>Users</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 800, color: "var(--navy)", marginTop: 6 }}>{stats.totalUsers}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Buyers {stats.buyers} · Sellers {stats.sellers} · Agents {stats.agents}
          </div>
        </div>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>Enquiries</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 800, color: "var(--navy)", marginTop: 6 }}>{stats.enquiries}</div>
        </div>
        <div className="card" style={{ padding: "20px 22px" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6 }}>Revenue (est.)</div>
          <div style={{ fontFamily: "'Fraunces',serif", fontSize: 28, fontWeight: 800, color: "var(--navy)", marginTop: 6 }}>{fmtP(stats.revenue)}</div>
          <div style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>Paid agents × {fmtP(PLAN_PRICE_INR)}</div>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 4,
          marginBottom: 20,
          background: "var(--gray)",
          padding: 4,
          borderRadius: 12,
          border: "1px solid var(--border)",
          overflowX: "auto",
        }}
        role="tablist"
      >
        {tabs.map(([t, l]) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            style={{
              padding: "8px 18px",
              borderRadius: 9,
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
              background: tab === t ? "var(--white)" : "transparent",
              color: tab === t ? "var(--navy)" : "var(--muted)",
              border: tab === t ? "1px solid var(--border)" : "none",
              whiteSpace: "nowrap",
              fontFamily: "inherit",
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: 40, color: "var(--muted)" }}>Loading…</div>
      ) : (
        <>
          {tab === "overview" && (
            <div className="admin-overview-grid">
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>
                  Activity
                </h3>
                {activityItems.length === 0 ? (
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>No recent activity.</p>
                ) : (
                  <ul style={{ margin: 0, padding: 0, listStyle: "none" }}>
                    {activityItems.map((it, i) => (
                      <li
                        key={i}
                        style={{
                          fontSize: 13,
                          padding: "10px 0",
                          borderBottom: "1px solid var(--border)",
                          color: "var(--text)",
                        }}
                      >
                        {it.text}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "'Fraunces',serif", fontSize: 17, fontWeight: 700, color: "var(--navy)", marginBottom: 16 }}>
                  Top agents by listings
                </h3>
                {agents.length === 0 ? (
                  <p style={{ color: "var(--muted)", fontSize: 13 }}>No agents.</p>
                ) : (
                  [...agents]
                    .sort((a, b) => listingsRaw.filter((l) => l.agent_id === b.id).length - listingsRaw.filter((l) => l.agent_id === a.id).length)
                    .slice(0, 8)
                    .map((a) => {
                      const c = listingsRaw.filter((l) => l.agent_id === a.id).length;
                      return (
                        <div
                          key={a.id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 0",
                            borderBottom: "1px solid var(--border)",
                          }}
                        >
                          <div>
                            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--navy)" }}>{a.name || "—"}</div>
                            <div style={{ fontSize: 12, color: "var(--muted)" }}>{a.agency_name || "—"}</div>
                          </div>
                          <span className="badge tag">{c} listings</span>
                        </div>
                      );
                    })
                )}
              </div>
            </div>
          )}

          {tab === "analytics" && (
            <div className="admin-analytics">
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginBottom: 20 }}>
                <div className="card" style={{ padding: 16 }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Signups (30d)</h4>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartSignups}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} width={32} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#1a1a1a" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>New listings (30d)</h4>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartListings}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} width={32} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#1a1a1a" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="card" style={{ padding: 16 }}>
                  <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Enquiries (30d)</h4>
                  <div style={{ width: "100%", height: 220 }}>
                    <ResponsiveContainer>
                      <LineChart data={chartEnquiries}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                        <YAxis allowDecimals={false} width={32} tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Line type="monotone" dataKey="count" stroke="#1a1a1a" strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
              <div className="card" style={{ padding: 16 }}>
                <h4 style={{ margin: "0 0 12px", fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>Top cities by listings</h4>
                <div style={{ width: "100%", height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={topCities} layout="vertical" margin={{ left: 8, right: 16 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="city" width={100} tick={{ fontSize: 10 }} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#1a1a1a" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {tab === "listings" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={searchListings}
                  onChange={(e) => {
                    setSearchListings(e.target.value);
                    setPageListings(1);
                  }}
                  placeholder="Search listings…"
                  className="inp"
                  style={{ maxWidth: dashNarrow ? undefined : 340, width: dashNarrow ? "100%" : undefined, boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{filteredListings.length} results</span>
                <button type="button" className="btn-outline" style={{ padding: "8px 14px",borderRadius:9,fontSize:12,fontWeight:600}} onClick={exportListingsCsv}>
                  Export CSV
                </button>
              </div>
              <div className="card admin-table-card" style={{ overflow: "hidden" }}>
                <div className="master-dash-table-wrap admin-table-wrap" style={{ overflowX: "auto" }}>
                  <table className="admin-data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 1040 }}>
                    <thead>
                      <tr style={{ background: "var(--navy)" }}>
                        {["Title", "Agent / seller", "City", "Price", "Status", "Featured", "Video", "Created", "Actions"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "12px 14px",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.75)",
                              textAlign: "left",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(filteredListings, pageListings).map((raw, i) => {
                        const l = mapListing(raw);
                        if (!l) return null;
                        const st = raw.status || "";
                        const isActive = st === "Active";
                        return (
                          <tr
                            key={raw.id}
                            style={{
                              borderBottom: "1px solid var(--border)",
                              background: i % 2 === 0 ? "var(--white)" : "var(--cream)",
                              ...trHover,
                            }}
                            className="admin-table-row"
                          >
                            <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{l.title}</td>
                            <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--muted)" }}>{l.agentName || "—"}</td>
                            <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--muted)" }}>{cityFromLocation(raw.location)}</td>
                            <td style={{ padding: "11px 14px", fontSize: 13, fontWeight: 700, fontFamily: "'Fraunces',serif" }}>{fmtP(l.price)}</td>
                            <td style={{ padding: "11px 14px" }}>
                              {st === "Active" && badge("active", "#EFF6FF", "#1D4ED8", "1px solid #BFDBFE")}
                              {st === "Inactive" && badge("inactive", "#F3F4F6", "#6B7280", "1px solid #E5E7EB")}
                              {st === "Rented" && badge("rented", "#FFFBEB", "#D97706", "1px solid #FDE68A")}
                              {st === "Sold" && badge("sold", "#F5F3FF", "#7C3AED", "1px solid #DDD6FE")}
                              {!["Active", "Inactive", "Rented", "Sold"].includes(st) && badge(st || "—", "#F3F4F6", "#374151", "1px solid #E5E7EB")}
                            </td>
                            <td style={{ padding: "11px 14px" }}>
                              {raw.featured ? badge("featured", "#ECFDF5", "#065F46", "1px solid #A7F3D0") : badge("—", "#F3F4F6", "#6B7280", "1px solid #E5E7EB")}
                            </td>
                            <td style={{ padding: "11px 14px", fontSize: 11, color: "var(--muted)", verticalAlign: "top" }}>
                              {l.videoPlaybackId ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                                  <img
                                    src={muxThumbnailUrl(l.videoPlaybackId, 1)}
                                    alt=""
                                    width={72}
                                    height={48}
                                    style={{ borderRadius: 6, objectFit: "cover", border: "1px solid var(--border)", display: "block" }}
                                  />
                                  <span>
                                    {l.videoStatus || "—"} · 🎥 {l.videoViewCount ?? 0}
                                  </span>
                                  {raw.video_id ? (
                                    <button type="button" className="btn-danger" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => deleteListingVideoMaster(raw.id)}>
                                      Del video
                                    </button>
                                  ) : null}
                                </div>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td style={{ padding: "11px 14px", fontSize: 12, color: "var(--muted)" }}>
                              {raw.created_at ? new Date(raw.created_at).toLocaleString() : "—"}
                            </td>
                            <td style={{ padding: "11px 14px" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                <button type="button" className="btn-ghost" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => setModal(l)}>
                                  View
                                </button>
                                {!isActive && (
                                  <button
                                    type="button"
                                    className="btn-ghost"
                                    style={{ padding: "4px 8px", fontSize: 11 }}
                                    disabled={listingBusy === raw.id}
                                    onClick={() => updateListing(raw.id, { status: "Active" })}
                                  >
                                    Activate
                                  </button>
                                )}
                                {isActive && (
                                  <button
                                    type="button"
                                    className="btn-ghost"
                                    style={{ padding: "4px 8px", fontSize: 11 }}
                                    disabled={listingBusy === raw.id}
                                    onClick={() => updateListing(raw.id, { status: "Inactive" })}
                                  >
                                    Deactivate
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn-ghost"
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  disabled={listingBusy === raw.id || !isActive}
                                  onClick={() => updateListing(raw.id, { featured: !raw.featured })}
                                >
                                  {raw.featured ? "Unfeature" : "Feature"}
                                </button>
                                <button type="button" className="btn-ghost" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => _h.openWA(l)}>
                                  <WALogo size={10} /> WA
                                </button>
                                <button type="button" className="btn-danger" style={{ padding: "4px 8px", fontSize: 11 }} onClick={() => setDeleteTarget(l)}>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredListings.length === 0 && (
                  <div style={{ textAlign: "center", padding: 36, color: "var(--muted)" }}>No listings</div>
                )}
                {filteredListings.length > PAGE_SIZE && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: 16 }}>
                    <button type="button" className="btn-outline" disabled={pageListings <= 1} onClick={() => setPageListings((p) => Math.max(1, p - 1))}>
                      Prev
                    </button>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      Page {pageListings} / {totalPages(filteredListings.length)}
                    </span>
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={pageListings >= totalPages(filteredListings.length)}
                      onClick={() => setPageListings((p) => Math.min(totalPages(filteredListings.length), p + 1))}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "agents" && (
            <div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={searchAgents}
                  onChange={(e) => {
                    setSearchAgents(e.target.value);
                    setPageAgents(1);
                  }}
                  placeholder="Search agents…"
                  className="inp"
                  style={{ maxWidth: dashNarrow ? undefined : 340, width: dashNarrow ? "100%" : undefined, boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{filteredAgents.length} agents</span>
              </div>
              <div className="card admin-table-card" style={{ overflow: "hidden" }}>
                <div className="master-dash-table-wrap admin-table-wrap" style={{ overflowX: "auto" }}>
                  <table
                    className="admin-data-table admin-agents-table"
                    style={{
                      width: "100%",
                      minWidth: 980,
                      borderCollapse: "collapse",
                      tableLayout: "fixed",
                    }}
                  >
                    <colgroup>
                      <col style={{ width: "15%" }} />
                      <col style={{ width: "20%" }} />
                      <col style={{ width: "11%" }} />
                      <col style={{ width: "10%" }} />
                      <col style={{ width: "9%" }} />
                      <col style={{ width: "8%" }} />
                      <col style={{ width: "7%" }} />
                      <col style={{ width: "12%" }} />
                      <col style={{ width: "18%" }} />
                    </colgroup>
                    <thead>
                      <tr style={{ background: "var(--navy)" }}>
                        {["Name", "Email", "Phone", "RERA", "Verification", "Plan", "Listings", "Intro video", "Actions"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "12px 14px",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.75)",
                              textAlign: "left",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                              verticalAlign: "bottom",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(filteredAgents, pageAgents).map((a, i) => {
                        const nList = listingsRaw.filter((l) => l.agent_id === a.id).length;
                        const ver = a.agent_verified === true;
                        const paid = a.plan === "paid";
                        return (
                          <tr
                            key={a.id}
                            style={{
                              borderBottom: "1px solid var(--border)",
                              background: i % 2 === 0 ? "var(--white)" : "var(--cream)",
                              ...trHover,
                            }}
                            className="admin-table-row"
                          >
                            <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--navy)", verticalAlign: "top" }}>
                              <div>{a.name || "—"}</div>
                              {a.agency_name ? (
                                <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginTop: 4, lineHeight: 1.35 }}>{a.agency_name}</div>
                              ) : null}
                            </td>
                            <td
                              style={{
                                padding: "12px 14px",
                                fontSize: 12,
                                color: "var(--muted)",
                                wordBreak: "break-word",
                                overflowWrap: "anywhere",
                                verticalAlign: "top",
                              }}
                            >
                              {a.email || "—"}
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)", verticalAlign: "top", whiteSpace: "nowrap" }}>
                              {a.phone || a.mobile_number || "—"}
                            </td>
                            <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)", verticalAlign: "top", wordBreak: "break-word" }}>
                              {a.rera_number || "—"}
                            </td>
                            <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                              {ver ? badge("verified", "#ECFDF5", "#065F46", "1px solid #A7F3D0") : badge("pending", "#FFFBEB", "#D97706", "1px solid #FDE68A")}
                            </td>
                            <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                              {paid ? badge("paid", "#DCFCE7", "#166534", "1px solid #86EFAC") : badge("free", "#F3F4F6", "#6B7280", "1px solid #E5E7EB")}
                            </td>
                            <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                              <span className="badge tag">{nList}</span>
                            </td>
                            <td style={{ padding: "12px 14px", verticalAlign: "top", fontSize: 11, color: "var(--muted)" }}>
                              {a.intro_video_playback_id ? (
                                <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                                  <img
                                    src={muxThumbnailUrl(a.intro_video_playback_id, 1)}
                                    alt=""
                                    width={56}
                                    height={40}
                                    style={{ borderRadius: 6, objectFit: "cover", border: "1px solid var(--border)", display: "block" }}
                                  />
                                  <span>{a.intro_video_status || "—"} · views {a.intro_video_view_count ?? 0}</span>
                                  {a.intro_video_id ? (
                                    <button type="button" className="btn-danger" style={{ padding: "4px 8px", fontSize: 10 }} onClick={() => deleteIntroVideoMaster(a.id)}>
                                      Del intro
                                    </button>
                                  ) : null}
                                </div>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td style={{ padding: "12px 14px", verticalAlign: "top" }}>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                                {!ver ? (
                                  <button type="button" className="btn-outline" style={{ padding: "4px 8px", fontSize: 11 }} disabled={agentBusy === a.id} onClick={() => approveAgent(a.id)}>
                                    Verify
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    className="btn-outline"
                                    style={{ padding: "4px 8px", fontSize: 11 }}
                                    disabled={agentBusy === a.id}
                                    onClick={() => setAgentVerified(a.id, false)}
                                  >
                                    Unverify
                                  </button>
                                )}
                                {!paid ? (
                                  <button type="button" className="btn-outline" style={{ padding: "4px 8px", fontSize: 11 }} disabled={agentBusy === a.id} onClick={() => setAgentPlan(a.id, "paid")}>
                                    Upgrade
                                  </button>
                                ) : (
                                  <button type="button" className="btn-outline" style={{ padding: "4px 8px", fontSize: 11 }} disabled={agentBusy === a.id} onClick={() => setAgentPlan(a.id, "free")}>
                                    Downgrade
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="btn-ghost"
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  onClick={() => {
                                    setTab("listings");
                                    setSearchListings(a.name || "");
                                  }}
                                >
                                  View listings
                                </button>
                                <button
                                  type="button"
                                  className="btn-outline"
                                  style={{ padding: "4px 8px", fontSize: 11 }}
                                  onClick={() =>
                                    setAgentProfileEdit({
                                      id: a.id,
                                      agencyName: a.agency_name || "",
                                      address: a.address || "",
                                      website: a.website || "",
                                      logoUrl: a.logo_url || "",
                                      reraNumber: a.rera_number || "",
                                      agentVerified: a.agent_verified === true,
                                      phone: a.phone || a.mobile_number || "",
                                      name: a.name || "",
                                      email: a.email || "",
                                    })
                                  }
                                >
                                  Profile
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredAgents.length === 0 && <div style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>No agents</div>}
                {filteredAgents.length > PAGE_SIZE && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: 16 }}>
                    <button type="button" className="btn-outline" disabled={pageAgents <= 1} onClick={() => setPageAgents((p) => Math.max(1, p - 1))}>
                      Prev
                    </button>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      Page {pageAgents} / {totalPages(filteredAgents.length)}
                    </span>
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={pageAgents >= totalPages(filteredAgents.length)}
                      onClick={() => setPageAgents((p) => Math.min(totalPages(filteredAgents.length), p + 1))}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {tab === "users" && (
            <div>
              <div className="card" style={{ padding: "16px", marginBottom: 12 }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 10 }}>
                  Add user
                </div>
                <div style={{ display: "grid", gridTemplateColumns: dashNarrow ? "1fr" : "repeat(5,minmax(120px,1fr))", gap: 10 }}>
                  <input className="inp" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))} />
                  <input className="inp" placeholder="Email *" value={newUser.email} onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))} />
                  <input className="inp" placeholder="Phone (unique)" value={newUser.phone} onChange={(e) => setNewUser((s) => ({ ...s, phone: e.target.value }))} />
                  <div style={{ position: "relative", minWidth: 0 }}>
                    <input
                      className="inp"
                      placeholder="Password *"
                      type={showNewUserPw ? "text" : "password"}
                      value={newUser.password}
                      onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))}
                      style={{ width: "100%", boxSizing: "border-box", paddingRight: 72 }}
                    />
                    <button
                      type="button"
                      className="btn-ghost"
                      aria-label={showNewUserPw ? "Hide password" : "Show password"}
                      onClick={() => setShowNewUserPw((s) => !s)}
                      style={{
                        position: "absolute",
                        right: 4,
                        top: "50%",
                        transform: "translateY(-50%)",
                        fontSize: 12,
                        fontWeight: 700,
                        padding: "6px 8px",
                        borderRadius: 8,
                        color: "var(--muted)",
                      }}
                    >
                      {showNewUserPw ? "Hide" : "Show"}
                    </button>
                  </div>
                  <select className="inp" value={newUser.role} onChange={(e) => setNewUser((s) => ({ ...s, role: e.target.value }))}>
                    {ROLE_OPTIONS.filter((r) => r.value !== "disabled").map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={{ marginTop: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--muted)" }}>
                    <input type="checkbox" checked={newUser.createListing} onChange={(e) => setNewUser((s) => ({ ...s, createListing: e.target.checked }))} />
                    Create first listing
                  </label>
                  <button type="button" className="btn-green" style={{ padding: "8px 14px", borderRadius: 9, fontSize: 12, fontWeight: 700 }} disabled={creatingUser} onClick={createUserFromAdmin}>
                    {creatingUser ? "Creating..." : "Create user"}
                  </button>
                </div>
                {newUser.createListing && (
                  <div style={{ display: "grid", gridTemplateColumns: dashNarrow ? "1fr" : "2fr 1fr 1fr 1fr 1fr", gap: 10, marginTop: 10 }}>
                    <input className="inp" placeholder="Listing title *" value={newUser.listingTitle} onChange={(e) => setNewUser((s) => ({ ...s, listingTitle: e.target.value }))} />
                    <input className="inp" placeholder="City *" value={newUser.listingCity} onChange={(e) => setNewUser((s) => ({ ...s, listingCity: e.target.value }))} />
                    <input className="inp" placeholder="Price *" type="number" value={newUser.listingPrice} onChange={(e) => setNewUser((s) => ({ ...s, listingPrice: e.target.value }))} />
                    <select className="inp" value={newUser.listingType} onChange={(e) => setNewUser((s) => ({ ...s, listingType: e.target.value }))}>
                      <option value="Sale">Sale</option>
                      <option value="Rent">Rent</option>
                    </select>
                    <select className="inp" value={newUser.propertyType} onChange={(e) => setNewUser((s) => ({ ...s, propertyType: e.target.value }))}>
                      <option value="Apartment">Apartment</option>
                      <option value="Villa">Villa</option>
                      <option value="Plot">Plot</option>
                      <option value="Commercial">Commercial</option>
                    </select>
                  </div>
                )}
                {newUser.role === "agent" && (
                  <div style={{ marginTop: 14 }}>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: "var(--muted)",
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        marginBottom: 10,
                      }}
                    >
                      Agent firm profile (optional)
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: dashNarrow ? "1fr" : "1fr 1fr", gap: 10 }}>
                      <input
                        className="inp"
                        placeholder="Agency / firm name"
                        value={newUser.agencyName}
                        onChange={(e) => setNewUser((s) => ({ ...s, agencyName: e.target.value }))}
                      />
                      <input
                        className="inp"
                        placeholder="RERA registration no."
                        value={newUser.reraNumber}
                        onChange={(e) => setNewUser((s) => ({ ...s, reraNumber: e.target.value }))}
                      />
                    </div>
                    <div style={{ marginTop: 12 }}>
                      <div
                        style={{
                          display: "block",
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--muted)",
                          marginBottom: 8,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        Company logo
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                        <div
                          style={{
                            width: 72,
                            height: 72,
                            borderRadius: 14,
                            border: "2px dashed var(--border)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden",
                            background: "var(--gray)",
                            flexShrink: 0,
                            position: "relative",
                          }}
                        >
                          {newUser.logoUrl ? (
                            <NorthingRemoteImage src={newUser.logoUrl} alt="Company logo" fill style={{ objectFit: "contain" }} />
                          ) : (
                            <span style={{ fontSize: 26, opacity: 0.4 }}>🏢</span>
                          )}
                        </div>
                        <div>
                          <input ref={newUserLogoInputRef} type="file" accept="image/*" onChange={handleNewUserLogoUpload} style={{ display: "none" }} />
                          <button
                            type="button"
                            onClick={() => newUserLogoInputRef.current?.click()}
                            disabled={newUserLogoLoading}
                            className="btn-ghost"
                            style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13, marginBottom: 6 }}
                          >
                            {newUserLogoLoading ? "Uploading…" : "📁 Upload logo"}
                          </button>
                          <div style={{ fontSize: 11, color: "var(--muted)" }}>PNG or JPG · Max 2MB · Same storage as agent dashboard</div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: dashNarrow ? "1fr" : "1fr 1fr", gap: 10, marginTop: 10 }}>
                      <input
                        className="inp"
                        placeholder="Office address"
                        value={newUser.address}
                        onChange={(e) => setNewUser((s) => ({ ...s, address: e.target.value }))}
                      />
                      <input
                        className="inp"
                        placeholder="Website (https://…)"
                        value={newUser.website}
                        onChange={(e) => setNewUser((s) => ({ ...s, website: e.target.value }))}
                      />
                    </div>
                    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12, color: "var(--muted)", marginTop: 10 }}>
                      <input
                        type="checkbox"
                        checked={newUser.agentVerified}
                        onChange={(e) => setNewUser((s) => ({ ...s, agentVerified: e.target.checked }))}
                      />
                      Mark agent as verified
                    </label>
                  </div>
                )}
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16, alignItems: "center", flexWrap: "wrap" }}>
                <input
                  value={searchUsers}
                  onChange={(e) => {
                    setSearchUsers(e.target.value);
                    setPageUsers(1);
                  }}
                  placeholder="Search users…"
                  className="inp"
                  style={{ maxWidth: dashNarrow ? undefined : 340, width: dashNarrow ? "100%" : undefined, boxSizing: "border-box" }}
                />
                <span style={{ fontSize: 13, color: "var(--muted)", fontWeight: 600 }}>{filteredUsers.length} users</span>
                <button type="button" className="btn-outline" style={{ padding: "8px 14px",borderRadius:9,fontSize:12,fontWeight:600}} onClick={exportUsersCsv}>
                  Export CSV
                </button>
              </div>
              <div className="card admin-table-card" style={{ overflow: "hidden" }}>
                <div className="master-dash-table-wrap admin-table-wrap" style={{ overflowX: "auto" }}>
                  <table className="admin-data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 800 }}>
                    <thead>
                      <tr style={{ background: "var(--navy)" }}>
                        {["Name", "Email", "Phone", "Role", "Created", "Status", "Actions"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "12px 14px",
                              fontSize: 11,
                              fontWeight: 700,
                              color: "rgba(255,255,255,0.75)",
                              textAlign: "left",
                              textTransform: "uppercase",
                              letterSpacing: 0.5,
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {paginate(filteredUsers, pageUsers).map((u, i) => (
                        <tr
                          key={u.id}
                          style={{
                            borderBottom: "1px solid var(--border)",
                            background: i % 2 === 0 ? "var(--white)" : "var(--cream)",
                            ...trHover,
                          }}
                          className="admin-table-row"
                        >
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{u.name || (u.email ? u.email.split("@")[0] : `User ${String(u.id || "").slice(0, 6)}`)}</td>
                          <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)", wordBreak: "break-word" }}>{u.email || "missing-email@legacy-profile"}</td>
                          <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)" }}>{u.phone || u.mobile_number || "—"}</td>
                          <td style={{ padding: "12px 14px" }}>
                            <select
                              className="inp"
                              style={{ fontSize: 12, padding: "6px 8px", minWidth: 120 }}
                              value={u.role}
                              disabled={roleBusy === u.id || (u.id === myId && u.role === "master")}
                              onChange={(e) => setUserRole(u.id, e.target.value)}
                              aria-label={`Role for ${u.name || u.email || "user"}`}
                            >
                              {ROLE_OPTIONS.map((o) => (
                                <option key={o.value} value={o.value}>
                                  {o.label}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)" }}>
                            {u.created_at ? new Date(u.created_at).toLocaleString() : "—"}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            {u.role === "disabled"
                              ? badge("disabled", "#F3F4F6", "#6B7280", "1px solid #E5E7EB")
                              : badge("active", "#EFF6FF", "#1D4ED8", "1px solid #BFDBFE")}
                          </td>
                          <td style={{ padding: "12px 14px" }}>
                            <button
                              type="button"
                              className="btn-danger"
                              style={{ padding: "5px 10px", fontSize: 11 }}
                              disabled={u.id === myId}
                              onClick={() => delU(u.id)}
                              title="Permanently deletes this account"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && <div style={{ textAlign: "center", padding: 32, color: "var(--muted)" }}>No users</div>}
                {filteredUsers.length > PAGE_SIZE && (
                  <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: 16 }}>
                    <button type="button" className="btn-outline" disabled={pageUsers <= 1} onClick={() => setPageUsers((p) => Math.max(1, p - 1))}>
                      Prev
                    </button>
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      Page {pageUsers} / {totalPages(filteredUsers.length)}
                    </span>
                    <button
                      type="button"
                      className="btn-outline"
                      disabled={pageUsers >= totalPages(filteredUsers.length)}
                      onClick={() => setPageUsers((p) => Math.min(totalPages(filteredUsers.length), p + 1))}
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {modal && <PropModal listing={modal} onClose={() => setModal(null)} />}

      {agentProfileEdit && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 10000,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="agent-profile-admin-title"
          onClick={() => setAgentProfileEdit(null)}
        >
          <div
            className="card"
            style={{ maxWidth: 640, width: "100%", maxHeight: "92vh", overflow: "auto", padding: 24 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ maxWidth: 620 }}>
              <h2
                id="agent-profile-admin-title"
                style={{ fontFamily: "'Fraunces',serif", fontSize: 20, fontWeight: 800, color: "var(--navy)", margin: "0 0 8px" }}
              >
                🏢 Agency / Firm Profile
              </h2>
              <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 12px" }}>
                {agentProfileEdit.name || "Agent"}
                {agentProfileEdit.email ? ` · ${agentProfileEdit.email}` : ""}
              </p>
              <p
                style={{
                  fontSize: 13,
                  color: "var(--muted)",
                  marginBottom: 12,
                  background: "var(--primary-light)",
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--primary-mid)",
                }}
              >
                ⭐ Logo and details are stored on the same profile the agent sees in their dashboard (PDF brochures, public page). Changes apply for both admin and agent.
              </p>
              <div
                style={{
                  background: "var(--gray)",
                  borderRadius: 10,
                  padding: "12px 14px",
                  marginBottom: 20,
                  border: "1px solid var(--border)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "var(--navy)", marginBottom: 2 }}>🔗 Public profile page</div>
                  <div style={{ fontSize: 11, color: "var(--muted)", wordBreak: "break-all" }}>{agentPublicProfileHref}</div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (agentPublicProfileHref) {
                      navigator.clipboard?.writeText(agentPublicProfileHref);
                      showToast("Link copied", "success");
                    }
                  }}
                  style={{
                    padding: "8px 16px",
                    borderRadius: 9,
                    fontSize: 12,
                    fontWeight: 700,
                    cursor: "pointer",
                    background: "var(--primary)",
                    color: "#fff",
                    border: "none",
                    fontFamily: "inherit",
                    whiteSpace: "nowrap",
                  }}
                >
                  📋 Copy link
                </button>
              </div>
              <div style={{ marginBottom: 20 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--muted)",
                    marginBottom: 8,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Company logo
                </label>
                <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <div
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 14,
                      border: "2px dashed var(--border)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                      background: "var(--gray)",
                      flexShrink: 0,
                      position: "relative",
                    }}
                  >
                    {agentProfileEdit.logoUrl ? (
                      <NorthingRemoteImage src={agentProfileEdit.logoUrl} alt="Company logo" fill style={{ objectFit: "contain" }} />
                    ) : (
                      <span style={{ fontSize: 28, opacity: 0.4 }}>🏢</span>
                    )}
                  </div>
                  <div>
                    <input ref={agentModalLogoInputRef} type="file" accept="image/*" onChange={handleAgentModalLogoUpload} style={{ display: "none" }} />
                    <button
                      type="button"
                      onClick={() => agentModalLogoInputRef.current?.click()}
                      disabled={agentModalLogoLoading}
                      className="btn-ghost"
                      style={{ padding: "9px 18px", borderRadius: 9, fontSize: 13, marginBottom: 6 }}
                    >
                      {agentModalLogoLoading ? "Uploading…" : "📁 Upload logo"}
                    </button>
                    <div style={{ fontSize: 11, color: "var(--muted)" }}>PNG or JPG · Max 2MB · Square recommended</div>
                  </div>
                </div>
              </div>
              {[
                ["Agency / Firm Name", "agencyName", "e.g. Sharma Realty"],
                ["Office Address", "address", "Full office address"],
                ["Website", "website", "https://yoursite.com"],
              ].map(([label, key, placeholder]) => (
                <div key={key} style={{ marginBottom: 14 }}>
                  <label
                    style={{
                      display: "block",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "var(--muted)",
                      marginBottom: 4,
                      textTransform: "uppercase",
                      letterSpacing: 0.5,
                    }}
                  >
                    {label}
                  </label>
                  <input
                    className="inp"
                    placeholder={placeholder}
                    value={agentProfileEdit[key] || ""}
                    onChange={(e) => setAgentProfileEdit((s) => (s ? { ...s, [key]: e.target.value } : s))}
                  />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--muted)",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  RERA registration no.
                </label>
                <input
                  className="inp"
                  placeholder="RERA no."
                  value={agentProfileEdit.reraNumber || ""}
                  onChange={(e) => setAgentProfileEdit((s) => (s ? { ...s, reraNumber: e.target.value } : s))}
                />
              </div>
              <div style={{ marginBottom: 14 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--muted)",
                    marginBottom: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  Phone
                </label>
                <input
                  className="inp"
                  placeholder="10-digit mobile"
                  inputMode="numeric"
                  autoComplete="tel-national"
                  value={agentProfileEdit.phone || ""}
                  onChange={(e) =>
                    setAgentProfileEdit((s) => (s ? { ...s, phone: e.target.value.replace(/\D/g, "").slice(0, 10) } : s))
                  }
                />
              </div>
              <label style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--text)", marginBottom: 14 }}>
                <input
                  type="checkbox"
                  checked={agentProfileEdit.agentVerified}
                  onChange={(e) => setAgentProfileEdit((s) => (s ? { ...s, agentVerified: e.target.checked } : s))}
                />
                Verified agent (admin)
              </label>
              <button
                type="button"
                onClick={saveAgentProfileFromAdmin}
                disabled={savingAgentProfile}
                className="btn-primary"
                style={{ padding: "12px 28px", borderRadius: 10, fontSize: 14, display: "flex", alignItems: "center", gap: 8, marginTop: 4, marginBottom: 16 }}
              >
                {savingAgentProfile ? (
                  <>
                    <span className="spin" />
                    Saving…
                  </>
                ) : (
                  "Save profile →"
                )}
              </button>
              <div className="card" style={{ padding: 20, background: "var(--cream)", border: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: "var(--muted)", marginBottom: 12, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  PDF header preview
                </div>
                <div
                  style={{
                    background: "var(--gray)",
                    borderRadius: 12,
                    padding: 16,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                    {agentProfileEdit.logoUrl ? (
                      <NorthingRemoteImage
                        src={agentProfileEdit.logoUrl}
                        alt="Company logo preview"
                        width={52}
                        height={52}
                        style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 8, border: "1px solid var(--border)", background: "#fff", flexShrink: 0 }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 52,
                          height: 52,
                          borderRadius: 8,
                          background: "var(--primary-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 24,
                          border: "1px solid var(--primary-mid)",
                          flexShrink: 0,
                        }}
                      >
                        🏢
                      </div>
                    )}
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: 16, color: "var(--navy)" }}>{agentProfileEdit.agencyName || "Your firm name"}</div>
                      {agentProfileEdit.phone ? (
                        <div style={{ fontSize: 12, color: "var(--muted)" }}>📞 {agentProfileEdit.phone}</div>
                      ) : null}
                      {agentProfileEdit.address ? (
                        <div style={{ fontSize: 11, color: "var(--muted)" }}>📍 {agentProfileEdit.address}</div>
                      ) : null}
                      {agentProfileEdit.website ? (
                        <div style={{ fontSize: 11, color: "var(--primary)", wordBreak: "break-all" }}>{agentProfileEdit.website}</div>
                      ) : null}
                    </div>
                  </div>
                  <div style={{ textAlign: "right", fontSize: 10, color: "var(--muted)", flexShrink: 0, marginLeft: 8 }}>
                    <div>{new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</div>
                    <div style={{ marginTop: 4, fontWeight: 600 }}>Brochure header preview</div>
                  </div>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16, flexWrap: "wrap" }}>
                <button type="button" className="btn-outline" style={{ padding: "10px 18px", borderRadius: 9 }} disabled={savingAgentProfile} onClick={() => setAgentProfileEdit(null)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
