import type { OfficialProductSpecs, SpecEntry } from "@/lib/specs/types";
import type { ComparisonRow } from "@/lib/types";

/** Max characters for a single spec value — prevents marketing paragraphs */
const MAX_VALUE_LENGTH = 120;

/** Section names that are purely marketing/identical across all models — skip them */
const SKIP_SECTIONS = new Set([
  "accessibility",
  "apple card",
  "apple pay",
  "apple intelligence",
  "built-in apps",
  "audio calling",
  "audio calling16",
  "location",
  "video calling",
  "siri",
  "sensors",
  "power",
  "connector",
  "sim card",
  "rating for hearing aids",
  "accessibility features",
]);

function normalizeKey(name: string) {
  return name.trim().toLowerCase();
}

function truncate(value: string): string {
  const trimmed = value.trim();
  if (trimmed.length <= MAX_VALUE_LENGTH) return trimmed;
  // Cut at last space before limit to avoid mid-word cuts
  const cut = trimmed.slice(0, MAX_VALUE_LENGTH);
  const lastSpace = cut.lastIndexOf(" ");
  return (lastSpace > 60 ? cut.slice(0, lastSpace) : cut) + "…";
}

export function buildOfficialComparisonTable(
  products: (OfficialProductSpecs | null)[]
): ComparisonRow[] {
  if (products.some((product) => !product?.specs.length)) return [];

  const maps = products.map(
    (p) => new Map((p?.specs ?? []).map((s) => [normalizeKey(s.spec_name), s]))
  );

  const keys = new Set<string>();
  for (const map of maps) {
    for (const key of map.keys()) keys.add(key);
  }

  const rows: ComparisonRow[] = [];

  for (const key of [...keys].sort((a, b) => a.localeCompare(b))) {
    // Skip marketing-only sections
    if (SKIP_SECTIONS.has(key)) continue;

    const entries: (SpecEntry | undefined)[] = maps.map((m) => m.get(key));
    const labelEntry = entries.find((e) => e?.spec_name);
    if (entries.some((entry) => !entry?.spec_value)) continue;

    const values = entries.map((e) => truncate(e?.spec_value ?? ""));

    // Skip rows where every value is identical (no comparison value)
    const meaningful = values.filter((v) => v !== "—");
    if (meaningful.length > 1 && meaningful.every((v) => v === meaningful[0])) continue;

    rows.push({
      key: labelEntry?.spec_name ?? key,
      values,
      sources: entries.map((e) => e?.source_url),
    });
  }

  return rows;
}
