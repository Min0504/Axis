/**
 * Source grading + verification gate — Axis's trust moat.
 *
 * Every spec value carries a *source tier*. A comparison only becomes
 * trustworthy (and SEO-indexable) when its **primary** fields are backed by
 * verified sources (tier ≤ 2). This is the single rule that keeps Axis above
 * Google's AI-spam filter and above a generic chatbot's trust line:
 *
 *   - Danawa has the data but gives no verdict.
 *   - ChatGPT gives a verdict but can't show verified, source-graded data.
 *   - Axis shows BOTH — and refuses to publish what it can't verify.
 */

/** 1 = manufacturer official, 2 = verified third-party, 3 = AI/unverified. */
export type SpecSourceTier = 1 | 2 | 3;

export const SOURCE_TIER_LABEL: Record<SpecSourceTier, string> = {
  1: "제조사 공식",
  2: "검증 자료",
  3: "AI 추정"
};

export const SOURCE_TIER_LABEL_EN: Record<SpecSourceTier, string> = {
  1: "Official",
  2: "Verified",
  3: "AI estimate"
};

/** Highest tier (lowest number) that still counts as "verified" for the gate. */
export const VERIFIED_TIER_THRESHOLD: SpecSourceTier = 2;

/** A single field value with provenance. */
export type GradedSpec = {
  /** Schema field key this value fills (e.g. "battery_wh"). */
  fieldKey: string;
  /** Display value (may be "—" / empty when unknown). */
  value: string;
  tier: SpecSourceTier;
  sourceUrl?: string;
  /** ISO timestamp the value was sourced. */
  fetchedAt?: string;
};

export type VerificationLevel = "verified" | "partial" | "unverified";

const EMPTY_VALUES = new Set(["", "—", "-", "정보 없음", "n/a", "na", "unknown", "미상"]);

export function isMeaningful(value: string | undefined | null): boolean {
  if (!value) return false;
  return !EMPTY_VALUES.has(value.trim().toLowerCase());
}

export function isVerifiedTier(tier: SpecSourceTier): boolean {
  return tier <= VERIFIED_TIER_THRESHOLD;
}

/**
 * Grade a comparison's overall verification level from its primary fields.
 *
 *  - verified   : every primary field has a meaningful, tier ≤ 2 value
 *  - partial    : some (but not all) primary fields are verified
 *  - unverified : no primary field is verified (pure AI / empty)
 *
 * Non-primary fields don't gate indexing — they enrich, they don't certify.
 */
export function verificationLevel(grades: GradedSpec[], primaryKeys: string[]): VerificationLevel {
  if (primaryKeys.length === 0) {
    // No schema → cannot certify. Treat any verified value as partial at best.
    const anyVerified = grades.some((g) => isVerifiedTier(g.tier) && isMeaningful(g.value));
    return anyVerified ? "partial" : "unverified";
  }

  const byKey = new Map(grades.map((g) => [g.fieldKey, g]));
  let verifiedCount = 0;

  for (const key of primaryKeys) {
    const g = byKey.get(key);
    if (g && isVerifiedTier(g.tier) && isMeaningful(g.value)) {
      verifiedCount += 1;
    }
  }

  if (verifiedCount === primaryKeys.length) return "verified";
  if (verifiedCount > 0) return "partial";
  return "unverified";
}

/**
 * SEO gate: a comparison page is indexable only when fully verified.
 * Partial/unverified pages render for the user but carry noindex, so we never
 * flood Google with AI-grade content and never claim authority we don't have.
 */
export function isIndexable(level: VerificationLevel): boolean {
  return level === "verified";
}

/** The best (lowest-number) tier present among meaningful values. */
export function bestTier(grades: GradedSpec[]): SpecSourceTier | null {
  let best: SpecSourceTier | null = null;
  for (const g of grades) {
    if (!isMeaningful(g.value)) continue;
    if (best === null || g.tier < best) best = g.tier;
  }
  return best;
}

/** Short human label for a verification level (badge text). */
export function verificationLabel(level: VerificationLevel): string {
  switch (level) {
    case "verified":
      return "공식 스펙 검증됨";
    case "partial":
      return "일부 공식 스펙 검증";
    case "unverified":
      return "AI 정리 (검증 전)";
  }
}
