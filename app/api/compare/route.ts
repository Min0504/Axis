import { NextResponse } from "next/server";
import { buildDecision, buildQuery, parseOptions } from "@/lib/decision-engine";
import { insertComparison } from "@/lib/comparisons/repository";
import { ensureUserProfile } from "@/lib/users/ensure-profile";
import { createApiHandler } from "@/lib/server/api-handler";
import { BadRequestError } from "@/lib/server/errors";
import { COUNTRY_COOKIE, LOCALE_COOKIE, countryForLocale, isCountry, isLocale } from "@/lib/i18n";
import type { ComparisonResult } from "@/lib/types";

const MAX_OPTIONS = 6;
const MAX_OPTION_LENGTH = 100;
const MAX_CONTEXT_LENGTH = 200;

type Body = {
  query?: string;
  optionA?: string;
  optionB?: string;
  options?: unknown;
  /** Optional user situation for tailored re-analysis. */
  context?: unknown;
};

function collectOptions(body: Body): string[] {
  if (Array.isArray(body.options)) {
    return body.options.map((o) => String(o ?? "").trim()).filter(Boolean);
  }
  const a = body.optionA?.trim() ?? "";
  const b = body.optionB?.trim() ?? "";
  if (a || b) return [a, b].filter(Boolean);
  return body.query ? parseOptions(body.query) : [];
}

function localeFromCookies(req: Request) {
  const cookieHeader = req.headers.get("cookie") ?? "";
  const localeCookieMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${LOCALE_COOKIE}=([^;]*)`));
  const countryCookieMatch = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COUNTRY_COOKIE}=([^;]*)`));
  const locale = isLocale(localeCookieMatch?.[1]) ? localeCookieMatch[1] : "ko";
  const country = isCountry(countryCookieMatch?.[1])
    ? countryCookieMatch[1]
    : countryForLocale(locale);
  return { locale, country };
}

/**
 * POST /api/compare — run the decision engine on 2..6 options.
 *
 * The body accepts three shapes (query string / optionA+B / options[]), so
 * option collection stays hand-written; the pipeline still provides rate
 * limiting, optional auth, JSON parsing and error mapping.
 */
export const POST = createApiHandler<Body>({
  route: "POST /api/compare",
  rateLimit: { limit: 20, windowMs: 60_000, keyPrefix: "compare" },
  auth: { mode: "optional" },
  body: { invalidJsonMessage: "잘못된 요청 형식입니다." },
  async handler(ctx) {
    const options = collectOptions(ctx.body).slice(0, MAX_OPTIONS);

    if (options.length < 2) {
      throw new BadRequestError("두 개 이상의 선택지를 입력해주세요.");
    }
    if (options.some((opt) => opt.length > MAX_OPTION_LENGTH)) {
      throw new BadRequestError(`선택지는 각각 ${MAX_OPTION_LENGTH}자 이하로 입력해주세요.`);
    }

    if (ctx.supabase && ctx.user) {
      await ensureUserProfile(ctx.supabase, ctx.user);
    }

    const { locale, country } = localeFromCookies(ctx.req);
    const query = buildQuery(options);

    const userContext =
      typeof ctx.body.context === "string"
        ? ctx.body.context.trim().slice(0, MAX_CONTEXT_LENGTH)
        : undefined;

    let result: ComparisonResult;
    try {
      result = await buildDecision(query, MAX_OPTIONS, locale, country, userContext || undefined);
    } catch (err) {
      ctx.log.error("buildDecision failed", { err, query });
      return NextResponse.json(
        { error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", requestId: ctx.requestId },
        { status: 500 }
      );
    }

    let comparisonId: string | undefined;

    if (ctx.supabase && ctx.user) {
      const inserted = await insertComparison(ctx.supabase, {
        userId: ctx.user.id,
        query,
        category: result.category,
        selectedOption: result.selectedOption,
        result
      });

      if (inserted.error) {
        // History persistence is best-effort — the comparison result itself
        // must still reach the user.
        ctx.log.error("comparison insert failed", { dbError: inserted.error });
      } else {
        comparisonId = inserted.id ?? undefined;
      }
    }

    return NextResponse.json({ result, comparisonId });
  }
});
