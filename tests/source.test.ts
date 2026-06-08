import { describe, expect, it } from "vitest";
import {
  verificationLevel,
  isIndexable,
  isMeaningful,
  isVerifiedTier,
  bestTier,
  type GradedSpec
} from "@/lib/specs/source";
import { primaryFieldKeys } from "@/lib/specs/schema";

const laptopPrimary = primaryFieldKeys("laptop");

function grade(fieldKey: string, value: string, tier: 1 | 2 | 3): GradedSpec {
  return { fieldKey, value, tier };
}

describe("source grading + verification gate", () => {
  it("treats empty / placeholder values as not meaningful", () => {
    expect(isMeaningful("—")).toBe(false);
    expect(isMeaningful("정보 없음")).toBe(false);
    expect(isMeaningful("")).toBe(false);
    expect(isMeaningful("Apple M3")).toBe(true);
  });

  it("counts tier 1 and 2 as verified, tier 3 as not", () => {
    expect(isVerifiedTier(1)).toBe(true);
    expect(isVerifiedTier(2)).toBe(true);
    expect(isVerifiedTier(3)).toBe(false);
  });

  it("marks a comparison verified only when ALL primary fields are tier <= 2", () => {
    const grades = laptopPrimary.map((k) => grade(k, "value", 1));
    expect(verificationLevel(grades, laptopPrimary)).toBe("verified");
    expect(isIndexable(verificationLevel(grades, laptopPrimary))).toBe(true);
  });

  it("marks partial when some primary fields are AI-grade or missing", () => {
    const grades = laptopPrimary.map((k, i) => grade(k, "value", i === 0 ? 3 : 1));
    const level = verificationLevel(grades, laptopPrimary);
    expect(level).toBe("partial");
    expect(isIndexable(level)).toBe(false); // noindex — never publish unverified as authority
  });

  it("marks unverified (noindex) when no primary field is verified", () => {
    const grades = laptopPrimary.map((k) => grade(k, "value", 3));
    const level = verificationLevel(grades, laptopPrimary);
    expect(level).toBe("unverified");
    expect(isIndexable(level)).toBe(false);
  });

  it("does not count verified-tier but empty values toward verification", () => {
    const grades = laptopPrimary.map((k) => grade(k, "—", 1));
    expect(verificationLevel(grades, laptopPrimary)).toBe("unverified");
  });

  it("cannot certify a category with no schema (no primary keys)", () => {
    const grades = [grade("x", "v", 1)];
    expect(verificationLevel(grades, [])).toBe("partial");
    expect(verificationLevel([grade("x", "v", 3)], [])).toBe("unverified");
  });

  it("reports the best available source tier", () => {
    expect(bestTier([grade("a", "v", 3), grade("b", "v", 1), grade("c", "v", 2)])).toBe(1);
    expect(bestTier([grade("a", "—", 1), grade("b", "v", 3)])).toBe(3);
    expect(bestTier([grade("a", "—", 1)])).toBeNull();
  });
});
