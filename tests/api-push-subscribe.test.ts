import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  upsertPushWatch: vi.fn(),
  deletePushWatch: vi.fn()
}));

vi.mock("@/lib/push/db", () => ({
  upsertPushWatch: mocks.upsertPushWatch,
  deletePushWatch: mocks.deletePushWatch
}));

import { POST, DELETE } from "@/app/api/push/subscribe/route";

const logSpies = [
  vi.spyOn(console, "log").mockImplementation(() => {}),
  vi.spyOn(console, "warn").mockImplementation(() => {}),
  vi.spyOn(console, "error").mockImplementation(() => {})
];
afterAll(() => logSpies.forEach((s) => s.mockRestore()));

let ipCounter = 0;
function request(method: string, body: unknown) {
  return new Request("http://test.local/api/push/subscribe", {
    method,
    headers: {
      "content-type": "application/json",
      "x-forwarded-for": `10.5.0.${++ipCounter}`
    },
    body: JSON.stringify(body)
  });
}

const routeCtx = { params: Promise.resolve({}) };

const SUBSCRIPTION = {
  endpoint: "https://push.example/token-abc",
  expirationTime: null,
  keys: { p256dh: "key1", auth: "key2" }
};

const VALID = {
  subscription: SUBSCRIPTION,
  productId: "galaxy-s25",
  name: "갤럭시 S25",
  region: "KR"
};

beforeEach(() => {
  Object.values(mocks).forEach((m) => m.mockReset());
  mocks.upsertPushWatch.mockResolvedValue(undefined);
  mocks.deletePushWatch.mockResolvedValue(undefined);
});

describe("POST /api/push/subscribe", () => {
  it("registers a push watch, passing the subscription through UNTOUCHED", async () => {
    const res = await POST(request("POST", VALID), routeCtx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });

    const [subscription, watch] = mocks.upsertPushWatch.mock.calls[0];
    // web-push needs keys/expirationTime — the schema must not strip them.
    expect(subscription).toEqual(SUBSCRIPTION);
    expect(watch.productId).toBe("galaxy-s25");
  });

  it("rejects a subscription without an endpoint", async () => {
    const res = await POST(
      request("POST", { ...VALID, subscription: { keys: {} } }),
      routeCtx
    );
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("missing or invalid fields");
    expect(mocks.upsertPushWatch).not.toHaveBeenCalled();
  });

  it("rejects an invalid region", async () => {
    const res = await POST(request("POST", { ...VALID, region: "DE" }), routeCtx);
    expect(res.status).toBe(400);
  });
});

describe("DELETE /api/push/subscribe", () => {
  it("removes a push watch by endpoint + product + region", async () => {
    const res = await DELETE(
      request("DELETE", { endpoint: SUBSCRIPTION.endpoint, productId: "galaxy-s25", region: "KR" }),
      routeCtx
    );
    expect(res.status).toBe(200);
    expect(mocks.deletePushWatch).toHaveBeenCalledWith(SUBSCRIPTION.endpoint, "galaxy-s25", "KR");
  });

  it("rejects missing endpoint", async () => {
    const res = await DELETE(request("DELETE", { productId: "galaxy-s25", region: "KR" }), routeCtx);
    expect(res.status).toBe(400);
    expect(mocks.deletePushWatch).not.toHaveBeenCalled();
  });
});
