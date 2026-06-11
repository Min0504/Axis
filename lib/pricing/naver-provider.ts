import { primaryBuyLink } from "@/lib/affiliate";
import { createServiceClientSafe } from "@/lib/supabase-server";
import {
  REGION_CURRENCY,
  REGION_RETAILER,
  type PriceHistory,
  type PriceProvider,
  type PriceQuote,
  type PricePoint,
  type PriceableProduct,
  type Region,
} from "./types";

/**
 * Naver Shopping Open API price provider (interim, until Coupang Partners API approved).
 *
 * Price data: Naver Shopping aggregated `lprice` (nationwide lowest price, all stores).
 * Buy link: Coupang affiliate link via primaryBuyLink() — affiliate tracking still works.
 * History: self-stored `price_history` table (same as coupang-provider).
 *
 * Required env vars:
 *   NAVER_CLIENT_ID     — Naver Open API client ID
 *   NAVER_CLIENT_SECRET — Naver Open API client secret
 *
 * Free tier: 25,000 calls/day (well within daily cron needs for 26 SKUs).
 */

const NAVER_SHOP_URL = "https://openapi.naver.com/v1/search/shop.json";
const HISTORY_DAYS = 90;

// ── API types ─────────────────────────────────────────────────────────────

interface NaverShopItem {
  title: string;
  link: string;
  lprice: string;
  hprice: string;
  mallName: string;
  productId: string;
  brand: string;
  category1: string;
  category2: string;
}

interface NaverShopResponse {
  total: number;
  display: number;
  items: NaverShopItem[];
}

// ── Core search ───────────────────────────────────────────────────────────

function stripHtml(s: string): string {
  return s.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"');
}

async function searchNaver(keyword: string): Promise<NaverShopItem | null> {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const params = new URLSearchParams({ query: keyword, display: "5", sort: "sim" });
  try {
    const res = await fetch(`${NAVER_SHOP_URL}?${params}`, {
      method: "GET",
      headers: {
        "X-Naver-Client-Id": clientId,
        "X-Naver-Client-Secret": clientSecret,
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;

    const json: NaverShopResponse = await res.json();
    if (!json.items?.length) return null;

    // Take the first result; Naver sorts by relevance by default
    return json.items[0];
  } catch {
    return null;
  }
}

// ── DB history ────────────────────────────────────────────────────────────

async function loadStoredHistory(
  productId: string,
  region: Region
): Promise<PricePoint[]> {
  const db = createServiceClientSafe();
  if (!db) return [];

  const since = new Date(Date.now() - HISTORY_DAYS * 86400 * 1000)
    .toISOString()
    .slice(0, 10);

  const { data } = await db
    .from("price_history")
    .select("recorded_date, price")
    .eq("product_id", productId)
    .eq("region", region)
    .gte("recorded_date", since)
    .order("recorded_date", { ascending: true });

  return (data ?? []).map((row) => ({
    date: row.recorded_date as string,
    price: row.price as number,
  }));
}

function buildHistory(
  productId: string,
  region: Region,
  points: PricePoint[],
  currentPrice: number
): PriceHistory {
  const currency = REGION_CURRENCY[region];
  const allPoints =
    points.length > 0
      ? points
      : [{ date: new Date().toISOString().slice(0, 10), price: currentPrice }];

  const prices = allPoints.map((p) => p.price);
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const dealScore =
    average > 0 ? Math.max(0, Math.min(1, (average - currentPrice) / average)) : 0;

  return {
    productId,
    region,
    currency,
    points: allPoints,
    current: currentPrice,
    lowest,
    highest,
    average,
    dealScore,
    source: "naver",
  };
}

// ── Provider ──────────────────────────────────────────────────────────────

export const naverProvider: PriceProvider = {
  source: "naver",

  async getQuote(
    product: PriceableProduct,
    region: Region
  ): Promise<PriceQuote | null> {
    if (region !== "KR") return null;

    const item = await searchNaver(product.name);
    if (!item) return null;

    const price = parseInt(item.lprice, 10);
    if (!price || isNaN(price)) return null;

    // Price from Naver Shopping; buy link = Coupang affiliate (affiliate revenue)
    const buy = primaryBuyLink(product.name, product.category, "ko");

    return {
      productId: product.id,
      region,
      retailer: REGION_RETAILER[region],
      currency: REGION_CURRENCY[region],
      price,
      url: buy.url,
      inStock: true,
      fetchedAt: new Date().toISOString(),
      source: "naver",
    };
  },

  async getHistory(
    product: PriceableProduct,
    region: Region
  ): Promise<PriceHistory | null> {
    if (region !== "KR") return null;

    const [points, quote] = await Promise.all([
      loadStoredHistory(product.id, region),
      this.getQuote(product, region),
    ]);

    if (!quote && points.length === 0) return null;

    const currentPrice =
      quote?.price ?? points[points.length - 1]?.price ?? 0;
    return buildHistory(product.id, region, points, currentPrice);
  },
};
