-- Push-based watch storage. Separate from email watches so each channel
-- can evolve independently. The push endpoint identifies a device.

create table if not exists public.push_watches (
  id                  uuid primary key default gen_random_uuid(),
  endpoint            text not null,           -- unique per device (from PushSubscription)
  subscription        jsonb not null,           -- full PushSubscriptionJSON for web-push
  product_id          text not null,
  product_name        text not null,
  region              text not null check (region in ('US', 'KR', 'JP')),
  target_price        numeric,
  added_at            timestamptz not null default now(),
  last_notified_price numeric,
  last_notified_at    timestamptz
);

create unique index if not exists push_watches_endpoint_product_region
  on public.push_watches (endpoint, product_id, region);

create index if not exists push_watches_endpoint_idx
  on public.push_watches (endpoint);

alter table public.push_watches enable row level security;
-- Service role only (cron). Client writes go through /api/push/subscribe.
