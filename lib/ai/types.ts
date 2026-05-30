import type { Category } from "@/lib/types";

export type AiDecisionPayload = {
  selectedOption: string;
  oneLineConclusion: string;
  reasons: string[];
  comparison: Array<{ key: string; a: string; b: string }>;
  detail: string;
};

export type AiDecisionInput = {
  optionA: string;
  optionB: string;
  category: Category;
  templateKeys: string[];
};
