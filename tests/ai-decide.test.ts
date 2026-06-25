import { afterEach, describe, expect, it, vi } from "vitest";
import { parseAiJson, normalizeSelectedOption, runAiDecision } from "@/lib/ai/decide";

const validPayload = JSON.stringify({
  selectedOption: "A",
  oneLineConclusion: "결론",
  reasons: ["r1"],
  comparison: [{ key: "k", values: ["1", "2"] }],
  detail: "d"
});

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
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
  it("matches an exact option", () => {
    expect(normalizeSelectedOption("갤럭시 S25", ["아이폰 16", "갤럭시 S25"])).toBe("갤럭시 S25");
  });

  it("matches case-insensitively", () => {
    expect(normalizeSelectedOption("IPHONE 16", ["iPhone 16", "Galaxy S25"])).toBe("iPhone 16");
  });

  it("prefers the more specific name when both are contained", () => {
    expect(normalizeSelectedOption("iPhone 16 Pro", ["iPhone 16", "iPhone 16 Pro"])).toBe(
      "iPhone 16 Pro"
    );
  });

  it("works across 3+ options", () => {
    expect(normalizeSelectedOption("픽셀 9", ["아이폰 16", "갤럭시 S25", "픽셀 9"])).toBe("픽셀 9");
  });

  it("returns the raw answer when it matches none", () => {
    expect(normalizeSelectedOption("모두", ["A옵션", "B옵션"])).toBe("모두");
  });
});

describe("runAiDecision", () => {
  it("falls back from Groq to OpenAI when Groq is rate-limited", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.OPENAI_API_KEY = "test-openai-key";

    const fetchMock = vi
      .fn(async (..._args: [string, RequestInit?]) => new Response("unused", { status: 500 }))
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: validPayload } }]
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await runAiDecision({
      options: ["A", "B"],
      category: "laptop",
      templateKeys: ["cpu"]
    });

    expect(result?.selectedOption).toBe("A");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(String(fetchMock.mock.calls[1][0])).toBe("https://api.openai.com/v1/chat/completions");
  });
});
