import type { Category, ComparisonRow } from "@/lib/types";
import { getCategorySchema, getField } from "@/lib/specs/schema";
import { laptops } from "./laptops";
import { smartphones } from "./smartphones";
import type { VerifiedProduct } from "./types";

export type { VerifiedProduct } from "./types";

/** All verified products across categories. Extend by adding category seeds. */
const ALL: VerifiedProduct[] = [...laptops, ...smartphones];

function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, " ");
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
 */
function matchIn(pool: VerifiedProduct[], name: string): VerifiedProduct | null {
  const key = norm(name);
  if (!key) return null;

  const exact = pool.find(
    (p) => norm(p.canonicalName) === key || p.aliases.some((a) => norm(a) === key)
  );
  if (exact) return exact;

  return (
    pool.find(
      (p) =>
        key.includes(norm(p.canonicalName)) ||
        p.aliases.some((a) => {
          const na = norm(a);
          return key.includes(na) || na.includes(key);
        })
    ) ?? null
  );
}

export function resolveVerifiedProduct(category: Category, name: string): VerifiedProduct | null {
  return matchIn(ALL.filter((p) => p.category === category), name);
}

/** Category-agnostic name match — used where the category isn't known (e.g. price API). */
export function resolveVerifiedAny(name: string): VerifiedProduct | null {
  return matchIn(ALL, name);
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
