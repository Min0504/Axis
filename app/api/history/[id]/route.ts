import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/server/api-handler";
import { BadRequestError, NotFoundError } from "@/lib/server/errors";
import { getComparisonForUser, deleteComparisonForUser } from "@/lib/comparisons/repository";

const RATE = { limit: 60, windowMs: 60_000, keyPrefix: "history-item" };
const AUTH = {
  mode: "required",
  unauthorizedMessage: "로그인이 필요합니다.",
  unavailableMessage: "Supabase not configured"
} as const;

/** GET /api/history/[id] — load one saved comparison (owner only). */
export const GET = createApiHandler({
  route: "GET /api/history/[id]",
  rateLimit: RATE,
  auth: AUTH,
  async handler(ctx) {
    const record = await getComparisonForUser(ctx.supabase!, ctx.params.id, ctx.user!.id);
    if (!record) {
      throw new NotFoundError("기록을 찾을 수 없습니다.");
    }
    return NextResponse.json({ query: record.query, result: record.result });
  }
});

/** DELETE /api/history/[id] — delete one saved comparison (owner only). */
export const DELETE = createApiHandler({
  route: "DELETE /api/history/[id]",
  rateLimit: RATE,
  auth: AUTH,
  async handler(ctx) {
    const deleted = await deleteComparisonForUser(ctx.supabase!, ctx.params.id, ctx.user!.id);
    if (!deleted) {
      throw new BadRequestError("삭제하지 못했습니다.");
    }
    return NextResponse.json({ ok: true });
  }
});
