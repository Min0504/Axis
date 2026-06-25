import { afterEach, describe, expect, it } from "vitest";
import { resolveProviderConfigs } from "@/lib/ai/provider-config";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("resolveProviderConfigs", () => {
  it("returns providers in default fallback order", () => {
    delete process.env.AI_PROVIDER;
    process.env.GROQ_API_KEY = "groq-key";
    process.env.OPENAI_API_KEY = "openai-key";
    process.env.GEMINI_API_KEY = "gemini-key";
    process.env.ANTHROPIC_API_KEY = "anthropic-key";

    expect(resolveProviderConfigs().map((config) => config.provider)).toEqual([
      "groq",
      "openai",
      "gemini",
      "anthropic"
    ]);
  });

  it("puts the preferred provider first and keeps the rest as fallback", () => {
    process.env.AI_PROVIDER = "gemini";
    process.env.GROQ_API_KEY = "groq-key";
    process.env.OPENAI_API_KEY = "openai-key";
    process.env.GEMINI_API_KEY = "gemini-key";

    expect(resolveProviderConfigs().map((config) => config.provider)).toEqual([
      "gemini",
      "groq",
      "openai"
    ]);
  });

  it("skips providers without keys", () => {
    process.env.AI_PROVIDER = "groq";
    delete process.env.GROQ_API_KEY;
    process.env.OPENAI_API_KEY = "openai-key";

    expect(resolveProviderConfigs().map((config) => config.provider)).toEqual(["openai"]);
  });
});
