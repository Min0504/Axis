import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  createServiceClientSafe: vi.fn(),
  createSupabaseRouteClient: vi.fn()
}));

vi.mock("@/lib/supabase-server", () => ({
  createServiceClientSafe: mocks.createServiceClientSafe,
  createServiceClient: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  hasServiceEnv: vi.fn(() => false)
}));
vi.mock("@/lib/supabase-route", () => ({
  createSupabaseRouteClient: mocks.createSupabaseRouteClient
}));

import { GET } from "@/app/api/health/route";

const logSpies = [
  vi.spyOn(console, "log").mockImplementation(() => {}),
  vi.spyOn(console, "warn").mockImplementation(() => {}),
  vi.spyOn(console, "error").mockImplementation(() => {})
];
afterAll(() => logSpies.forEach((s) => s.mockRestore()));

let ipCounter = 0;
function request() {
  return new Request("http://test.local/api/health", {
    headers: { "x-forwarded-for": `10.4.0.${++ipCounter}` }
  });
}

const routeCtx = { params: Promise.resolve({}) };

function dbAnswering(result: { error: null | { message: string } }) {
  return {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve(result))
      }))
    }))
  };
}

beforeEach(() => {
  mocks.createServiceClientSafe.mockReset();
});

describe("GET /api/health", () => {
  it("reports degraded (503) when the database is unconfigured", async () => {
    mocks.createServiceClientSafe.mockReturnValue(null);

    const res = await GET(request(), routeCtx);
    expect(res.status).toBe(503);
    expect(res.headers.get("Cache-Control")).toBe("no-store");

    const body = await res.json();
    expect(body.status).toBe("degraded");
    expect(body.checks.database.status).toBe("unconfigured");
    expect(body.requestId).toBeTruthy();
  });

  it("reports a live database with probe latency", async () => {
    mocks.createServiceClientSafe.mockReturnValue(dbAnswering({ error: null }));

    const body = await (await GET(request(), routeCtx)).json();
    expect(body.checks.database.status).toBe("ok");
    expect(typeof body.checks.database.latencyMs).toBe("number");
  });

  it("reports database errors as a failed check", async () => {
    mocks.createServiceClientSafe.mockReturnValue(dbAnswering({ error: { message: "boom" } }));

    const body = await (await GET(request(), routeCtx)).json();
    expect(body.checks.database.status).toBe("error");
    expect(body.status).toBe("degraded");
  });

  it("only exposes configuration BOOLEANS/names — never env values", async () => {
    mocks.createServiceClientSafe.mockReturnValue(null);

    const body = await (await GET(request(), routeCtx)).json();
    expect(typeof body.checks.ai.configured).toBe("boolean");
    expect(typeof body.checks.email.configured).toBe("boolean");
    // missingCoreEnv lists names of unset vars — values are impossible to leak.
    expect(Array.isArray(body.missingCoreEnv)).toBe(true);
  });
});
