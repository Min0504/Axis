import { afterEach, describe, expect, it, vi } from "vitest";
import { completeJson } from "@/lib/ai/complete";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("completeJson", () => {
  it("uses Groq through the OpenAI-compatible endpoint", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    delete process.env.OPENAI_API_KEY;
    delete process.env.OPENAI_BASE_URL;

    const fetchMock = vi.fn(async (_input: RequestInfo | URL, _init?: RequestInit) =>
      new Response(
        JSON.stringify({
          choices: [{ message: { content: "{\"ok\":true}" } }]
        }),
        { status: 200, headers: { "content-type": "application/json" } }
      )
    );
    vi.stubGlobal("fetch", fetchMock);

    const result = await completeJson("system", "user");

    expect(result).toBe("{\"ok\":true}");
    expect(fetchMock).toHaveBeenCalledOnce();
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.groq.com/openai/v1/chat/completions");
  });

  it("falls back from Groq to OpenAI when Groq fails", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.OPENAI_API_KEY = "test-openai-key";
    delete process.env.OPENAI_BASE_URL;

    const fetchMock = vi
      .fn<typeof fetch>()
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "{\"ok\":true}" } }]
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await completeJson("system", "user");

    expect(result).toBe("{\"ok\":true}");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls[0][0])).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(String(fetchMock.mock.calls[1][0])).toBe("https://api.openai.com/v1/chat/completions");
  });
});
