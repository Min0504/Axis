import { NextResponse } from "next/server";
import { buildDecision, buildQuery, parseOptions } from "@/lib/decision-engine";
import { createSupabaseRouteClient } from "@/lib/supabase-route";
import { ensureUserProfile } from "@/lib/users/ensure-profile";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import {
  GUEST_MAX_OPTIONS,
  PLAN_DAILY_LIMIT,
  dailyLimit,
  devPlanOverride,
  maxOptions,
  normalizePlan,
  type Plan
} from "@/lib/plan";
import type { ComparisonResult } from "@/lib/types";

const MAX_OPTION_LENGTH = 100;
const HARD_MAX_OPTIONS = 5;
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60_000; // per minute

type Usage = { plan: Plan; dailyUsage: number; limit: number | null };

type Body = { query?: string; optionA?: string; optionB?: string; options?: unknown };

function collectOptions(body: Body): string[] {
  if (Array.isArray(body.options)) {
    return body.options.map((o) => String(o ?? "").trim()).filter(Boolean);
  }
  const a = body.optionA?.trim() ?? "";
  const b = body.optionB?.trim() ?? "";
  if (a || b) {
    return [a, b].filter(Boolean);
  }
  return body.query ? parseOptions(body.query) : [];
}

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

  let body: Body;
  try {
    body = (await req.json()) as Body;
  } catch {
    return NextResponse.json({ error: "잘못된 요청 형식입니다." }, { status: 400 });
  }

  const allOptions = collectOptions(body).slice(0, HARD_MAX_OPTIONS);

  if (allOptions.length < 2) {
    return NextResponse.json({ error: "두 개 이상의 선택지를 입력해주세요." }, { status: 400 });
  }

  if (allOptions.some((opt) => opt.length > MAX_OPTION_LENGTH)) {
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
  let allowedOptions = GUEST_MAX_OPTIONS;

  // Quota gate (logged-in users): enforce the free daily limit BEFORE the AI
  // call so blocked requests don't incur cost. Guests are governed by the IP
  // rate limit above and compare two options.
  if (supabase && user) {
    await ensureUserProfile(supabase, user);

    const { data: quota, error: quotaError } = await supabase.rpc("consume_daily_quota", {
      p_free_limit: PLAN_DAILY_LIMIT.free,
      p_plus_limit: PLAN_DAILY_LIMIT.plus
    });

    const row = Array.isArray(quota) ? quota[0] : quota;

    if (!quotaError && row) {
      const plan = normalizePlan(row.plan);
      allowedOptions = maxOptions(plan);
      usage = { plan, dailyUsage: row.daily_usage, limit: dailyLimit(plan) };

      if (!row.allowed) {
        return NextResponse.json(
          {
            error: "오늘 선택 횟수를 모두 사용했어요. 상위 플랜으로 더 많이 선택할 수 있어요.",
            limitReached: true,
            usage
          },
          { status: 402 }
        );
      }
    }
  }

  // Dev-only override so Pro multi-way can be tried locally without an account.
  const dev = devPlanOverride();
  if (dev) {
    allowedOptions = maxOptions(dev);
  }

  const options = allOptions.slice(0, allowedOptions);
  const query = buildQuery(options);

  let result: ComparisonResult;
  try {
    result = await buildDecision(query, allowedOptions);
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
