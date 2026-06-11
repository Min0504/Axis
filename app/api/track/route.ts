import { NextResponse } from "next/server";
import { createServiceClientSafe } from "@/lib/supabase-server";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_type, product_id, slug, region, retailer, session_id } = body;

    if (!event_type || !["affiliate", "compare_view"].includes(event_type)) {
      return NextResponse.json({ error: "invalid_event" }, { status: 400 });
    }

    const db = createServiceClientSafe();
    if (!db) {
      return NextResponse.json({ ok: true }); // silently skip if no DB
    }

    const referrer = req.headers.get("referer") ?? undefined;

    await db.from("click_events").insert({
      event_type,
      product_id: product_id ?? null,
      slug: slug ?? null,
      region: region ?? null,
      retailer: retailer ?? null,
      session_id: session_id ?? null,
      referrer: referrer ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never break the user flow
  }
}
