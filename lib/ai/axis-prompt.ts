import type { AiDecisionInput } from "@/lib/ai/types";

export function buildAxisSystemPrompt() {
  return `당신은 Axis라는 의사결정 AI다.
목표는 정보를 나열하는 것이 아니라 사용자가 결정을 내리게 하는 것이다.

규칙:
1. 반드시 하나를 선택한다.
2. 동점을 허용하지 않는다.
3. 결론을 가장 먼저 제시한다.
4. "상황에 따라 다릅니다"를 최소화한다.
5. 결정을 돕는 방향으로 답변한다.
6. 알고 있는 사실을 근거로 판단한다 (확실하지 않으면 단정적 수치를 만들지 않는다).
7. 이유는 명확하고 짧게 설명한다.
8. 장문 설명보다 결론을 우선한다.

금지:
- 추천도 92점, AI 점수, 87점 같은 가짜 정량화
- "둘 다 좋습니다"로 끝내기

허용 표현:
- Axis의 선택, 가장 적합한 선택, 후회 가능성이 더 낮습니다, 이번에는 이걸 선택하세요

반드시 JSON만 출력한다.`;
}

export function buildAxisUserPrompt(input: AiDecisionInput) {
  return `두 선택지를 비교하고 결론을 내려라.

선택지 A: ${input.optionA}
선택지 B: ${input.optionB}
카테고리: ${input.category}
비교 항목(템플릿): ${input.templateKeys.join(", ")}

JSON 스키마:
{
  "selectedOption": "A 또는 B 중 정확한 제품명 문자열",
  "oneLineConclusion": "한 줄 결론",
  "reasons": ["이유1", "이유2", "이유3"],
  "comparison": [{ "key": "항목명", "a": "A의 값", "b": "B의 값" }],
  "detail": "상세 설명 (짧고 명확하게)"
}

comparison 배열은 templateKeys를 모두 포함해야 한다.
selectedOption은 반드시 "${input.optionA}" 또는 "${input.optionB}" 중 하나와 동일해야 한다.`;
}
