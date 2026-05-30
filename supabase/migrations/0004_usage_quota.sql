-- Daily-usage quota for the freemium model.
-- users.plan ('free' | 'pro') and users.daily_usage already exist (0001);
-- add a usage_date so the counter can reset each calendar day.
alter table public.users
  add column if not exists usage_date date;

-- Atomically reset (on a new day), check the free limit, and increment usage.
-- SECURITY DEFINER so it can update the caller's own row; it only ever touches
-- auth.uid()'s row, and Pro accounts are unlimited.
create or replace function public.consume_daily_quota(p_free_limit int)
returns table(allowed boolean, plan text, daily_usage int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_usage int;
  v_date date;
begin
  select u.plan, u.daily_usage, u.usage_date
    into v_plan, v_usage, v_date
    from public.users u
    where u.id = auth.uid()
    for update;

  if not found then
    return query select false, 'free'::text, 0;
    return;
  end if;

  if v_date is distinct from current_date then
    v_usage := 0;
    v_date := current_date;
  end if;

  -- Pro: unlimited.
  if v_plan = 'pro' then
    v_usage := v_usage + 1;
    update public.users set daily_usage = v_usage, usage_date = v_date where id = auth.uid();
    return query select true, v_plan, v_usage;
    return;
  end if;

  -- Free: enforce the daily limit.
  if v_usage >= p_free_limit then
    update public.users set daily_usage = v_usage, usage_date = v_date where id = auth.uid();
    return query select false, coalesce(v_plan, 'free'), v_usage;
    return;
  end if;

  v_usage := v_usage + 1;
  update public.users set daily_usage = v_usage, usage_date = v_date where id = auth.uid();
  return query select true, coalesce(v_plan, 'free'), v_usage;
end;
$$;
