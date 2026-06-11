import { detectCategory } from "@/lib/category";
import { runAiDecision, isAiConfigured } from "@/lib/ai/decide";
import { expandComparisonOptions } from "@/lib/query-expansion";
import { extractProductSpecs } from "@/lib/specs/extract/pipeline";
import { buildExtractedComparisonTable } from "@/lib/specs/extracted-table";
import { discoverOfficialUrl, isOfficialUrl } from "@/lib/specs/extract/discover";
import { resolveOfficialProduct, resolveProductSource } from "@/lib/specs/product-registry";
import { fieldLabelForLocale, getCategorySchema, primaryFieldKeys, resolveFieldByLabel, schemaFieldLabelsForLocale } from "@/lib/specs/schema";
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

const UNIT_MAP_EN: Record<string, string> = {
  "인치": "in",
  "시간": "h",
  "원": "KRW"
};

function localizedUnit(unit: string, locale: Locale): string {
  if (locale === "en") return UNIT_MAP_EN[unit] ?? unit;
  return unit;
}

function appendUnitIfNeeded(value: string, unit: string | undefined, locale: Locale): string {
  if (!unit) return value;
  const u = localizedUnit(unit, locale);
  const normalized = value.toLowerCase().replace(/\s/g, "");
  if (normalized.includes(u.toLowerCase())) return value;
  return `${value}${u}`;
}

/**
 * Build the final comparison table by combining:
 *   1. AI comparison rows  — the AI fills ALL schema fields in order, including
 *      fields the official page doesn't list (출시일, 출시가격, 램, 충전 speed, etc.)
 *      using its training knowledge of official product specs.
 *   2. Officially-scraped values  — where the official page DID provide a value,
 *      replace the AI value with the scraped one and attach the source URL so the
 *      row is marked as sourced (drives the verification badge).
 *
 * Value-level override (per product, per field) means a row like:
 *   chipset: ["A18 ← scraped+sourced", "Snapdragon 8 Elite ← scraped+sourced"]
 * and:
 *   출시가격: ["125만원부터 ← AI knowledge", "99만원부터 ← AI knowledge"]
 * both appear in the table, in the user-specified schema order.
 */
function buildFinalComparison(
  aiRows: ComparisonRow[],
  extractedSpecs: (ExtractedSpecs | null)[],
  category: Category,
  locale: Locale
): ComparisonRow[] {
  const schema = getCategorySchema(category);
  if (!schema) return aiRows;

  // Index AI rows by field key (locale-agnostic, handles Korean ↔ English ↔ Japanese)
  const aiByKey = new Map<string, ComparisonRow>();
  for (const row of aiRows) {
    const field = resolveFieldByLabel(category, row.key);
    if (field) aiByKey.set(field.key, row);
  }

  const result: ComparisonRow[] = [];

  for (const field of schema.fields) {
    const aiRow = aiByKey.get(field.key);

    // Per-product scraped values for this field
    const scrapedValues = extractedSpecs.map((spec) => {
      const v = spec?.specs[field.key];
      return v && isMeaningful(v) ? v : null;
    });
    const hasScraped = scrapedValues.some((v) => v !== null);

    // Skip field entirely only if AI didn't produce it AND nothing was scraped
    if (!aiRow && !hasScraped) continue;

    const label = fieldLabelForLocale(field, locale);

    // Base values come from AI (guarantees completeness)
    const aiValues = aiRow?.values ?? extractedSpecs.map(() => "—");

    // Per-product override: scraped value wins where available (more authoritative)
    const finalValues = aiValues.map((aiVal, i) => {
      const sv = scrapedValues[i];
      if (!sv) return aiVal;
      // Append localized unit to bare numeric values from the scraper
      return field.type === "numeric" && field.unit
        ? appendUnitIfNeeded(sv, field.unit, locale)
        : sv;
    });

    // Attach official source URLs only for positions where the scraper had the value
    const sources = hasScraped
      ? extractedSpecs.map((spec, i) => (scrapedValues[i] ? spec?.source : undefined))
      : undefined;

    result.push({ key: label, values: finalValues, sources });
  }

  return result;
}

