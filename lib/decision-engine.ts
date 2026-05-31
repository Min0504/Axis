import { categoryTemplateMap, detectCategory } from "@/lib/category";
import { runAiDecision, isAiConfigured } from "@/lib/ai/decide";
import { buildFallbackDecision } from "@/lib/decision-engine-fallback";
import { collectOfficialSpecs } from "@/lib/specs/collect";
import { buildOfficialComparisonTable } from "@/lib/specs/compare-table";
import { safeHttpUrl } from "@/lib/safe-url";
import type { ComparisonResult, ComparisonRow } from "@/lib/types";

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

const isOfficialSpecsEnabled = () => process.env.AXIS_OFFICIAL_SPECS === "true";

/** Ensure each comparison row has exactly `count` values. */
function padValues(values: string[] | undefined, count: number): string[] {
  const v = Array.isArray(values) ? values.slice(0, count) : [];
  while (v.length < count) v.push("—");
  return v;
}

export async function buildDecision(query: string, maxOptionsAllowed = 2): Promise<ComparisonResult> {
  const parsed = parseOptions(query);

  // Clamp to the caller's allowed option count, ensure at least two labels.
  const options = parsed.slice(0, Math.max(2, maxOptionsAllowed));
  while (options.length < 2) {
    options.push(`선택지 ${options.length + 1}`);
  }

  const category = detectCategory(query);

  const aiPayload = await runAiDecision({
    options,
    category,
    templateKeys: categoryTemplateMap[category]
  });

  if (!aiPayload) {
    return buildFallbackDecision(options, category, isAiConfigured() ? "ai-failed" : "no-key");
  }

  let comparison: ComparisonRow[] = aiPayload.comparison.map((row) => ({
    key: row.key,
    values: padValues(row.values, options.length)
  }));

  // Default: official product-page links the AI supplied (validated), aligned
  // to options. The verified scraper can override these below.
  let officialSources: ComparisonResult["officialSources"] = options.map((_, i) =>
    safeHttpUrl(aiPayload.officialUrls?.[i])
  );
  let specCollectionNote: string | undefined;

  if (isOfficialSpecsEnabled()) {
    const products = await Promise.all(
      options.map((opt) => collectOfficialSpecs(opt).catch(() => null))
    );

    if (products.some((p) => p?.specs.length)) {
      comparison = buildOfficialComparisonTable(products);
      officialSources = products.map((p, i) => p?.officialUrl ?? officialSources?.[i]);
      specCollectionNote = "공식 스펙 기준";
    } else {
      specCollectionNote = "공식 페이지 링크 제공 · 값은 AI 정리";
    }
  }

  return {
    selectedOption: aiPayload.selectedOption,
    category,
    options,
    oneLineConclusion: aiPayload.oneLineConclusion,
    reasons: aiPayload.reasons.slice(0, 5),
    comparison,
    detail: aiPayload.detail,
    analyses: options.map((_, i) => aiPayload.analyses?.[i] ?? ""),
    officialSources,
    specCollectionNote
  };
}
