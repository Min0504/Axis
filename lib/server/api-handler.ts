/**
 * Composable route-handler pipeline.
 *
 * Before this module every route hand-rolled the same cross-cutting stack —
 * rate limit → auth → JSON parse → field validation → try/catch → error JSON —
 * with copy-paste drift between routes (e.g. push/subscribe had no rate limit
 * at all). createApiHandler() centralizes that stack, so routes declare policy
 * and implement only domain logic:
 *
 *   export const POST = createApiHandler({
 *     route: "POST /api/watches",
 *     rateLimit: { limit: 30, windowMs: 60_000 },
 *     auth: { mode: "required", requireEmail: true },
 *     body: { schema: watchSchema, invalidMessage: "missing or invalid fields" },
 *     async handler(ctx) { ... }
 *   });
 *
 * Guarantees provided to every route:
 *  - x-request-id response header + request-scoped structured logger
 *  - completion log line with status + durationMs (latency observability)
 *  - thrown ApiError → consistent { error, code, requestId } JSON
 *  - unexpected crash → logged with stack, generic 500 (internals never leak)
 *
 * Response contract note: per-route legacy messages (Korean strings, "invalid
 * json", …) are configurable so the migration to this pipeline is
 * byte-compatible with what the frontend already parses.
 */
import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createSupabaseRouteClient } from "@/lib/supabase-route";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  BadRequestError,
  RateLimitError,
  ServiceUnavailableError,
  UnauthorizedError,
  ValidationError,
  toHttpError
} from "./errors";
import { createLogger, type Logger } from "./logger";
import { formatIssues, type Schema } from "./validate";

export type ApiContext<TBody, TQuery> = {
  req: Request;
  requestId: string;
  log: Logger;
  ip: string;
  /** Dynamic segment params ([id] etc.), already awaited. */
  params: Record<string, string>;
  /** Parsed (+ validated when a schema is configured) JSON body. */
  body: TBody;
  /** Validated query params (when a schema is configured). */
  query: TQuery;
  /** Session-scoped Supabase client (RLS applies). Null when env unset. */
  supabase: SupabaseClient | null;
  user: User | null;
  /** Normalized session email — set when auth.requireEmail passes. */
  sessionEmail: string | null;
};

type RateLimitConfig = {
  limit: number;
  windowMs: number;
  /** Bucket key prefix; defaults to the route name. */
  keyPrefix?: string;
  /** 429 body message — legacy per-route strings preserved via this knob. */
  message?: string;
};

type AuthConfig = {
  mode: "optional" | "required";
  /** Additionally require a valid email on the session user (watch APIs). */
  requireEmail?: boolean;
  unauthorizedMessage?: string;
  /** Message when Supabase env is missing entirely (503). */
  unavailableMessage?: string;
};

type BodyConfig<TBody> = {
  schema?: Schema<TBody>;
  /** 400 message when the payload isn't valid JSON. */
  invalidJsonMessage?: string;
  /** 400 message when schema validation fails (issues go into details). */
  invalidMessage?: string;
};

type QueryConfig<TQuery> = {
  schema: Schema<TQuery>;
  invalidMessage?: string;
};

type ApiHandlerConfig<TBody, TQuery> = {
  /** Human-readable route label for logs, e.g. "POST /api/watches". */
  route: string;
  rateLimit?: RateLimitConfig;
  auth?: AuthConfig;
  body?: BodyConfig<TBody>;
  query?: QueryConfig<TQuery>;
  handler: (ctx: ApiContext<TBody, TQuery>) => Promise<Response> | Response;
};

type RouteContext = { params: Promise<Record<string, string>> };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DEFAULT_RATE_MESSAGE = "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.";

function applyRateLimit(config: RateLimitConfig, route: string, ip: string): { remaining: number; resetAt: number } {
  const key = `${config.keyPrefix ?? route}:${ip}`;
  const result = rateLimit(key, config.limit, config.windowMs);
  if (!result.allowed) {
    const retryAfterSec = Math.ceil((result.resetAt - Date.now()) / 1000);
    throw new RateLimitError(config.message ?? DEFAULT_RATE_MESSAGE, retryAfterSec);
  }
  return { remaining: result.remaining, resetAt: result.resetAt };
}

