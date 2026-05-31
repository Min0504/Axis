-- Optional display nickname (별명) shown instead of the raw email.
alter table public.users
  add column if not exists nickname text;
