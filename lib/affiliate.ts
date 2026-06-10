import type { Locale } from "@/lib/i18n";
import type { Category } from "@/lib/types";

/**
 * Affiliate & purchase link configuration.
 *
 * Korea  : Coupang Partners (best catalog + conversion for KR)
 * Japan  : Amazon Japan
 * Global : Amazon US
 *
 * Env vars (set in .env.local / Vercel):
 *   NEXT_PUBLIC_COUPANG_AFFILIATE_ID   — Coupang Partners referral ID
 *   NEXT_PUBLIC_AMAZON_AFFILIATE_US    — Amazon US Associates tag
 *   NEXT_PUBLIC_AMAZON_AFFILIATE_JP    — Amazon JP Associates tag
 */

const COUPANG_ID = process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID;
const AMAZON_US_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_US;
const AMAZON_JP_ID = process.env.NEXT_PUBLIC_AMAZON_AFFILIATE_JP;

// ── Brand detection ───────────────────────────────────────────────────────

type KnownBrand = "apple" | "samsung" | "sony" | "lg" | "other";

function detectBrand(productName: string): KnownBrand {
  const lower = productName.toLowerCase();
  if (/iphone|ipad|macbook|airpods?|imac|apple\s*watch|에어팟|아이폰|아이패드|맥북/.test(lower)) return "apple";
  if (/galaxy|samsung|갤럭시|삼성/.test(lower)) return "samsung";
  if (/\bsony\b|wh-|wf-|xm\d/.test(lower)) return "sony";
  if (/\blg\b|gram|그램/.test(lower)) return "lg";
  return "other";
}

// ── Coupang URL builders ──────────────────────────────────────────────────

/**
 * Build a Coupang search URL.
 *
 * When affiliate ID is present, appends the tracking parameter.
 * Uses `rocketAll=true` to surface Rocket Delivery items first (higher
 * conversion, faster delivery), and sorts by relevance score.
 */
function coupangSearchUrl(query: string, extraParams: string = ""): string {
  const q = encodeURIComponent(query);
  const base = `https://www.coupang.com/np/search?q=${q}&channel=user&searchTabCode=ALL&sorter=scoreDesc&rocketAll=true${extraParams}`;
  if (!COUPANG_ID) return base;
  // Coupang Partners standard tracking: append the referral ID as a query param
  return `${base}&token=${COUPANG_ID}`;
}

/**
 * Brand-aware Coupang link.
 *
 * Apple / Samsung → official brand store search on Coupang (higher trust,
 * typically guaranteed authentic product, often with official warranty).
 * Other brands → rocket-delivery filtered search.
 */
function coupangUrl(productName: string): string {
  const brand = detectBrand(productName);

  if (brand === "apple") {
    // Apple 공식인증점 + 로켓배송 필터: "Apple 공식 {product}"
    const q = encodeURIComponent(`Apple 공식 ${productName}`);
    const base = `https://www.coupang.com/np/search?q=${q}&channel=user&searchTabCode=ALL&sorter=scoreDesc&rocketAll=true&brand=Apple`;
    return COUPANG_ID ? `${base}&token=${COUPANG_ID}` : base;
  }

  if (brand === "samsung") {
    // 삼성 공식 + 로켓배송
    const q = encodeURIComponent(`삼성 공식 ${productName}`);
    const base = `https://www.coupang.com/np/search?q=${q}&channel=user&searchTabCode=ALL&sorter=scoreDesc&rocketAll=true&brand=Samsung`;
    return COUPANG_ID ? `${base}&token=${COUPANG_ID}` : base;
  }

  if (brand === "sony") {
    const q = encodeURIComponent(`소니 공식 ${productName}`);
    const base = `https://www.coupang.com/np/search?q=${q}&channel=user&searchTabCode=ALL&sorter=scoreDesc&rocketAll=true`;
    return COUPANG_ID ? `${base}&token=${COUPANG_ID}` : base;
  }

  if (brand === "lg") {
    const q = encodeURIComponent(`LG 공식 ${productName}`);
    const base = `https://www.coupang.com/np/search?q=${q}&channel=user&searchTabCode=ALL&sorter=scoreDesc&rocketAll=true`;
    return COUPANG_ID ? `${base}&token=${COUPANG_ID}` : base;
  }

  // Generic: product name + rocket delivery
  return coupangSearchUrl(productName);
}

// ── Amazon URL builder ───────────────────────────────────────────────────

function amazonUrl(query: string, tld: string, affiliateId: string | undefined): string {
  const q = encodeURIComponent(query);
  const base = `https://www.amazon.${tld}/s?k=${q}&s=featured-rank`;
  if (!affiliateId) return base;
  return `${base}&tag=${affiliateId}`;
}

// ── Public API ────────────────────────────────────────────────────────────

export type BuyLinkResult = {
  url: string;
  store: "coupang" | "amazon_us" | "amazon_jp";
  /** Display label shown in the buy button */
  label: string;
  /** Whether this is an official brand store link on the marketplace */
  isOfficialStore: boolean;
};

/**
 * Returns the best affiliate purchase link for the given product and locale.
 *
 * For Korean users:
 *   - Apple / Samsung / Sony / LG → official brand store on Coupang + rocket delivery
 *   - Others → Coupang search + rocket delivery
 *
 * For Japanese users  → Amazon Japan
 * For English / other → Amazon US
 */
export function primaryBuyLink(
  productName: string,
  _category: Category,
  locale: Locale = "ko"
): BuyLinkResult {
  if (locale === "ko") {
    const brand = detectBrand(productName);
    const isOfficial = brand !== "other";
    return {
      url: coupangUrl(productName),
      store: "coupang",
      label: isOfficial ? "쿠팡 공식몰" : "쿠팡",
      isOfficialStore: isOfficial
    };
  }

  if (locale === "ja") {
    return {
      url: amazonUrl(productName, "co.jp", AMAZON_JP_ID),
      store: "amazon_jp",
      label: "Amazon",
      isOfficialStore: false
    };
  }

  // en + other locales → Amazon US
  return {
    url: amazonUrl(productName, "com", AMAZON_US_ID),
    store: "amazon_us",
    label: "Amazon",
    isOfficialStore: false
  };
}
