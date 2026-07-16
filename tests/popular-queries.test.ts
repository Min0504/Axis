import { describe, expect, it } from "vitest";
import {
  aggregatePopularQueries,
  isSafePublicQuery,
  normalizePopularQuery
} from "@/lib/popular-queries";

describe("popular query sanitization", () => {
  it("accepts short product comparisons", () => {
    expect(isSafePublicQuery("맥북 에어 vs 갤럭시 북5")).toBe(true);
    expect(isSafePublicQuery("MacBook Air vs LG gram")).toBe(true);
  });

  it("rejects emails, phones, and non-comparisons", () => {
    expect(isSafePublicQuery("user@example.com vs test")).toBe(false);
    expect(isSafePublicQuery("010-1234-5678 vs 상품")).toBe(false);
    expect(isSafePublicQuery("맥북 에어")).toBe(false);
    expect(isSafePublicQuery("내 이메일 비밀번호 vs 테스트")).toBe(false);
  });

  it("aggregates only safe queries", () => {
    const rows = [
      { query: "맥북 에어 vs LG 그램" },
      { query: "맥북 에어 vs LG 그램" },
      { query: "secret@mail.com vs leak" },
      { query: "그냥 잡담" }
    ];
    expect(aggregatePopularQueries(rows, 5)).toEqual([
      { query: normalizePopularQuery("맥북 에어 vs LG 그램"), count: 2 }
    ]);
  });
});
