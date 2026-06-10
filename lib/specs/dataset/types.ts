import type { Category } from "@/lib/types";
import type { SpecSourceTier } from "@/lib/specs/source";

/**
 * Country / market region.
 * "GLOBAL" = specs apply in all markets (hardware is identical worldwide;
 * only prices / launch dates differ). When a country-specific entry exists
 * for the same product it takes priority over the GLOBAL entry.
 */
export type DatasetCountry = "KR" | "US" | "JP" | "GLOBAL";

/**
 * A verified product entry — the foundation of Axis's trust data.
 *
 * Each entry's `specs` are keyed by schema field keys (see lib/specs/schema.ts).
 * Values come from the official `source` page for that market.
 *
 * Country-specific fields (launch_price_krw, launch_price_usd, etc.) live in
 * their respective country entries so Korean users see ₩ prices and US users
 * see $ prices.
 */
export type VerifiedProduct = {
  /** Stable slug id — the key for prices, watches, and SEO URLs. Never changes. */
  id: string;
  /** Korean display name (default locale). */
  canonicalName: string;
  /**
   * English display + affiliate-search name (e.g. "iPhone 16 Pro").
   * Used when the user's locale is `en`, and as the Amazon US/JP search query so
   * a Korean input ("아이폰 16 프로") still searches the right English term.
   * Falls back to `canonicalName` when absent.
   */
  nameEn?: string;
  /** Japanese display name. Falls back to `nameEn` → `canonicalName`. */
  nameJa?: string;
  /** Input strings that should resolve to this product (lowercased match). */
  aliases: string[];
  category: Category;
  /**
   * Market this entry covers.
   * - "KR" : Korean market specs + KRW price
   * - "US" : US market specs + USD price
   * - "JP" : Japanese market specs + JPY price
   * - "GLOBAL": hardware specs shared across all markets (used when no
   *             country-specific entry exists)
   */
  country: DatasetCountry;
  /** Official spec page the values were sourced from. */
  source: string;
  /** ISO date (YYYY-MM) the specs were sourced/verified. */
  fetchedAt: string;
  /** Source tier — 1 for manufacturer-official, 2 for verified third-party (다나와 etc.) */
  tier: SpecSourceTier;
  /** schema fieldKey → display value. Base-configuration values. */
  specs: Record<string, string>;
};
