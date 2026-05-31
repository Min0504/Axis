-- Public sharing: a comparison can have a random share token so anyone with
-- the link can view the result without being logged in.
alter table public.comparisons
  add column if not exists share_token text unique,
  add column if not exists is_public boolean not null default false;

-- Index for fast token lookup on the public share page.
create index if not exists comparisons_share_token_idx
  on public.comparisons (share_token)
  where share_token is not null;

-- Unauthenticated reads are allowed only when is_public = true.
create policy "public can read shared comparisons"
  on public.comparisons
  for select
  using (is_public = true);
