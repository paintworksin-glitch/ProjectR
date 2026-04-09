"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
    const { error } = await supabase.rpc("master_disable_user", { target_id: id });
    if (error) {
      showToast(error.message || "Remove failed", "error");
      return;
    }
    // Persisted as role=disabled in DB; keep row in state so it does not "reappear" after refresh.
    setProfiles((p) => p.map((x) => (x.id === id ? { ...x, role: "disabled" } : x)));
    showToast("User disabled", "success");
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
                  <table className="admin-data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
                    <thead>
                      <tr style={{ background: "var(--navy)" }}>
                        {["Title", "Agent / seller", "City", "Price", "Status", "Featured", "Created", "Actions"].map((h) => (
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
                  <table className="admin-data-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 920 }}>
                    <thead>
                      <tr style={{ background: "var(--navy)" }}>
                        {["Name", "Email", "Phone", "RERA", "Verification", "Plan", "Listings", "Actions"].map((h) => (
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
                            <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{a.name || "—"}</td>
                            <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)", wordBreak: "break-word" }}>{a.email || "—"}</td>
                            <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)" }}>{a.phone || a.mobile_number || "—"}</td>
                            <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)" }}>{a.rera_number || "—"}</td>
                            <td style={{ padding: "12px 14px" }}>
                              {ver ? badge("verified", "#ECFDF5", "#065F46", "1px solid #A7F3D0") : badge("pending", "#FFFBEB", "#D97706", "1px solid #FDE68A")}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              {paid ? badge("paid", "#DCFCE7", "#166534", "1px solid #86EFAC") : badge("free", "#F3F4F6", "#6B7280", "1px solid #E5E7EB")}
                            </td>
                            <td style={{ padding: "12px 14px" }}>
                              <span className="badge tag">{nList}</span>
                            </td>
                            <td style={{ padding: "12px 14px" }}>
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
                          <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "var(--navy)" }}>{u.name || "—"}</td>
                          <td style={{ padding: "12px 14px", fontSize: 12, color: "var(--muted)", wordBreak: "break-word" }}>{u.email || "—"}</td>
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
                              disabled={u.id === myId || u.role === "disabled"}
                              onClick={() => delU(u.id)}
                              title="Sets account to disabled (does not delete the row)"
                            >
                              Disable
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
    </div>
  );
}
