import type { Category } from "@/lib/types";
import type { SpecSourceTier } from "@/lib/specs/source";

/**
 * A hand-verified product entry — the foundation of Axis's trust moat.
 *
 * Each entry's `specs` are keyed by schema field keys (see lib/specs/schema.ts)
 * and were transcribed from the official `source` page on `fetchedAt`. Only
 * fields that could be verified are present; missing fields stay absent so the
 * verification grader honestly reports "partial" rather than inventing values.
 */
export type VerifiedProduct = {
  /** Stable slug id — the key for prices, watches, and SEO URLs. Never changes. */
  id: string;
  /** Display name. */
  canonicalName: string;
  /** Input strings that should resolve to this product (lowercased match). */
  aliases: string[];
  category: Category;
  /** Official manufacturer spec page the values were transcribed from. */
  source: string;
  /** ISO date (YYYY-MM) the specs were sourced/verified. */
  fetchedAt: string;
  /** Source tier — 1 for manufacturer-official transcriptions. */
  tier: SpecSourceTier;
  /** schema fieldKey → display value. Base-configuration values. */
  specs: Record<string, string>;
};
