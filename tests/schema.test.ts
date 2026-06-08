import { describe, expect, it } from "vitest";
import {
  getCategorySchema,
  hasSchema,
  schemaFieldKeys,
  schemaFieldLabels,
  primaryFieldKeys,
  getField,
  resolveFieldByLabel,
  schematizedCategories
} from "@/lib/specs/schema";

describe("category schema registry", () => {
  it("provides a structured schema for the lead category (laptop)", () => {
    const schema = getCategorySchema("laptop");
    expect(schema).not.toBeNull();
    expect(schema?.label).toBe("노트북");
    expect(schema!.fields.length).toBeGreaterThanOrEqual(10);
  });

  it("provides a schema for smartphone", () => {
    expect(hasSchema("smartphone")).toBe(true);
    expect(schemaFieldKeys("smartphone")).toContain("chipset");
  });

  it("returns no schema for not-yet-schematized categories", () => {
    expect(hasSchema("guitar")).toBe(false);
    expect(getCategorySchema("general")).toBeNull();
    expect(schemaFieldKeys("general")).toEqual([]);
  });

  it("derives labels used as comparison-table row keys", () => {
    const labels = schemaFieldLabels("laptop");
    expect(labels).toContain("배터리");
    expect(labels).toContain("무게");
    expect(labels).toContain("가격");
  });

  it("marks primary axes that drive decision weighting", () => {
    const primaries = primaryFieldKeys("laptop");
    expect(primaries).toContain("model_name");
    expect(primaries).toContain("cpu");
    expect(primaries).toContain("os");
    expect(primaries).toContain("refresh_hz");
    expect(primaries).toContain("brightness_nits");
    expect(primaries).toContain("weight_g");
    expect(primaries).toContain("battery_wh");
    // enrichment + volatile fields are excluded from the trust gate
    expect(primaries).not.toContain("ports");
    expect(primaries).not.toContain("price_krw"); // price changes too often to certify
  });

  it("encodes ranking direction for objective comparison", () => {
    expect(getField("laptop", "battery_wh")?.better).toBe("higher");
    expect(getField("laptop", "weight_g")?.better).toBe("lower");
    expect(getField("laptop", "price_krw")?.better).toBe("lower");
    expect(getField("laptop", "cpu")?.better).toBe("none");
  });

  it("uses official-source battery units per category", () => {
    expect(getField("laptop", "battery_wh")?.unit).toBe("Wh");
    expect(getField("smartphone", "battery")?.unit).toBeUndefined();
  });

  it("lists exactly the schematized categories", () => {
    expect(schematizedCategories().sort()).toEqual(["earphones", "laptop", "monitor", "smartphone", "tablet"]);
  });

  it("monitor + earphones schemas have primary trust-gate fields", () => {
    expect(primaryFieldKeys("monitor")).toContain("panel");
    expect(primaryFieldKeys("monitor")).toContain("refresh_hz");
    expect(getField("monitor", "refresh_hz")?.better).toBe("higher");
    expect(getField("monitor", "response_ms")?.better).toBe("lower");
    expect(primaryFieldKeys("earphones")).toContain("anc");
    expect(primaryFieldKeys("earphones")).toContain("codec");
    expect(primaryFieldKeys("earphones")).toContain("latency");
    // price stays out of the trust gate everywhere
    expect(primaryFieldKeys("monitor")).not.toContain("price_krw");
    expect(primaryFieldKeys("earphones")).not.toContain("price_krw");
  });

  describe("resolveFieldByLabel (comparison row key → schema field)", () => {
    it("maps a Korean display label back to its field", () => {
      expect(resolveFieldByLabel("laptop", "무게")?.key).toBe("weight_g");
      expect(resolveFieldByLabel("laptop", "배터리")?.key).toBe("battery_wh");
      expect(resolveFieldByLabel("smartphone", "메인 카메라")?.key).toBe("camera_mp");
    });

    it("is case- and whitespace-insensitive and accepts English labels", () => {
      expect(resolveFieldByLabel("laptop", "  cpu  ")?.key).toBe("cpu");
      expect(resolveFieldByLabel("laptop", "Battery")?.key).toBe("battery_wh");
    });

    it("returns null for unknown labels or schemaless categories", () => {
      expect(resolveFieldByLabel("laptop", "존재하지않는항목")).toBeNull();
      expect(resolveFieldByLabel("general", "무게")).toBeNull();
    });
  });
});
