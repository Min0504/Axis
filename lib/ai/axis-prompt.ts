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
  const optionLines = input.options.map((opt, i) => `Option ${i + 1}: ${opt}`).join("\n");
  const optionListJson = JSON.stringify(input.options);
  const officialSpecs = input.officialSpecs
    ?.map((spec, i) => ({
      option: input.options[i],
      source: spec?.source ?? null,
      specs: spec?.specs ?? null
    })) ?? [];
  const officialSpecsJson = JSON.stringify(officialSpecs, null, 2);
  const language = LANGUAGE_NAME[input.locale ?? "ko"];

  return `Compare the following options and pick exactly one winner.

${optionLines}
Category: ${input.category}
Spec fields to fill (use these exact strings as "key" in comparison): ${input.templateKeys.join(", ")}
Response language: ${language}
Official spec context (use ONLY these values — never fabricate):
${officialSpecsJson}

Bilingual product recognition:
- Treat Korean and English names as identical products.
  Examples: "에어팟 프로" = "AirPods Pro", "갤럭시 버즈" = "Galaxy Buds", "아이폰 16" = "iPhone 16"
- When spec context is sparse or missing, ALWAYS draw on your training knowledge of official specs.
  Never default to "정보 없음" just because the context is empty — use what you know.

Output JSON schema:
{
  "selectedOption": "exact string matching one of the options above",
  "oneLineConclusion": "one-line verdict in ${language}",
  "reasons": ["reason1", "reason2", "reason3"],
  "comparison": [{ "key": "<field from spec fields list>", "values": ["option1 value", "option2 value", ...] }],
  "detail": "detailed explanation in ${language} (concise)",
  "officialUrls": ["option1 official URL", "option2 official URL", ...],
  "analyses": ["option1 pros/cons/who-it-suits (2-3 sentences)", "option2 pros/cons/who-it-suits"]
}

Hard rules:
- ALL text (oneLineConclusion, reasons, detail, analyses) MUST be in ${language}.
- comparison must include EVERY key from the spec fields list above — no omissions.
- Each comparison "values" array must have exactly ${input.options.length} entries, in the same order as the options.
- For the model name field (모델명 / Model): use the EXACT official product name from spec context (e.g. "iPhone 16", "Galaxy S25"). Never use a generic or modified name.
- For fields present in the spec context (chipset, battery, weight, etc.): copy those values verbatim.
- For fields NOT in the spec context (출시일, 출시가격, 램, 충전 speed, etc.): fill with your best knowledge of the product's official specs. Do NOT write "정보 없음" / "N/A" unless the value is genuinely unknown.
- officialUrls: use only URLs from official spec context "source" fields. Use "" if missing.
- selectedOption MUST exactly match one of: ${optionListJson}
- Never fabricate numeric specs that conflict with the official spec context values.`;
}
