import crypto from "crypto";
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
 * Coupang Partners Open API price provider.
 *
 * Reads current prices from the Coupang Partners product search API and
 * returns history from our self-stored `price_history` table (populated by
 * the /api/cron/price-snapshot cron).
 *
 * Required env vars:
 *   COUPANG_ACCESS_KEY   — Partners API access key
 *   COUPANG_SECRET_KEY   — Partners API secret key (for HMAC signing)
 *
 * Optional:
 *   NEXT_PUBLIC_COUPANG_AFFILIATE_ID — sub-ID embedded in returned product URLs
 */

const BASE_URL = "https://api-gateway.coupang.com";
const SEARCH_PATH =
  "/v2/providers/affiliate_open_api/apis/openapi/v1/products/search";
const HISTORY_DAYS = 90;

// ── HMAC authentication ───────────────────────────────────────────────────

function coupangDatetime(): string {
  const now = new Date();
  const yy = now.getUTCFullYear().toString().slice(-2);
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const hh = String(now.getUTCHours()).padStart(2, "0");
  const min = String(now.getUTCMinutes()).padStart(2, "0");
  const ss = String(now.getUTCSeconds()).padStart(2, "0");
  return `${yy}${mm}${dd}T${hh}${min}${ss}Z`;
}

function buildAuthHeader(
  accessKey: string,
  secretKey: string,
  urlWithQuery: string
): string {
  const datetime = coupangDatetime();
  const message = `${datetime}\nGET\n${urlWithQuery}`;
  const signature = crypto
    .createHmac("sha256", secretKey)
    .update(message)
    .digest("hex");
  return `CEA algorithm=HmacSHA256, access-key=${accessKey}, signed-date=${datetime}, url=${urlWithQuery}, signature=${signature}`;
}

// ── API types ─────────────────────────────────────────────────────────────

interface CoupangProduct {
  productId: number;
  productName: string;
  productPrice: number;
  productUrl: string;
  isRocket?: boolean;
}

interface CoupangSearchResponse {
  rCode: string;
  rMessage: string;
  data?: { productData?: CoupangProduct[] };
}

// ── Core search ───────────────────────────────────────────────────────────

async function searchCoupang(keyword: string): Promise<CoupangProduct | null> {
  const accessKey = process.env.COUPANG_ACCESS_KEY;
  const secretKey = process.env.COUPANG_SECRET_KEY;
  if (!accessKey || !secretKey) return null;

  const subId = process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID;
  const params = new URLSearchParams({ keyword, limit: "5" });
  if (subId) params.set("subId", subId);

  const urlWithQuery = `${SEARCH_PATH}?${params.toString()}`;
  const auth = buildAuthHeader(accessKey, secretKey, urlWithQuery);

  try {
    const res = await fetch(`${BASE_URL}${urlWithQuery}`, {
      method: "GET",
      headers: {
        Authorization: auth,
        "Content-Type": "application/json;charset=UTF-8",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) return null;

    const json: CoupangSearchResponse = await res.json();
    if (json.rCode !== "0" || !json.data?.productData?.length) return null;

    const products = json.data.productData;
    // Prefer Rocket Delivery items (faster, more authentic) → else first result
    return products.find((p) => p.isRocket) ?? products[0];
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
    source: "coupang",
  };
}

// ── Provider ──────────────────────────────────────────────────────────────

export const coupangProvider: PriceProvider = {
  source: "coupang",

  async getQuote(
    product: PriceableProduct,
    region: Region
  ): Promise<PriceQuote | null> {
    if (region !== "KR") return null;

    const result = await searchCoupang(product.name);
    if (!result) return null;

    return {
      productId: product.id,
      region,
      retailer: REGION_RETAILER[region],
      currency: REGION_CURRENCY[region],
      price: result.productPrice,
      url: result.productUrl,
      inStock: true,
      fetchedAt: new Date().toISOString(),
      source: "coupang",
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
