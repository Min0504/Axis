import type { Category, ComparisonRow } from "@/lib/types";
import type { Locale } from "@/lib/i18n";
import { getCategorySchema, getField } from "@/lib/specs/schema";
// ── 수동 검증 데이터셋 (tier-1, 공식 소스) ─────────────────────────────────
import { laptops } from "./laptops";
import { smartphones } from "./smartphones";
import { earphones } from "./earphones";
import { tablets } from "./tablets";
// ── 다나와 자동 수집 데이터셋 (KR 시장, 2026-06) ───────────────────────────
import { laptops as krLaptops } from "./kr/laptops";
import { smartphones as krSmartphones } from "./kr/smartphones";
import { earphones as krEarphones } from "./kr/earphones";
import type { VerifiedProduct, DatasetCountry } from "./types";

export type { VerifiedProduct } from "./types";

/**
 * 데이터셋 병합 — 앞쪽 pool이 우선권을 가짐 (ID 중복 시 첫 번째 유지).
 * 수동 검증 데이터셋이 항상 다나와 자동 수집 데이터보다 앞에 위치해야 함.
 */
function mergeDatasets(...pools: VerifiedProduct[][]): VerifiedProduct[] {
  const seenIds = new Set<string>();
  const result: VerifiedProduct[] = [];
  for (const pool of pools) {
    for (const p of pool) {
      if (!seenIds.has(p.id)) {
        seenIds.add(p.id);
        result.push(p);
      }
    }
  }
  return result;
}

/** All verified products — hardcoded (official) first, KR batch second. */
const ALL: VerifiedProduct[] = mergeDatasets(
  [...laptops, ...smartphones, ...earphones, ...tablets],  // 수동 검증 데이터 (우선)
  [...krSmartphones, ...krLaptops, ...krEarphones]  // 다나와 자동 수집 (신모델 추가)
);

/**
 * 검색어 정규화:
 *  - 소문자 + 공백 압축
 *  - 영어 tech 접미어 → 한국어 변환 (사용자 혼용 입력 커버)
 *    "pro"→"프로", "plus"→"플러스", "max"→"맥스", "ultra"→"울트라", "mini"→"미니"
 */
function norm(s: string): string {
  return s
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    // 영문 tech 접미어를 한국어로 통일 (단어 경계 \b 사용)
    .replace(/\bpro\b/g, "프로")
    .replace(/\bplus\b/g, "플러스")
    .replace(/\bmax\b/g, "맥스")
    .replace(/\bultra\b/g, "울트라")
    .replace(/\bmini\b/g, "미니")
    .replace(/\s+/g, " ")  // 변환 후 다시 공백 정리
    .trim();
}

/**
 * 포함(containment) 매칭에서 가장 구체적인 항목을 선택.
 * "아이폰 16 프로" 검색 시 "아이폰 16"(짧음)이 아닌 "아이폰 16 프로"(긺)를 우선.
 * 매칭 길이가 긴 항목이 더 구체적인 제품명.
 */
function bestContainsMatch(pool: VerifiedProduct[], key: string): VerifiedProduct | null {
  let best: VerifiedProduct | null = null;
  let bestScore = 0;

  for (const p of pool) {
    // canonicalName + 로케일 이름(nameEn/nameJa) + aliases를 모두 후보로
    const names = [p.canonicalName, p.nameEn, p.nameJa, ...p.aliases].filter(
      (n): n is string => Boolean(n)
    );
    for (const name of names) {
      const n = norm(name);
      if (key.includes(n) || n.includes(key)) {
        if (n.length > bestScore) {
          bestScore = n.length;
          best = p;
        }
      }
    }
  }

  return best;
}

/** Look up a verified product by its stable id (the key for prices/watches/URLs). */
export function getProductById(id: string): VerifiedProduct | null {
  return ALL.find((p) => p.id === id) ?? null;
}

/** Every verified product, read-only. */
export function allVerifiedProducts(): readonly VerifiedProduct[] {
  return ALL;
}

/**
 * Resolve a free-text product name to a verified entry. Exact alias/canonical
 * matches win; otherwise falls back to a containment match so "맥북 에어 M3 13형"
 * still resolves. Returns null when nothing is confidently matched.
 *
 * Country priority: prefer country-specific entry over GLOBAL.
 * If country is provided, KR/US/JP entries for that market are preferred;
 * GLOBAL entries serve as fallback when no country-specific entry exists.
 */
