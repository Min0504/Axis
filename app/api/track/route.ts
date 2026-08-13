import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/server/api-handler";
import { createServiceClientSafe } from "@/lib/supabase-server";

export const runtime = "nodejs";

const EVENT_TYPES = ["affiliate", "compare_view"] as const;

function asNullableString(value: unknown, maxLength: number): string | null {
  if (typeof value !== "string" || !value) return null;
  return value.slice(0, maxLength);
}

/**
 * POST /api/track — fire-and-forget click/view analytics.
 *
 * Contract quirk (intentional, preserved): tracking must NEVER break the user
 * flow, so malformed JSON and DB failures still answer { ok: true }. The only
 * hard 4xx are rate limiting and an unknown event_type. Because of that, body
 * parsing stays inside the handler instead of using the pipeline's strict
 * body stage.
 */
export const POST = createApiHandler({
  route: "POST /api/track",
  rateLimit: { limit: 60, windowMs: 60_000, keyPrefix: "track", message: "rate_limited" },
  async handler(ctx) {
    try {
      const body = (await ctx.req.json()) as Record<string, unknown>;
      const eventType = body.event_type;

      if (typeof eventType !== "string" || !(EVENT_TYPES as readonly string[]).includes(eventType)) {
        return NextResponse.json({ error: "invalid_event" }, { status: 400 });
      }

      const db = createServiceClientSafe();
      if (!db) {
        return NextResponse.json({ ok: true }); // silently skip if no DB
      }

      // Coerce every free-form field defensively: analytics rows must never
      // become an injection/garbage vector into the DB.
      const { error } = await db.from("click_events").insert({
        event_type: eventType,
        product_id: asNullableString(body.product_id, 200),
        slug: asNullableString(body.slug, 300),
        region: asNullableString(body.region, 8),
        retailer: asNullableString(body.retailer, 100),
        session_id: asNullableString(body.session_id, 100),
        referrer: asNullableString(ctx.req.headers.get("referer"), 500)
      });

      if (error) {
        ctx.log.warn("click event insert failed", { dbError: error.message });
      }

      return NextResponse.json({ ok: true });
    } catch {
      return NextResponse.json({ ok: true }); // never break the user flow
    }
  }
});
