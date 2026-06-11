-- Daily price snapshots for self-hosted price history.
-- One row per product / region / date (upsert-safe).
-- The cron job at /api/cron/price-snapshot writes here.
-- The Coupang provider reads here for getHistory().

create table if not exists public.price_history (
  id            bigserial     primary key,
  product_id    text          not null,
  region        text          not null check (region in ('US', 'KR', 'JP')),
  currency      text          not null check (currency in ('USD', 'KRW', 'JPY')),
  price         numeric       not null,
  source        text          not null,
  affiliate_url text,
  recorded_date date          not null default current_date,
  fetched_at    timestamptz   not null default now()
);

-- One snapshot per product / region / day — idempotent cron re-runs
create unique index if not exists price_history_product_region_date
  on public.price_history (product_id, region, recorded_date);

create index if not exists price_history_lookup_idx
  on public.price_history (product_id, region, recorded_date desc);

alter table public.price_history enable row level security;

-- Anonymous users can read price history (needed for the results page)
create policy "public read price_history"
  on public.price_history for select to anon using (true);

create policy "authenticated read price_history"
  on public.price_history for select to authenticated using (true);

-- Only service role (cron) can write
create policy "service write price_history"
  on public.price_history for all to service_role using (true);
