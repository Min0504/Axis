import { describe, expect, it } from "vitest";
import { parseAiJson, normalizeSelectedOption } from "@/lib/ai/decide";

const validPayload = JSON.stringify({
  selectedOption: "A",
  oneLineConclusion: "결론",
  reasons: ["r1"],
  comparison: [{ key: "k", a: "1", b: "2" }],
  detail: "d"
});

describe("parseAiJson", () => {
  it("parses clean JSON", () => {
    expect(parseAiJson(validPayload)?.selectedOption).toBe("A");
  });

  it("strips ```json fences", () => {
    expect(parseAiJson("```json\n" + validPayload + "\n```")?.selectedOption).toBe("A");
  });

  it("extracts JSON embedded in surrounding prose", () => {
    expect(parseAiJson("여기 결과입니다: " + validPayload + " 끝.")?.selectedOption).toBe("A");
  });

  it("returns null when required fields are missing", () => {
    expect(parseAiJson(JSON.stringify({ selectedOption: "A" }))).toBeNull();
  });

  it("returns null for non-JSON", () => {
    expect(parseAiJson("그냥 텍스트")).toBeNull();
  });
});

describe("normalizeSelectedOption", () => {
  it("matches exact option", () => {
    expect(normalizeSelectedOption("갤럭시 S25", "아이폰 16", "갤럭시 S25")).toBe("갤럭시 S25");
  });

  it("matches case-insensitively", () => {
    expect(normalizeSelectedOption("IPHONE 16", "iPhone 16", "Galaxy S25")).toBe("iPhone 16");
  });

  it("prefers the more specific name when both are contained", () => {
    // AI answers "iPhone 16 Pro"; both "iPhone 16" and "iPhone 16 Pro" are substrings.
    expect(normalizeSelectedOption("iPhone 16 Pro", "iPhone 16", "iPhone 16 Pro")).toBe(
      "iPhone 16 Pro"
    );
  });

  it("returns the raw answer when it matches neither", () => {
    expect(normalizeSelectedOption("둘 다", "A옵션", "B옵션")).toBe("둘 다");
  });
});
