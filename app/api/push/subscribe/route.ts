import { NextResponse } from "next/server";
import { upsertPushWatch, deletePushWatch } from "@/lib/push/db";
import type { Region } from "@/lib/pricing/types";
import type webpush from "web-push";

function isValidRegion(r: unknown): r is Region {
  return r === "US" || r === "KR" || r === "JP";
}

function isValidSubscription(s: unknown): s is webpush.PushSubscription {
  return (
    typeof s === "object" &&
    s !== null &&
    typeof (s as Record<string, unknown>).endpoint === "string"
  );
}

/**
 * POST /api/push/subscribe
 * { subscription, productId, name, region, targetPrice?, addedAt? }
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { subscription, productId, name, region, targetPrice, addedAt } = body;

  if (
    !isValidSubscription(subscription) ||
    typeof productId !== "string" || !productId ||
    typeof name !== "string" || !name ||
    !isValidRegion(region)
  ) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  await upsertPushWatch(subscription, {
    productId,
    name,
    region,
    targetPrice: typeof targetPrice === "number" ? targetPrice : undefined,
    addedAt: typeof addedAt === "string" ? addedAt : new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/push/subscribe
 * { endpoint, productId, region }
 */
export async function DELETE(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { endpoint, productId, region } = body;

  if (
    typeof endpoint !== "string" || !endpoint ||
    typeof productId !== "string" || !productId ||
    !isValidRegion(region)
  ) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  await deletePushWatch(endpoint, productId, region);
  return NextResponse.json({ ok: true });
}
