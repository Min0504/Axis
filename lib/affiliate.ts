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
  const q = encodeURIComponent(query);
  const base = `https://www.coupang.com/np/search?q=${q}`;
  if (!COUPANG_ID) return base;
  return `https://link.coupang.com/a/${COUPANG_ID}?url=${encodeURIComponent(base)}`;
}

function amazonUrl(query: string, tld: string, affiliateId: string | undefined) {
  const q = encodeURIComponent(query);
  const base = `https://www.amazon.${tld}/s?k=${q}`;
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
