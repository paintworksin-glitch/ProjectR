-- Core upgrades for broker productivity platform

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null,
  name text not null,
  phone text not null,
  requirement text,
  budget numeric,
  locality text,
  stage text default 'New',
  notes text,
  follow_up_at timestamptz,
  created_at timestamptz default now()
);

create table if not exists public.commissions (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null,
  property_id uuid,
  deal_value numeric not null,
  commission_amount numeric not null,
  status text default 'pending',
  created_at timestamptz default now()
);

create table if not exists public.broker_documents (
  id uuid primary key default gen_random_uuid(),
  broker_id uuid not null,
  link_type text,
  link_id uuid,
  file_name text not null,
  file_url text not null,
  file_type text,
  created_at timestamptz default now()
);

alter table public.listings add column if not exists amenities text[] default '{}';
alter table public.listings add column if not exists rera_number text;
alter table public.listings add column if not exists latitude double precision;
alter table public.listings add column if not exists longitude double precision;
alter table public.listings add column if not exists share_slug text;

update public.listings
set share_slug = lower(substr(md5(id::text || random()::text), 1, 8))
where share_slug is null;

create unique index if not exists listings_share_slug_key on public.listings(share_slug);

-- Phone OTP: open file migrations/20260401000000_phone_auth_profiles.sql in this repo,
-- copy its full contents into Supabase SQL Editor, and run (do not paste the path as SQL).

create table if not exists public.share_events (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid,
  broker_id uuid,
  visitor_id text,
  event_type text,
  platform text,
  created_at timestamptz default now()
);
