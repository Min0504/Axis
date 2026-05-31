-- Allow guest (anonymous) shares: user_id may be null for publicly shared
-- comparisons that were not created by a logged-in user.
alter table public.comparisons
  alter column user_id drop not null;

-- Unauthenticated inserts are allowed only when is_public = true and
-- user_id is null (guest shares via the /api/share/guest endpoint).
create policy "guest can insert public comparison"
  on public.comparisons
  for insert
  with check (is_public = true and user_id is null);
