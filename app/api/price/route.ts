import { NextResponse } from "next/server";
import { getProductById, resolveVerifiedAny } from "@/lib/specs/dataset";
import {
  getPriceProvider,
  localeToRegion,
  type Currency,
  type PriceSource,
  type Region
} from "@/lib/pricing";
import { isLocale } from "@/lib/i18n";

export type PriceApiResult = {
  productId: string;
  name: string;
  region: Region;
  currency: Currency;
  current: number;
  lowest: number;
  average: number;
  dealScore: number;
  url: string;
  source: PriceSource;
  /** History prices (oldest → newest) for a sparkline. */
  spark: number[];
};

/**
 * GET /api/price?name=맥북%20에어%20M3&locale=ko   (or ?id=macbook-air-13-m3)
 *
 * Returns a price snapshot for a verified product in the caller's region, or
 * { result: null } when the product isn't in the catalog or no price source is
 * configured. Never invents prices — same honesty rule as the spec gate.
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id")?.trim();
  const name = searchParams.get("name")?.trim();
  const localeParam = searchParams.get("locale");

  const region = isLocale(localeParam) ? localeToRegion(localeParam) : "US";

  const product = id ? getProductById(id) : name ? resolveVerifiedAny(name) : null;
  if (!product) {
    return NextResponse.json({ result: null });
  }

  const provider = getPriceProvider(region);
  if (!provider) {
    return NextResponse.json({ result: null });
  }

  const priceable = { id: product.id, name: product.canonicalName, category: product.category };
  const [quote, history] = await Promise.all([
    provider.getQuote(priceable, region).catch(() => null),
    provider.getHistory(priceable, region).catch(() => null)
  ]);

  if (!quote || !history) {
    return NextResponse.json({ result: null });
  }

  const result: PriceApiResult = {
    productId: product.id,
    name: product.canonicalName,
    region,
    currency: history.currency,
    current: history.current,
    lowest: history.lowest,
    average: history.average,
    dealScore: history.dealScore,
    url: quote.url,
    source: history.source,
    spark: history.points.map((p) => p.price)
  };

  return NextResponse.json({ result });
}
