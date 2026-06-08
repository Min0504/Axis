import { seedPriceProvider } from "./seed-provider";
import type { PriceProvider, Region } from "./types";

export * from "./types";

/**
 * Resolve the active price provider for a region.
 *
 * Until a real data source is wired, prices are only available when explicitly
 * opted into the seed provider (dev/demo) via `AXIS_PRICE_SOURCE=seed`. In
 * production with no real provider, this returns null and the UI shows no
 * price — same honesty rule as the spec verification gate: never present data
 * we can't stand behind.
 */
export function getPriceProvider(_region: Region): PriceProvider | null {
  const source = process.env.AXIS_PRICE_SOURCE;
  if (source === "seed") return seedPriceProvider;
  // Future: if (source === "keepa") return keepaProvider; etc.
  return null;
}

/** True when any price source is configured. */
export function isPricingEnabled(): boolean {
  return Boolean(process.env.AXIS_PRICE_SOURCE);
}
