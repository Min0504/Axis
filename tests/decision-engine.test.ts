import { describe, expect, it } from "vitest";
import { parseOptions, buildQuery, gradeVerification, buildDecision } from "@/lib/decision-engine";

describe("parseOptions", () => {
  it("splits two options on ' vs '", () => {
    expect(parseOptions("아이폰 16 vs 갤럭시 S25")).toEqual(["아이폰 16", "갤럭시 S25"]);
  });

  it("splits three or more options", () => {
    expect(parseOptions("A vs B vs C")).toEqual(["A", "B", "C"]);
  });

  it("splits on Korean ' 대 '", () => {
    expect(parseOptions("짜장 대 짬뽕")).toEqual(["짜장", "짬뽕"]);
  });

  it("returns a single element when no separator", () => {
    expect(parseOptions("단일 항목")).toEqual(["단일 항목"]);
  });

  it("trims whitespace around options", () => {
    expect(parseOptions("  A   vs   B  ")).toEqual(["A", "B"]);
  });
});

describe("buildQuery", () => {
  it("joins options with ' vs '", () => {
    expect(buildQuery(["아이폰", "갤럭시"])).toBe("아이폰 vs 갤럭시");
  });

  it("joins three options", () => {
    expect(buildQuery(["A", "B", "C"])).toBe("A vs B vs C");
  });

  it("trims and drops empties", () => {
    expect(buildQuery(["  A ", "", " B  "])).toBe("A vs B");
  });
});

describe("gradeVerification", () => {
  it("downgrades incomplete sourced primary rows to partial", () => {
    expect(
      gradeVerification("smartphone", [
        {
          key: "칩셋",
          values: ["A18", "—", "Snapdragon"],
          sources: ["https://apple.example", undefined, "https://samsung.example"]
        },
        {
          key: "화면 크기",
          values: ["15.5cm", "156.4mm", "153.9mm"],
          sources: ["https://apple.example", "https://samsung.example", "https://samsung.example"]
        },
        {
          key: "배터리",
          values: ["22시간", "4000mAh", "3900mAh"],
          sources: ["https://apple.example", "https://samsung.example", "https://samsung.example"]
        },
        {
          key: "메인 카메라",
          values: ["48", "50", "50"],
          sources: ["https://apple.example", "https://samsung.example", "https://samsung.example"]
        }
      ])
    ).toBe("partial");
  });
});

describe("buildDecision", () => {
  it("returns product-not-found when every requested product is not in official sources", async () => {
    const result = await buildDecision("아이폰 19 vs 아이폰 20", 2, "ko");

    expect(result.status).toBe("not_found");
    expect(result.selectedOption).toBe("제품을 찾을 수 없습니다");
    expect(result.locale).toBe("ko");
    expect(result.missingOptions).toEqual(["아이폰 19", "아이폰 20"]);
    expect(result.comparison).toEqual([]);
    expect(result.analyses).toEqual([]);
    expect(result.oneLineConclusion).toContain("공식");
  });
});
