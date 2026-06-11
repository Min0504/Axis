import type { Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

/**
 * Price layer — the v2 spine. Live prices + history + alerts are the things a
 * chatbot structurally cannot do. Everything here is region-aware so global
 * (Amazon) and Korea (Coupang) run through one contract.
 *
 * Data sources plug in behind `PriceProvider`. A deterministic seed provider
 * powers dev/tests; real providers (Keepa/Amazon/Coupang) swap in later with
 * zero changes to the UI.
 */

export type Region = "US" | "KR" | "JP";
export type Retailer = "amazon_us" | "amazon_jp" | "coupang";
export type Currency = "USD" | "KRW" | "JPY";
export type PriceSource = "seed" | "amazon" | "coupang" | "keepa" | "naver";

/** Minimal product shape the price layer needs (VerifiedProduct satisfies it). */
export type PriceableProduct = {
  id: string;
  name: string;
  category: Category;
};

export type PriceQuote = {
  productId: string;
  region: Region;
  retailer: Retailer;
  currency: Currency;
  /** Current price in the currency's minor-free major unit (e.g. 1599 USD, 1590000 KRW). */
  price: number;
  /** Affiliate buy URL. */
  url: string;
  inStock: boolean;
  /** ISO timestamp the quote was sourced. */
  fetchedAt: string;
  source: PriceSource;
};

export type PricePoint = { date: string; price: number };

export type PriceHistory = {
  productId: string;
  region: Region;
  currency: Currency;
  /** Chronological points (oldest → newest). */
  points: PricePoint[];
  current: number;
  lowest: number;
  highest: number;
  /** Mean over the period, rounded. */
  average: number;
  /**
   * How good the current price is: fraction below the period average, 0..1.
   * 0 = at/above average, higher = better deal. Drives "지금 살까/기다릴까".
   */
  dealScore: number;
  source: PriceSource;
};

export interface PriceProvider {
  readonly source: PriceSource;
  getQuote(product: PriceableProduct, region: Region): Promise<PriceQuote | null>;
  getHistory(product: PriceableProduct, region: Region): Promise<PriceHistory | null>;
}

// ── Region / currency / retailer routing ──────────────────────────────────

export const REGION_CURRENCY: Record<Region, Currency> = {
  US: "USD",
  KR: "KRW",
  JP: "JPY"
};

export const REGION_RETAILER: Record<Region, Retailer> = {
  US: "amazon_us",
  KR: "coupang",
  JP: "amazon_jp"
};

const LOCALE_REGION: Record<Locale, Region> = {
  en: "US",
  ko: "KR",
  ja: "JP"
};

export function localeToRegion(locale: Locale): Region {
  return LOCALE_REGION[locale] ?? "US";
}

export function regionCurrency(region: Region): Currency {
  return REGION_CURRENCY[region];
}

const CURRENCY_LOCALE: Record<Currency, string> = {
  USD: "en-US",
  KRW: "ko-KR",
  JPY: "ja-JP"
};

/** Format a major-unit amount for display, e.g. 1590000 KRW → "₩1,590,000". Pure / client-safe. */
export function formatPrice(amount: number, currency: Currency): string {
  return new Intl.NumberFormat(CURRENCY_LOCALE[currency], {
    style: "currency",
    currency,
    maximumFractionDigits: currency === "USD" ? 2 : 0
  }).format(amount);
}
