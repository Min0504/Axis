import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/server/api-handler";
import { v, type Infer } from "@/lib/server/validate";
import { upsertWatch, deleteWatch, listWatchesByEmail } from "@/lib/watch/db";

/**
 * /api/watches — price-watch CRUD for the authenticated user.
 *
 * Ownership rule: the watch owner is ALWAYS the session email. Any email in
 * the request body is ignored — clients never get to claim an identity.
 * (auth.requireEmail enforces this in the pipeline.)
 */

const RATE = { limit: 30, windowMs: 60_000 };
const AUTH = { mode: "required", requireEmail: true } as const;
const INVALID_FIELDS = "missing or invalid fields";

const regionSchema = v.enum(["US", "KR", "JP"]);

const createWatchSchema = v.object({
  productId: v.string({ min: 1, max: 200 }),
  name: v.string({ min: 1, max: 300 }),
  region: regionSchema,
  targetPrice: v.optional(v.number({ min: 0 })),
  addedAt: v.optional(v.string({ min: 1, max: 64 }))
});

const deleteWatchSchema = v.object({
  productId: v.string({ min: 1, max: 200 }),
  region: regionSchema
});

/** GET /api/watches — the caller's watch list. */
export const GET = createApiHandler({
  route: "GET /api/watches",
  rateLimit: { ...RATE, keyPrefix: "watches:get" },
  auth: AUTH,
  async handler(ctx) {
    // requireEmail guarantees sessionEmail; `!` narrows what the pipeline proved.
    const watches = await listWatchesByEmail(ctx.sessionEmail!);
    return NextResponse.json({ watches });
  }
});

/** POST /api/watches — create or update a watch (idempotent upsert). */
export const POST = createApiHandler<Infer<typeof createWatchSchema>>({
  route: "POST /api/watches",
  rateLimit: { ...RATE, keyPrefix: "watches:post" },
  auth: AUTH,
  body: { schema: createWatchSchema, invalidMessage: INVALID_FIELDS },
  async handler(ctx) {
    const { productId, name, region, targetPrice, addedAt } = ctx.body;

    await upsertWatch(ctx.sessionEmail!, {
      productId,
      name,
      region,
      targetPrice,
      addedAt: addedAt ?? new Date().toISOString()
    });

    return NextResponse.json({ ok: true });
  }
});

/** DELETE /api/watches — remove a watch. */
export const DELETE = createApiHandler<Infer<typeof deleteWatchSchema>>({
  route: "DELETE /api/watches",
  rateLimit: { ...RATE, keyPrefix: "watches:delete" },
  auth: AUTH,
  body: { schema: deleteWatchSchema, invalidMessage: INVALID_FIELDS },
  async handler(ctx) {
    await deleteWatch(ctx.sessionEmail!, ctx.body.productId, ctx.body.region);
    return NextResponse.json({ ok: true });
  }
});
