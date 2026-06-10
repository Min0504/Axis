import { describe, expect, it } from "vitest";
import {
  resolveVerifiedProduct,
  resolveVerifiedAny,
  buildVerifiedComparison,
  validateDataset
} from "@/lib/specs/dataset";
import { primaryFieldKeys, getField } from "@/lib/specs/schema";
import { gradeVerification } from "@/lib/decision-engine";

describe("verified spec dataset", () => {
  it("has zero spec-key typos (every key exists in its category schema)", () => {
    // The single most important integrity guard: a typo'd field key would
    // silently drop verified data and break the trust gate.
    expect(validateDataset()).toEqual([]);
  });

  describe("resolveVerifiedProduct", () => {
    it("resolves exact aliases", () => {
      expect(resolveVerifiedProduct("laptop", "맥북 에어 M3")?.canonicalName).toBe("맥북 에어 13 M3");
      expect(resolveVerifiedProduct("laptop", "갤럭시북4 프로")?.canonicalName).toBe("갤럭시 북4 프로 14");
      expect(resolveVerifiedProduct("laptop", "LG 그램 16")?.canonicalName).toBe("LG 그램 16");
      expect(resolveVerifiedProduct("smartphone", "아이폰 16")?.canonicalName).toBe("아이폰 16");
      expect(resolveVerifiedProduct("smartphone", "갤럭시 S25")?.canonicalName).toBe("갤럭시 S25");
    });

    it("disambiguates 13 vs 15 inch MacBook Air", () => {
      expect(resolveVerifiedProduct("laptop", "맥북 에어 15 M3")?.canonicalName).toBe("맥북 에어 15 M3");
      // 세대 미지정 시 최신 모델(M4) — query-expansion의 "맥북 에어"→M4 확장과 일치
      expect(resolveVerifiedProduct("laptop", "맥북 에어")?.canonicalName).toBe("맥북 에어 13 M4");
    });

    it("returns null for unknown products or wrong category", () => {
      expect(resolveVerifiedProduct("laptop", "존재하지않는노트북")).toBeNull();
      expect(resolveVerifiedProduct("smartphone", "맥북 에어 M3")).toBeNull();
    });

    it("resolveVerifiedAny matches across categories (for the price API)", () => {
      expect(resolveVerifiedAny("맥북 에어 M3")?.id).toBe("macbook-air-13-m3");
      expect(resolveVerifiedAny("갤럭시북4 프로")?.id).toBe("galaxy-book4-pro-14");
      expect(resolveVerifiedAny("아이폰 16")?.id).toBe("iphone-16");
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

    it("builds verified smartphone rows without scraped marketing prose", () => {
      const a = resolveVerifiedProduct("smartphone", "아이폰 16");
      const b = resolveVerifiedProduct("smartphone", "갤럭시 S25");
      const rows = buildVerifiedComparison("smartphone", [a, b]);

      const battery = rows.find((r) => r.key === "배터리");
      expect(battery?.values).toEqual(["동영상 재생 최대 22시간", "4000mAh"]);
      expect(rows.some((r) => r.values.some((v) => v.includes("개인정보 보호")))).toBe(false);

      for (const key of primaryFieldKeys("smartphone")) {
        const label = getField("smartphone", key)?.label;
        const row = rows.find((r) => r.key === label);
        expect(row, `missing primary row: ${label}`).toBeTruthy();
        expect(row?.values.every((v) => v !== "—"), `unsourced primary: ${label}`).toBe(true);
      }
    });
  });

  describe("end-to-end verification grade", () => {
    it("a fully-seeded verified pair grades as 'verified' (→ indexable)", () => {
      const a = resolveVerifiedProduct("laptop", "맥북 에어 M3");
      const b = resolveVerifiedProduct("laptop", "갤럭시북4 프로");
      const rows = buildVerifiedComparison("laptop", [a, b]);
      expect(gradeVerification("laptop", rows)).toBe("verified");
    });

    it("a fully-seeded smartphone pair grades as 'verified'", () => {
      const a = resolveVerifiedProduct("smartphone", "아이폰 16");
      const b = resolveVerifiedProduct("smartphone", "갤럭시 S25");
      const rows = buildVerifiedComparison("smartphone", [a, b]);
      expect(gradeVerification("smartphone", rows)).toBe("verified");
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
