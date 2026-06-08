import { describe, expect, it } from "vitest";
import { detectCategory, categoryTemplateMap } from "@/lib/category";

describe("detectCategory", () => {
  it("detects smartphone from Korean keyword", () => {
    expect(detectCategory("아이폰 16 vs 갤럭시 S25")).toBe("smartphone");
  });

  it("detects smartphone from English keyword (galaxy/pixel)", () => {
    expect(detectCategory("Galaxy S25 vs Pixel 9")).toBe("smartphone");
  });

  it("detects smartphone from compact iPhone generation shorthand", () => {
    expect(detectCategory("14pro vs 15pro")).toBe("smartphone");
  });

  it("detects laptop (lead category)", () => {
    expect(detectCategory("맥북 에어 vs 그램")).toBe("laptop");
    expect(detectCategory("LG gram vs ThinkPad")).toBe("laptop");
  });

  it("classifies 갤럭시북 as laptop, not smartphone (precedence)", () => {
    expect(detectCategory("갤럭시북 vs 맥북")).toBe("laptop");
    expect(detectCategory("Galaxy Book vs XPS")).toBe("laptop");
  });

  it("detects monitor and earphones", () => {
    expect(detectCategory("LG 울트라기어 vs 오디세이 모니터")).toBe("monitor");
    expect(detectCategory("에어팟 프로 vs 갤럭시 버즈")).toBe("earphones");
  });

  it("classifies 갤럭시 버즈 as earphones, not smartphone (precedence)", () => {
    expect(detectCategory("갤럭시 버즈 vs 에어팟")).toBe("earphones");
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
