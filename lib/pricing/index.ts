import { seedPriceProvider } from "./seed-provider";
import { coupangProvider } from "./coupang-provider";
import { naverProvider } from "./naver-provider";
import type { PriceProvider, Region } from "./types";

export * from "./types";

/**
 * Resolve the active price provider for a region.
 *
 * `AXIS_PRICE_SOURCE=naver`   — Naver Shopping API (interim; available immediately).
 * `AXIS_PRICE_SOURCE=coupang` — Coupang Partners API (requires Partners 최종승인).
 * `AXIS_PRICE_SOURCE=seed`    — deterministic fixture for dev/demo only.
 * unset                       — returns null; UI shows no price.
 *
 * Switch path: naver → coupang (env var change only, no code change needed).
 */
export function getPriceProvider(region: Region): PriceProvider | null {
  const source = process.env.AXIS_PRICE_SOURCE;
  if (source === "naver") return region === "KR" ? naverProvider : null;
  if (source === "coupang") return region === "KR" ? coupangProvider : null;
  if (source === "seed") return seedPriceProvider;
  return null;
}

/** True when any price source is configured. */
export function isPricingEnabled(): boolean {
  return Boolean(process.env.AXIS_PRICE_SOURCE);
}