async function resolveAuth(
  req: Request,
  config: AuthConfig
): Promise<{ supabase: SupabaseClient | null; user: User | null; sessionEmail: string | null }> {
  const supabase = await createSupabaseRouteClient(req);

  if (!supabase) {
    if (config.mode === "required") {
      throw new ServiceUnavailableError(config.unavailableMessage ?? "auth unavailable");
    }
    return { supabase: null, user: null, sessionEmail: null };
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user && config.mode === "required") {
    throw new UnauthorizedError(config.unauthorizedMessage ?? "unauthorized");
  }

  let sessionEmail: string | null = null;
  if (config.requireEmail) {
    const email = user?.email?.trim().toLowerCase();
    if (!email || !EMAIL_RE.test(email)) {
      throw new UnauthorizedError(config.unauthorizedMessage ?? "unauthorized");
    }
    sessionEmail = email;
  }

  return { supabase, user: user ?? null, sessionEmail };
}

async function parseBody<TBody>(req: Request, config: BodyConfig<TBody>): Promise<TBody> {
  let raw: unknown;
  try {
    raw = await req.json();
  } catch {
    throw new BadRequestError(config.invalidJsonMessage ?? "invalid json");
  }

  if (!config.schema) return raw as TBody;

  const result = config.schema.parse(raw);
  if (!result.ok) {
    throw new ValidationError(config.invalidMessage ?? formatIssues(result.issues), {
      details: { issues: result.issues }
    });
  }
  return result.value;
}

function parseQuery<TQuery>(req: Request, config: QueryConfig<TQuery>): TQuery {
  const params = Object.fromEntries(new URL(req.url).searchParams);
  const result = config.schema.parse(params);
  if (!result.ok) {
    throw new ValidationError(config.invalidMessage ?? formatIssues(result.issues), {
      details: { issues: result.issues }
    });
  }
  return result.value;
}

// The returned signature declares routeCtx as required (Next's generated
// route type-check rejects optional params), while the implementation
// tolerates its absence so tests can invoke handlers with a bare Request.
export function createApiHandler<TBody = unknown, TQuery = Record<string, string>>(
  config: ApiHandlerConfig<TBody, TQuery>
): (req: Request, routeCtx: RouteContext) => Promise<Response> {
  return async (req, routeCtx?: RouteContext) => {
    const requestId = randomUUID();
    const log = createLogger({ requestId, route: config.route });
    const startedAt = performance.now();

    let response: Response;
    let rateInfo: { remaining: number; resetAt: number } | null = null;

    try {
      const ip = getClientIp(req);

      if (config.rateLimit) {
        rateInfo = applyRateLimit(config.rateLimit, config.route, ip);
      }

      const { supabase, user, sessionEmail } = config.auth
        ? await resolveAuth(req, config.auth)
        : { supabase: null, user: null, sessionEmail: null };

      const body = config.body ? await parseBody(req, config.body) : (undefined as TBody);
      const query = config.query
        ? parseQuery(req, config.query)
        : (Object.fromEntries(new URL(req.url).searchParams) as TQuery);

      const params = routeCtx?.params ? await routeCtx.params : {};

      response = await config.handler({
        req,
        requestId,
        log,
        ip,
        params,
        body,
        query,
        supabase,
        user,
        sessionEmail
      });
    } catch (err) {
      const httpError = toHttpError(err);

      if (!httpError.expected) {
        log.error("unhandled route error", { err });
      } else if (httpError.status >= 500) {
        log.warn("request failed", { status: httpError.status, code: httpError.code });
      }

      response = NextResponse.json(
        {
          error: httpError.message,
          code: httpError.code,
          requestId,
          ...(httpError.details !== undefined ? { details: httpError.details } : {})
        },
        { status: httpError.status, headers: httpError.headers }
      );
    }

    response.headers.set("x-request-id", requestId);
    if (rateInfo) {
      response.headers.set("X-RateLimit-Remaining", String(rateInfo.remaining));
      response.headers.set("X-RateLimit-Reset", String(Math.ceil(rateInfo.resetAt / 1000)));
    }

    const durationMs = Math.round(performance.now() - startedAt);
    const level = response.status >= 500 ? "error" : response.status >= 400 ? "warn" : "info";
    log[level]("request completed", { status: response.status, durationMs });

    return response;
  };
}
