import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { checkRateLimit } from "@/lib/rateLimit";

function clampInt(v, min, max, fallback) {
  const n = Number.parseInt(v, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function applyListingFilters(query, filters) {
  let q = query.eq("status", "Active");
  if (filters.search) {
    const safe = String(filters.search).trim().replace(/[%_,]/g, " ");
    if (safe) q = q.or(`title.ilike.%${safe}%,location.ilike.%${safe}%`);
  }
  if (filters.propertyType) q = q.eq("property_type", filters.propertyType);
  if (filters.listingType) q = q.eq("listing_type", filters.listingType);
  if (filters.city) q = q.ilike("location", `%${filters.city}%`);
  if (filters.minPrice) q = q.gte("price", Number(filters.minPrice));
  if (filters.maxPrice) q = q.lte("price", Number(filters.maxPrice));
  if (filters.bedrooms) q = q.gte("bedrooms", Number(filters.bedrooms));
  if (filters.furnishing) q = q.eq("furnishing_status", filters.furnishing);
  return q;
}

export async function GET(request) {
  const ip = (request.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
  const rate = await checkRateLimit(`listings:${ip}`, 60_000, 90);
  if (!rate.ok) return NextResponse.json({ error: "Too many requests" }, { status: 429 });

  const supabase = await createSupabaseServerClient();
  const params = request.nextUrl.searchParams;
  const page = clampInt(params.get("page"), 1, 500, 1);
  const pageSize = clampInt(params.get("pageSize"), 6, 36, 18);
  const sort = params.get("sort") || "newest";
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const filters = {
    search: params.get("search") || "",
    propertyType: params.get("propertyType") || "",
    listingType: params.get("listingType") || "",
    city: params.get("city") || "",
    minPrice: params.get("minPrice") || "",
    maxPrice: params.get("maxPrice") || "",
    bedrooms: params.get("bedrooms") || "",
    furnishing: params.get("furnishing") || "",
  };

  const countQuery = applyListingFilters(supabase.from("listings").select("id", { count: "exact", head: true }), filters);
  const { count, error: countError } = await countQuery;
  if (countError) return NextResponse.json({ error: countError.message }, { status: 400 });

  let dataQuery = applyListingFilters(supabase.from("listings").select("*"), filters).range(from, to);
  if (sort === "price_asc") dataQuery = dataQuery.order("price", { ascending: true });
  else if (sort === "price_desc") dataQuery = dataQuery.order("price", { ascending: false });
  else dataQuery = dataQuery.order("created_at", { ascending: false });

  const { data, error } = await dataQuery;
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  const rows = data || [];
  const agentIds = [...new Set(rows.map((r) => r.agent_id).filter(Boolean))];
  let vmap = {};
  if (agentIds.length) {
    const { data: profs } = await supabase.from("profiles").select("id, agent_verified").in("id", agentIds);
    vmap = Object.fromEntries((profs || []).map((p) => [p.id, p.agent_verified === true]));
  }

  return NextResponse.json({
    items: rows.map((r) => ({ ...r, _ownerAgentVerified: vmap[r.agent_id] })),
    totalCount: count || 0,
    page,
    pageSize,
  });
}
