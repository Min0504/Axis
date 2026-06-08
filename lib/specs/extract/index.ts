import { getCategorySchema, getField } from "@/lib/specs/schema";
import { isMeaningful, type SpecSourceTier } from "@/lib/specs/source";
import { completeJson, type CompleteFn } from "@/lib/ai/complete";
import { extractRuleBasedSpecs } from "@/lib/specs/extract/rules";
import type { Category } from "@/lib/types";

/**
 * AI spec extractor — the engine that realizes "AI reads the official page and
 * pulls the specs out". Given a product's official page HTML, an LLM extracts
 * ONLY the values literally present, mapped into the category schema. Output is
 * tier-2 (verified-from-official, AI-extracted) — strong enough to pass the gate
 * and index, while staying honest that a human didn't transcribe it.
 *
 * Design: extract-once-and-cache, NOT live-per-request. The orchestrator is
 * pure given an injected `complete`, so the prompt + parsing are fully testable
 * without a live model. Real fetch + LLM plug in via `complete` / the fetch caller.
 */

/** Tier assigned to AI-extracted-from-official specs. */
export const EXTRACTED_TIER: SpecSourceTier = 2;

export type ExtractedSpecs = {
  productName: string;
  category: Category;
  /** Official page the values were extracted from. */
  source: string;
  /** YYYY-MM-DD the page was extracted. */
  fetchedAt: string;
  tier: SpecSourceTier;
  /** schema fieldKey → value. */
  specs: Record<string, string>;
};

const MAX_TEXT = 12_000;
const MAX_FOCUSED_TEXT = 5_000;
const SNIPPET_RADIUS = 360;

/** Strip an official page down to readable text for the model. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&#\d+;/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function searchTermsForCategory(category: Category): string[] {
  const schema = getCategorySchema(category);
  if (!schema) return [];
  return schema.fields
    .flatMap((field) => [
      field.key,
      field.label,
      field.labelEn,
      ...(field.searchTerms ?? [])
    ])
    .map((term) => term.trim())
    .filter((term, index, terms) => term.length >= 2 && terms.indexOf(term) === index);
}

export function buildFocusedPageText(category: Category, pageText: string): string {
  const text = pageText.trim();
  if (text.length <= MAX_FOCUSED_TEXT) return text;

  const ranges = searchTermsForCategory(category)
    .flatMap((term) => {
      const pattern = new RegExp(escapeRegExp(term), "gi");
      return Array.from(text.matchAll(pattern)).slice(0, 2).map((match) => {
        const index = match.index ?? 0;
        return {
          start: Math.max(0, index - SNIPPET_RADIUS),
          end: Math.min(text.length, index + term.length + SNIPPET_RADIUS)
        };
      });
    })
    .sort((a, b) => a.start - b.start);

  if (!ranges.length) return text.slice(0, MAX_FOCUSED_TEXT);

  const merged: Array<{ start: number; end: number }> = [];
  for (const range of ranges) {
    const last = merged[merged.length - 1];
    if (!last || range.start > last.end + 80) {
      merged.push(range);
    } else {
      last.end = Math.max(last.end, range.end);
    }
  }

  return merged
    .map((range) => text.slice(range.start, range.end).trim())
    .join("\n…\n")
    .slice(0, MAX_FOCUSED_TEXT);
}

export function buildExtractionPrompt(category: Category, productName: string, pageText: string) {
  const schema = getCategorySchema(category);
  const fields = schema?.fields ?? [];
  const focusedPageText = buildFocusedPageText(category, pageText);

  const fieldLines = fields
    .map((f) => {
      const unit = f.unit ? ` (단위: ${f.unit})` : "";
      const hint = f.hint ? ` — ${f.hint}` : "";
      return `- ${f.key}: ${f.label}${unit}${hint}`;
    })
    .join("\n");

  const system =
    "너는 제조사 공식 제품 페이지에서 스펙을 추출하는 도구다. " +
    "규칙: (1) 페이지 텍스트에 실제로 적힌 값만 사용한다. (2) 없으면 null. " +
    "(3) 절대 추측하거나 일반 지식으로 채우지 않는다. (4) 숫자는 단위 없이 숫자만(예: 무게 1240, 배터리 52.6). " +
    "(5) 여러 용량/구성이 있으면 가장 낮은 저장공간의 기본 구성을 우선한다. " +
    "(6) 모델명·칩셋만 채우고 멈추지 말고, 표/목록 전체에서 주요 스펙 필드를 끝까지 찾는다. " +
    "(7) 반드시 JSON 객체만 출력한다.";

  const user = `제품: ${productName}
카테고리: ${category}

추출할 필드 (JSON 키 = 필드 id):
${fieldLines}

아래는 공식 페이지의 텍스트다. 위 필드를 JSON으로 추출하라.
각 키의 값은 페이지에 있으면 문자열, 없으면 null.

JSON 스키마:
{ ${fields.map((f) => `"${f.key}": "값 또는 null"`).join(", ")} }

--- 공식 페이지 텍스트 ---
${focusedPageText}`;

  return { system, user };
}

function specsWithProductIdentity(
  category: Category,
  productName: string,
  specs: Record<string, string>
): Record<string, string> {
  if (!getField(category, "model_name") || specs.model_name) return specs;
  return { model_name: productName, ...specs };
}

/** Parse the model's JSON, keeping ONLY valid schema fields with meaningful values. */
export function parseExtraction(raw: string, category: Category): Record<string, string> {
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const start = cleaned.indexOf("{");
  const end = cleaned.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return {};

  let obj: Record<string, unknown>;
  try {
    obj = JSON.parse(cleaned.slice(start, end + 1)) as Record<string, unknown>;
  } catch {
    return {};
  }

  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (!getField(category, key)) continue; // drop keys not in the schema
    if (value === null || value === undefined) continue;
    const str = String(value).trim();
    if (!isMeaningful(str)) continue;
    out[key] = str;
  }
  return out;
}

export async function extractSpecsFromPage(params: {
  productName: string;
  category: Category;
  sourceUrl: string;
  html: string;
  complete?: CompleteFn;
}): Promise<ExtractedSpecs | null> {
  if (!getCategorySchema(params.category)) return null;

  const pageText = htmlToText(params.html);
  if (pageText.length < 40) return null; // nothing usable on the page

  const ruleBasedSpecs = extractRuleBasedSpecs(params.category, params.productName, pageText);
  if (Object.keys(ruleBasedSpecs).length >= 4) {
    return {
      productName: params.productName,
      category: params.category,
      source: params.sourceUrl,
      fetchedAt: new Date().toISOString().slice(0, 10),
      tier: EXTRACTED_TIER,
      specs: specsWithProductIdentity(params.category, params.productName, ruleBasedSpecs)
    };
  }

  const { system, user } = buildExtractionPrompt(params.category, params.productName, pageText);
  const complete = params.complete ?? completeJson;

  const raw = await complete(system, user);
  if (!raw) return null;

  const parsedSpecs = parseExtraction(raw, params.category);
  if (Object.keys(parsedSpecs).length === 0 && Object.keys(ruleBasedSpecs).length < 4) return null;
  const specs = specsWithProductIdentity(params.category, params.productName, {
    ...ruleBasedSpecs,
    ...parsedSpecs
  });
  if (Object.keys(specs).length === 0) return null;

  return {
    productName: params.productName,
    category: params.category,
    source: params.sourceUrl,
    fetchedAt: new Date().toISOString().slice(0, 10),
    tier: EXTRACTED_TIER,
    specs
  };
}
