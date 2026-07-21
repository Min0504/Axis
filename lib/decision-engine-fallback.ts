import type { Category, ComparisonResult } from "@/lib/types";

/**
 * Temporary unavailable result when AI cannot run.
 * Must NOT invent a winner — verification-gate rules forbid hardcoded recommendations.
 */
export function buildFallbackDecision(
  options: string[],
  category: Category,
  reason: "no-key" | "ai-failed" = "no-key"
): ComparisonResult {
  const reasonLine =
    reason === "ai-failed"
      ? "실시간 분석이 지연되어 지금은 추천 결론을 내릴 수 없습니다."
      : "AI 키가 없어 지금은 추천 결론을 내릴 수 없습니다.";

  const detail =
    reason === "ai-failed"
      ? "잠시 후 다시 시도하면 상황별 분석을 받을 수 있습니다."
      : "서버에 AI 프로바이더를 설정한 뒤 다시 비교해 주세요.";

  return {
    selectedOption: "일시적으로 결론을 낼 수 없습니다",
    category,
    options,
    status: "verification_pending",
    oneLineConclusion: "지금은 추천을 확정하지 않습니다. 잠시 후 다시 시도해 주세요.",
    reasons: [reasonLine, "가짜 승자·하드코딩 추천은 제공하지 않습니다.", detail],
    comparison: [],
    analyses: options.map((opt) => `${opt}: 분석 대기 중`),
    detail,
    specCollectionNote:
      reason === "ai-failed" ? "실시간 분석 지연 · 결론 보류" : "AI 미설정 · 결론 보류",
    verification: "unverified"
  };
}
