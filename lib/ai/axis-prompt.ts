import type { AiDecisionInput } from "@/lib/ai/types";

export function buildAxisSystemPrompt() {
  return `당신은 Axis라는 의사결정 AI다.
목표는 정보를 나열하는 것이 아니라 사용자가 결정을 내리게 하는 것이다.

규칙:
1. 반드시 선택지 중 하나를 선택한다.
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
  const optionLines = input.options.map((opt, i) => `선택지 ${i + 1}: ${opt}`).join("\n");
  const optionListJson = JSON.stringify(input.options);

  return `다음 선택지들을 비교하고 하나를 선택해 결론을 내려라.

${optionLines}
카테고리: ${input.category}
비교 항목(템플릿): ${input.templateKeys.join(", ")}

JSON 스키마:
{
  "selectedOption": "선택한 항목의 정확한 이름 문자열",
  "oneLineConclusion": "한 줄 결론",
  "reasons": ["이유1", "이유2", "이유3"],
  "comparison": [{ "key": "항목명", "values": ["선택지1 값", "선택지2 값", ...] }],
  "detail": "상세 설명 (짧고 명확하게)"
}

규칙:
- comparison 배열은 templateKeys를 모두 포함해야 한다.
- 각 comparison 항목의 "values"는 위 선택지 순서와 동일하게 ${input.options.length}개를 채운다.
- selectedOption은 반드시 다음 중 하나와 동일해야 한다: ${optionListJson}`;
}