function matchIn(
  pool: VerifiedProduct[],
  name: string,
  country?: DatasetCountry
): VerifiedProduct | null {
  const key = norm(name);
  if (!key) return null;

  const isExact = (p: VerifiedProduct) =>
    norm(p.canonicalName) === key ||
    (p.nameEn != null && norm(p.nameEn) === key) ||
    (p.nameJa != null && norm(p.nameJa) === key) ||
    p.aliases.some((a) => norm(a) === key);

  // Country priority: country-specific → GLOBAL → any other market.
  // Hardware specs are identical worldwide, so a KR-sourced entry is still the
  // correct spec sheet for a US/JP user — only market-specific price fields
  // differ (the consumer strips those via stripForeignMarketFields).
  if (country && country !== "GLOBAL") {
    const countryPool = pool.filter((p) => p.country === country);
    const globalPool = pool.filter((p) => p.country === "GLOBAL");
    const otherPool = pool.filter((p) => p.country !== country && p.country !== "GLOBAL");

    const exact =
      countryPool.find(isExact) ?? globalPool.find(isExact) ?? otherPool.find(isExact);
    if (exact) return exact;
    // containment: 가장 구체적인(긴 canonical) 매칭 우선
    return (
      bestContainsMatch(countryPool, key) ??
      bestContainsMatch(globalPool, key) ??
      bestContainsMatch(otherPool, key) ??
      null
    );
  }

  // No country filter — match across all
  const exact = pool.find(isExact);
  if (exact) return exact;
  return bestContainsMatch(pool, key) ?? null;
}

/**
 * Locale-aware display/search name for a verified product.
 *  - ko → canonicalName (Korean)
 *  - en → nameEn ?? canonicalName
 *  - ja → nameJa ?? nameEn ?? canonicalName
 *
 * This is what powers "type 아이폰 16 in English locale → see iPhone 16 and
 * search 'iPhone 16' on Amazon US".
 */
export function localizedProductName(entry: VerifiedProduct, locale: Locale): string {
  if (locale === "en") return entry.nameEn ?? entry.canonicalName;
  if (locale === "ja") return entry.nameJa ?? entry.nameEn ?? entry.canonicalName;
  return entry.canonicalName;
}

/**
 * Resolve a free-text product name and return its locale-appropriate display
 * name. Falls back to the raw input when the product isn't in the catalog
 * (we can't translate an unknown product).
 *
 * Used to normalize comparison option labels + affiliate search terms so the
 * displayed names and shopping links always match the user's locale regardless
 * of the language they typed in.
 */
export function localizeDisplayName(
  name: string,
  category: Category,
  country: DatasetCountry,
  locale: Locale
): string {
  const entry = resolveVerifiedProduct(category, name, country);
  return entry ? localizedProductName(entry, locale) : name;
}

/** Spec keys that only make sense in their origin market (currency-bound). */
const MARKET_SPECIFIC_KEYS = ["launch_price_krw", "price_krw"];

/**
 * When a dataset entry from another market is served cross-country (e.g. a
 * KR-sourced iPhone entry shown to a US user), strip currency-bound fields so
 * the AI fills the local price from its own knowledge instead of echoing ₩.
 * Hardware fields pass through untouched — they're identical worldwide.
 */
export function stripForeignMarketFields(
  entry: VerifiedProduct,
  country?: DatasetCountry
): Record<string, string> {
  if (!country || country === "GLOBAL" || entry.country === country || entry.country === "GLOBAL") {
    return entry.specs;
  }
  const filtered: Record<string, string> = {};
  for (const [key, value] of Object.entries(entry.specs)) {
    if (!MARKET_SPECIFIC_KEYS.includes(key)) filtered[key] = value;
  }
  return filtered;
}

export function resolveVerifiedProduct(
  category: Category,
  name: string,
  country?: DatasetCountry
): VerifiedProduct | null {
  return matchIn(ALL.filter((p) => p.category === category), name, country);
}

/** Category-agnostic name match — used where the category isn't known (e.g. price API). */
export function resolveVerifiedAny(name: string, country?: DatasetCountry): VerifiedProduct | null {
  return matchIn(ALL, name, country);
}

/**
 * Build a schema-ordered comparison table from verified products. Each value
 * carries the product's official source URL, so the verification grader treats
 * filled primary fields as tier-1 (official). Rows with no data are dropped.
 */
export function buildVerifiedComparison(
  category: Category,
  products: (VerifiedProduct | null)[]
): ComparisonRow[] {
  const schema = getCategorySchema(category);
  if (!schema) return [];

  const rows: ComparisonRow[] = [];
  for (const field of schema.fields) {
    const values = products.map((p) => p?.specs[field.key] ?? "—");
    if (!values.some((v) => v && v !== "—")) continue;
    const sources = products.map((p) => (p?.specs[field.key] ? p.source : undefined));
    rows.push({ key: field.label, values, sources });
  }
  return rows;
}

/**
 * Integrity guard: every dataset spec key must exist in its category schema.
 * Surfaces typos like `weigth_g` at test time instead of silently dropping data.
 */
export function validateDataset(): string[] {
  const problems: string[] = [];
  const seenIds = new Set<string>();
  for (const p of ALL) {
    if (!p.id || !/^[a-z0-9-]+$/.test(p.id)) {
      problems.push(`${p.canonicalName}: invalid id "${p.id}" (use lowercase-kebab)`);
    }
    if (seenIds.has(p.id)) problems.push(`duplicate id "${p.id}"`);
    seenIds.add(p.id);

    if (!getCategorySchema(p.category)) {
      problems.push(`${p.canonicalName}: no schema for category "${p.category}"`);
      continue;
    }
    for (const key of Object.keys(p.specs)) {
      if (!getField(p.category, key)) {
        problems.push(`${p.canonicalName}: unknown spec key "${key}"`);
      }
    }
  }
  return problems;
}
