import { NextResponse } from "next/server";
import { createCronHandler, type CronContext } from "@/lib/server/cron";
import { listAllWatches, updateLastNotified } from "@/lib/watch/db";
import { listAllPushWatches, updatePushLastNotified, deletePushWatchById } from "@/lib/push/db";
import { evaluateAlert } from "@/lib/watch/alerts";
import { getPriceProvider } from "@/lib/pricing";
import { getProductById, resolveVerifiedAny } from "@/lib/specs/dataset";
import { sendPriceAlert } from "@/lib/email/send";
import { sendPricePush } from "@/lib/push/send";
import type { Watch } from "@/lib/watch/types";
import { getSiteUrl } from "@/lib/site-url";

/**
 * GET /api/cron/price-check
 * Secured with Authorization: Bearer <CRON_SECRET> — verified constant-time
 * by createCronHandler, which also logs the run and records a cron_runs
 * audit row. Vercel Cron calls this with GET (see vercel.json).
 */
async function runPriceCheck({ log }: CronContext) {
  const [emailRows, pushRows] = await Promise.all([listAllWatches(), listAllPushWatches()]);
  let fired = 0;

  async function checkAndAlert(
    row: { id: string; product_id: string; product_name: string; region: "US" | "KR" | "JP"; target_price: number | null; added_at: string; last_notified_price: number | null },
    send: (buyUrl: string, price: number, currency: import("@/lib/pricing/types").Currency, reason: import("@/lib/watch/types").AlertReason) => Promise<boolean>
  ) {
    const product = getProductById(row.product_id) ?? resolveVerifiedAny(row.product_name);
    if (!product) return;

    const provider = getPriceProvider(row.region);
    if (!provider) return;

    const priceable = { id: product.id, name: product.canonicalName, category: product.category };
    const [history, quote] = await Promise.all([
      provider.getHistory(priceable, row.region).catch(() => null),
      provider.getQuote(priceable, row.region).catch(() => null),
    ]);
    if (!history) return;

    const watch: Watch = {
      productId: row.product_id,
      name: row.product_name,
      region: row.region,
      targetPrice: row.target_price ?? undefined,
      addedAt: row.added_at,
    };

    const decision = evaluateAlert(watch, history, row.last_notified_price ?? undefined);
    if (!decision.fire || !decision.reason) return;

    const ok = await send(
      quote?.url ?? getSiteUrl("public"),
      decision.price,
      history.currency,
      decision.reason
    );
    if (ok) {
      fired++;
      log.info("alert fired", {
        productId: row.product_id,
        region: row.region,
        reason: decision.reason,
        price: decision.price
      });
    }
  }

  // ── Email watches ──────────────────────────────────────────────────────────
  await Promise.all(
    emailRows.map((row) =>
      checkAndAlert(row, async (buyUrl, price, currency, reason) => {
        const err = await sendPriceAlert({
          to: row.email,
          productName: row.product_name,
          price,
          currency,
          reason,
          targetPrice: row.target_price ?? undefined,
          buyUrl,
        }).then(() => null).catch((e: unknown) => String(e));
        if (!err) {
          await updateLastNotified(row.id, price);
          return true;
        }
        return false;
      })
    )
  );

  // ── Push watches ───────────────────────────────────────────────────────────
  await Promise.all(
    pushRows.map((row) =>
      checkAndAlert(row, async (buyUrl, price, currency, reason) => {
        const result = await sendPricePush({
          subscription: row.subscription,
          productName: row.product_name,
          price,
          currency,
          reason,
          buyUrl,
        });
        if (result === "gone") {
          await deletePushWatchById(row.id);
          return false;
        }
        if (result === "sent") {
          await updatePushLastNotified(row.id, price);
          return true;
        }
        return false;
      })
    )
  );

  return NextResponse.json({
    emailChecked: emailRows.length,
    pushChecked: pushRows.length,
    fired,
  });
}

const handler = createCronHandler({ job: "price-check", run: runPriceCheck });

export { handler as GET, handler as POST };
