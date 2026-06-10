import { describe, expect, it } from "vitest";
import { buildExtractedComparisonTable } from "@/lib/specs/extracted-table";
import type { ExtractedSpecs } from "@/lib/specs/extract";

function product(name: string, specs: Record<string, string>): ExtractedSpecs {
  return {
    productName: name,
    category: "smartphone",
    source: `https://example.com/${name}`,
    fetchedAt: "2026-06-05",
    tier: 2,
    specs
  };
}

describe("buildExtractedComparisonTable", () => {
  it("builds only schema-aligned rows where every product has an official value", () => {
    const rows = buildExtractedComparisonTable("smartphone", [
      product("iphone", { chipset: "A18", battery: "동영상 재생 최대 22시간" }),
      product("galaxy", { chipset: "Snapdragon 8 Elite", battery: "4000mAh" })
    ]);

    expect(rows.map((row) => row.key)).toEqual(["칩셋", "배터리"]);
    expect(rows[0].sources?.every(Boolean)).toBe(true);
  });

  it("refuses one-sided extracted specs instead of filling AI-grade blanks", () => {
    const rows = buildExtractedComparisonTable("smartphone", [
      product("iphone", { chipset: "A18" }),
      product("galaxy", { battery: "4000mAh" })
    ]);

    expect(rows).toEqual([]);
  });

  it("keeps sourced partial rows for larger expanded comparisons", () => {
    const rows = buildExtractedComparisonTable("smartphone", [
      product("a", { battery: "22시간" }),
      product("b", { battery: "4000mAh" }),
      product("c", { chipset: "A18" }),
      product("d", { battery: "20시간" })
    ]);

    expect(rows).toHaveLength(1);
    expect(rows[0].values).toEqual(["22시간", "4000mAh", "—", "20시간"]);
    expect(rows[0].sources).toEqual([
      "https://example.com/a",
      "https://example.com/b",
      undefined,
      "https://example.com/d"
    ]);
  });

  it("uses localized labels for English result reruns", () => {
    const rows = buildExtractedComparisonTable(
      "smartphone",
      [
        product("iphone", { chipset: "A18" }),
        product("galaxy", { chipset: "Snapdragon 8 Elite" })
      ],
      "en"
    );

    expect(rows[0].key).toBe("Chipset");
  });

  it("appends schema units to bare numeric values", () => {
    const rows = buildExtractedComparisonTable("smartphone", [
      product("iphone", { weight_g: "170", camera_mp: "48", storage_gb: "128" }),
      product("galaxy", { weight_g: "162", camera_mp: "50", storage_gb: "256" })
    ]);

    expect(rows.find((row) => row.key === "무게")?.values).toEqual(["170g", "162g"]);
    expect(rows.find((row) => row.key === "카메라")?.values).toEqual(["48MP", "50MP"]);
    expect(rows.find((row) => row.key === "저장공간")?.values).toEqual(["128GB", "256GB"]);
  });

  it("localizes appended display units", () => {
    const rows = buildExtractedComparisonTable(
      "smartphone",
      [
        product("iphone", { display_inch: "6.1" }),
        product("galaxy", { display_inch: "6.2" })
      ],
      "en"
    );

    expect(rows[0].values).toEqual(["6.1in", "6.2in"]);
  });

  it("truncates overly long official values for readable tables", () => {
    const longValue =
      "iPhone은 처음부터 개인정보 보호를 염두에 두고 설계됩니다. 모든 iPhone에는 보안성이 뛰어난 안면 인증 기술이 탑재되어 있습니다. 앱이 타사 앱 또는 웹사이트에 걸친 당신의 활동을 추적하려면 승인을 받아야 합니다.";
    const rows = buildExtractedComparisonTable("smartphone", [
      product("iphone", { battery: longValue }),
      product("galaxy", { battery: "4000mAh" })
    ]);

    expect(rows[0].values[0]).toHaveLength(120);
    expect(rows[0].values[0].endsWith("…")).toBe(true);
  });
});
