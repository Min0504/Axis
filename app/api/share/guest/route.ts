import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createApiHandler } from "@/lib/server/api-handler";
import { BadRequestError, InternalError, ServiceUnavailableError } from "@/lib/server/errors";
import { insertGuestShare } from "@/lib/comparisons/repository";
import type { ComparisonResult } from "@/lib/types";

/** 22-char URL-safe token (~131 bits) — harder to enumerate than 10-char charset. */
function generateToken() {
  return randomBytes(16).toString("base64url").slice(0, 22);
}

type Body = {
  query?: string;
  result?: ComparisonResult;
};

/**
 * POST /api/share/guest — store a result as a public anonymous comparison so
 * the link can be shared without login. The stored row has no user_id.
 */
export const POST = createApiHandler<Body>({
  route: "POST /api/share/guest",
  rateLimit: { limit: 10, windowMs: 60_000, keyPrefix: "share-guest" },
  auth: { mode: "optional" },
  body: { invalidJsonMessage: "잘못된 요청입니다." },
  async handler(ctx) {
    if (!ctx.body.query || !ctx.body.result?.selectedOption) {
      throw new BadRequestError("결과 데이터가 없습니다.");
    }

    // Cap stored query length to reduce spam / PII dumps.
    const query = String(ctx.body.query).trim().slice(0, 120);
    if (query.length < 3) {
      throw new BadRequestError("결과 데이터가 없습니다.");
    }

    if (!ctx.supabase) {
      throw new ServiceUnavailableError("Supabase not configured");
    }

    const token = generateToken();
    const { error } = await insertGuestShare(ctx.supabase, {
      query,
      result: ctx.body.result,
      token
    });

    if (error) {
      ctx.log.error("guest share insert failed", { dbError: error });
      throw new InternalError("공유 링크 생성에 실패했습니다.");
    }

    return NextResponse.json({ token });
  }
});
