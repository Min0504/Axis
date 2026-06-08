import { describe, expect, it } from "vitest";
import { expandComparisonOptions } from "@/lib/query-expansion";

describe("expandComparisonOptions", () => {
  it("expands broad Galaxy vs iPhone intent into recent flagship generations", () => {
    expect(expandComparisonOptions(["갤럭시", "아이폰"], 6, "ko")).toEqual([
      "갤럭시 S25",
      "아이폰 17",
      "갤럭시 S24",
      "아이폰 16",
      "갤럭시 S23",
      "아이폰 15"
    ]);
  });

  it("keeps explicit product comparisons unchanged", () => {
    expect(expandComparisonOptions(["아이폰 16", "갤럭시 S25"], 6, "ko")).toEqual([
      "아이폰 16",
      "갤럭시 S25"
    ]);
  });

  it("localizes expanded labels", () => {
    expect(expandComparisonOptions(["Galaxy", "iPhone"], 4, "en")).toEqual([
      "Galaxy S25",
      "iPhone 17",
      "Galaxy S24",
      "iPhone 16"
    ]);
  });

  it("resolves broad earbuds brands to the latest concrete models", () => {
    expect(expandComparisonOptions(["갤럭시버즈", "에어팟"], 6, "ko")).toEqual([
      "갤럭시 버즈3 프로",
      "에어팟 4"
    ]);
  });
});
