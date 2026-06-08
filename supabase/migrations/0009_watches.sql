-- P2-Alert: durable watch storage for server-side price-check cron.
-- email-based (no auth required). Service role bypasses RLS; API validates email.

create table if not exists public.watches (
  id                  uuid primary key default gen_random_uuid(),
  email               text not null,
  product_id          text not null,
  product_name        text not null,
  region              text not null check (region in ('US', 'KR', 'JP')),
  target_price        numeric,
  added_at            timestamptz not null default now(),
  last_notified_price numeric,
  last_notified_at    timestamptz
);

create unique index if not exists watches_email_product_region
  on public.watches (email, product_id, region);

create index if not exists watches_email_idx on public.watches (email);

alter table public.watches enable row level security;
-- No row-level policies: only the service-role key (used by the cron API) can
-- read or write. The anon/authenticated key goes through /api/watches which
-- validates ownership at the application layer.
