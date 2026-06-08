-- Search misses: products users tried to compare but we couldn't find.
-- This table drives coverage improvement — run a query on it weekly to see
-- what products people ask for that Axis can't yet handle.

create table if not exists public.search_misses (
  id           bigserial primary key,
  product_name text        not null,
  category     text        not null,
  country      text        not null default 'KR',
  locale       text        not null default 'ko',
  created_at   timestamptz not null default now()
);

-- Index for aggregation queries: "most missed products this week"
create index if not exists search_misses_product_name_idx
  on public.search_misses (product_name, created_at desc);

alter table public.search_misses enable row level security;

-- Service role can insert (from server); no public read (privacy).
create policy "service write search_misses"
  on public.search_misses for all to service_role using (true);
