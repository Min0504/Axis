import { describe, expect, it } from "vitest";
import { parseOptions, buildQuery } from "@/lib/decision-engine";

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
