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
