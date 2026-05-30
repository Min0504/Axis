-- Allow users to delete their own comparison history (was missing — only
-- SELECT/INSERT policies existed, so history could never be removed).
create policy "user can delete own comparisons"
  on public.comparisons
  for delete
  using (auth.uid() = user_id);

-- Speed up the history list query: select ... where user_id = ? order by created_at desc.
create index if not exists comparisons_user_created_idx
  on public.comparisons (user_id, created_at desc);
