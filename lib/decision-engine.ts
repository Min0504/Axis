import { detectCategory } from "@/lib/category";
import { expandComparisonOptions } from "@/lib/query-expansion";
import { extractProductSpecs } from "@/lib/specs/extract/pipeline";
import { buildExtractedComparisonTable } from "@/lib/specs/extracted-table";
import { discoverOfficialUrl, isOfficialUrl } from "@/lib/specs/extract/discover";
import { resolveOfficialProduct, resolveProductSource } from "@/lib/specs/product-registry";
import { getCategorySchema, primaryFieldKeys, resolveFieldByLabel } from "@/lib/specs/schema";
import {
  isMeaningful,
  verificationLevel,
  type GradedSpec,
  type SpecSourceTier
} from "@/lib/specs/source";
import { safeHttpUrl } from "@/lib/safe-url";
import { countryForLocale, getDictionary, type Country, type Locale } from "@/lib/i18n";
import type { Category, ComparisonResult, ComparisonRow, OfficialSourceMeta } from "@/lib/types";
import type { ExtractedSpecs } from "@/lib/specs/extract";
import type { ProductSourceCandidate } from "@/lib/specs/types";
import { logSearchMiss } from "@/lib/search-miss-log";
import { getCachedComparison, setCachedComparison } from "@/lib/comparison-cache";
import { localizeDisplayName, resolveVerifiedProduct, stripForeignMarketFields } from "@/lib/specs/dataset";

const SPLIT_RE = /\s+vs\s+|\s+VS\s+|\svs\s|\s대\s/i;

/** Split a query like "A vs B vs C" into its options. */
export function parseOptions(query: string): string[] {
  return query
    .split(SPLIT_RE)
    .map((v) => v.trim())
    .filter(Boolean);
}

export function buildQuery(options: string[]) {
  return options.map((o) => o.trim()).filter(Boolean).join(" vs ");
}

/**
 * Grade the spec table's trust level. A primary field counts as verified when
 * its values carry official source URLs (tier ≤ 2). Without a category schema,
 * or without official sources, the table is "unverified" (AI-grade) — which is
 * honest and keeps such pages out of the search index until real data is seeded.
 */
export function gradeVerification(category: Category, comparison: ComparisonRow[]) {
  const primaryKeys = primaryFieldKeys(category);
  if (!primaryKeys.length) return verificationLevel([], []);

  const grades: GradedSpec[] = [];
  let hasIncompletePrimaryRow = false;
  for (const row of comparison) {
    const field = resolveFieldByLabel(category, row.key);
    if (!field) continue;

    const sources = row.sources ?? [];
    const meaningful = row.values.filter(isMeaningful);
    const sourced = row.values.filter((v, i) => isMeaningful(v) && Boolean(sources[i]));
    if (field.primary && row.values.some((value, index) => !isMeaningful(value) || !sources[index])) {
      hasIncompletePrimaryRow = true;
    }

    let tier: SpecSourceTier = 3;
    if (meaningful.length > 0 && sourced.length === meaningful.length) tier = 1;
    else if (sourced.length > 0) tier = 2;

    grades.push({ fieldKey: field.key, value: meaningful[0] ?? "", tier });
  }

  const level = verificationLevel(grades, primaryKeys);
  return level === "verified" && hasIncompletePrimaryRow ? "partial" : level;
}

async function collectOfficialExtractedSpecs(
  productName: string,
  category: Category,
  source: ProductSourceCandidate | null
) {
  if (!source) return null;

  return extractProductSpecs({ productName, category, sourceUrl: source.url }).catch(() => null);
}

