import type { Country } from "@/lib/i18n";
import type { SpecSourceTier } from "@/lib/specs/source";

export type RegionalUrlMap = Partial<Record<Country, string>>;

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
  officialUrls?: RegionalUrlMap;
  importerUrls?: RegionalUrlMap;
  allowImporterFallback?: boolean;
  parser: "apple" | "samsung" | "generic";
  /** Apple specs pages often list multiple models; pick column by class suffix. */
  columnClass?: string;
  level: 1 | 2 | 3;
};

export type ProductSourceKind = "manufacturer" | "authorized_importer";

export type ProductSourceCandidate = {
  url: string;
  tier: SpecSourceTier;
  kind: ProductSourceKind;
};
