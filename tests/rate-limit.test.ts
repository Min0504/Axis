import { describe, expect, it } from "vitest";
import { rateLimit, getClientIp } from "@/lib/rate-limit";

describe("rateLimit", () => {
  it("allows up to the limit then blocks", () => {
    const key = `test:${Math.random()}`;
    const limit = 3;

    expect(rateLimit(key, limit, 60_000).allowed).toBe(true); // 1
    expect(rateLimit(key, limit, 60_000).allowed).toBe(true); // 2
    expect(rateLimit(key, limit, 60_000).allowed).toBe(true); // 3
    const blocked = rateLimit(key, limit, 60_000); // 4
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it("resets after the window elapses", async () => {
    const key = `test:${Math.random()}`;
    const windowMs = 20;
    expect(rateLimit(key, 1, windowMs).allowed).toBe(true);
    expect(rateLimit(key, 1, windowMs).allowed).toBe(false); // still inside window
    await new Promise((r) => setTimeout(r, windowMs + 10));
    expect(rateLimit(key, 1, windowMs).allowed).toBe(true); // window elapsed
  });

  it("reports decreasing remaining", () => {
    const key = `test:${Math.random()}`;
    expect(rateLimit(key, 5, 60_000).remaining).toBe(4);
    expect(rateLimit(key, 5, 60_000).remaining).toBe(3);
  });
});

describe("getClientIp", () => {
  it("reads the first x-forwarded-for entry", () => {
    const req = new Request("http://x", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" }
    });
    expect(getClientIp(req)).toBe("203.0.113.7");
  });

  it("falls back to x-real-ip", () => {
    const req = new Request("http://x", { headers: { "x-real-ip": "198.51.100.2" } });
    expect(getClientIp(req)).toBe("198.51.100.2");
  });

  it("returns 'unknown' when no ip headers", () => {
    expect(getClientIp(new Request("http://x"))).toBe("unknown");
  });
});
