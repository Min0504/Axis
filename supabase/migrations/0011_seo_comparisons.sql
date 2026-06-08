-- Pre-generated SEO comparison results.
-- Populated lazily on first page request; read by subsequent visits + Googlebot.

create table if not exists public.seo_comparisons (
  slug         text primary key,
  query        text not null,
  result       jsonb not null,
  generated_at timestamptz not null default now()
);

alter table public.seo_comparisons enable row level security;

create policy "public read seo_comparisons"
  on public.seo_comparisons for select to anon using (true);

create policy "service write seo_comparisons"
  on public.seo_comparisons for all to service_role using (true);
