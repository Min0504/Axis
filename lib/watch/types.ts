import type { Region } from "@/lib/pricing/types";

/**
 * A tracked product. The "Track" half of Decide → Track → Alert.
 *
 * Stored client-side (localStorage) for now — no account needed to start
 * watching. A durable server copy (Supabase) is only required once we want to
 * send alerts while the user is away (server cron) or sync across devices.
 */
export type Watch = {
  productId: string;
  name: string;
  region: Region;
  /** Optional user-set target; alert when price drops to/below this. */
  targetPrice?: number;
  /** ISO timestamp the watch was created. */
  addedAt: string;
};

export type AlertReason = "target" | "all_time_low" | "drop";

export type AlertDecision = {
  fire: boolean;
  reason?: AlertReason;
  price: number;
};
