import { describe, expect, it } from "vitest";
import { seedPriceProvider } from "@/lib/pricing/seed-provider";
import {
  localeToRegion,
  regionCurrency,
  formatPrice,
  REGION_RETAILER,
  type PriceableProduct
} from "@/lib/pricing";
import { getProductById, allVerifiedProducts } from "@/lib/specs/dataset";

const macbook: PriceableProduct = {
  id: "macbook-air-13-m3",
  name: "맥북 에어 13 M3",
  category: "laptop"
};

describe("region routing", () => {
  it("maps locale → region → currency → retailer", () => {
    expect(localeToRegion("ko")).toBe("KR");
    expect(localeToRegion("en")).toBe("US");
    expect(localeToRegion("ja")).toBe("JP");
    expect(regionCurrency("KR")).toBe("KRW");
    expect(REGION_RETAILER.US).toBe("amazon_us");
    expect(REGION_RETAILER.KR).toBe("coupang");
  });

  it("formats prices per currency", () => {
    expect(formatPrice(1590000, "KRW")).toContain("1,590,000");
    expect(formatPrice(1299, "USD")).toContain("1,299");
  });
});

describe("seed price provider", () => {
  it("is deterministic for the same product + region", async () => {
    const a = await seedPriceProvider.getHistory(macbook, "KR");
    const b = await seedPriceProvider.getHistory(macbook, "KR");
    expect(a?.current).toBe(b?.current);
    expect(a?.points).toEqual(b?.points);
  });

  it("differs by region", async () => {
    const kr = await seedPriceProvider.getQuote(macbook, "KR");
    const us = await seedPriceProvider.getQuote(macbook, "US");
    expect(kr?.currency).toBe("KRW");
    expect(us?.currency).toBe("USD");
    expect(kr?.retailer).toBe("coupang");
    expect(us?.retailer).toBe("amazon_us");
  });

  it("produces a 90-point history with consistent stats", async () => {
    const h = await seedPriceProvider.getHistory(macbook, "KR");
    expect(h).not.toBeNull();
    expect(h!.points.length).toBe(90);

    const prices = h!.points.map((p) => p.price);
    expect(h!.current).toBe(prices[prices.length - 1]);
    expect(h!.lowest).toBe(Math.min(...prices));
    expect(h!.highest).toBe(Math.max(...prices));
    expect(h!.lowest).toBeLessThanOrEqual(h!.highest);
  });

  it("deal score is 0..1 and reflects current vs average", async () => {
    const h = await seedPriceProvider.getHistory(macbook, "KR");
    expect(h!.dealScore).toBeGreaterThanOrEqual(0);
    expect(h!.dealScore).toBeLessThanOrEqual(1);
    if (h!.current < h!.average) expect(h!.dealScore).toBeGreaterThan(0);
  });

  it("quote price equals latest history point", async () => {
    const q = await seedPriceProvider.getQuote(macbook, "KR");
    const h = await seedPriceProvider.getHistory(macbook, "KR");
    expect(q?.price).toBe(h?.current);
    expect(q?.inStock).toBe(true);
    expect(q?.url).toMatch(/^https?:\/\//);
  });

  it("works for every verified product (no crashes, valid output)", async () => {
    for (const p of allVerifiedProducts()) {
      const h = await seedPriceProvider.getHistory(
        { id: p.id, name: p.canonicalName, category: p.category },
        "KR"
      );
      expect(h!.current).toBeGreaterThan(0);
    }
  });
});

describe("product ids", () => {
  it("resolves a product by id", () => {
    expect(getProductById("lg-gram-16")?.canonicalName).toBe("LG 그램 16");
    expect(getProductById("nonexistent")).toBeNull();
  });
});
