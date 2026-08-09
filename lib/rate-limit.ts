// Rate limiter with optional shared store (Upstash Redis REST).
//
// When UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN are set, limits are
// shared across Vercel instances. Otherwise falls back to in-memory (per
// instance / cold-start). No npm package required — plain fetch to Upstash REST.
//
// Fail-open: if the shared store errors, we degrade to in-memory so compare
// stays available. This is a first-line abuse guard, not a hard guarantee.

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  resetAt: number;
};

/** Sync in-memory limiter — used by tests and as shared-store fallback. */
export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) {
      if (b.resetAt <= now) buckets.delete(k);
    }
  }

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + windowMs;
    buckets.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  if (existing.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt };
  }

  existing.count += 1;
  return { allowed: true, remaining: limit - existing.count, resetAt: existing.resetAt };
}

function upstashConfigured(): boolean {
  return Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);
}

/**
 * Shared-store rate limit via Upstash Redis REST (no SDK).
 * Returns null when Upstash is not configured or the request fails.
 */
async function upstashRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult | null> {
  const base = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!base || !token) return null;

  const redisKey = `axis:rl:${key}`;
  const windowSec = Math.max(1, Math.ceil(windowMs / 1000));

  try {
    const res = await fetch(`${base}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify([
        ["INCR", redisKey],
        ["PTTL", redisKey]
      ]),
      // Keep compare latency bounded if Redis is slow.
      signal: AbortSignal.timeout(800)
    });

    if (!res.ok) return null;

    const data = (await res.json()) as Array<{ result: number } | number>;
    const incrRaw = data[0];
    const pttlRaw = data[1];
    const count = typeof incrRaw === "number" ? incrRaw : Number(incrRaw?.result);
    let pttl = typeof pttlRaw === "number" ? pttlRaw : Number(pttlRaw?.result);

    if (!Number.isFinite(count) || count < 1) return null;

    // First hit (or key without TTL) — set expiry.
    if (count === 1 || pttl < 0) {
      await fetch(`${base}/expire/${encodeURIComponent(redisKey)}/${windowSec}`, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(800)
      }).catch(() => undefined);
      pttl = windowMs;
    }

    const resetAt = Date.now() + Math.max(pttl, 0);
    if (count > limit) {
      return { allowed: false, remaining: 0, resetAt };
    }
    return { allowed: true, remaining: Math.max(0, limit - count), resetAt };
  } catch {
    return null;
  }
}

/**
 * Preferred entry for API routes: shared store when configured, else memory.
 */
export async function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  if (upstashConfigured()) {
    const shared = await upstashRateLimit(key, limit, windowMs);
    if (shared) return shared;
  }
  return rateLimit(key, limit, windowMs);
}

/** Extract the best-guess client IP from a request (Vercel/proxy aware). */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip")?.trim() || "unknown";
}
