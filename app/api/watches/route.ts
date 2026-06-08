import { NextResponse } from "next/server";
import { upsertWatch, deleteWatch, listWatchesByEmail } from "@/lib/watch/db";
import type { Region } from "@/lib/pricing/types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidRegion(r: unknown): r is Region {
  return r === "US" || r === "KR" || r === "JP";
}

/**
 * GET /api/watches?email=…
 * Returns the watch list for that email (email acts as an unguessable owner token).
 */
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email")?.trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    return NextResponse.json({ error: "invalid email" }, { status: 400 });
  }
  const watches = await listWatchesByEmail(email);
  return NextResponse.json({ watches });
}

/**
 * POST /api/watches
 * Body: { email, productId, name, region, targetPrice?, addedAt? }
 */
export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { email, productId, name, region, targetPrice, addedAt } = body;

  if (
    typeof email !== "string" || !isValidEmail(email) ||
    typeof productId !== "string" || !productId ||
    typeof name !== "string" || !name ||
    !isValidRegion(region)
  ) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  await upsertWatch(email.toLowerCase(), {
    productId,
    name,
    region,
    targetPrice: typeof targetPrice === "number" ? targetPrice : undefined,
    addedAt: typeof addedAt === "string" ? addedAt : new Date().toISOString(),
  });

  return NextResponse.json({ ok: true });
}

/**
 * DELETE /api/watches
 * Body: { email, productId, region }
 */
export async function DELETE(req: Request) {
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { email, productId, region } = body;

  if (
    typeof email !== "string" || !isValidEmail(email) ||
    typeof productId !== "string" || !productId ||
    !isValidRegion(region)
  ) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  await deleteWatch(email.toLowerCase(), productId, region);
  return NextResponse.json({ ok: true });
}
