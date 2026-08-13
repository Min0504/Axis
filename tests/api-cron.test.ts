import { describe, it, expect, vi, beforeEach, afterEach, afterAll } from "vitest";
import { NextResponse } from "next/server";

const mocks = vi.hoisted(() => ({
  createServiceClientSafe: vi.fn()
}));

vi.mock("@/lib/supabase-server", () => ({
  createServiceClientSafe: mocks.createServiceClientSafe,
  createServiceClient: vi.fn(),
  createSupabaseServerClient: vi.fn(),
  hasServiceEnv: vi.fn(() => false)
}));

import { createCronHandler } from "@/lib/server/cron";

const logSpies = [
  vi.spyOn(console, "log").mockImplementation(() => {}),
  vi.spyOn(console, "warn").mockImplementation(() => {}),
  vi.spyOn(console, "error").mockImplementation(() => {})
];
afterAll(() => logSpies.forEach((s) => s.mockRestore()));

function request(auth?: string) {
  return new Request("http://test.local/api/cron/test-job", {
    headers: auth ? { Authorization: auth } : {}
  });
}

beforeEach(() => {
  mocks.createServiceClientSafe.mockReset();
  mocks.createServiceClientSafe.mockReturnValue(null); // audit no-op by default
});

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("createCronHandler", () => {
  it("fails closed when CRON_SECRET is not configured", async () => {
    vi.stubEnv("CRON_SECRET", "");
    const run = vi.fn();
    const handler = createCronHandler({ job: "test-job", run });

    const res = await handler(request("Bearer anything"));
    expect(res.status).toBe(401);
    expect(run).not.toHaveBeenCalled();
  });

  it("rejects a wrong secret without running the job", async () => {
    vi.stubEnv("CRON_SECRET", "real-secret");
    const run = vi.fn();
    const handler = createCronHandler({ job: "test-job", run });

    const res = await handler(request("Bearer wrong-secret"));
    expect(res.status).toBe(401);
    expect((await res.json()).error).toBe("unauthorized");
    expect(run).not.toHaveBeenCalled();
  });

  it("runs the job with the correct secret and passes through its response", async () => {
    vi.stubEnv("CRON_SECRET", "real-secret");
    const handler = createCronHandler({
      job: "test-job",
      run: async () => NextResponse.json({ checked: 5, fired: 1 })
    });

    const res = await handler(request("Bearer real-secret"));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ checked: 5, fired: 1 });
    expect(res.headers.get("x-request-id")).toBeTruthy();
  });

  it("records an audit row mirroring the job's own summary", async () => {
    vi.stubEnv("CRON_SECRET", "real-secret");
    const insert = vi.fn().mockResolvedValue({ error: null });
    mocks.createServiceClientSafe.mockReturnValue({ from: vi.fn(() => ({ insert })) });

    const handler = createCronHandler({
      job: "price-check",
      run: async () => NextResponse.json({ fired: 2 })
    });
    await handler(request("Bearer real-secret"));

    expect(insert).toHaveBeenCalledTimes(1);
    const row = insert.mock.calls[0][0];
    expect(row.job).toBe("price-check");
    expect(row.status).toBe("ok");
    expect(row.summary).toEqual({ fired: 2 });
    expect(typeof row.duration_ms).toBe("number");
  });

  it("converts a crashing job into JSON 500 and audits it as an error", async () => {
    vi.stubEnv("CRON_SECRET", "real-secret");
    const insert = vi.fn().mockResolvedValue({ error: null });
    mocks.createServiceClientSafe.mockReturnValue({ from: vi.fn(() => ({ insert })) });

    const handler = createCronHandler({
      job: "test-job",
      run: async () => {
        throw new Error("provider exploded");
      }
    });

    const res = await handler(request("Bearer real-secret"));
    expect(res.status).toBe(500);
    expect((await res.json()).error).toBe("internal_error");
    expect(insert.mock.calls[0][0].status).toBe("error");
  });

  it("still answers when the audit write itself fails", async () => {
    vi.stubEnv("CRON_SECRET", "real-secret");
    mocks.createServiceClientSafe.mockReturnValue({
      from: vi.fn(() => ({ insert: vi.fn().mockRejectedValue(new Error("no table")) }))
    });

    const handler = createCronHandler({
      job: "test-job",
      run: async () => NextResponse.json({ ok: true })
    });

    const res = await handler(request("Bearer real-secret"));
    expect(res.status).toBe(200);
  });
});