/**
 * Enrich scraped specs with hardcoded dataset.
 *
 * Two modes:
 *  1. Scraping FAILED (null) — inject the full dataset entry as context so the AI
 *     always has concrete, verified values to echo.
 *  2. Scraping SUCCEEDED — **merge** dataset values into the scraped spec to fill
 *     any fields the scraper didn't capture (e.g. refresh_hz, water_resist).
 *     Scraped values win field-by-field; dataset fills the gaps.
 *
 * This guarantees that fields like "주사율" (refresh_hz) always appear in the AI
 * context with the correct verified value (e.g. 120Hz for iPhone 16 Pro) even when
 * Apple/Samsung spec pages express the same spec in prose ("ProMotion", "최대 120Hz").
 */
function enrichWithDatasetFallback(
  scraped: (ExtractedSpecs | null)[],
  options: string[],
  category: Category,
  country: Country
): (ExtractedSpecs | null)[] {
  return scraped.map((spec, index) => {
    const entry = resolveVerifiedProduct(category, options[index], country);
    // Cross-market entries (e.g. KR dataset served to US/JP) keep hardware specs
    // but drop currency-bound fields so the AI fills the local price instead.
    const datasetSpecs = entry ? stripForeignMarketFields(entry, country) : null;
    const hasDataset = entry && datasetSpecs && Object.keys(datasetSpecs).length > 0;

    if (!spec) {
      // Scraping failed entirely — use dataset as full fallback
      if (!hasDataset) return null;
      return {
        productName: options[index],
        category,
        source: entry!.source,
        fetchedAt: entry!.fetchedAt,
        tier: entry!.tier,
        specs: datasetSpecs!
      } satisfies ExtractedSpecs;
    }

    // Scraping succeeded — dataset wins over scraped values.
    // Hardcoded dataset is manually verified; live scraping can silently misparse
    // or return stale/wrong data (e.g. Apple support pages occasionally surface
    // unrelated product content). Dataset source URL also replaces the scraped one.
    if (!hasDataset) return spec;
    const mergedSpecs: Record<string, string> = { ...spec.specs, ...datasetSpecs! };
    return { ...spec, source: entry!.source, specs: mergedSpecs };
  });
}

async function resolveComparableSource(
  productName: string,
  category: Category,
  country: Country
): Promise<ProductSourceCandidate | null> {
  const entry = resolveOfficialProduct(productName);
  if (entry) {
    const source = resolveProductSource(entry, country);
    // If the registry entry has no regional URL for this country, fall through
    // to discovery (brand URL patterns / web search) rather than giving up.
    if (source) return source;
  }

  // Verified dataset hit with a manufacturer-official source URL — no network
  // needed. (다나와 등 tier-2 소스는 아래 discovery 이후의 최종 fallback으로만 사용)
  const verified = resolveVerifiedProduct(category, productName, country);
  if (verified && isOfficialUrl(verified.source)) {
    return { url: verified.source, tier: 1, kind: "manufacturer" };
  }

  const discoveredUrl = await discoverOfficialUrl(productName, category, { country });
  if (discoveredUrl) {
    return { url: discoveredUrl, tier: 2, kind: "manufacturer" };
  }

  // Last resort: dataset entry exists but its source is third-party (다나와 등).
  // Still a verified product — return it so the comparison doesn't dead-end at
  // "not found" for products we actually have data for.
  if (verified) {
    return { url: verified.source, tier: 2, kind: "authorized_importer" };
  }

  return null;
}

function officialSourceUrls(
  sourceMeta: (OfficialSourceMeta | undefined)[]
) {
  return sourceMeta.map((source) => source?.url);
}

function officialSourceMetadata(
  specs: Awaited<ReturnType<typeof collectOfficialExtractedSpecs>>[],
  sources: (ProductSourceCandidate | null)[]
): (OfficialSourceMeta | undefined)[] {
  return sources.map((source, index) => {
    if (!source) return undefined;
    const url = safeHttpUrl(specs[index]?.source ?? source.url);
    if (!url) return undefined;
    return { url, kind: source.kind, tier: source.tier };
  });
}

function missingOfficialProducts(options: string[], sources: (ProductSourceCandidate | null)[]) {
  return options.filter((_, index) => !sources[index]);
}

