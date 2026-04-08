export function shellPathForPage(page, agentId) {
  if (page === "agentpage" && agentId) return `/?agent=${encodeURIComponent(agentId)}`;
  if (page === "feed") return "/feed";
  if (page === "login") return "/login";
  if (page === "signup") return "/signup";
  if (page === "profile") return "/profile";
  if (page === "dashboard") return "/dashboard";
  if (page === "privacy") return "/privacy";
  if (page === "terms") return "/terms";
  if (page === "about") return "/about";
  if (page === "pricing") return "/pricing";
  if (page === "contact") return "/contact";
  return "/";
}

/** Maps current URL to legacy `page` + `agentId` used by Nav and shell. */
export function resolveNavPage(pathname, agentFromSearch) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  if (agentFromSearch) return { page: "agentpage", agentId: agentFromSearch };
  if (path === "/feed") return { page: "feed", agentId: null };
  if (path === "/login") return { page: "login", agentId: null };
  if (path === "/signup") return { page: "signup", agentId: null };
  if (path === "/profile") return { page: "profile", agentId: null };
  if (path === "/dashboard" || path === "/admin") return { page: "dashboard", agentId: null };
  if (path === "/privacy") return { page: "privacy", agentId: null };
  if (path === "/terms") return { page: "terms", agentId: null };
  if (path === "/about") return { page: "about", agentId: null };
  if (path === "/pricing") return { page: "pricing", agentId: null };
  if (path === "/contact") return { page: "contact", agentId: null };
  return { page: "home", agentId: null };
}
