import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-route";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import type { ComparisonResult } from "@/lib/types";

/** 22-char URL-safe token (~131 bits) — harder to enumerate than 10-char charset. */
function generateToken() {
  return randomBytes(16).toString("base64url").slice(0, 22);
}

/** Hard cap on serialized result size to blunt guest-share abuse. */
const MAX_RESULT_BYTES = 48_000;

/**
 * Guest share endpoint: accepts a result payload directly and stores it
 * as a public anonymous comparison so the link can be shared without login.
 * The stored row has no user_id.
 */
export async function POST(req: Request) {
  const ip = getClientIp(req);
  const limit = await checkRateLimit(`share-guest:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: { query?: string; result?: ComparisonResult };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!body.query || !body.result?.selectedOption) {
    return NextResponse.json({ error: "결과 데이터가 없습니다." }, { status: 400 });
  }

  // Cap stored query length to reduce spam / PII dumps.
  const query = String(body.query).trim().slice(0, 120);
  if (query.length < 3) {
    return NextResponse.json({ error: "결과 데이터가 없습니다." }, { status: 400 });
  }

  try {
    const encoded = JSON.stringify(body.result);
    if (encoded.length > MAX_RESULT_BYTES) {
      return NextResponse.json({ error: "결과 데이터가 너무 큽니다." }, { status: 413 });
    }
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  const supabase = await createSupabaseRouteClient(req);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const token = generateToken();
  const { error } = await supabase.from("comparisons").insert({
    user_id: null,
    query,
    category: body.result.category ?? "general",
    selected_option: body.result.selectedOption,
    analysis_result: body.result,
    share_token: token,
    is_public: true
  });

  if (error) {
    console.error("[guest share insert]", error.message);
    return NextResponse.json({ error: "공유 링크 생성에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ token });
}
