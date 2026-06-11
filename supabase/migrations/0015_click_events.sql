-- Click event tracking for affiliate CTR measurement (C-stage validation)
create table if not exists public.click_events (
  id            bigserial     primary key,
  event_type    text          not null check (event_type in ('affiliate', 'compare_view')),
  product_id    text,
  slug          text,
  region        text          check (region in ('KR', 'US', 'JP')),
  retailer      text,
  session_id    text,
  referrer      text,
  clicked_at    timestamptz   not null default now()
);

create index if not exists click_events_type_at
  on public.click_events (event_type, clicked_at desc);

create index if not exists click_events_slug
  on public.click_events (slug, clicked_at desc);

alter table public.click_events enable row level security;

-- anon/authenticated can insert (track clicks without login)
create policy "anyone can track clicks"
  on public.click_events for insert
  to anon, authenticated
  with check (true);

-- only service_role reads (admin analytics)
create policy "service_role reads click events"
  on public.click_events for select
  to service_role
  using (true);
