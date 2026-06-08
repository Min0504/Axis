import type { Category, ComparisonResult } from "@/lib/types";

export function buildFallbackDecision(
  options: string[],
  category: Category,
  reason: "no-key" | "ai-failed" = "no-key"
): ComparisonResult {
  // Deterministic placeholder pick (longest name) used when AI is unavailable.
  // The returned copy must make the temporary status clear to users.
  const selectedOption = options.reduce((a, b) => (a.length >= b.length ? a : b), options[0] ?? "");

  const reasonLine =
    reason === "ai-failed"
      ? "실시간 분석이 지연되어 기본 비교 기준으로 임시 결론을 생성했습니다."
      : "현재 기본 비교 기준으로 임시 결론을 생성했습니다.";

  const detail =
    reason === "ai-failed"
      ? "잠시 후 다시 시도하면 더 정확한 상황별 분석을 받을 수 있습니다."
      : "공식 스펙과 상황별 기준을 연결하면 더 정교한 구매 판단을 제공할 수 있습니다.";

  return {
    selectedOption,
    category,
    options,
    oneLineConclusion: `이번에는 ${selectedOption}을(를) 선택하는 것이 더 적합합니다.`,
    reasons: [
      `${selectedOption}이(가) ${category} 용도에서 더 실용적인 선택입니다.`,
      `다른 선택지 대비 선택 피로가 더 낮습니다.`,
      reasonLine
    ],
    comparison: [],
    analyses: options.map((opt) =>
      opt === selectedOption
        ? `${opt}은(는) 이번 비교에서 가장 균형 잡힌 선택입니다.`
        : `${opt}도 좋은 선택지이지만 이번에는 우선순위가 낮습니다.`
    ),
    detail,
    specCollectionNote: reason === "ai-failed" ? "실시간 분석 지연 · 임시 결론" : "기본 비교 기준 · 임시 결론",
    verification: "unverified"
  };
}