export async function buildDecision(
  query: string,
  maxOptionsAllowed = 2,
  locale: Locale = "ko",
  country: Country = countryForLocale(locale),
  userContext?: string
): Promise<ComparisonResult> {
  // Tailored re-analysis (user situation) must never read or write the shared
  // cache — the verdict is personalized, so each request runs fresh.
  const tailored = Boolean(userContext?.trim());

  // Check 24h cache before doing any network work
  if (!tailored) {
    const cached = await getCachedComparison(query, locale, country);
    if (cached) return cached;
  }

  const parsed = parseOptions(query);
  const dict = getDictionary(locale);

  // Clamp to the caller's allowed option count, ensure at least two labels.
  const expanded = expandComparisonOptions(parsed, Math.max(2, maxOptionsAllowed), locale);
  while (expanded.length < 2) {
    expanded.push(dict.input.optionSlot(expanded.length + 1));
  }

  const expandedQuery = buildQuery(expanded);
  const category = detectCategory(`${query} ${expandedQuery}`);

  // Normalize every option to its locale display name (한글 입력 → 영어 로케일이면
  // "iPhone 16"으로 통일). 카탈로그에 없는 제품은 입력 그대로 유지. 이렇게 하면
  // 비교표 헤더·AI 입력·구매 링크 검색어가 항상 사용자 로케일과 일치한다.
  const options = expanded.map((option) => localizeDisplayName(option, category, country, locale));

  const sourceCandidates = await Promise.all(
    options.map((option) => resolveComparableSource(option, category, country))
  );
  const missingOptions = missingOfficialProducts(options, sourceCandidates);

  if (missingOptions.length > 0) {
    // Log missing products for coverage analysis regardless
    await Promise.all(
      missingOptions.map((name) =>
        logSearchMiss({ productName: name, category, country, locale })
      )
    );

    // Hard-stop when ALL products are missing — none of the requested items exist in
    // our catalog or discoverable official URLs. This covers genuinely unknown or
    // fictional products (e.g. "아이폰 19 vs 아이폰 20").
    //
    // When only SOME are missing in a schematized category (smartphone, earphones…),
    // the AI has reliable training knowledge for popular products not yet in our
    // registry — e.g. a newly released earphone. We proceed so the user gets a
    // result rather than a dead "not found" screen.
    const allMissing = missingOptions.length === options.length;
    if (allMissing || !getCategorySchema(category)) {
      return buildProductNotFoundDecision(options, category, missingOptions, locale);
    }
  }

  // ── Scrape official pages in parallel (null for products without a source) ─
  const scrapedSpecs = await Promise.all(
    options.map((option, index) => collectOfficialExtractedSpecs(option, category, sourceCandidates[index] ?? null))
  );

  // ── Enrich with dataset fallback where scraping returned null ─────────────
  // JS-rendered pages (Samsung accessories, Sony importer) return null from static
  // HTML scraping. Inject the pre-verified dataset entry as context so the AI always
  // has concrete values to echo, and source URLs appear in the comparison table.
  const officialSpecs = enrichWithDatasetFallback(scrapedSpecs, options, category, country);

  const officialSourceMeta = officialSourceMetadata(officialSpecs, sourceCandidates);
  const officialSources = officialSourceUrls(officialSourceMeta);
  const specCollectionNote = scrapedSpecs.some((s) => s !== null)
    ? "공식 페이지 추출 검증"
    : officialSpecs.some((s) => s !== null)
    ? "검증 데이터셋 기반"
    : "AI 지식 기반";

  // ── Run AI with scraped + dataset context ─────────────────────────────────
  // The AI fills ALL schema fields in order. For fields present in context, it echoes
  // verbatim. For fields not in context (출시일 etc.), it fills from training knowledge.
  const aiPayload = await runAiDecision({
    options,
    category,
    locale,
    templateKeys: schemaFieldLabelsForLocale(category, locale),
    officialSpecs: officialSpecs.map((spec) =>
      spec ? { source: spec.source, specs: spec.specs } : null
    ),
    userContext
  });

  if (!aiPayload) {
    // AI unavailable — fall back to scraped-only deterministic comparison
    const scrapedComparison = buildExtractedComparisonTable(category, officialSpecs, locale);
    if (scrapedComparison.length === 0) {
      return buildVerificationPendingDecision(
        options,
        category,
        officialSources,
        officialSourceMeta,
        locale
      );
    }
    const deterministicResult = buildDeterministicDecision(
      options,
      category,
      scrapedComparison,
      officialSources,
      officialSourceMeta,
      specCollectionNote,
      locale
    );
    if (!tailored) void setCachedComparison(query, locale, country, deterministicResult);
    return deterministicResult;
  }

  // ── Build final comparison (value-level merge) ────────────────────────────
  // AI rows provide all fields in schema order.
  // Scraped values override AI values per-position where the official page had them,
  // and carry source URLs so those cells get the "sourced" verification badge.
  const comparison = buildFinalComparison(
    aiPayload.comparison ?? [],
    officialSpecs,
    category,
    locale
  );

  const finalResult: ComparisonResult = {
    selectedOption: aiPayload.selectedOption,
    category,
    options,
    locale,
    status: "ok",
    oneLineConclusion: aiPayload.oneLineConclusion,
    reasons: aiPayload.reasons.slice(0, 5),
    comparison,
    detail: aiPayload.detail,
    analyses: options.map((_, i) => aiPayload.analyses?.[i] ?? ""),
    officialSources,
    officialSourceMeta,
    specCollectionNote,
    verification: gradeVerification(category, comparison)
  };
  if (!tailored) void setCachedComparison(query, locale, country, finalResult);
  return finalResult;
}
