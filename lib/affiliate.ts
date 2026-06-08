import type { Locale } from "@/lib/i18n";
import type { Category } from "@/lib/types";

/**
 * Affiliate configuration.
 * - Korea: Coupang Partners (best catalog + conversion for KR)
 * - Japan: Amazon Japan
 * - Global (default): Amazon US
 *
 * Set the env vars in .env.local / deployment env:
 *   NEXT_PUBLIC_COUPANG_AFFILIATE_ID
 *   NEXT_PUBLIC_AMAZON_AFFILIATE_US
 *   NEXT_PUBLIC_AMAZON_AFFILIATE_JP
 */

const COUPANG_ID = process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID;
const AMAZON_US_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_US;
const AMAZON_JP_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_JP;

function coupangUrl(query: string) {
  // Coupang search results page for the specific product
  // Affiliate tracking: Coupang Partners requires generating per-product short links
  // via their dashboard. Until then, use the direct search URL so users land on
  // the correct product page.
  const q = encodeURIComponent(query);
  return `https://www.coupang.com/np/search?q=${q}&channel=user&searchTabCode=ALL`;
}

function amazonUrl(query: string, tld: string, affiliateId: string | undefined) {
  // Sort by featured/relevance to surface the best match
  const q = encodeURIComponent(query);
  const base = `https://www.amazon.${tld}/s?k=${q}&s=featured-rank`;
  if (!affiliateId) return base;
  return `${base}&tag=${affiliateId}`;
}

export type BuyLinkResult = {
  url: string;
  store: "coupang" | "amazon_us" | "amazon_jp";
  label: string; // e.g. "쿠팡" | "Amazon"
};

/**
 * Returns the best affiliate purchase link for the given product and locale.
 */
export function primaryBuyLink(
  productName: string,
  _category: Category,
  locale: Locale = "ko"
): BuyLinkResult {
  if (locale === "ko") {
    return { url: coupangUrl(productName), store: "coupang", label: "쿠팡" };
  }

  if (locale === "ja") {
    return {
      url: amazonUrl(productName, "co.jp", AMAZON_JP_ID),
      store: "amazon_jp",
      label: "Amazon"
    };
  }

  // en + all other locales → Amazon US
  return {
    url: amazonUrl(productName, "com", AMAZON_US_ID),
    store: "amazon_us",
    label: "Amazon"
  };
}
