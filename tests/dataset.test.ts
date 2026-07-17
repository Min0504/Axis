import { describe, expect, it } from "vitest";
import {
  resolveVerifiedProduct,
  resolveVerifiedAny,
  buildVerifiedComparison,
  validateDataset
} from "@/lib/specs/dataset";
import { primaryFieldKeys, getField } from "@/lib/specs/schema";
import { gradeVerification } from "@/lib/decision-engine";

describe("verified spec dataset (laptops only)", () => {
  it("has zero spec-key typos (every key exists in its category schema)", () => {
    expect(validateDataset()).toEqual([]);
  });

  describe("resolveVerifiedProduct", () => {
    it("resolves exact aliases", () => {
      expect(resolveVerifiedProduct("laptop", "맥북 에어 M3")?.canonicalName).toBe("맥북 에어 13 M3");
      expect(resolveVerifiedProduct("laptop", "갤럭시북4 프로")?.canonicalName).toBe("갤럭시 북4 프로 14");
      expect(resolveVerifiedProduct("laptop", "LG 그램 16")?.canonicalName).toBe("LG 그램 16");
    });

    it("disambiguates 13 vs 15 inch MacBook Air", () => {
      expect(resolveVerifiedProduct("laptop", "맥북 에어 15 M3")?.canonicalName).toBe("맥북 에어 15 M3");
      expect(resolveVerifiedProduct("laptop", "맥북 에어")?.canonicalName).toBe("맥북 에어 13 M4");
    });

    it("resolves Galaxy Book6 Pro laptop aliases", () => {
      expect(resolveVerifiedProduct("laptop", "갤럭시북6 프로")?.canonicalName).toBe("갤럭시 북6 프로 14");
      expect(resolveVerifiedProduct("laptop", "갤럭시 북6 프로 16")?.canonicalName).toBe("갤럭시 북6 프로 16");
      expect(resolveVerifiedAny("galaxy book6 pro 16")?.id).toBe("galaxy-book6-pro-16");
    });

    it("returns null for unknown products or wrong category", () => {
      expect(resolveVerifiedProduct("laptop", "존재하지않는노트북")).toBeNull();
      expect(resolveVerifiedProduct("smartphone", "맥북 에어 M3")).toBeNull();
    });

    it("resolveVerifiedAny matches laptops (for the price API)", () => {
      expect(resolveVerifiedAny("맥북 에어 M3")?.id).toBe("macbook-air-13-m3");
      expect(resolveVerifiedAny("갤럭시북4 프로")?.id).toBe("galaxy-book4-pro-14");
      expect(resolveVerifiedAny("아이폰 16")).toBeNull();
      expect(resolveVerifiedAny("듣도보도못한기기")).toBeNull();
    });
  });

  describe("buildVerifiedComparison", () => {
    it("builds schema-ordered rows with per-value official sources", () => {
      const a = resolveVerifiedProduct("laptop", "맥북 에어 M3");
      const b = resolveVerifiedProduct("laptop", "갤럭시북4 프로");
      const rows = buildVerifiedComparison("laptop", [a, b]);

      const weight = rows.find((r) => r.key === "무게");
      expect(weight?.values).toEqual(["1240", "1170"]);
      expect(weight?.sources?.every(Boolean)).toBe(true);
    });

    it("fills every primary field with sourced values → grades as verified", () => {
      const a = resolveVerifiedProduct("laptop", "맥북 에어 M3");
      const b = resolveVerifiedProduct("laptop", "LG 그램 16");
      const rows = buildVerifiedComparison("laptop", [a, b]);

      for (const key of primaryFieldKeys("laptop")) {
        const label = getField("laptop", key)?.label;
        const row = rows.find((r) => r.key === label);
        expect(row, `missing primary row: ${label}`).toBeTruthy();
        expect(row?.sources?.every(Boolean), `unsourced primary: ${label}`).toBe(true);
      }
    });

    it("drops rows where no product has a value (e.g. price)", () => {
      const a = resolveVerifiedProduct("laptop", "맥북 에어 M3");
      const b = resolveVerifiedProduct("laptop", "갤럭시북4 프로");
      const rows = buildVerifiedComparison("laptop", [a, b]);
      expect(rows.find((r) => r.key === "가격")).toBeUndefined();
    });
  });

  describe("end-to-end verification grade", () => {
    it("a fully-seeded verified pair grades as 'verified' (→ indexable)", () => {
      const a = resolveVerifiedProduct("laptop", "맥북 에어 M3");
      const b = resolveVerifiedProduct("laptop", "갤럭시북4 프로");
      const rows = buildVerifiedComparison("laptop", [a, b]);
      expect(gradeVerification("laptop", rows)).toBe("verified");
    });

    it("a newly-seeded Galaxy Book6 pair grades as 'verified'", () => {
      const a = resolveVerifiedProduct("laptop", "갤럭시북6 프로");
      const b = resolveVerifiedProduct("laptop", "갤럭시 북6 프로 16");
      const rows = buildVerifiedComparison("laptop", [a, b]);
      expect(gradeVerification("laptop", rows)).toBe("verified");
    });

    it("an unseeded pair (no sources) grades as 'unverified' (→ noindex)", () => {
      const aiRows = [
        { key: "CPU", values: ["A", "B"] },
        { key: "무게", values: ["1kg", "1.2kg"] }
      ];
      expect(gradeVerification("laptop", aiRows)).toBe("unverified");
    });
  });
});
