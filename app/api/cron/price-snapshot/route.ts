import { NextResponse } from "next/server";
import { createServiceClientSafe } from "@/lib/supabase-server";
import { getPriceProvider } from "@/lib/pricing";
import { laptops } from "@/lib/specs/dataset/laptops";

/**
 * GET /api/cron/price-snapshot
 *
 * Records today's KR price for every laptop SKU into `price_history`.
 * Uses whatever provider is active via AXIS_PRICE_SOURCE env var.
 * Idempotent — upserts by (product_id, region, recorded_date).
 *
 * Secured with Authorization: Bearer <CRON_SECRET>.
 * Vercel Cron schedule: 0 1 * * * (01:00 UTC = 10:00 KST).
 */
async function runPriceSnapshot(req: Request) {
  const cronSecret = process.env.CRON_SECRET;
  const auth = req.headers.get("Authorization");
  if (!cronSecret || auth !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const provider = getPriceProvider("KR");
  if (!provider) {
    return NextResponse.json(
      { error: "no_provider", hint: "Set AXIS_PRICE_SOURCE=naver or coupang" },
      { status: 503 }
    );
  }

  const db = createServiceClientSafe();
  if (!db) {
    return NextResponse.json({ error: "db_unavailable" }, { status: 503 });
  }

  const today = new Date().toISOString().slice(0, 10);
  let stored = 0;
  let failed = 0;

  for (const laptop of laptops) {
    const priceable = {
      id: laptop.id,
      name: laptop.canonicalName,
      category: laptop.category,
    };

    try {
      const quote = await provider.getQuote(priceable, "KR");
      if (!quote) {
        failed++;
        continue;
      }

      const { error } = await db.from("price_history").upsert(
        {
          product_id: laptop.id,
          region: "KR",
          currency: "KRW",
          price: quote.price,
          source: provider.source,
          affiliate_url: quote.url,
          recorded_date: today,
        },
        { onConflict: "product_id,region,recorded_date" }
      );

      if (error) {
        failed++;
      } else {
        stored++;
      }
    } catch {
      failed++;
    }

    // Throttle to respect API rate limits (Naver: 10 req/s, Coupang: 10 req/s)
    await new Promise((r) => setTimeout(r, 150));
  }

  return NextResponse.json({
    date: today,
    provider: provider.source,
    stored,
    failed,
    total: laptops.length,
  });
}

export async function GET(req: Request) {
  return runPriceSnapshot(req);
}

export async function POST(req: Request) {
  return runPriceSnapshot(req);
}
