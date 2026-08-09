import type { Locale } from "@/lib/i18n";
import type { AiDecisionInput } from "@/lib/ai/types";

const LANGUAGE_NAME = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
} as const;

type StyleHints = {
  bad: string;
  good: string;
  reasonShape: string;
  analysisShape: string;
  contextExample: string;
  unknown: string;
};

const STYLE_BY_LOCALE: Record<Locale, StyleHints> = {
  ko: {
    bad: '"배터리 5000mAh" / "주사율 120Hz"',
    good: '"배터리가 5000mAh로 더 커서 하루를 거뜬히 넘깁니다" / "120Hz라 스크롤·게임이 눈에 띄게 부드럽습니다"',
    reasonShape: "스펙 우위 → 실생활 장점 (완전한 한국어 문장)",
    analysisShape: "어울리는 사람 + 강점 + 약점을 초보자 언어로 2-3문장",
    contextExample: "게임 위주라면 주사율이 높은 …가 체감 차이가 큽니다",
    unknown: "정보 없음"
  },
  en: {
    bad: '"5000mAh battery" / "120Hz refresh rate"',
    good: '"The 5000mAh battery lasts a full heavy day" / "120Hz makes scrolling and games noticeably smoother"',
    reasonShape: "spec edge → real-life benefit (full English sentence)",
    analysisShape: "who it suits + standout strength + main trade-off in 2-3 plain English sentences",
    contextExample: "If you game a lot, the higher refresh rate on … is the difference you feel",
    unknown: "N/A"
  },
  ja: {
    bad: '"バッテリー5000mAh" / "リフレッシュレート120Hz"',
    good: '"5000mAhなのでヘビーに使っても1日持ちやすい" / "120Hzなのでスクロールやゲームが明らかに滑らか"',
    reasonShape: "スペック優位 → 実生活の利点（日本語の完全な文）",
    analysisShape: "向いている人 + 強み + 弱みを、初心者向けの日本語で2-3文",
    contextExample: "ゲーム中心なら、…の高いリフレッシュレートが体感差になります",
    unknown: "情報なし"
  }
};

/**
 * System rules for Axis decisions.
 * Language lock follows the UI locale — not the language of the typed query.
 */
export function buildAxisSystemPrompt(locale: Locale = "ko") {
  const language = LANGUAGE_NAME[locale];

  return `You are Axis, an AI that helps people choose what to buy.
Goal: make the user pick one option — not dump a list of facts.

Rules:
1. Always pick exactly one of the given options.
2. No ties.
3. Lead with the verdict.
4. Minimize "it depends".
5. Help the user decide.
6. Ground claims in known facts (do not invent uncertain numeric specs).
7. Keep reasons short and clear.
8. Prefer the conclusion over long essays.
9. Translate specs into everyday meaning (battery → hours of use, weight → carry feel, Hz → scroll/game smoothness). Never list raw numbers alone.

Language lock (ABSOLUTE):
- UI locale / response language = ${language}.
- The user may type product names or free text in Korean, English, or Japanese.
- ALWAYS write user-facing prose in ${language} only, regardless of the query language.
- Do not mix languages in oneLineConclusion, reasons, detail, or analyses.

Forbidden:
- Fake scores ("92 points", "AI score 87")
- Ending with "both are good"
- Inventing official URLs
- For Korean responses: no mixed Hanja (漢字). Use pure Hangul words.

Output JSON only.`;
}

export function buildAxisUserPrompt(input: AiDecisionInput) {
  const locale: Locale = input.locale ?? "ko";
  const language = LANGUAGE_NAME[locale];
  const style = STYLE_BY_LOCALE[locale];

  const optionLines = input.options.map((opt, i) => `Option ${i + 1}: ${opt}`).join("\n");
  const optionListJson = JSON.stringify(input.options);
  const officialSpecs = input.officialSpecs
    ?.map((spec, i) => ({
      option: input.options[i],
      source: spec?.source ?? null,
      specs: spec?.specs ?? null
    })) ?? [];
  const officialSpecsJson = JSON.stringify(officialSpecs, null, 2);

  const userContextBlock = input.userContext?.trim()
    ? `
User's situation (THIS IS THE PRIORITY — tailor the verdict to it):
"${input.userContext.trim()}"
- Weight selectedOption toward what best fits THIS user's use case and budget, even if a different option wins on raw specs.
- In reasons and analyses, explicitly connect the pick to the user's stated needs (e.g. "${style.contextExample}").
- If budget is stated, factor in value-for-money, not just top specs.
- Still write that explanation in ${language} only.
`
    : "";

  return `Compare the following options and pick exactly one winner.

${optionLines}
Category: ${input.category}
Spec fields to fill (use these exact strings as "key" in comparison): ${input.templateKeys.join(", ")}
Response language: ${language}

CRITICAL language rule:
- Settings language is ${language}.
- Product names above may already be localized, but the original query might have been in another language.
- Write oneLineConclusion, reasons, detail, and analyses ONLY in ${language}.
- Do NOT answer in the language of the typed query if it differs from ${language}.

Official spec context (use ONLY these values — never fabricate):
${officialSpecsJson}
${userContextBlock}
Bilingual product recognition:
- Treat Korean / English / Japanese names as the same product when they refer to the same model.
  Examples: "에어팟 프로" = "AirPods Pro", "갤럭시 버즈" = "Galaxy Buds", "아이폰 16" = "iPhone 16"
- When spec context is sparse or missing, use training knowledge of official specs.
  Never default to "${style.unknown}" just because context is empty — use what you know.

How to write reasons & analyses (what users actually read):
- Do NOT just state a spec number. Translate every advantage into a concrete real-life benefit.
  BAD: ${style.bad}
  GOOD: ${style.good}
- Each reason = one spec the winner is better at + why that matters. 3 reasons, each a full sentence in ${language}.
- analyses[i] = ${style.analysisShape}
- Be concrete and decisive. No "both are good", no fake scores.

Output JSON schema:
{
  "selectedOption": "exact string matching one of the options above",
  "oneLineConclusion": "one-line verdict in ${language} — name the winner and the single biggest reason",
  "reasons": ["${style.reasonShape} 1", "${style.reasonShape} 2", "${style.reasonShape} 3"],
  "comparison": [{ "key": "<field from spec fields list>", "values": ["option1 value", "option2 value", ...] }],
  "detail": "detailed explanation in ${language} (concise, 2-4 sentences)",
  "officialUrls": ["option1 official URL", "option2 official URL", ...],
  "analyses": ["option1 analysis in ${language}", "option2 analysis in ${language}"]
}

Hard rules:
- ALL text (oneLineConclusion, reasons, detail, analyses) MUST be in ${language}.
- comparison must include EVERY key from the spec fields list above — no omissions.
- Each comparison "values" array must have exactly ${input.options.length} entries, in the same order as the options.
- For the model name field: use the EXACT official product name from spec context. Never use a generic or modified name.
- For fields present in the spec context: copy those values verbatim.
- For fields NOT in the spec context: fill with best knowledge of official specs. Do NOT write "${style.unknown}" unless genuinely unknown.
- officialUrls: use only URLs from official spec context "source" fields. Use "" if missing.
- selectedOption MUST exactly match one of: ${optionListJson}
- Never fabricate numeric specs that conflict with the official spec context values.`;
}
