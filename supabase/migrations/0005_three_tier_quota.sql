-- Move from 2-tier (free/pro) to 3-tier (free/plus/pro) daily quota.
-- Drop the old single-limit function and replace with a two-limit version;
-- pro remains unlimited.
drop function if exists public.consume_daily_quota(int);

create or replace function public.consume_daily_quota(p_free_limit int, p_plus_limit int)
returns table(allowed boolean, plan text, daily_usage int)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_plan text;
  v_usage int;
  v_date date;
  v_limit int;
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

  v_plan := coalesce(v_plan, 'free');

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

  -- Per-tier daily limit.
  v_limit := case when v_plan = 'plus' then p_plus_limit else p_free_limit end;

  if v_usage >= v_limit then
    update public.users set daily_usage = v_usage, usage_date = v_date where id = auth.uid();
    return query select false, v_plan, v_usage;
    return;
  end if;

  v_usage := v_usage + 1;
  update public.users set daily_usage = v_usage, usage_date = v_date where id = auth.uid();
  return query select true, v_plan, v_usage;
end;
$$;
