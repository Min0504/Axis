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
  it("merges specs by normalized key and fills missing values with a dash", () => {
    const a = product("A", [["Display", "6.1in"]]);
    const b = product("B", [["Battery", "4000mAh"]]);

    const rows = buildOfficialComparisonTable([a, b]);
    const byKey = Object.fromEntries(rows.map((r) => [r.key.toLowerCase(), r]));

    expect(byKey["display"].values).toEqual(["6.1in", "—"]);
    expect(byKey["battery"].values).toEqual(["—", "4000mAh"]);
  });

  it("aligns matching specs across products (case-insensitive key)", () => {
    const a = product("A", [["Display", "6.1in"]]);
    const b = product("B", [["display", "6.7in"]]);

    const rows = buildOfficialComparisonTable([a, b]);
    expect(rows).toHaveLength(1);
    expect(rows[0].values).toEqual(["6.1in", "6.7in"]);
  });

  it("supports three or more products", () => {
    const rows = buildOfficialComparisonTable([
      product("A", [["Display", "6.1in"]]),
      product("B", [["Display", "6.7in"]]),
      product("C", [["Display", "6.3in"]])
    ]);
    expect(rows[0].values).toEqual(["6.1in", "6.7in", "6.3in"]);
  });

  it("handles all-null products", () => {
    expect(buildOfficialComparisonTable([null, null])).toEqual([]);
  });
});
