import { NextResponse } from "next/server";
import { upsertWatch, deleteWatch, listWatchesByEmail } from "@/lib/watch/db";
import { createSupabaseRouteClient } from "@/lib/supabase-route";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { Region } from "@/lib/pricing/types";

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidRegion(r: unknown): r is Region {
  return r === "US" || r === "KR" || r === "JP";
}

/**
 * Resolve the authenticated user's email. Client-supplied emails are never
 * trusted for ownership — only the session (cookie or Bearer) is.
 */
async function requireSessionEmail(req: Request): Promise<
  { email: string } | { error: NextResponse }
> {
  const supabase = await createSupabaseRouteClient(req);
  if (!supabase) {
    return { error: NextResponse.json({ error: "auth unavailable" }, { status: 503 }) };
  }
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email?.trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    return { error: NextResponse.json({ error: "unauthorized" }, { status: 401 }) };
  }
  return { email };
}

async function rateLimitOrReject(req: Request, action: string): Promise<NextResponse | null> {
  const ip = getClientIp(req);
  const limit = await checkRateLimit(`watches:${action}:${ip}`, 30, 60_000);
  if (!limit.allowed) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }
  return null;
}

/**
 * GET /api/watches
 * Returns the watch list for the authenticated user only.
 */
export async function GET(req: Request) {
  const limited = await rateLimitOrReject(req, "get");
  if (limited) return limited;

  const auth = await requireSessionEmail(req);
  if ("error" in auth) return auth.error;

  const watches = await listWatchesByEmail(auth.email);
  return NextResponse.json({ watches });
}

/**
 * POST /api/watches
 * Body: { productId, name, region, targetPrice?, addedAt? }
 * Optional `email` in body is ignored (session email wins).
 */
export async function POST(req: Request) {
  const limited = await rateLimitOrReject(req, "post");
  if (limited) return limited;

  const auth = await requireSessionEmail(req);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { productId, name, region, targetPrice, addedAt } = body;

  if (
    typeof productId !== "string" || !productId ||
    typeof name !== "string" || !name ||
    !isValidRegion(region)
  ) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  await upsertWatch(auth.email, {
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
 * Body: { productId, region }
 */
export async function DELETE(req: Request) {
  const limited = await rateLimitOrReject(req, "delete");
  if (limited) return limited;

  const auth = await requireSessionEmail(req);
  if ("error" in auth) return auth.error;

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "invalid json" }, { status: 400 });
  }

  const { productId, region } = body;

  if (
    typeof productId !== "string" || !productId ||
    !isValidRegion(region)
  ) {
    return NextResponse.json({ error: "missing or invalid fields" }, { status: 400 });
  }

  await deleteWatch(auth.email, productId, region);
  return NextResponse.json({ ok: true });
}
