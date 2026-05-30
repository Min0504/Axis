import { describe, expect, it } from "vitest";
import { detectCategory, categoryTemplateMap } from "@/lib/category";

describe("detectCategory", () => {
  it("detects smartphone from Korean keyword", () => {
    expect(detectCategory("아이폰 16 vs 갤럭시 S25")).toBe("smartphone");
  });

  it("detects smartphone from English keyword (galaxy/pixel)", () => {
    expect(detectCategory("Galaxy S25 vs Pixel 9")).toBe("smartphone");
  });

  it("detects guitar", () => {
    expect(detectCategory("스트라토 vs 텔레캐스터")).toBe("guitar");
  });

  it("detects multieffects", () => {
    expect(detectCategory("HX Stomp vs Nano Cortex")).toBe("multieffects");
  });

  it("falls back to general", () => {
    expect(detectCategory("커피 vs 홍차")).toBe("general");
  });
});

describe("categoryTemplateMap", () => {
  it("has a non-empty template for every category", () => {
    for (const key of ["smartphone", "guitar", "multieffects", "general"] as const) {
      expect(categoryTemplateMap[key].length).toBeGreaterThan(0);
    }
  });
});
