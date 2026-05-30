export type SpecEntry = {
  spec_name: string;
  spec_value: string;
  source_url: string;
};

export type OfficialProductSpecs = {
  productName: string;
  officialUrl: string;
  specs: SpecEntry[];
  fetchedAt: string;
  level: 1 | 2 | 3;
};

export type ProductRegistryEntry = {
  officialUrl: string;
  parser: "apple" | "samsung" | "generic";
  /** Apple specs pages often list multiple models; pick column by class suffix. */
  columnClass?: string;
  level: 1 | 2 | 3;
};
