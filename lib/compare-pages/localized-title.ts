import type { Locale } from "@/lib/i18n";
import type { ComparisonDef } from "./comparisons";

/** Locale-facing titles for curated comparison pages. Korean keeps the source title. */
const TITLE_I18N: Record<string, Partial<Record<Exclude<Locale, "ko">, string>>> = {
  "macbook-air-m4-vs-macbook-pro-m4": {
    en: "MacBook Air M4 vs MacBook Pro M4",
    ja: "MacBook Air M4 vs MacBook Pro M4",
  },
  "macbook-air-m3-vs-macbook-pro-m3": {
    en: "MacBook Air M3 vs MacBook Pro M3",
    ja: "MacBook Air M3 vs MacBook Pro M3",
  },
  "macbook-air-13-vs-macbook-air-15": {
    en: "MacBook Air 13-inch vs 15-inch",
    ja: "MacBook Air 13インチ vs 15インチ",
  },
  "macbook-air-m3-vs-lg-gram-16": {
    en: "MacBook Air M3 vs LG gram 16",
    ja: "MacBook Air M3 vs LG gram 16",
  },
  "macbook-air-m3-vs-galaxy-book4-pro": {
    en: "MacBook Air M3 vs Galaxy Book4 Pro",
    ja: "MacBook Air M3 vs Galaxy Book4 Pro",
  },
  "lg-gram-16-vs-galaxy-book4-pro": {
    en: "LG gram 16 vs Galaxy Book4 Pro",
    ja: "LG gram 16 vs Galaxy Book4 Pro",
  },
  "macbook-air-m4-vs-lg-gram-16": {
    en: "MacBook Air M4 vs LG gram 16",
    ja: "MacBook Air M4 vs LG gram 16",
  },
  "macbook-air-m4-vs-galaxy-book5-pro": {
    en: "MacBook Air M4 vs Galaxy Book5 Pro",
    ja: "MacBook Air M4 vs Galaxy Book5 Pro",
  },
  "macbook-air-m4-vs-lg-gram-pro-16": {
    en: "MacBook Air M4 vs LG gram Pro 16",
    ja: "MacBook Air M4 vs LG gram Pro 16",
  },
  "macbook-air-m3-vs-macbook-air-m4": {
    en: "MacBook Air M3 vs M4 — upgrade value",
    ja: "MacBook Air M3 vs M4 — アップグレード価値",
  },
  "macbook-air-m2-vs-macbook-air-m3": {
    en: "MacBook Air M2 vs M3 — used vs new",
    ja: "MacBook Air M2 vs M3 — 中古 vs 新型",
  },
  "lg-gram-pro-16-vs-galaxy-book5-pro": {
    en: "LG gram Pro 16 vs Galaxy Book5 Pro",
    ja: "LG gram Pro 16 vs Galaxy Book5 Pro",
  },
  "lg-gram-16-vs-lg-gram-pro-16": {
    en: "LG gram 16 vs gram Pro 16",
    ja: "LG gram 16 vs gram Pro 16",
  },
  "galaxy-book5-pro-vs-galaxy-book4-pro": {
    en: "Galaxy Book5 Pro vs Book4 Pro — one-year gap",
    ja: "Galaxy Book5 Pro vs Book4 Pro — 1年差の価値",
  },
  "iphone-16-vs-galaxy-s25": {
    en: "iPhone 16 vs Galaxy S25",
    ja: "iPhone 16 vs Galaxy S25",
  },
  "iphone-16-pro-vs-galaxy-s25-ultra": {
    en: "iPhone 16 Pro vs Galaxy S25 Ultra",
    ja: "iPhone 16 Pro vs Galaxy S25 Ultra",
  },
  "iphone-16-vs-iphone-16-pro": {
    en: "iPhone 16 vs iPhone 16 Pro",
    ja: "iPhone 16 vs iPhone 16 Pro",
  },
  "galaxy-s25-vs-s25-ultra": {
    en: "Galaxy S25 vs S25 Ultra",
    ja: "Galaxy S25 vs S25 Ultra",
  },
  "iphone-15-vs-iphone-16": {
    en: "iPhone 15 vs iPhone 16 — worth upgrading?",
    ja: "iPhone 15 vs iPhone 16 — アップグレード価値は？",
  },
  "galaxy-s24-vs-s25": {
    en: "Galaxy S24 vs S25 — reason to switch?",
    ja: "Galaxy S24 vs S25 — 乗り換える理由は？",
  },
  "iphone-16-pro-max-vs-galaxy-s25-ultra": {
    en: "iPhone 16 Pro Max vs Galaxy S25 Ultra",
    ja: "iPhone 16 Pro Max vs Galaxy S25 Ultra",
  },
  "iphone-14-pro-vs-iphone-15-pro": {
    en: "iPhone 14 Pro vs iPhone 15 Pro",
    ja: "iPhone 14 Pro vs iPhone 15 Pro",
  },
  "iphone-15-pro-vs-iphone-16-pro": {
    en: "iPhone 15 Pro vs iPhone 16 Pro",
    ja: "iPhone 15 Pro vs iPhone 16 Pro",
  },
  "galaxy-s24-ultra-vs-s25-ultra": {
    en: "Galaxy S24 Ultra vs S25 Ultra",
    ja: "Galaxy S24 Ultra vs S25 Ultra",
  },
  "airpods-pro-2-vs-galaxy-buds3-pro": {
    en: "AirPods Pro 2 vs Galaxy Buds3 Pro",
    ja: "AirPods Pro 2 vs Galaxy Buds3 Pro",
  },
  "airpods-pro-2-vs-sony-wf-1000xm5": {
    en: "AirPods Pro 2 vs Sony WF-1000XM5",
    ja: "AirPods Pro 2 vs Sony WF-1000XM5",
  },
  "sony-wh-1000xm5-vs-bose-qc-ultra": {
    en: "Sony WH-1000XM5 vs Bose QC Ultra",
    ja: "Sony WH-1000XM5 vs Bose QC Ultra",
  },
  "airpods-4-vs-galaxy-buds3": {
    en: "AirPods 4 vs Galaxy Buds3",
    ja: "AirPods 4 vs Galaxy Buds3",
  },
  "airpods-pro-2-vs-airpods-4": {
    en: "AirPods Pro 2 vs AirPods 4 — need Pro?",
    ja: "AirPods Pro 2 vs AirPods 4 — Proは必要？",
  },
  "galaxy-buds3-pro-vs-sony-wf-1000xm5": {
    en: "Galaxy Buds3 Pro vs Sony WF-1000XM5",
    ja: "Galaxy Buds3 Pro vs Sony WF-1000XM5",
  },
  "ipad-pro-m4-vs-galaxy-tab-s10-ultra": {
    en: "iPad Pro M4 vs Galaxy Tab S10 Ultra",
    ja: "iPad Pro M4 vs Galaxy Tab S10 Ultra",
  },
  "ipad-air-m2-vs-galaxy-tab-s9-plus": {
    en: "iPad Air M2 vs Galaxy Tab S9+",
    ja: "iPad Air M2 vs Galaxy Tab S9+",
  },
  "ipad-pro-m4-vs-ipad-air-m2": {
    en: "iPad Pro M4 vs iPad Air M2 — need Pro?",
    ja: "iPad Pro M4 vs iPad Air M2 — Proは必要？",
  },
  "ipad-10-vs-galaxy-tab-s9-fe": {
    en: "iPad 10th gen vs Galaxy Tab S9 FE",
    ja: "iPad 第10世代 vs Galaxy Tab S9 FE",
  },
};

export function localizedComparisonTitle(
  comparison: Pick<ComparisonDef, "slug" | "title">,
  locale: Locale
): string {
  if (locale === "ko") return comparison.title;
  return TITLE_I18N[comparison.slug]?.[locale] ?? comparison.title;
}
