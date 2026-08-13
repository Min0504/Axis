/**
 * Cron job wrapper: authentication + observability + audit trail.
 *
 * Every scheduled job gets, for free:
 *  - constant-time CRON_SECRET verification (fails closed when unset),
 *  - a request-scoped structured logger + x-request-id header,
 *  - a completion log with duration,
 *  - a crash barrier (a throwing job returns JSON 500 instead of an
 *    unhandled framework error),
 *  - a best-effort audit row in `cron_runs` — so "did last night's job run,
 *    and what did it do?" is answerable from the DB, not just log archaeology.
 *
 * The audit write is fire-and-forget by design: observability must never
 * break the job itself (e.g. before the cron_runs migration is applied).
 */
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { createServiceClientSafe } from "@/lib/supabase-server";
import { createLogger, type Logger } from "./logger";
import { verifyBearerSecret } from "./secrets";

export type CronContext = {
  requestId: string;
  log: Logger;
};

type CronHandlerConfig = {
  /** Job name for logs + audit rows, e.g. "price-check". */
  job: string;
  run: (ctx: CronContext) => Promise<NextResponse>;
};

async function recordCronRun(entry: {
  job: string;
  status: "ok" | "error";
  summary: Record<string, unknown> | null;
  durationMs: number;
  requestId: string;
}): Promise<void> {
  const db = createServiceClientSafe();
  if (!db) return;

  try {
    await db.from("cron_runs").insert({
      job: entry.job,
      status: entry.status,
      summary: entry.summary,
      duration_ms: entry.durationMs,
      request_id: entry.requestId
    });
  } catch {
    // Table missing or transient failure — auditing is best-effort.
  }
}

/** Extract the job's own response body so the audit row mirrors what the job reported. */
async function summarizeResponse(res: NextResponse): Promise<Record<string, unknown> | null> {
  try {
    return (await res.clone().json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function createCronHandler(config: CronHandlerConfig): (req: Request) => Promise<Response> {
  return async (req) => {
    const requestId = randomUUID();
    const log = createLogger({ requestId, job: config.job });

    if (!verifyBearerSecret(req, process.env.CRON_SECRET)) {
      log.warn("cron auth rejected");
      const res = NextResponse.json({ error: "unauthorized" }, { status: 401 });
      res.headers.set("x-request-id", requestId);
      return res;
    }

    const startedAt = performance.now();
    log.info("cron started");

    let response: NextResponse;
    let status: "ok" | "error" = "ok";

    try {
      response = await config.run({ requestId, log });
      if (response.status >= 500) status = "error";
    } catch (err) {
      status = "error";
      log.error("cron crashed", { err });
      response = NextResponse.json({ error: "internal_error", requestId }, { status: 500 });
    }

    const durationMs = Math.round(performance.now() - startedAt);
    const summary = await summarizeResponse(response);

    log[status === "ok" ? "info" : "error"]("cron finished", { status: response.status, durationMs });
    await recordCronRun({ job: config.job, status, summary, durationMs, requestId });

    response.headers.set("x-request-id", requestId);
    return response;
  };
}
