create extension if not exists "pgcrypto";

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  plan text not null default 'free',
  daily_usage integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.comparisons (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  query text not null,
  category text not null,
  selected_option text not null,
  analysis_result jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null,
  official_url text,
  last_updated timestamptz
);

create table if not exists public.specs (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  spec_name text not null,
  spec_value text not null,
  source_url text,
  created_at timestamptz not null default now()
);

alter table public.users enable row level security;
alter table public.comparisons enable row level security;
alter table public.products enable row level security;
alter table public.specs enable row level security;

create policy "user can read own profile" on public.users
  for select using (auth.uid() = id);

create policy "user can insert own profile" on public.users
  for insert with check (auth.uid() = id);

create policy "user can read own comparisons" on public.comparisons
  for select using (auth.uid() = user_id);

create policy "user can insert own comparisons" on public.comparisons
  for insert with check (auth.uid() = user_id);

create policy "authenticated read products" on public.products
  for select to authenticated using (true);

create policy "authenticated read specs" on public.specs
  for select to authenticated using (true);
