import { describe, expect, it } from "vitest";
import { parseOptions, buildQuery } from "@/lib/decision-engine";

describe("parseOptions", () => {
  it("splits on ' vs '", () => {
    expect(parseOptions("아이폰 16 vs 갤럭시 S25")).toEqual({ a: "아이폰 16", b: "갤럭시 S25" });
  });

  it("is case-insensitive on VS", () => {
    expect(parseOptions("A VS B")).toEqual({ a: "A", b: "B" });
  });

  it("splits on Korean ' 대 '", () => {
    expect(parseOptions("짜장 대 짬뽕")).toEqual({ a: "짜장", b: "짬뽕" });
  });

  it("returns empty options when no separator", () => {
    expect(parseOptions("단일 항목")).toEqual({ a: "", b: "" });
  });

  it("trims whitespace around options", () => {
    expect(parseOptions("  A   vs   B  ")).toEqual({ a: "A", b: "B" });
  });
});

describe("buildQuery", () => {
  it("joins options with ' vs '", () => {
    expect(buildQuery("아이폰", "갤럭시")).toBe("아이폰 vs 갤럭시");
  });

  it("trims each side", () => {
    expect(buildQuery("  A ", " B  ")).toBe("A vs B");
  });
});
