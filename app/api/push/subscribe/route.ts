import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/server/api-handler";
import { v, type Infer } from "@/lib/server/validate";
import { upsertPushWatch, deletePushWatch } from "@/lib/push/db";
import type webpush from "web-push";

/**
 * /api/push/subscribe — web-push price alerts keyed by push subscription.
 *
 * No login required: possession of a valid push subscription (browser-issued,
 * unguessable endpoint URL) is the credential. Rate limiting is therefore the
 * primary abuse guard on this route.
 */

const RATE = { limit: 30, windowMs: 60_000, keyPrefix: "push-subscribe" };
const INVALID_FIELDS = "missing or invalid fields";

const regionSchema = v.enum(["US", "KR", "JP"]);

// Pass the subscription object through untouched (web-push needs its extra
// keys), but require the shape we depend on.
const subscriptionSchema = v.custom<webpush.PushSubscription>(
  (s): s is webpush.PushSubscription =>
    typeof s === "object" &&
    s !== null &&
    typeof (s as Record<string, unknown>).endpoint === "string" &&
    (s as Record<string, unknown>).endpoint !== "",
  "invalid subscription"
);

const subscribeSchema = v.object({
  subscription: subscriptionSchema,
  productId: v.string({ min: 1, max: 200 }),
  name: v.string({ min: 1, max: 300 }),
  region: regionSchema,
  targetPrice: v.optional(v.number({ min: 0 })),
  addedAt: v.optional(v.string({ min: 1, max: 64 }))
});

const unsubscribeSchema = v.object({
  endpoint: v.string({ min: 1, max: 2000 }),
  productId: v.string({ min: 1, max: 200 }),
  region: regionSchema
});

/** POST /api/push/subscribe — register a push watch. */
export const POST = createApiHandler<Infer<typeof subscribeSchema>>({
  route: "POST /api/push/subscribe",
  rateLimit: RATE,
  body: { schema: subscribeSchema, invalidMessage: INVALID_FIELDS },
  async handler(ctx) {
    const { subscription, productId, name, region, targetPrice, addedAt } = ctx.body;

    await upsertPushWatch(subscription, {
      productId,
      name,
      region,
      targetPrice,
      addedAt: addedAt ?? new Date().toISOString()
    });

    return NextResponse.json({ ok: true });
  }
});

/** DELETE /api/push/subscribe — remove a push watch. */
export const DELETE = createApiHandler<Infer<typeof unsubscribeSchema>>({
  route: "DELETE /api/push/subscribe",
  rateLimit: RATE,
  body: { schema: unsubscribeSchema, invalidMessage: INVALID_FIELDS },
  async handler(ctx) {
    await deletePushWatch(ctx.body.endpoint, ctx.body.productId, ctx.body.region);
    return NextResponse.json({ ok: true });
  }
});
