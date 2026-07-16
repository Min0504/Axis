import crypto from "crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import { seedPriceProvider } from "@/lib/pricing/seed-provider";
import { coupangProvider } from "@/lib/pricing/coupang-provider";
import {
  localeToRegion,
  regionCurrency,
  formatPrice,
  REGION_RETAILER,
  type PriceableProduct
} from "@/lib/pricing";
import { getProductById, allVerifiedProducts } from "@/lib/specs/dataset";

const originalEnv = { ...process.env };

const macbook: PriceableProduct = {
  id: "macbook-air-13-m3",
  name: "맥북 에어 13 M3",
  category: "laptop"
};

afterEach(() => {
  process.env = { ...originalEnv };
  vi.useRealTimers();
  vi.restoreAllMocks();
});

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

describe("coupang price provider", () => {
  it("signs search requests with the Coupang Partners HMAC format", async () => {
    process.env.COUPANG_ACCESS_KEY = "access-key";
    process.env.COUPANG_SECRET_KEY = "secret-key";
    delete process.env.NEXT_PUBLIC_COUPANG_AFFILIATE_ID;
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-19T01:02:03Z"));

    const fetchMock = vi.fn<typeof fetch>().mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          rCode: "0",
          rMessage: "OK",
          data: {
            productData: [
              {
                productId: 1,
                productName: "맥북 에어 13 M3",
                productPrice: 1590000,
                productUrl: "https://www.coupang.com/vp/products/1",
                isRocket: true
              }
            ]
          }
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const quote = await coupangProvider.getQuote(macbook, "KR");

    const firstCall = fetchMock.mock.calls.at(0);
    if (!firstCall) throw new Error("expected Coupang fetch call");
    const requestUrl = new URL(String(firstCall[0]));
    const signedUri = `${requestUrl.pathname}${requestUrl.search.slice(1)}`;
    const expectedSignature = crypto
      .createHmac("sha256", "secret-key")
      .update(`260619T010203ZGET${signedUri}`)
      .digest("hex");
    const auth = new Headers(firstCall[1]?.headers).get("Authorization");
    expect(quote?.price).toBe(1590000);
    expect(auth).toBe(
      `CEA algorithm=HmacSHA256, access-key=access-key, signed-date=260619T010203Z, signature=${expectedSignature}`
    );
  });
});