function buildProductNotFoundDecision(
  options: string[],
  category: Category,
  missingOptions: string[],
  locale: Locale
): ComparisonResult {
  const t = getDictionary(locale).results;
  return {
    selectedOption: t.productNotFoundTitle,
    category,
    options,
    locale,
    status: "not_found",
    missingOptions,
    oneLineConclusion: t.productNotFoundConclusion(missingOptions),
    reasons: [t.productNotFoundReason],
    comparison: [],
    detail: t.productNotFoundDetail,
    analyses: [],
    officialSources: options.map(() => undefined),
    officialSourceMeta: options.map(() => undefined),
    specCollectionNote: t.productNotFoundTitle,
    verification: "unverified"
  };
}

function buildVerificationPendingDecision(
  options: string[],
  category: Category,
  officialSources: (string | undefined)[],
  officialSourceMeta: (OfficialSourceMeta | undefined)[],
  locale: Locale
): ComparisonResult {
  const t = getDictionary(locale).results;
  return {
    selectedOption: t.verificationPendingTitle,
    category,
    options,
    locale,
    status: "verification_pending",
    oneLineConclusion: t.verificationPendingConclusion,
    reasons: [t.verificationPendingReason],
    comparison: [],
    detail: t.verificationPendingDetail,
    analyses: [],
    officialSources,
    officialSourceMeta,
    specCollectionNote: t.verificationPendingTitle,
    verification: "unverified"
  };
}

function numericValue(value: string): number | null {
  const match = value.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : null;
}

function deterministicCopy(locale: Locale) {
  if (locale === "en") {
    return {
      conclusion: (option: string) => `${option} is the safer pick based on verified spec advantages.`,
      reason: (label: string, value: string) => `${label}: stronger verified value (${value})`,
      neutral: "No unverifiable specs were used; the decision only uses official comparison rows.",
      detail: "Axis selected the option with more objective advantages in the verified spec table. Non-numeric or missing fields were not scored."
    };
  }
  if (locale === "ja") {
    return {
      conclusion: (option: string) => `検証済みスペックの優位点から見ると、${option} がより安全な選択です。`,
      reason: (label: string, value: string) => `${label}: 検証済みの数値で優位 (${value})`,
      neutral: "未確認スペックは使わず、公式比較表の項目だけで判断しました。",
      detail: "Axisは検証済みスペック表の客観的な優位点が多い選択肢を選びました。数値化できない項目や欠損値は採点していません。"
    };
  }
  return {
    conclusion: (option: string) => `검증된 스펙 우위 기준으로는 ${option}이(가) 더 안전한 선택입니다.`,
    reason: (label: string, value: string) => `${label}: 공식 확인 수치 우위 (${value})`,
    neutral: "확인되지 않은 스펙은 쓰지 않고, 공식 비교표의 항목만 기준으로 판단했습니다.",
    detail: "Axis는 검증된 스펙표에서 객관적으로 우위가 많은 선택지를 골랐습니다. 수치화할 수 없거나 비어 있는 항목은 점수에 반영하지 않았습니다."
  };
}

