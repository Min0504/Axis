import { categoryTemplateMap, detectCategory } from "@/lib/category";
import { runAiDecision } from "@/lib/ai/decide";
import { buildFallbackDecision } from "@/lib/decision-engine-fallback";
import { collectOfficialSpecs } from "@/lib/specs/collect";
import { buildOfficialComparisonTable } from "@/lib/specs/compare-table";
import type { ComparisonResult } from "@/lib/types";

export function parseOptions(query: string): { a: string; b: string } {
  const parts = query.split(/\s+vs\s+|\s+VS\s+|\svs\s|\s대\s/i).map((v) => v.trim()).filter(Boolean);

  if (parts.length >= 2) {
    return { a: parts[0], b: parts[1] };
  }

  return { a: "", b: "" };
}

export function buildQuery(optionA: string, optionB: string) {
  return `${optionA.trim()} vs ${optionB.trim()}`;
}

const isOfficialSpecsEnabled = () => process.env.AXIS_OFFICIAL_SPECS === "true";

export async function buildDecision(query: string): Promise<ComparisonResult> {
  const { a, b } = parseOptions(query);
  const optionA = a || "선택지 A";
  const optionB = b || "선택지 B";
  const category = detectCategory(query);

  const aiPayload = await runAiDecision({
    optionA,
    optionB,
    category,
    templateKeys: categoryTemplateMap[category]
  });

  if (!aiPayload) {
    return buildFallbackDecision(optionA, optionB, category);
  }

  let comparison = aiPayload.comparison;
  let officialSources: ComparisonResult["officialSources"];
  let specCollectionNote: string | undefined;

  if (isOfficialSpecsEnabled()) {
    const [productA, productB] = await Promise.all([
      collectOfficialSpecs(optionA).catch(() => null),
      collectOfficialSpecs(optionB).catch(() => null)
    ]);

    if (productA?.specs.length || productB?.specs.length) {
      comparison = buildOfficialComparisonTable(productA, productB);
      officialSources = { a: productA?.officialUrl, b: productB?.officialUrl };
    } else {
      specCollectionNote = "공식 스펙 수집 실패 · AI 비교표 사용";
    }
  }

  return {
    selectedOption: aiPayload.selectedOption,
    category,
    oneLineConclusion: aiPayload.oneLineConclusion,
    reasons: aiPayload.reasons.slice(0, 5),
    comparison,
    detail: aiPayload.detail,
    officialSources,
    specCollectionNote
  };
}
