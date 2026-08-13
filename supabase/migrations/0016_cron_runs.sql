-- Cron run audit trail.
--
-- Every scheduled job (price-check, price-snapshot) records one row per run
-- via lib/server/cron.ts, so "did last night's job run and what did it do?"
-- is a SQL query instead of log archaeology.
--
-- The writer degrades gracefully when this table doesn't exist yet, so the
-- migration can be applied independently of the code deploy.

create table if not exists public.cron_runs (
  id uuid primary key default gen_random_uuid(),
  job text not null,
  status text not null check (status in ('ok', 'error')),
  -- The job's own response body (counts, provider, etc.).
  summary jsonb,
  duration_ms integer,
  request_id text,
  started_at timestamptz not null default now()
);

-- Dashboard query shape: "latest runs of job X" — index matches it exactly.
create index if not exists cron_runs_job_started_idx
  on public.cron_runs (job, started_at desc);

-- Service-role only: RLS enabled with no policies denies anon/authenticated
-- entirely (service role bypasses RLS).
alter table public.cron_runs enable row level security;
