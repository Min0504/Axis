import { getCategorySchema, getField } from "@/lib/specs/schema";
import { isMeaningful, type SpecSourceTier } from "@/lib/specs/source";
import { extractRuleBasedSpecs } from "@/lib/specs/extract/rules";
import type { Category } from "@/lib/types";

/** Tier for rule-extracted specs from an official page. */
export const EXTRACTED_TIER: SpecSourceTier = 2;

export type ExtractedSpecs = {
  productName: string;
  category: Category;
  source: string;
  fetchedAt: string;
  tier: SpecSourceTier;
  specs: Record<string, string>;
};

const MAX_TEXT = 12_000;

/** Strip an official page down to readable text. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_TEXT);
}

function specsWithProductIdentity(
  category: Category,
  productName: string,
  specs: Record<string, string>
): Record<string, string> {
  if (!getField(category, "model_name") || specs.model_name) return specs;
  return { model_name: productName, ...specs };
}

/**
 * Rules-only extraction from official page HTML.
 * No LLM — if rules find nothing usable, returns null (dataset fallback handles it).
 */
export async function extractSpecsFromPage(params: {
  productName: string;
  category: Category;
  sourceUrl: string;
  html: string;
}): Promise<ExtractedSpecs | null> {
  if (!getCategorySchema(params.category)) return null;

  const pageText = htmlToText(params.html);
  if (pageText.length < 40) return null;

  const ruleBasedSpecs = extractRuleBasedSpecs(params.category, params.productName, pageText);
  if (Object.keys(ruleBasedSpecs).length === 0) return null;

  return {
    productName: params.productName,
    category: params.category,
    source: params.sourceUrl,
    fetchedAt: new Date().toISOString().slice(0, 10),
    tier: EXTRACTED_TIER,
    specs: specsWithProductIdentity(params.category, params.productName, ruleBasedSpecs)
  };
}

// Keep parse helpers for tests that still import them (rules path).
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
    if (!getField(category, key)) continue;
    if (value === null || value === undefined) continue;
    const str = String(value).trim();
    if (!isMeaningful(str)) continue;
    out[key] = str;
  }
  return out;
}
