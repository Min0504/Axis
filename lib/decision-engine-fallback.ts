import { categoryTemplateMap } from "@/lib/category";
import type { Category } from "@/lib/types";
import type { ComparisonResult } from "@/lib/types";

export function buildFallbackDecision(optionA: string, optionB: string, category: Category): ComparisonResult {
  const selectedOption = optionA.length >= optionB.length ? optionA : optionB;
  const otherOption = selectedOption === optionA ? optionB : optionA;

  return {
    selectedOption,
    category,
    oneLineConclusion: `이번에는 ${selectedOption}을(를) 선택하는 것이 더 적합합니다.`,
    reasons: [
      `${selectedOption}이(가) ${category} 용도에서 더 실용적인 선택입니다.`,
      `${otherOption} 대비 결정 피로가 더 낮습니다.`,
      `AI API 키가 없어 임시 규칙으로 결론을 생성했습니다.`
    ],
    comparison: categoryTemplateMap[category].map((key) => ({
      key,
      a: `${optionA} 관점`,
      b: `${optionB} 관점`
    })),
    detail:
      "OpenAI, Gemini, Anthropic API 키 중 하나를 .env.local에 설정하면 Axis AI가 실제 의사결정 분석을 수행합니다.",
    specCollectionNote: "AI 미연결 · 임시 결론"
  };
}
