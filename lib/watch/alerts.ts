import type { PriceHistory } from "@/lib/pricing/types";
import type { AlertDecision, Watch } from "./types";

/** Drop below the period average that counts as a "notable drop" alert. */
export const DROP_THRESHOLD = 0.07;

/**
 * Decide whether a watched product's current price warrants an alert. Pure —
 * the server cron and any client preview both run this same function.
 *
 * Priority:
 *   1. target hit   — price ≤ the user's target
 *   2. all-time low — price is the lowest in the tracked window
 *   3. notable drop — price ≥ DROP_THRESHOLD below the period average
 *
 * `lastNotifiedPrice` suppresses repeat alerts: we never re-alert at a price
 * that isn't strictly lower than what we last told the user.
 */
export function evaluateAlert(
  watch: Watch,
  history: PriceHistory,
  lastNotifiedPrice?: number
): AlertDecision {
  const price = history.current;

  if (lastNotifiedPrice !== undefined && price >= lastNotifiedPrice) {
    return { fire: false, price };
  }

  if (watch.targetPrice !== undefined && price <= watch.targetPrice) {
    return { fire: true, reason: "target", price };
  }

  if (price <= history.lowest) {
    return { fire: true, reason: "all_time_low", price };
  }

  if (history.average > 0 && (history.average - price) / history.average >= DROP_THRESHOLD) {
    return { fire: true, reason: "drop", price };
  }

  return { fire: false, price };
}
