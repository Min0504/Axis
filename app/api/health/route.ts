import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/server/api-handler";
import { createServiceClientSafe } from "@/lib/supabase-server";
import { envReport } from "@/lib/server/env";
import { isAiConfigured } from "@/lib/ai/decide";
import { getPriceProvider } from "@/lib/pricing";

export const runtime = "nodejs";
// Health must reflect live state — never serve a prerendered/cached copy.
export const dynamic = "force-dynamic";

const DB_PROBE_TIMEOUT_MS = 2500;

type CheckStatus = "ok" | "error" | "unconfigured";

type HealthChecks = {
  database: { status: CheckStatus; latencyMs?: number };
  ai: { configured: boolean };
  pricing: { provider: string | null };
  email: { configured: boolean };
  push: { configured: boolean };
};

/**
 * Cheapest real round-trip we can make: HEAD-style select on an existing
 * table. Confirms DNS + TLS + auth + Postgres are all alive, unlike a
 * "return 200 unconditionally" liveness stub.
 */
async function checkDatabase(): Promise<HealthChecks["database"]> {
  const db = createServiceClientSafe();
  if (!db) return { status: "unconfigured" };

  const startedAt = performance.now();
  try {
    const probe = db.from("comparisons").select("id", { head: true }).limit(1);
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("db probe timeout")), DB_PROBE_TIMEOUT_MS)
    );
    const { error } = await Promise.race([probe, timeout]);
    const latencyMs = Math.round(performance.now() - startedAt);

    if (error) return { status: "error", latencyMs };
    return { status: "ok", latencyMs };
  } catch {
    return { status: "error", latencyMs: Math.round(performance.now() - startedAt) };
  }
}

/**
 * GET /api/health — readiness report for uptime monitors and ops debugging.
 *
 * Answers "is the service actually able to serve?" in one request:
 * DB reachability + which optional features are configured. Reports names
 * and booleans only — env VALUES are never exposed.
 *
 * 200 = fully operational, 503 = degraded (monitors alert on non-2xx).
 */
export const GET = createApiHandler({
  route: "GET /api/health",
  rateLimit: { limit: 30, windowMs: 60_000, keyPrefix: "health" },
  async handler(ctx) {
    const env = envReport();
    const database = await checkDatabase();

    const checks: HealthChecks = {
      database,
      ai: { configured: env.aiConfigured },
      pricing: { provider: getPriceProvider("KR")?.source ?? null },
      email: { configured: (env.groups["email"]?.missing.length ?? 0) === 0 },
      push: { configured: (env.groups["push"]?.missing.length ?? 0) === 0 }
    };

    const healthy = database.status === "ok" && env.missingCore.length === 0 && isAiConfigured();

    return NextResponse.json(
      {
        status: healthy ? "ok" : "degraded",
        requestId: ctx.requestId,
        checks,
        missingCoreEnv: env.missingCore
      },
      {
        status: healthy ? 200 : 503,
        headers: { "Cache-Control": "no-store" }
      }
    );
  }
});
