import type { ProductRegistryEntry } from "@/lib/specs/types";

/** Level 1: official manufacturer pages (expand over time). */
const registry: Record<string, ProductRegistryEntry> = {
  "iphone 16": {
    officialUrl: "https://www.apple.com/iphone-16/specs/",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 16 pro": {
    officialUrl: "https://www.apple.com/iphone-16-pro/specs/",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "갤럭시 s25": {
    officialUrl: "https://www.samsung.com/global/smartphones/galaxy-s25/specs/",
    parser: "samsung",
    level: 1
  },
  "galaxy s25": {
    officialUrl: "https://www.samsung.com/global/smartphones/galaxy-s25/specs/",
    parser: "samsung",
    level: 1
  },

};

const aliases: Record<string, string> = {
  "아이폰 16": "iphone 16",
  "아이폰16": "iphone 16",
  "아이폰 16 pro": "iphone 16 pro",
  "갤럭시s25": "갤럭시 s25"
};

function normalizeProductName(name: string) {
  const key = name.trim().toLowerCase().replace(/\s+/g, " ");
  return aliases[key] ?? key;
}

export function resolveOfficialProduct(name: string): ProductRegistryEntry | null {
  const key = normalizeProductName(name);
  if (registry[key]) {
    return registry[key];
  }

  const fuzzy = Object.entries(registry).find(([k]) => key.includes(k) || k.includes(key));
  return fuzzy ? fuzzy[1] : null;
}
