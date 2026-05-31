import type { OfficialProductSpecs, SpecEntry } from "@/lib/specs/types";
import type { ComparisonRow } from "@/lib/types";

function normalizeKey(name: string) {
  return name.trim().toLowerCase();
}

export function buildOfficialComparisonTable(
  products: (OfficialProductSpecs | null)[]
): ComparisonRow[] {
  const maps = products.map(
    (p) => new Map((p?.specs ?? []).map((s) => [normalizeKey(s.spec_name), s]))
  );

  const keys = new Set<string>();
  for (const map of maps) {
    for (const key of map.keys()) keys.add(key);
  }

  return [...keys]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const entries: (SpecEntry | undefined)[] = maps.map((m) => m.get(key));
      const labelEntry = entries.find((e) => e?.spec_name);

      return {
        key: labelEntry?.spec_name ?? key,
        values: entries.map((e) => e?.spec_value ?? "—"),
        sources: entries.map((e) => e?.source_url)
      };
    });
}
