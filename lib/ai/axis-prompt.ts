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
9. 스펙 수치는 반드시 실생활 의미로 번역한다:
   - 배터리(mAh/시간) → "유튜브 X시간, 이틀 충전 없이 가능" 같은 표현
   - RAM → "크롬 탭 X개 동시, 영상편집 가능/불가" 같은 표현
   - 무게(g) → "A4 교과서와 비슷", "장시간 들면 손목 부담" 같은 표현
   - 주사율(Hz) → "스크롤이 X배 더 부드럽게", "게임 시 끊김 없음" 같은 표현
   - 카메라(MP) → 화소 숫자 대신 "야간 사진 깔끔", "4K 영상 가능" 같은 표현
   숫자만 나열하지 말고 초보자가 바로 이해할 수 있는 일상 언어로 설명한다.

금지:
- 추천도 92점, AI 점수, 87점 같은 가짜 정량화
- "둘 다 좋습니다"로 끝내기
- 공식 확인 없는 URL 생성
- "120Hz라서 더 부드럽습니다" (숫자+단순 결론) 대신 "120Hz로 스크롤·게임이 60Hz의 두 배 부드럽게 느껴집니다"처럼 구체적으로
- 한자(漢字) 혼용 절대 금지. 한국어 응답은 순 한글로만 쓴다 (예: "배터리 寿命" ❌ → "배터리 수명" ✅, "高주사율" ❌ → "고주사율" ✅). 응답 언어가 영어/일본어면 그 언어의 표기만 쓴다.

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

  const userContextBlock = input.userContext?.trim()
    ? `
User's situation (THIS IS THE PRIORITY — tailor the verdict to it):
"${input.userContext.trim()}"
- Weight selectedOption toward what best fits THIS user's use case and budget, even if a different option wins on raw specs.
- In reasons and analyses, explicitly connect the pick to the user's stated needs (e.g. "게임 위주라면 주사율이 높은 …가 체감 차이가 큽니다").
- If budget is stated, factor in value-for-money, not just top specs.
`
    : "";

  return `Compare the following options and pick exactly one winner.

${optionLines}
Category: ${input.category}
Spec fields to fill (use these exact strings as "key" in comparison): ${input.templateKeys.join(", ")}
Response language: ${language}
Official spec context (use ONLY these values — never fabricate):
${officialSpecsJson}
${userContextBlock}
Bilingual product recognition:
- Treat Korean and English names as identical products.
  Examples: "에어팟 프로" = "AirPods Pro", "갤럭시 버즈" = "Galaxy Buds", "아이폰 16" = "iPhone 16"
- When spec context is sparse or missing, ALWAYS draw on your training knowledge of official specs.
  Never default to "정보 없음" just because the context is empty — use what you know.

How to write reasons & analyses (MOST IMPORTANT — this is what users read):
- Do NOT just state a spec number. Translate every spec advantage into a concrete real-life benefit.
  BAD: "배터리 5000mAh" / "주사율 120Hz"
  GOOD: "배터리가 5000mAh로 더 커서 헤비하게 써도 하루를 거뜬히 넘깁니다"
        "120Hz 화면이라 스크롤·게임이 눈에 띄게 부드럽습니다"
- Each reason = one spec the winner is better at + why that matters to a real person. 3 reasons, each a full sentence.
- analyses[i] = a 2-3 sentence verdict for THAT option: who it suits, its standout strength, and its main trade-off, all in everyday language ("~하는 사람에게 좋다", "~할 때 아쉽다").
- Be concrete and decisive. No "둘 다 좋습니다", no fake scores.

Output JSON schema:
{
  "selectedOption": "exact string matching one of the options above",
  "oneLineConclusion": "one-line verdict in ${language} — name the winner and the single biggest reason",
  "reasons": ["스펙 우위 → 실생활 장점 1", "스펙 우위 → 실생활 장점 2", "스펙 우위 → 실생활 장점 3"],
  "comparison": [{ "key": "<field from spec fields list>", "values": ["option1 value", "option2 value", ...] }],
  "detail": "detailed explanation in ${language} (concise, 2-4 sentences)",
  "officialUrls": ["option1 official URL", "option2 official URL", ...],
  "analyses": ["option1: 어울리는 사람 + 강점 + 약점을 초보자 언어로 2-3문장", "option2: 동일 형식"]
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
