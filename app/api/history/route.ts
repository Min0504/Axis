import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/server/api-handler";
import { BadRequestError } from "@/lib/server/errors";
import { clampLimit, decodeCursor } from "@/lib/server/pagination";
import { listHistoryPage } from "@/lib/comparisons/repository";

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

/**
 * GET /api/history?limit=10&cursor=<opaque>
 *
 * Cursor-paginated comparison history for the authenticated user.
 * Anonymous callers get an empty list (soft-auth: the history widget renders
 * for everyone, it's just empty when logged out).
 */
export const GET = createApiHandler({
  route: "GET /api/history",
  rateLimit: { limit: 60, windowMs: 60_000, keyPrefix: "history" },
  auth: { mode: "optional" },
  async handler(ctx) {
    if (!ctx.supabase || !ctx.user) {
      return NextResponse.json({ history: [], nextCursor: null });
    }

    const url = new URL(ctx.req.url);
    const limit = clampLimit(url.searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);

    const rawCursor = url.searchParams.get("cursor");
    const cursor = rawCursor ? decodeCursor(rawCursor) : null;
    if (rawCursor && !cursor) {
      throw new BadRequestError("invalid cursor");
    }

    const page = await listHistoryPage(ctx.supabase, ctx.user.id, { limit, cursor });

    return NextResponse.json({ history: page.items, nextCursor: page.nextCursor });
  }
});
