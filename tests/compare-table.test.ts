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
  it("does not promote one-sided official scrapes into a comparison table", () => {
    const a = product("A", [["Display", "6.1in"]]);
    const b = product("B", [["Battery", "4000mAh"]]);

    expect(buildOfficialComparisonTable([a, b])).toEqual([]);
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

  it("handles incomplete or all-null products", () => {
    expect(buildOfficialComparisonTable([product("A", [["Display", "6.1in"]]), null])).toEqual([]);
    expect(buildOfficialComparisonTable([null, null])).toEqual([]);
  });
});
