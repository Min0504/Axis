export type Category = "smartphone" | "guitar" | "multieffects" | "general";

export type ComparisonRow = {
  key: string;
  a: string;
  b: string;
  sourceA?: string;
  sourceB?: string;
};

export type ComparisonResult = {
  selectedOption: string;
  category: Category;
  oneLineConclusion?: string;
  reasons: string[];
  comparison: ComparisonRow[];
  detail: string;
  officialSources?: {
    a?: string;
    b?: string;
  };
  specCollectionNote?: string;
};
