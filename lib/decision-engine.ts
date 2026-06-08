import { categoryTemplateMap, detectCategory } from "@/lib/category";
import { runAiDecision, isAiConfigured } from "@/lib/ai/decide";
import { expandComparisonOptions } from "@/lib/query-expansion";
import { extractProductSpecs } from "@/lib/specs/extract/pipeline";
import { buildExtractedComparisonTable } from "@/lib/specs/extracted-table";
import { discoverOfficialUrl } from "@/lib/specs/extract/discover";
import { resolveOfficialProduct, resolveProductSource } from "@/lib/specs/product-registry";
import { primaryFieldKeys, resolveFieldByLabel } from "@/lib/specs/schema";
import {
  isMeaningful,
  verificationLevel,
  type GradedSpec,
  type SpecSourceTier
} from "@/lib/specs/source";
import { safeHttpUrl } from "@/lib/safe-url";
import { countryForLocale, getDictionary, type Country, type Locale } from "@/lib/i18n";
import type { Category, ComparisonResult, ComparisonRow, OfficialSourceMeta } from "@/lib/types";
import type { ProductSourceCandidate } from "@/lib/specs/types";
import { logSearchMiss } from "@/lib/search-miss-log";
import { getCachedComparison, setCachedComparison } from "@/lib/comparison-cache";

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

  const discoveredUrl = await discoverOfficialUrl(productName, category, { country });
  if (!discoveredUrl) return null;
  return { url: discoveredUrl, tier: 2, kind: "manufacturer" };
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

export async function buildDecision(
  query: string,
  maxOptionsAllowed = 2,
  locale: Locale = "ko",
  country: Country = countryForLocale(locale)
): Promise<ComparisonResult> {
  // Check 24h cache before doing any network work
  const cached = await getCachedComparison(query, locale, country);
  if (cached) return cached;

  const parsed = parseOptions(query);

  // Clamp to the caller's allowed option count, ensure at least two labels.
  const options = expandComparisonOptions(parsed, Math.max(2, maxOptionsAllowed), locale);
  while (options.length < 2) {
    options.push(`선택지 ${options.length + 1}`);
  }

  const expandedQuery = buildQuery(options);
  const category = detectCategory(`${query} ${expandedQuery}`);
  const sourceCandidates = await Promise.all(
    options.map((option) => resolveComparableSource(option, category, country))
  );
  const missingOptions = missingOfficialProducts(options, sourceCandidates);
  if (missingOptions.length > 0) {
    // Log each unresolved product for coverage analysis
    await Promise.all(
      missingOptions.map((name) =>
        logSearchMiss({ productName: name, category, country, locale })
      )
    );
    return buildProductNotFoundDecision(options, category, missingOptions, locale);
  }

  const officialSpecs = await Promise.all(
    options.map((option, index) => collectOfficialExtractedSpecs(option, category, sourceCandidates[index] ?? null))
  );
  const officialComparison = buildExtractedComparisonTable(category, officialSpecs, locale);
  const officialSourceMeta = officialSourceMetadata(officialSpecs, sourceCandidates);
  const officialSources = officialSourceUrls(officialSourceMeta);
  const specCollectionNote =
    officialComparison.length > 0 ? "공식 페이지 추출 검증" : "공식 스펙 검증 대기";

  if (officialComparison.length === 0) {
    return buildVerificationPendingDecision(
      options,
      category,
      officialSources,
      officialSourceMeta,
      locale
    );
  }

  const aiPayload = await runAiDecision({
    options,
    category,
    locale,
    templateKeys: categoryTemplateMap[category],
    officialSpecs: officialSpecs.map((spec) =>
      spec ? { source: spec.source, specs: spec.specs } : null
    )
  });

  if (!aiPayload) {
    const deterministicResult = buildDeterministicDecision(
      options,
      category,
      officialComparison,
      officialSources,
      officialSourceMeta,
      specCollectionNote,
      locale
    );
    void setCachedComparison(query, locale, country, deterministicResult);
    return deterministicResult;
  }

  const finalResult: ComparisonResult = {
    selectedOption: aiPayload.selectedOption,
    category,
    options,
    locale,
    status: "ok",
    oneLineConclusion: aiPayload.oneLineConclusion,
    reasons: aiPayload.reasons.slice(0, 5),
    comparison: officialComparison,
    detail: aiPayload.detail,
    analyses: options.map((_, i) => aiPayload.analyses?.[i] ?? ""),
    officialSources,
    officialSourceMeta,
    specCollectionNote,
    verification: gradeVerification(category, officialComparison)
  };
  void setCachedComparison(query, locale, country, finalResult);
  return finalResult;
}
