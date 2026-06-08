import { NextResponse } from "next/server";
import { buildDecision, buildQuery, parseOptions } from "@/lib/decision-engine";
import { createSupabaseRouteClient } from "@/lib/supabase-route";
import { ensureUserProfile } from "@/lib/users/ensure-profile";
import { getClientIp, rateLimit } from "@/lib/rate-limit";
import { COUNTRY_COOKIE, LOCALE_COOKIE, countryForLocale, isCountry, isLocale } from "@/lib/i18n";
import type { ComparisonResult } from "@/lib/types";

const MAX_OPTIONS = 6;
const MAX_OPTION_LENGTH = 100;
const RATE_LIMIT = 20;
const RATE_WINDOW_MS = 60_000;

type Body = { query?: string; optionA?: string; optionB?: string; options?: unknown };

function collectOptions(body: Body): string[] {
  if (Array.isArray(body.options)) {
    return body.options.map((o) => String(o ?? "").trim()).filter(Boolean);
  }
  const a = body.optionA?.trim() ?? "";
  const b = body.optionB?.trim() ?? "";
  if (a || b) return [a, b].filter(Boolean);
  return body.query ? parseOptions(body.query) : [];
}

export async function POST(req: Request) {
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

  const options = collectOptions(body).slice(0, MAX_OPTIONS);

  if (options.length < 2) {
    return NextResponse.json({ error: "두 개 이상의 선택지를 입력해주세요." }, { status: 400 });
  }

  if (options.some((opt) => opt.length > MAX_OPTION_LENGTH)) {
    return NextResponse.json(
      { error: `선택지는 각각 ${MAX_OPTION_LENGTH}자 이하로 입력해주세요.` },
      { status: 400 }
    );
  }

  const supabase = await createSupabaseRouteClient(req);
  const { data: { user } } = supabase
    ? await supabase.auth.getUser()
    : { data: { user: null } };

  if (supabase && user) {
    await ensureUserProfile(supabase, user);
  }

  const cookieHeader = req.headers.get("cookie") ?? "";
  const localeCookieMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
  const countryCookieMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COUNTRY_COOKIE}=([^;]*)`));
  const locale = isLocale(localeCookieMatch?.[1]) ? localeCookieMatch[1] : "ko";
  const country = isCountry(countryCookieMatch?.[1])
    ? countryCookieMatch[1]
    : countryForLocale(locale);

  const query = buildQuery(options);

  let result: ComparisonResult;
  try {
    result = await buildDecision(query, MAX_OPTIONS, locale, country);
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
        analysis_result: result,
      })
      .select("id")
      .single();

    if (error) {
      console.error("[comparisons.insert]", error.message);
    } else {
      comparisonId = data.id;
    }
  }

  return NextResponse.json({ result, comparisonId });
}
