import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/server/api-handler";
import { InternalError, NotFoundError } from "@/lib/server/errors";
import { getShareTokenForUser, setShareToken } from "@/lib/comparisons/repository";

/**
 * 22-char URL-safe token (~131 bits) from a CSPRNG.
 *
 * The previous implementation used Math.random() over a 32-char alphabet
 * (10 chars ≈ 50 bits, and Math.random is not cryptographically secure —
 * its state can be recovered from observed outputs). Share tokens are
 * capability URLs, so they must be unguessable: node:crypto only.
 * Existing short tokens in the DB stay valid; only new ones use this format.
 */
function generateToken() {
  return randomBytes(16).toString("base64url").slice(0, 22);
}

/** POST /api/share/[id] — mint (or return existing) public share token. */
export const POST = createApiHandler({
  route: "POST /api/share/[id]",
  rateLimit: { limit: 30, windowMs: 60_000, keyPrefix: "share" },
  auth: {
    mode: "required",
    unauthorizedMessage: "로그인이 필요합니다.",
    unavailableMessage: "Supabase not configured"
  },
  async handler(ctx) {
    const existing = await getShareTokenForUser(ctx.supabase!, ctx.params.id, ctx.user!.id);

    if (!existing.found) {
      throw new NotFoundError("기록을 찾을 수 없습니다.");
    }

    // Idempotent: sharing twice returns the same link.
    if (existing.token) {
      return NextResponse.json({ token: existing.token });
    }

    const token = generateToken();
    const updated = await setShareToken(ctx.supabase!, ctx.params.id, ctx.user!.id, token);

    if (!updated) {
      throw new InternalError("공유 링크 생성에 실패했습니다.");
    }

    return NextResponse.json({ token });
  }
});
