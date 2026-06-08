import type { AiDecisionInput } from "@/lib/ai/types";

const LANGUAGE_NAME = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
} as const;

export function buildAxisSystemPrompt() {
  return `당신은 Axis라는 선택을 돕는 AI다.
목표는 정보를 나열하는 것이 아니라 사용자가 선택하게 하는 것이다.

규칙:
1. 반드시 선택지 중 하나를 선택한다.
2. 동점을 허용하지 않는다.
3. 결론을 가장 먼저 제시한다.
4. "상황에 따라 다릅니다"를 최소화한다.
5. 선택을 돕는 방향으로 답변한다.
6. 알고 있는 사실을 근거로 판단한다 (확실하지 않은 스펙 수치는 만들지 않는다).
7. 이유는 명확하고 짧게 설명한다.
8. 장문 설명보다 결론을 우선한다.

금지:
- 추천도 92점, AI 점수, 87점 같은 가짜 정량화
- "둘 다 좋습니다"로 끝내기
- 공식 확인 없는 URL 생성

반드시 JSON만 출력한다.`;
}

export function buildAxisUserPrompt(input: AiDecisionInput) {
  const optionLines = input.options.map((opt, i) => `선택지 ${i + 1}: ${opt}`).join("\n");
  const optionListJson = JSON.stringify(input.options);
  const officialSpecs = input.officialSpecs
    ?.map((spec, i) => ({
      option: input.options[i],
      source: spec?.source ?? null,
      specs: spec?.specs ?? null
    })) ?? [];
  const officialSpecsJson = JSON.stringify(officialSpecs, null, 2);
  const language = LANGUAGE_NAME[input.locale ?? "ko"];

  return `다음 선택지들을 비교하고 하나를 선택해 결론을 내려라.

${optionLines}
카테고리: ${input.category}
비교 항목(템플릿): ${input.templateKeys.join(", ")}
응답 언어: ${language}
공식 스펙 컨텍스트:
${officialSpecsJson}

JSON 스키마:
{
  "selectedOption": "선택한 항목의 정확한 이름 문자열",
  "oneLineConclusion": "한 줄 결론",
  "reasons": ["이유1", "이유2", "이유3"],
  "comparison": [{ "key": "항목명", "values": ["선택지1 값", "선택지2 값", ...] }],
  "detail": "상세 설명 (짧고 명확하게)",
  "officialUrls": ["선택지1 공식 페이지 URL", "선택지2 공식 페이지 URL", ...],
  "analyses": ["선택지1 상세 분석", "선택지2 상세 분석", ...]
}

규칙:
- 모든 문장과 판단은 응답 언어(${language})로 작성한다.
- 공식 스펙 컨텍스트에 없는 수치·정가·URL은 절대 만들지 않는다.
- comparison은 공식 스펙 컨텍스트에서 확인된 값만 기입한다. 없으면 "정보 없음"으로 둔다.
- 정가/MSRP는 공식 스펙 컨텍스트에 가격 필드가 있을 때만 언급한다.
- comparison 배열은 templateKeys를 모두 포함해야 한다.
- 각 comparison 항목의 "values"는 위 선택지 순서와 동일하게 ${input.options.length}개를 채운다.
- officialUrls는 공식 스펙 컨텍스트의 source만 사용한다. 없으면 빈 문자열("").
- analyses는 각 선택지별 장점·단점·어떤 사람에게 맞는지를 2~3문장으로 쓴다.
- selectedOption은 반드시 다음 중 하나와 동일해야 한다: ${optionListJson}`;
}
