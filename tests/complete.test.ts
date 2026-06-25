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

    const fetchMock = vi.fn(async (..._args: [string, RequestInit?]) =>
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
    expect(String(fetchMock.mock.calls.at(0)?.[0])).toBe("https://api.groq.com/openai/v1/chat/completions");
  });

  it("falls back from Groq to OpenAI when the first provider fails", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.OPENAI_API_KEY = "test-openai-key";

    const fetchMock = vi
      .fn(async (..._args: [string, RequestInit?]) => new Response("unused", { status: 500 }))
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            choices: [{ message: { content: "{\"provider\":\"openai\"}" } }]
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    const result = await completeJson("system", "user");

    expect(result).toBe("{\"provider\":\"openai\"}");
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(String(fetchMock.mock.calls.at(0)?.[0])).toBe("https://api.groq.com/openai/v1/chat/completions");
    expect(String(fetchMock.mock.calls.at(1)?.[0])).toBe("https://api.openai.com/v1/chat/completions");
  });

  it("returns null when every configured provider fails", async () => {
    process.env.AI_PROVIDER = "groq";
    process.env.GROQ_API_KEY = "test-groq-key";
    process.env.OPENAI_API_KEY = "test-openai-key";

    const fetchMock = vi
      .fn(async (..._args: [string, RequestInit?]) => new Response("unused", { status: 500 }))
      .mockResolvedValueOnce(new Response("rate limited", { status: 429 }))
      .mockResolvedValueOnce(new Response("server error", { status: 500 }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await completeJson("system", "user");

    expect(result).toBeNull();
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
