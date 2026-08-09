import { NextResponse } from "next/server";
import { createServiceClientSafe } from "@/lib/supabase-server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";

export const runtime = "nodejs";

const EVENT_TYPES = new Set(["affiliate", "compare_view"]);
const REGIONS = new Set(["KR", "US", "JP"]);

function clip(value: unknown, max: number): string | null {
  if (value == null) return null;
  const text = String(value).trim();
  if (!text) return null;
  return text.slice(0, max);
}

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = await checkRateLimit(`track:${ip}`, 60, 60_000);
  if (!limit.allowed) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  try {
    const body = await req.json();
    const eventType = clip(body?.event_type, 32);
    if (!eventType || !EVENT_TYPES.has(eventType)) {
      return NextResponse.json({ error: "invalid_event" }, { status: 400 });
    }

    const regionRaw = clip(body?.region, 8)?.toUpperCase() ?? null;
    const region = regionRaw && REGIONS.has(regionRaw) ? regionRaw : null;

    const db = createServiceClientSafe();
    if (!db) {
      return NextResponse.json({ ok: true }); // silently skip if no DB
    }

    const referrer = clip(req.headers.get("referer"), 500) ?? undefined;

    await db.from("click_events").insert({
      event_type: eventType,
      product_id: clip(body?.product_id, 120),
      slug: clip(body?.slug, 160),
      region,
      retailer: clip(body?.retailer, 64),
      session_id: clip(body?.session_id, 128),
      referrer: referrer ?? null
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never break the user flow
  }
}
