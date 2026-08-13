import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  createSupabaseRouteClient: vi.fn()
}));

vi.mock("@/lib/supabase-route", () => ({
  createSupabaseRouteClient: mocks.createSupabaseRouteClient
}));

import { createApiHandler } from "@/lib/server/api-handler";
import { v } from "@/lib/server/validate";

// Silence structured log lines — assertions target responses, not logs.
const logSpies = [
  vi.spyOn(console, "log").mockImplementation(() => {}),
  vi.spyOn(console, "warn").mockImplementation(() => {}),
  vi.spyOn(console, "error").mockImplementation(() => {})
];
afterAll(() => logSpies.forEach((s) => s.mockRestore()));

beforeEach(() => {
  mocks.createSupabaseRouteClient.mockReset();
  mocks.createSupabaseRouteClient.mockResolvedValue(null);
});

let ipCounter = 0;
/** Unique IP per request so the module-global rate limiter never couples tests. */
function jsonRequest(body: unknown, ip = `10.0.0.${++ipCounter}`) {
  return new Request("http://test.local/api/x", {
    method: "POST",
    headers: { "content-type": "application/json", "x-forwarded-for": ip },
    body: typeof body === "string" ? body : JSON.stringify(body)
  });
}

/** Route context Next.js would pass for a non-dynamic route. */
const ctx = { params: Promise.resolve({}) };

describe("createApiHandler pipeline", () => {
  it("runs the handler and stamps x-request-id on the response", async () => {
    const handler = createApiHandler({
      route: "POST /test/basic",
      handler: async () => NextResponse.json({ hello: "world" })
    });

    const res = await handler(jsonRequest({}), ctx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ hello: "world" });
    expect(res.headers.get("x-request-id")).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("enforces the rate limit with Retry-After and the configured message", async () => {
    const handler = createApiHandler({
      route: "POST /test/ratelimit",
      rateLimit: { limit: 2, windowMs: 60_000, keyPrefix: "test-rl", message: "너무 많아요" },
      handler: async () => NextResponse.json({ ok: true })
    });

    const ip = "10.9.9.1";
    expect((await handler(jsonRequest({}, ip), ctx)).status).toBe(200);
    expect((await handler(jsonRequest({}, ip), ctx)).status).toBe(200);

    const limited = await handler(jsonRequest({}, ip), ctx);
    expect(limited.status).toBe(429);
    expect(Number(limited.headers.get("Retry-After"))).toBeGreaterThanOrEqual(0);
    const body = await limited.json();
    expect(body.error).toBe("너무 많아요");
    expect(body.code).toBe("rate_limited");
    expect(body.requestId).toBeTruthy();
  });

  it("exposes rate limit headers on successful responses", async () => {
    const handler = createApiHandler({
      route: "POST /test/rl-headers",
      rateLimit: { limit: 5, windowMs: 60_000, keyPrefix: "test-rl-headers" },
      handler: async () => NextResponse.json({ ok: true })
    });

    const res = await handler(jsonRequest({}), ctx);
    expect(res.headers.get("X-RateLimit-Remaining")).toBe("4");
    expect(res.headers.get("X-RateLimit-Reset")).toMatch(/^\d+$/);
  });

  it("maps malformed JSON to 400 with the route's legacy message", async () => {
    const handler = createApiHandler({
      route: "POST /test/badjson",
      body: { invalidJsonMessage: "잘못된 요청 형식입니다." },
      handler: async () => NextResponse.json({ ok: true })
    });

    const res = await handler(jsonRequest("{nope"), ctx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("잘못된 요청 형식입니다.");
  });

  it("maps schema failures to 400 with issue details", async () => {
    const handler = createApiHandler({
      route: "POST /test/schema",
      body: {
        schema: v.object({ name: v.string({ min: 1 }) }),
        invalidMessage: "missing or invalid fields"
      },
      handler: async () => NextResponse.json({ ok: true })
    });

    const res = await handler(jsonRequest({ wrong: 1 }), ctx);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("missing or invalid fields");
    expect(body.code).toBe("validation_failed");
    expect(body.details.issues[0]).toEqual({ path: "name", message: "required" });
  });

  it("passes the validated (stripped) body to the handler", async () => {
    let seen: unknown;
    const handler = createApiHandler({
      route: "POST /test/body",
      body: { schema: v.object({ name: v.string() }) },
      handler: async (ctx) => {
        seen = ctx.body;
        return NextResponse.json({ ok: true });
      }
    });

    await handler(jsonRequest({ name: "kim", isAdmin: true }), ctx);
    expect(seen).toEqual({ name: "kim" }); // isAdmin stripped
  });

  it("returns 503 when auth is required but Supabase env is missing", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue(null);
    const handler = createApiHandler({
      route: "GET /test/auth-unavailable",
      auth: { mode: "required" },
      handler: async () => NextResponse.json({ ok: true })
    });

    const res = await handler(jsonRequest({}), ctx);
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("auth unavailable");
  });

  it("returns 401 with the configured message when there is no session", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: null } }) }
    });
    const handler = createApiHandler({
      route: "GET /test/auth-required",
      auth: { mode: "required", unauthorizedMessage: "로그인이 필요합니다." },
      handler: async () => NextResponse.json({ ok: true })
    });

    const res = await handler(jsonRequest({}), ctx);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("로그인이 필요합니다.");
  });

  it("normalizes the session email when requireEmail is set", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user: { id: "u1", email: "  User@Example.COM " } }
        })
      }
    });

    let email: string | null = null;
    const handler = createApiHandler({
      route: "GET /test/email",
      auth: { mode: "required", requireEmail: true },
      handler: async (ctx) => {
        email = ctx.sessionEmail;
        return NextResponse.json({ ok: true });
      }
    });

    await handler(jsonRequest({}), ctx);
    expect(email).toBe("user@example.com");
  });

  it("rejects sessions without a usable email when requireEmail is set", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue({
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1", email: undefined } } }) }
    });
    const handler = createApiHandler({
      route: "GET /test/no-email",
      auth: { mode: "required", requireEmail: true },
      handler: async () => NextResponse.json({ ok: true })
    });

    expect((await handler(jsonRequest({}), ctx)).status).toBe(401);
  });

  it("hides unexpected error internals behind a generic 500", async () => {
    const handler = createApiHandler({
      route: "GET /test/crash",
      handler: async () => {
        throw new Error("db password is hunter2");
      }
    });

    const res = await handler(jsonRequest({}), ctx);
    expect(res.status).toBe(500);
    const body = await res.json();
    expect(body.code).toBe("internal_error");
    expect(JSON.stringify(body)).not.toContain("hunter2");
    expect(body.requestId).toBeTruthy();
  });

  it("awaits and passes dynamic route params", async () => {
    let id: string | undefined;
    const handler = createApiHandler({
      route: "GET /test/[id]",
      handler: async (ctx) => {
        id = ctx.params.id;
        return NextResponse.json({ ok: true });
      }
    });

    await handler(jsonRequest({}), { params: Promise.resolve({ id: "abc-123" }) });
    expect(id).toBe("abc-123");
  });
});
