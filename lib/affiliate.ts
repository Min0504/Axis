/**
 * Affiliate link helpers.
 *
 * Real affiliate IDs must be configured via environment variables.
 * Without them, links fall back to a plain search URL (still useful UX).
 *
 * NEXT_PUBLIC_COUPANG_AFFILIATE_ID   — 쿠팡 파트너스 서브ID
 * NEXT_PUBLIC_NAVER_AFFILIATE_ID     — 네이버 CPS 파트너 ID
 */

const COUPANG_ID = process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID;
const NAVER_ID = process.env.NEXT_PUBLIC_NAVER_AFFILIATE_ID;

type Category = "smartphone" | "guitar" | "multieffects" | "general";

/** Coupang product-search affiliate URL. */
export function coupangSearchUrl(productName: string): string {
  const q = encodeURIComponent(productName);
  const base = `https://www.coupang.com/np/search?q=${q}`;
  if (!COUPANG_ID) return base;
  return `https://link.coupang.com/a/${COUPANG_ID}?url=${encodeURIComponent(base)}`;
}

/** Naver Shopping search URL. */
export function naverShoppingUrl(productName: string): string {
  const q = encodeURIComponent(productName);
  const base = `https://search.shopping.naver.com/search/all?query=${q}`;
  if (!NAVER_ID) return base;
  return `${base}&frm=NVSHATC&nvMid=${NAVER_ID}`;
}

/**
 * Returns the best affiliate link for a product given its category.
 * Electronics → Coupang (wider catalog). Others → Naver Shopping.
 */
export function primaryBuyLink(productName: string, category: Category): string {
  if (category === "smartphone" || category === "general") {
    return coupangSearchUrl(productName);
  }
  // Guitar/effects: Naver Shopping has more specialty inventory.
  return naverShoppingUrl(productName);
}
