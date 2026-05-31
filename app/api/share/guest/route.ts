import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-route";
import type { ComparisonResult } from "@/lib/types";

function generateToken() {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

/**
 * Guest share endpoint: accepts a result payload directly and stores it
 * as a public anonymous comparison so the link can be shared without login.
 * The stored row has no user_id.
 */
export async function POST(req: Request) {
  let body: { query?: string; result?: ComparisonResult };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청입니다." }, { status: 400 });
  }

  if (!body.query || !body.result?.selectedOption) {
    return NextResponse.json({ error: "결과 데이터가 없습니다." }, { status: 400 });
  }

  const supabase = await createSupabaseRouteClient(req);
  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const token = generateToken();
  const { error } = await supabase.from("comparisons").insert({
    user_id: null,
    query: body.query,
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
