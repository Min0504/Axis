import type { Category } from "@/lib/types";

export type AiDecisionPayload = {
  selectedOption: string;
  oneLineConclusion: string;
  reasons: string[];
  /** values aligned to the input options order. */
  comparison: Array<{ key: string; values: string[] }>;
  detail: string;
  /** Official product/manufacturer page URLs, aligned to the options order. */
  officialUrls?: string[];
};

export type AiDecisionInput = {
  options: string[];
  category: Category;
  templateKeys: string[];
};
