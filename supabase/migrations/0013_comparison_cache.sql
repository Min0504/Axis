-- Anonymous comparison result cache (24-hour TTL).
-- Prevents repeated AI + spec-extraction calls for popular queries.
-- The service role writes after each fresh compute; reads are public so
-- anonymous users benefit too.

create table if not exists public.comparison_cache (
  id          bigserial   primary key,
  cache_key   text        not null unique, -- query|locale|country
  result      jsonb       not null,
  cached_at   timestamptz not null default now(),
  expires_at  timestamptz not null
);

create index if not exists comparison_cache_key_expires_idx
  on public.comparison_cache (cache_key, expires_at);

-- Auto-clean expired rows every day (Supabase cron or manual)
-- DELETE FROM comparison_cache WHERE expires_at < now();

alter table public.comparison_cache enable row level security;

create policy "public read comparison_cache"
  on public.comparison_cache for select to anon using (expires_at > now());

create policy "service write comparison_cache"
  on public.comparison_cache for all to service_role using (true);
