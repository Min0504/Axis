import type { OfficialProductSpecs } from "@/lib/specs/types";
import type { ComparisonRow } from "@/lib/types";

export function buildOfficialComparisonTable(
  productA: OfficialProductSpecs | null,
  productB: OfficialProductSpecs | null
): ComparisonRow[] {
  const mapA = new Map((productA?.specs ?? []).map((s) => [normalizeKey(s.spec_name), s]));
  const mapB = new Map((productB?.specs ?? []).map((s) => [normalizeKey(s.spec_name), s]));

  const keys = new Set([...mapA.keys(), ...mapB.keys()]);

  return [...keys]
    .sort((a, b) => a.localeCompare(b))
    .map((key) => {
      const specA = mapA.get(key);
      const specB = mapB.get(key);

      return {
        key: specA?.spec_name ?? specB?.spec_name ?? key,
        a: specA?.spec_value ?? "—",
        b: specB?.spec_value ?? "—",
        sourceA: specA?.source_url,
        sourceB: specB?.source_url
      };
    });
}

function normalizeKey(name: string) {
  return name.trim().toLowerCase();
}
