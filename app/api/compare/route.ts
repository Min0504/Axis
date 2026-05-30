import { NextResponse } from "next/server";
import { buildDecision, buildQuery } from "@/lib/decision-engine";
import { createSupabaseRouteClient } from "@/lib/supabase-route";
import { ensureUserProfile } from "@/lib/users/ensure-profile";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { FREE_DAILY_LIMIT, normalizePlan, type Plan } from "@/lib/plan";
import type { ComparisonResult } from "@/lib/types";

const MAX_OPTION_LENGTH = 100;
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60_000; // per minute

type Usage = { plan: Plan; dailyUsage: number; limit: number | null };

export async function POST(req: Request) {
  // Best-effort abuse guard: AI calls cost money, so cap requests per client.
  const ip = getClientIp(req);
  const limit = rateLimit(`compare:${ip}`, RATE_LIMIT, RATE_WINDOW_MS);
  if (!limit.allowed) {
    const retryAfter = Math.ceil((limit.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요." },
      { status: 429, headers: { "Retry-After": String(retryAfter) } }
    );
  }

  let body: { query?: string; optionA?: string; optionB?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const optionA = body.optionA?.trim() ?? "";
  const optionB = body.optionB?.trim() ?? "";
  const query = body.query?.trim() || (optionA && optionB ? buildQuery(optionA, optionB) : "");

  if (!query) {
    return NextResponse.json({ error: "두 선택지를 모두 입력해주세요." }, { status: 400 });
  }

  if (
    optionA.length > MAX_OPTION_LENGTH ||
    optionB.length > MAX_OPTION_LENGTH ||
    query.length > MAX_OPTION_LENGTH * 3
  ) {
    return NextResponse.json(
      { error: `선택지는 각각 ${MAX_OPTION_LENGTH}자 이하로 입력해주세요.` },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseRouteClient(req);

  const {
    data: { user }
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  let usage: Usage | undefined;

  // Quota gate (logged-in users): enforce the free daily limit BEFORE the AI
  // call so blocked requests don't incur cost. Guests are governed by the IP
  // rate limit above and don't have a stored quota.
  if (supabase && user) {
    await ensureUserProfile(supabase, user);

    const { data: quota, error: quotaError } = await supabase.rpc("consume_daily_quota", {
      p_free_limit: FREE_DAILY_LIMIT
    });

    const row = Array.isArray(quota) ? quota[0] : quota;

    if (!quotaError && row) {
      const plan = normalizePlan(row.plan);
      usage = { plan, dailyUsage: row.daily_usage, limit: plan === "pro" ? null : FREE_DAILY_LIMIT };

      if (!row.allowed) {
        return NextResponse.json(
          {
            error: "오늘 무료 결정 횟수를 모두 사용했어요. Pro로 업그레이드하면 무제한이에요.",
            limitReached: true,
            usage
          },
          { status: 402 }
        );
      }
    }
  }

  let result: ComparisonResult;
  try {
    result = await buildDecision(query);
  } catch (err) {
    console.error("[buildDecision]", err);
    return NextResponse.json(
      { error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." },
      { status: 500 }
    );
  }

  let comparisonId: string | undefined;

  if (supabase && user) {
    const { data, error } = await supabase
      .from("comparisons")
      .insert({
        user_id: user.id,
        query,
        category: result.category,
        selected_option: result.selectedOption,
        analysis_result: result
      })
      .select("id")
      .single();

    if (error) {
      console.error("[comparisons.insert]", error.message);
    } else {
      comparisonId = data.id;
    }
  }

  return NextResponse.json({ result, comparisonId, usage });
}
