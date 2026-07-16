/**
 * Generic JSON completion across providers (prompt-agnostic).
 *
 * Mirrors the provider routing in `decide.ts` but takes arbitrary system/user
 * prompts and returns the raw model text. Used by the spec extractor and any
 * future single-shot LLM task. Returns null when no provider is configured or
 * the call fails — callers must handle null (no silent fabrication).
 *
 * NOTE: never mutates process.env — config is resolved into a typed object so
 * concurrent serverless invocations don't interfere with each other.
 */

const AI_TIMEOUT_MS = 30_000;

export type CompleteFn = (system: string, user: string) => Promise<string | null>;

type ProviderConfig =
  | { kind: "openai"; apiKey: string; baseUrl: string; model: string }
  | { kind: "gemini"; apiKey: string; model: string }
  | { kind: "anthropic"; apiKey: string; model: string };

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function configuredProviders(): ProviderConfig[] {
  const providers: ProviderConfig[] = [];

  if (process.env.GROQ_API_KEY) {
    providers.push({
      kind: "openai",
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai",
      model: process.env.GROQ_MODEL ?? process.env.OPENAI_MODEL ?? "llama-3.1-8b-instant"
    });
  }
  if (process.env.OPENAI_API_KEY) {
    providers.push({
      kind: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com").replace(/\/$/, ""),
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    });
  }
  if (process.env.GEMINI_API_KEY) {
    providers.push({
      kind: "gemini",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
    });
  }
  if (process.env.ANTHROPIC_API_KEY) {
    providers.push({
      kind: "anthropic",
      apiKey: process.env.ANTHROPIC_API_KEY,
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022"
    });
  }

  return providers;
}

function resolveProviderConfigs(): ProviderConfig[] {
  const preferred = process.env.AI_PROVIDER?.toLowerCase();
  const providers = configuredProviders();
  if (!preferred) return providers;

  const preferredProviders = providers.filter((provider) => {
    if (preferred === "groq") {
      return provider.kind === "openai" && provider.baseUrl === "https://api.groq.com/openai";
    }
    if (preferred === "openai") {
      return provider.kind === "openai" && provider.baseUrl !== "https://api.groq.com/openai";
    }
    return provider.kind === preferred;
  });
  const fallbackProviders = providers.filter((provider) => !preferredProviders.includes(provider));
  return [...preferredProviders, ...fallbackProviders];
}

async function callProvider(cfg: ProviderConfig, system: string, user: string): Promise<string | null> {
  if (cfg.kind === "openai") {
    const res = await fetchWithTimeout(`${cfg.baseUrl}/v1/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${cfg.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: cfg.model,
        temperature: 0,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user }
        ]
      })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
    return data.choices?.[0]?.message?.content ?? null;
  }

  if (cfg.kind === "gemini") {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${cfg.model}:generateContent?key=${cfg.apiKey}`;
    const res = await fetchWithTimeout(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: `${system}\n\n${user}` }] }],
        generationConfig: { temperature: 0, responseMimeType: "application/json" }
      })
    });
    if (!res.ok) return null;
    const data = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    return data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
  }

  const res = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": cfg.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 1500,
      temperature: 0,
      system,
      messages: [{ role: "user", content: user }]
    })
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { content?: Array<{ type?: string; text?: string }> };
  return data.content?.find((b) => b.type === "text")?.text ?? null;
}

/** Single-shot completion that asks for a JSON object back. Returns raw text. */
export const completeJson: CompleteFn = async (system, user) => {
  const configs = resolveProviderConfigs();
  for (const cfg of configs) {
    try {
      const result = await callProvider(cfg, system, user);
      if (result) return result;
    } catch (error) {
      if (error instanceof Error) {
        console.warn("[completeJson]", cfg.kind, error.message);
      } else {
        console.warn("[completeJson]", cfg.kind, "unknown provider error");
      }
    }
  }
  return null;
};
