import { describe, expect, it } from "vitest";
import {
  countryForLocale,
  detectCountry,
  detectLocale,
  getDictionary,
  SUPPORTED_LOCALES,
  type Locale
} from "@/lib/i18n";
import { fieldLabelForLocale, getCategorySchema } from "@/lib/specs/schema";

const HANGUL = /[\uAC00-\uD7A3]/;
const KANA_OR_CJK = /[\u3040-\u30ff\u3400-\u9fff]/;

function collectStrings(value: unknown, out: string[] = []): string[] {
  if (typeof value === "string") {
    out.push(value);
    return out;
  }
  if (typeof value === "function") {
    try {
      const sample = value.length >= 1 ? value(["A", "B"], "x") : value();
      if (typeof sample === "string") out.push(sample);
    } catch {
      /* ignore signature mismatches */
    }
    return out;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectStrings(item, out);
    return out;
  }
  if (value && typeof value === "object") {
    for (const child of Object.values(value)) collectStrings(child, out);
  }
  return out;
}

function topLevelKeys(locale: Locale): string[] {
  return Object.keys(getDictionary(locale)).sort();
}

function resultsKeys(locale: Locale): string[] {
  return Object.keys(getDictionary(locale).results).sort();
}

describe("locale and country routing", () => {
  it("keeps source country independent from display language", () => {
    expect(countryForLocale("ko")).toBe("KR");
    expect(countryForLocale("en")).toBe("US");
    expect(detectCountry("JP", "KR", "ko")).toBe("JP");
    expect(detectLocale("en", "KR", "ko-KR,ko;q=0.9")).toBe("en");
  });

  it("detects first-visit locale and country from geo headers", () => {
    const locale = detectLocale(undefined, "JP", "en-US,en;q=0.9");
    expect(locale).toBe("ja");
    expect(detectCountry(undefined, "JP", locale)).toBe("JP");
  });
});

describe("dictionary language coverage", () => {
  it("keeps the same top-level and results keys across locales", () => {
    const baseTop = topLevelKeys("ko");
    const baseResults = resultsKeys("ko");
    for (const locale of SUPPORTED_LOCALES) {
      expect(topLevelKeys(locale)).toEqual(baseTop);
      expect(resultsKeys(locale)).toEqual(baseResults);
    }
  });

  it("serves locale-appropriate UI chrome for results", () => {
    expect(getDictionary("ko").results.axisChoice).toMatch(HANGUL);
    expect(getDictionary("en").results.axisChoice).not.toMatch(HANGUL);
    expect(getDictionary("en").results.axisChoice).toMatch(/Axis/i);
    expect(getDictionary("ja").results.axisChoice).toMatch(KANA_OR_CJK);
    expect(getDictionary("ja").results.whyChosen).toMatch(KANA_OR_CJK);

    expect(getDictionary("en").results.back).not.toMatch(HANGUL);
    expect(getDictionary("en").home.hero1).not.toMatch(HANGUL);
    expect(getDictionary("ja").home.hero1).toMatch(KANA_OR_CJK);
  });

  it("does not leak Hangul into English result chrome strings", () => {
    const enResults = collectStrings(getDictionary("en").results);
    const leaked = enResults.filter((s) => HANGUL.test(s));
    expect(leaked).toEqual([]);
  });

  it("localizes laptop primary field labels", () => {
    const schema = getCategorySchema("laptop");
    expect(schema).toBeTruthy();
    const weight = schema?.fields.find((f) => f.key === "weight_g");
    expect(weight).toBeTruthy();
    if (!weight) return;
    expect(fieldLabelForLocale(weight, "ko")).toMatch(HANGUL);
    expect(fieldLabelForLocale(weight, "en")).toMatch(/weight/i);
    expect(fieldLabelForLocale(weight, "en")).not.toMatch(HANGUL);
    expect(fieldLabelForLocale(weight, "ja")).toMatch(KANA_OR_CJK);
  });
});
