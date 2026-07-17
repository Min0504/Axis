import type { Locale } from "@/lib/i18n";
import type { Category } from "@/lib/types";

/**
 * KR Coupang Partners only (validation-first).
 * Set NEXT_PUBLIC_COUPANG_AFFILIATE_ID for tracking.
 */

const COUPANG_ID = process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID;

type KnownBrand = "apple" | "samsung" | "lg" | "other";

function detectBrand(productName: string): KnownBrand {
  const lower = productName.toLowerCase();
  if (/iphone|ipad|macbook|airpods?|imac|apple\s*watch|에어팟|아이폰|아이패드|맥북/.test(lower)) {
    return "apple";
  }
  if (/galaxy|samsung|갤럭시|삼성/.test(lower)) return "samsung";
  if (/\blg\b|gram|그램/.test(lower)) return "lg";
  return "other";
}

function coupangSearchUrl(query: string, brand?: string): string {
  const q = encodeURIComponent(query);
  let base = `https://www.coupang.com/np/search?q=${q}&channel=user&searchTabCode=ALL&sorter=scoreDesc&rocketAll=true`;
  if (brand) base += `&brand=${brand}`;
  if (!COUPANG_ID) return base;
  return `${base}&token=${COUPANG_ID}`;
}

function coupangUrl(productName: string): string {
  const brand = detectBrand(productName);
  if (brand === "apple") return coupangSearchUrl(productName, "Apple");
  if (brand === "samsung") return coupangSearchUrl(productName, "Samsung");
  return coupangSearchUrl(productName);
}

export type BuyLinkResult = {
  url: string;
  store: "coupang";
  label: string;
  isOfficialStore: boolean;
};

/** Always Coupang (KR focus). Locale arg kept for call-site compatibility. */
export function primaryBuyLink(
  productName: string,
  _category: Category,
  _locale: Locale = "ko"
): BuyLinkResult {
  return {
    url: coupangUrl(productName),
    store: "coupang",
    label: "쿠팡",
    isOfficialStore: false
  };
}
