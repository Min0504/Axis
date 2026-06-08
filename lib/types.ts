import type { VerificationLevel } from "@/lib/specs/source";
import type { Locale } from "@/lib/i18n";

export type Category =
  | "smartphone"
  | "laptop"
  | "tablet"
  | "monitor"
  | "earphones"
  | "guitar"
  | "multieffects"
  | "general";

export type ComparisonRow = {
  key: string;
  /** Values aligned to ComparisonResult.options (length === options.length). */
  values: string[];
  /** Optional per-value source URLs (official specs), aligned to options. */
  sources?: (string | undefined)[];

  // --- legacy 2-way fields (read-only back-compat for old saved history) ---
  a?: string;
  b?: string;
  sourceA?: string;
  sourceB?: string;
};

export type OfficialSourceKind = "manufacturer" | "authorized_importer";

export type OfficialSourceMeta = {
  url: string;
  kind: OfficialSourceKind;
  tier: 1 | 2 | 3;
};

export type ComparisonResult = {
  selectedOption: string;
  category: Category;
  options: string[];
  locale?: Locale;
  status?: "ok" | "not_found" | "verification_pending";
  missingOptions?: string[];
  oneLineConclusion?: string;
  reasons: string[];
  comparison: ComparisonRow[];
  detail: string;
  /** Per-option AI analysis, aligned to options. */
  analyses?: string[];
  /** Official page URLs aligned to options. */
  officialSources?: (string | undefined)[];
  officialSourceMeta?: (OfficialSourceMeta | undefined)[];
  specCollectionNote?: string;
  /**
   * Trust level of the spec table: "verified" (all primary specs from official/
   * verified sources), "partial", or "unverified" (AI-grade). Gates SEO indexing.
   */
  verification?: VerificationLevel;
};
