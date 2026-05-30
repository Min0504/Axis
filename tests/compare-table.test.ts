import { describe, expect, it } from "vitest";
import { buildOfficialComparisonTable } from "@/lib/specs/compare-table";
import type { OfficialProductSpecs } from "@/lib/specs/types";

function product(name: string, specs: Array<[string, string]>): OfficialProductSpecs {
  return {
    productName: name,
    officialUrl: `https://example.com/${name}`,
    specs: specs.map(([spec_name, spec_value]) => ({
      spec_name,
      spec_value,
      source_url: `https://example.com/${name}`
    })),
    fetchedAt: new Date().toISOString(),
    level: 1
  };
}

describe("buildOfficialComparisonTable", () => {
  it("merges specs by normalized key and fills missing sides with a dash", () => {
    const a = product("A", [["Display", "6.1in"]]);
    const b = product("B", [["Battery", "4000mAh"]]);

    const rows = buildOfficialComparisonTable(a, b);
    const byKey = Object.fromEntries(rows.map((r) => [r.key.toLowerCase(), r]));

    expect(byKey["display"].a).toBe("6.1in");
    expect(byKey["display"].b).toBe("—");
    expect(byKey["battery"].a).toBe("—");
    expect(byKey["battery"].b).toBe("4000mAh");
  });

  it("aligns matching specs across both products", () => {
    const a = product("A", [["Display", "6.1in"]]);
    const b = product("B", [["display", "6.7in"]]);

    const rows = buildOfficialComparisonTable(a, b);
    expect(rows).toHaveLength(1);
    expect(rows[0].a).toBe("6.1in");
    expect(rows[0].b).toBe("6.7in");
  });

  it("handles null products", () => {
    expect(buildOfficialComparisonTable(null, null)).toEqual([]);
  });
});
