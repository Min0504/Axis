import type { Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

export type AiDecisionPayload = {
  selectedOption: string;
  oneLineConclusion: string;
  reasons: string[];
  /** values aligned to the input options order. */
  comparison: Array<{ key: string; values: string[] }>;
  detail: string;
  /** Official product/manufacturer page URLs, aligned to the options order. */
  officialUrls?: string[];
  /** Short per-option analysis, aligned to the options order. */
  analyses?: string[];
};

export type OfficialSpecContext = {
  /** URL the specs were fetched from. */
  source: string;
  /** fieldKey → value map extracted from the official page. */
  specs: Record<string, string>;
};

export type AiDecisionInput = {
  options: string[];
  category: Category;
  locale?: Locale;
  templateKeys: string[];
  /**
   * Pre-fetched official specs per option (aligned to options order).
   * null means no official data was found for that option.
   */
  officialSpecs?: (OfficialSpecContext | null)[];
};