function buildDeterministicDecision(
  options: string[],
  category: Category,
  officialComparison: ComparisonRow[],
  officialSources: (string | undefined)[],
  officialSourceMeta: (OfficialSourceMeta | undefined)[],
  specCollectionNote: string,
  locale: Locale
): ComparisonResult {
  const scores = options.map(() => 0);
  const reasons: string[][] = options.map(() => []);
  const copy = deterministicCopy(locale);

  for (const row of officialComparison) {
    const field = resolveFieldByLabel(category, row.key);
    if (!field || field.better === "none") continue;

    const values = row.values.map(numericValue);
    if (values.some((value) => value === null)) continue;
    const numbers = values.map((value) => value ?? 0);
    const target = field.better === "higher" ? Math.max(...numbers) : Math.min(...numbers);
    const winners = numbers
      .map((value, index) => ({ value, index }))
      .filter((item) => item.value === target);
    if (winners.length !== 1) continue;

    const winner = winners[0];
    scores[winner.index] += 1;
    reasons[winner.index].push(copy.reason(row.key, row.values[winner.index] ?? String(target)));
  }

  const selectedIndex = scores
    .map((score, index) => ({ score, index }))
    .sort((a, b) => b.score - a.score || a.index - b.index)[0]?.index ?? 0;
  const selectedOption = options[selectedIndex] ?? options[0] ?? "";
  const selectedReasons = reasons[selectedIndex]?.slice(0, 4) ?? [];

  return {
    selectedOption,
    category,
    options,
    locale,
    status: "ok",
    oneLineConclusion: copy.conclusion(selectedOption),
    reasons: selectedReasons.length ? selectedReasons : [copy.neutral],
    comparison: officialComparison,
    detail: copy.detail,
    analyses: options.map(() => ""),
    officialSources,
    officialSourceMeta,
    specCollectionNote,
    verification: gradeVerification(category, officialComparison)
  };
}

/**
 * Decide-lite: verified spec table + deterministic score.
 * No AI chat verdict. Non-laptop queries are rejected.
 */
export async function buildDecision(
  query: string,
  maxOptionsAllowed = 2,
  locale: Locale = "ko",
  country: Country = countryForLocale(locale),
  _userContext?: string
): Promise<ComparisonResult> {
  const cached = await getCachedComparison(query, locale, country);
  if (cached) return cached;

  const parsed = parseOptions(query);
  const dict = getDictionary(locale);

  const expanded = expandComparisonOptions(parsed, Math.min(2, Math.max(2, maxOptionsAllowed)), locale);
  while (expanded.length < 2) {
    expanded.push(dict.input.optionSlot(expanded.length + 1));
  }

  const expandedQuery = buildQuery(expanded);
  const category = detectCategory(`${query} ${expandedQuery}`);

  // KR·노트북 집중: 다른 카테고리는 지원하지 않음
  if (category !== "laptop") {
    return buildProductNotFoundDecision(
      expanded,
      category,
      expanded,
      locale
    );
  }

  const options = expanded.map((option) => localizeDisplayName(option, category, country, locale));

  const sourceCandidates = await Promise.all(
    options.map((option) => resolveComparableSource(option, category, country))
  );
  const missingOptions = missingOfficialProducts(options, sourceCandidates);

  if (missingOptions.length > 0) {
    await Promise.all(
      missingOptions.map((name) =>
        logSearchMiss({ productName: name, category, country, locale })
      )
    );
    if (missingOptions.length === options.length || !getCategorySchema(category)) {
      return buildProductNotFoundDecision(options, category, missingOptions, locale);
    }
  }

  const scrapedSpecs = await Promise.all(
    options.map((option, index) =>
      collectOfficialExtractedSpecs(option, category, sourceCandidates[index] ?? null)
    )
  );

  const officialSpecs = enrichWithDatasetFallback(scrapedSpecs, options, category, country);
  const officialSourceMeta = officialSourceMetadata(officialSpecs, sourceCandidates);
  const officialSources = officialSourceUrls(officialSourceMeta);
  const specCollectionNote = scrapedSpecs.some((s) => s !== null)
    ? "공식 페이지 추출 검증"
    : officialSpecs.some((s) => s !== null)
      ? "검증 데이터셋 기반"
      : "스펙 없음";

  const comparison = buildExtractedComparisonTable(category, officialSpecs, locale);
  if (comparison.length === 0) {
    return buildVerificationPendingDecision(
      options,
      category,
      officialSources,
      officialSourceMeta,
      locale
    );
  }

  const result = buildDeterministicDecision(
    options,
    category,
    comparison,
    officialSources,
    officialSourceMeta,
    specCollectionNote,
    locale
  );
  void setCachedComparison(query, locale, country, result);
  return result;
}
