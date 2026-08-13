import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseRouteClient: vi.fn(),
  upsertWatch: vi.fn(),
  deleteWatch: vi.fn(),
  listWatchesByEmail: vi.fn()
}));

vi.mock("@/lib/supabase-route", () => ({
  createSupabaseRouteClient: mocks.createSupabaseRouteClient
}));
vi.mock("@/lib/watch/db", () => ({
  upsertWatch: mocks.upsertWatch,
  deleteWatch: mocks.deleteWatch,
  listWatchesByEmail: mocks.listWatchesByEmail
}));

import { GET, POST, DELETE } from "@/app/api/watches/route";

const logSpies = [
  vi.spyOn(console, "log").mockImplementation(() => {}),
  vi.spyOn(console, "warn").mockImplementation(() => {}),
  vi.spyOn(console, "error").mockImplementation(() => {})
];
afterAll(() => logSpies.forEach((s) => s.mockRestore()));

function sessionWith(email: string | undefined) {
  return {
    auth: {
      getUser: vi.fn().mockResolvedValue({
        data: { user: email ? { id: "u1", email } : null }
      })
    }
  };
}

let ipCounter = 0;
function request(method: string, body?: unknown) {
  return new Request("http://test.local/api/watches", {
    method,
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `10.1.0.${++ipCounter}`
    },
    ...(body !== undefined ? { body: JSON.stringify(body) } : {})
  });
}

const routeCtx = { params: Promise.resolve({}) };

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.createSupabaseRouteClient.mockResolvedValue(sessionWith("owner@axis.so"));
  mocks.upsertWatch.mockResolvedValue(undefined);
  mocks.deleteWatch.mockResolvedValue(undefined);
  mocks.listWatchesByEmail.mockResolvedValue([]);
});

const VALID_WATCH = {
  productId: "macbook-air-13-m3",
  name: "맥북 에어 13 M3",
  region: "KR",
  targetPrice: 1_390_000
};

describe("GET /api/watches", () => {
  it("returns the session owner's watches", async () => {
    mocks.listWatchesByEmail.mockResolvedValue([{ product_id: "x" }]);

    const res = await GET(request("GET"), routeCtx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ watches: [{ product_id: "x" }] });
    expect(mocks.listWatchesByEmail).toHaveBeenCalledWith("owner@axis.so");
  });

  it("returns 401 without a session", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue(sessionWith(undefined));

    const res = await GET(request("GET"), routeCtx);
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("unauthorized");
  });

  it("returns 503 when auth infrastructure is unavailable", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue(null);

    const res = await GET(request("GET"), routeCtx);
    expect(res.status).toBe(503);
    expect((await res.json()).error).toBe("auth unavailable");
  });
});

describe("POST /api/watches", () => {
  it("creates a watch owned by the SESSION email — body email is ignored", async () => {
    const res = await POST(
      request("POST", { ...VALID_WATCH, email: "attacker@evil.com" }),
      routeCtx
    );

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(mocks.upsertWatch).toHaveBeenCalledTimes(1);
    const [email, watch] = mocks.upsertWatch.mock.calls[0];
    expect(email).toBe("owner@axis.so"); // never the body's email
    expect(watch.productId).toBe(VALID_WATCH.productId);
    expect(watch.addedAt).toBeTruthy(); // defaulted server-side
  });

  it("rejects missing fields with the legacy message", async () => {
    const res = await POST(request("POST", { name: "no product id", region: "KR" }), routeCtx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("missing or invalid fields");
    expect(mocks.upsertWatch).not.toHaveBeenCalled();
  });

  it("rejects an invalid region", async () => {
    const res = await POST(request("POST", { ...VALID_WATCH, region: "FR" }), routeCtx);
    expect(res.status).toBe(400);
  });

  it("rejects a non-numeric targetPrice (strict boundary)", async () => {
    const res = await POST(request("POST", { ...VALID_WATCH, targetPrice: "cheap" }), routeCtx);
    expect(res.status).toBe(400);
  });

  it("rejects malformed JSON", async () => {
    const req = new Request("http://test.local/api/watches", {
      method: "POST",
      headers: { "content-type": "application/json", "x-forwarded-for": "10.1.99.1" },
      body: "{broken"
    });
    const res = await POST(req, routeCtx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid json");
  });
});

describe("DELETE /api/watches", () => {
  it("deletes by session email + product + region", async () => {
    const res = await DELETE(request("DELETE", { productId: "p1", region: "US" }), routeCtx);
    expect(res.status).toBe(200);
    expect(mocks.deleteWatch).toHaveBeenCalledWith("owner@axis.so", "p1", "US");
  });

  it("rejects missing productId", async () => {
    const res = await DELETE(request("DELETE", { region: "US" }), routeCtx);
    expect(res.status).toBe(400);
    expect(mocks.deleteWatch).not.toHaveBeenCalled();
  });
});
