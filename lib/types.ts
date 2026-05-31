export type Category = "smartphone" | "guitar" | "multieffects" | "general";

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

export type ComparisonResult = {
  selectedOption: string;
  category: Category;
  /** The compared items (2..5). */
  options: string[];
  oneLineConclusion?: string;
  reasons: string[];
  comparison: ComparisonRow[];
  detail: string;
  /** Official page URLs aligned to options. */
  officialSources?: (string | undefined)[];
  specCollectionNote?: string;
};
