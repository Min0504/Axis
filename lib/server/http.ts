/**
 * Outbound HTTP with timeout + bounded retry.
 *
 * External APIs (Naver, Coupang, search providers) fail transiently: network
 * blips, 429s, 5xxs. The resilient-client recipe is:
 *
 *   1. per-attempt timeout (never hang a serverless function),
 *   2. retry ONLY safe-to-retry failures (network error, 429, 5xx),
 *   3. exponential backoff with jitter (don't stampede a recovering server),
 *   4. a hard attempt cap (fail fast beats retrying forever).
 *
 * 4xx (except 429) are NOT retried — the request itself is wrong and
 * retrying identical input cannot succeed.
 */

export type RetryOptions = {
  /** Per-attempt timeout. */
  timeoutMs?: number;
  /** Extra attempts after the first (retries: 2 → up to 3 requests). */
  retries?: number;
  backoffBaseMs?: number;
  backoffMaxMs?: number;
};

const DEFAULTS: Required<RetryOptions> = {
  timeoutMs: 6000,
  retries: 2,
  backoffBaseMs: 300,
  backoffMaxMs: 4000
};

function isRetryableStatus(status: number): boolean {
  return status === 429 || status >= 500;
}

/**
 * Full-jitter exponential backoff: delay ∈ [0, min(max, base * 2^attempt)].
 * Exported for deterministic unit testing (inject `random`).
 */
export function computeBackoffMs(
  attempt: number,
  baseMs: number,
  maxMs: number,
  random: () => number = Math.random
): number {
  const ceiling = Math.min(maxMs, baseMs * 2 ** attempt);
  return Math.round(random() * ceiling);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function fetchWithRetry(
  input: string | URL,
  init: RequestInit & RetryOptions = {}
): Promise<Response> {
  const { timeoutMs, retries, backoffBaseMs, backoffMaxMs, ...fetchInit } = {
    ...DEFAULTS,
    ...init
  };

  let lastError: unknown;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const isLastAttempt = attempt === retries;

    try {
      const res = await fetch(input, {
        ...fetchInit,
        signal: AbortSignal.timeout(timeoutMs)
      });

      if (res.ok || !isRetryableStatus(res.status) || isLastAttempt) {
        return res;
      }
      // Retryable status: discard the body so the connection can be reused.
      await res.body?.cancel().catch(() => {});
    } catch (err) {
      lastError = err;
      if (isLastAttempt) throw err;
    }

    await sleep(computeBackoffMs(attempt, backoffBaseMs, backoffMaxMs));
  }

  // Unreachable: the loop always returns or throws on the last attempt.
  throw lastError ?? new Error("fetchWithRetry: exhausted retries");
}
