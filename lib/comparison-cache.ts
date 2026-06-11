/**
 * 24-hour comparison result cache backed by Supabase.
 *
 * Popular queries (e.g. "아이폰 16 vs 갤럭시 S25") are computed once and
 * served from cache for all subsequent visitors — reducing AI API costs and
 * response latency without sacrificing freshness (spec pages rarely change
 * intra-day).
 *
 * Cache key = `v{CACHE_VERSION}|{query}|{locale}|{country}` (lowercase, trimmed).
 * Bump CACHE_VERSION when the comparison schema or result format changes significantly
 * so old cached entries are automatically bypassed (they expire naturally within 24h).
 */
import { createServiceClientSafe } from "@/lib/supabase-server";
import type { ComparisonResult } from "@/lib/types";
import type { Country, Locale } from "@/lib/i18n";

const CACHE_TTL_HOURS = 24;

/** Bump this when comparison output format changes to invalidate stale cached results. */
const CACHE_VERSION = 9;  // v9: reasons/analyses 강화(스펙→실생활 장점) + userContext 맞춤 재분석

function cacheKey(query: string, locale: Locale, country: Country): string {
  return `v${CACHE_VERSION}|${query.trim().toLowerCase()}|${locale}|${country}`;
}

export async function getCachedComparison(
  query: string,
  locale: Locale,
  country: Country
): Promise<ComparisonResult | null> {
  const db = createServiceClientSafe();
  if (!db) return null;

  try {
    const { data } = await db
      .from("comparison_cache")
      .select("result")
      .eq("cache_key", cacheKey(query, locale, country))
      .gt("expires_at", new Date().toISOString())
      .maybeSingle();

    if (!data) return null;
    return data.result as ComparisonResult;
  } catch {
    return null;
  }
}

export async function setCachedComparison(
  query: string,
  locale: Locale,
  country: Country,
  result: ComparisonResult
): Promise<void> {
  const db = createServiceClientSafe();
  if (!db) return;

  // Only cache successful comparisons (not "not_found" or "verification_pending")
  if (result.status !== "ok") return;

  const expiresAt = new Date(Date.now() + CACHE_TTL_HOURS * 60 * 60 * 1000).toISOString();

  try {
    await db.from("comparison_cache").upsert({
      cache_key: cacheKey(query, locale, country),
      result,
      cached_at: new Date().toISOString(),
      expires_at: expiresAt
    });
  } catch {
    // Non-blocking — cache failures never break the main flow
  }
}
