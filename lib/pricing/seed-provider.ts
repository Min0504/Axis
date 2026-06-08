import { primaryBuyLink } from "@/lib/affiliate";
import {
  REGION_CURRENCY,
  REGION_RETAILER,
  type Currency,
  type PriceHistory,
  type PriceProvider,
  type PriceQuote,
  type PricePoint,
  type PriceableProduct,
  type Region
} from "./types";

/**
 * Deterministic seed price provider.
 *
 * Generates stable, plausible prices + 90-day history from a product id, with
 * NO external API. Its job is to prove the full price → history → deal-score →
 * alert pipeline end-to-end in dev and tests. Real providers (Keepa / Amazon
 * PA-API / Coupang) implement the same `PriceProvider` contract and swap in.
 *
 * ⚠️ Seed prices are fixtures, not real prices — the UI must only show prices
 * from a real provider (or label seed prices clearly in dev).
 */

const HISTORY_DAYS = 90;

/** Sensible base-price band per currency (major unit). */
const PRICE_BAND: Record<Currency, [number, number]> = {
  USD: [700, 2200],
  KRW: [900_000, 2_600_000],
  JPY: [110_000, 330_000]
};

/** Round to a tidy step so seed prices look like real ones. */
const ROUND_STEP: Record<Currency, number> = {
  USD: 10,
  KRW: 10_000,
  JPY: 1_000
};

function hashStr(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

/** Deterministic [0,1) generator (mulberry32). */
function rng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function roundTo(value: number, step: number): number {
  return Math.max(step, Math.round(value / step) * step);
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

function buildHistory(product: PriceableProduct, region: Region): PriceHistory {
  const currency = REGION_CURRENCY[region];
  const [min, max] = PRICE_BAND[currency];
  const step = ROUND_STEP[currency];
  const rand = rng(hashStr(`${product.id}:${region}`));

  // Base (MSRP-ish) anchor for this product+region.
  const base = roundTo(min + rand() * (max - min), step);

  // Random walk around the base, with an occasional dip near the end so the
  // deal-score logic has something to react to.
  const points: PricePoint[] = [];
  let level = base;
  for (let i = HISTORY_DAYS - 1; i >= 0; i--) {
    const drift = (rand() - 0.5) * 0.04; // ±4% daily wobble
    level = level * (1 + drift);
    // Keep within a sane band around base.
    level = Math.min(base * 1.06, Math.max(base * 0.8, level));
    points.push({ date: isoDaysAgo(i), price: roundTo(level, step) });
  }

  const prices = points.map((p) => p.price);
  const current = prices[prices.length - 1];
  const lowest = Math.min(...prices);
  const highest = Math.max(...prices);
  const average = roundTo(prices.reduce((a, b) => a + b, 0) / prices.length, step);
  const dealScore = average > 0 ? Math.max(0, Math.min(1, (average - current) / average)) : 0;

  return {
    productId: product.id,
    region,
    currency,
    points,
    current,
    lowest,
    highest,
    average,
    dealScore,
    source: "seed"
  };
}

export const seedPriceProvider: PriceProvider = {
  source: "seed",

  async getQuote(product: PriceableProduct, region: Region): Promise<PriceQuote | null> {
    const history = buildHistory(product, region);
    const buy = primaryBuyLink(product.name, product.category, regionLocale(region));
    return {
      productId: product.id,
      region,
      retailer: REGION_RETAILER[region],
      currency: history.currency,
      price: history.current,
      url: buy.url,
      inStock: true,
      fetchedAt: new Date().toISOString(),
      source: "seed"
    };
  },

  async getHistory(product: PriceableProduct, region: Region): Promise<PriceHistory | null> {
    return buildHistory(product, region);
  }
};

/** Map a region to the locale the affiliate-link builder expects. */
function regionLocale(region: Region): "ko" | "en" | "ja" {
  return region === "KR" ? "ko" : region === "JP" ? "ja" : "en";
}
