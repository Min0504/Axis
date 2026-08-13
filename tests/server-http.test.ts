import { describe, it, expect, vi, afterEach } from "vitest";
import { computeBackoffMs, fetchWithRetry } from "@/lib/server/http";

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("computeBackoffMs", () => {
  it("grows exponentially with the attempt number", () => {
    const fullJitter = () => 1; // random=1 → delay equals the ceiling
    expect(computeBackoffMs(0, 100, 10_000, fullJitter)).toBe(100);
    expect(computeBackoffMs(1, 100, 10_000, fullJitter)).toBe(200);
    expect(computeBackoffMs(2, 100, 10_000, fullJitter)).toBe(400);
  });

  it("caps at backoffMaxMs", () => {
    expect(computeBackoffMs(10, 100, 500, () => 1)).toBe(500);
  });

  it("applies full jitter (random scales the delay down to zero)", () => {
    expect(computeBackoffMs(3, 100, 10_000, () => 0)).toBe(0);
    expect(computeBackoffMs(3, 100, 10_000, () => 0.5)).toBe(400);
  });
});

describe("fetchWithRetry", () => {
  const FAST = { backoffBaseMs: 1, backoffMaxMs: 2 };

  it("returns immediately on success without extra calls", async () => {
    const mock = vi.fn().mockResolvedValue(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", mock);

    const res = await fetchWithRetry("https://api.test/x", { ...FAST, retries: 2 });
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("retries 5xx responses and returns the eventual success", async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce(new Response("boom", { status: 500 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", mock);

    const res = await fetchWithRetry("https://api.test/x", { ...FAST, retries: 2 });
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("retries 429 (rate limited) responses", async () => {
    const mock = vi
      .fn()
      .mockResolvedValueOnce(new Response("slow down", { status: 429 }))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", mock);

    const res = await fetchWithRetry("https://api.test/x", { ...FAST, retries: 1 });
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("does NOT retry 4xx contract errors", async () => {
    const mock = vi.fn().mockResolvedValue(new Response("bad request", { status: 400 }));
    vi.stubGlobal("fetch", mock);

    const res = await fetchWithRetry("https://api.test/x", { ...FAST, retries: 3 });
    expect(res.status).toBe(400);
    expect(mock).toHaveBeenCalledTimes(1);
  });

  it("returns the last failing response when retries are exhausted", async () => {
    const mock = vi.fn().mockResolvedValue(new Response("down", { status: 503 }));
    vi.stubGlobal("fetch", mock);

    const res = await fetchWithRetry("https://api.test/x", { ...FAST, retries: 2 });
    expect(res.status).toBe(503);
    expect(mock).toHaveBeenCalledTimes(3); // 1 initial + 2 retries
  });

  it("retries network errors and succeeds", async () => {
    const mock = vi
      .fn()
      .mockRejectedValueOnce(new TypeError("fetch failed"))
      .mockResolvedValueOnce(new Response("ok", { status: 200 }));
    vi.stubGlobal("fetch", mock);

    const res = await fetchWithRetry("https://api.test/x", { ...FAST, retries: 1 });
    expect(res.status).toBe(200);
    expect(mock).toHaveBeenCalledTimes(2);
  });

  it("throws the last error when every attempt fails", async () => {
    const mock = vi.fn().mockRejectedValue(new TypeError("fetch failed"));
    vi.stubGlobal("fetch", mock);

    await expect(fetchWithRetry("https://api.test/x", { ...FAST, retries: 2 })).rejects.toThrow("fetch failed");
    expect(mock).toHaveBeenCalledTimes(3);
  });
});
