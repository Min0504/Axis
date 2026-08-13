import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";

const mocks = vi.hoisted(() => ({
  createSupabaseRouteClient: vi.fn()
}));

vi.mock("@/lib/supabase-route", () => ({
  createSupabaseRouteClient: mocks.createSupabaseRouteClient
}));

import { GET } from "@/app/api/history/route";
import { encodeCursor, decodeCursor } from "@/lib/server/pagination";

const logSpies = [
  vi.spyOn(console, "log").mockImplementation(() => {}),
  vi.spyOn(console, "warn").mockImplementation(() => {}),
  vi.spyOn(console, "error").mockImplementation(() => {})
];
afterAll(() => logSpies.forEach((s) => s.mockRestore()));

type Row = { id: string; query: string; selected_option: string; created_at: string };

function makeRows(count: number): Row[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `id-${i}`,
    query: `q-${i}`,
    selected_option: `opt-${i}`,
    created_at: new Date(Date.UTC(2026, 0, 31 - i)).toISOString()
  }));
}

/** Chainable thenable that mimics the supabase query builder. */
function makeBuilder(rows: Row[]) {
  const builder = {
    select: vi.fn(() => builder),
    eq: vi.fn(() => builder),
    order: vi.fn(() => builder),
    lt: vi.fn(() => builder),
    limit: vi.fn(() => builder),
    then: (resolve: (value: { data: Row[]; error: null }) => unknown) =>
      Promise.resolve({ data: rows, error: null }).then(resolve)
  };
  return builder;
}

function clientWith(rows: Row[], user: { id: string } | null = { id: "u1" }) {
  const builder = makeBuilder(rows);
  return {
    client: {
      auth: { getUser: vi.fn().mockResolvedValue({ data: { user } }) },
      from: vi.fn(() => builder)
    },
    builder
  };
}

let ipCounter = 0;
function request(params = "") {
  return new Request(`http://test.local/api/history${params}`, {
    headers: { "x-forwarded-for": `10.2.0.${++ipCounter}` }
  });
}

const routeCtx = { params: Promise.resolve({}) };

beforeEach(() => {
  mocks.createSupabaseRouteClient.mockReset();
});

describe("GET /api/history", () => {
  it("returns an empty list for anonymous callers (soft auth)", async () => {
    mocks.createSupabaseRouteClient.mockResolvedValue(null);

    const res = await GET(request(), routeCtx);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ history: [], nextCursor: null });
  });

  it("returns one page with no cursor when everything fits", async () => {
    const { client } = clientWith(makeRows(3));
    mocks.createSupabaseRouteClient.mockResolvedValue(client);

    const body = await (await GET(request(), routeCtx)).json();
    expect(body.history).toHaveLength(3);
    expect(body.nextCursor).toBeNull();
  });

  it("overfetches by one and returns a decodable nextCursor when more rows exist", async () => {
    const rows = makeRows(11); // limit 10 + 1 sentinel row
    const { client, builder } = clientWith(rows);
    mocks.createSupabaseRouteClient.mockResolvedValue(client);

    const body = await (await GET(request(), routeCtx)).json();
    expect(builder.limit).toHaveBeenCalledWith(11);
    expect(body.history).toHaveLength(10);

    const cursor = decodeCursor(body.nextCursor);
    expect(cursor).not.toBeNull();
    expect(cursor!.id).toBe(rows[9].id); // last VISIBLE row, not the sentinel
    expect(cursor!.createdAt).toBe(rows[9].created_at);
  });

  it("applies a valid cursor as a keyset predicate", async () => {
    const { client, builder } = clientWith(makeRows(2));
    mocks.createSupabaseRouteClient.mockResolvedValue(client);

    const cursor = encodeCursor({ createdAt: "2026-01-15T00:00:00.000Z", id: "id-x" });
    await GET(request(`?cursor=${cursor}`), routeCtx);

    expect(builder.lt).toHaveBeenCalledWith("created_at", "2026-01-15T00:00:00.000Z");
  });

  it("rejects a malformed cursor with 400", async () => {
    const { client } = clientWith(makeRows(1));
    mocks.createSupabaseRouteClient.mockResolvedValue(client);

    const res = await GET(request("?cursor=%F0%9F%92%A9garbage"), routeCtx);
    expect(res.status).toBe(400);
    expect((await res.json()).error).toBe("invalid cursor");
  });

  it("clamps the limit parameter to the maximum", async () => {
    const { client, builder } = clientWith(makeRows(1));
    mocks.createSupabaseRouteClient.mockResolvedValue(client);

    await GET(request("?limit=99999"), routeCtx);
    expect(builder.limit).toHaveBeenCalledWith(51); // max 50 + 1 sentinel
  });
});
