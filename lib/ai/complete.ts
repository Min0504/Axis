import { resolveProviderConfigs } from "@/lib/ai/provider-config";

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

async function fetchWithTimeout(url: string, init: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** Single-shot completion that asks for a JSON object back. Returns raw text. */
export const completeJson: CompleteFn = async (system, user) => {
  const configs = resolveProviderConfigs();
  if (configs.length === 0) return null;

  for (const cfg of configs) {
    try {
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
        if (!res.ok) continue;
        const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
        const content = data.choices?.[0]?.message?.content ?? null;
        if (content) return content;
        continue;
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
        if (!res.ok) continue;
        const data = (await res.json()) as {
          candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
        };
        const content = data.candidates?.[0]?.content?.parts?.[0]?.text ?? null;
        if (content) return content;
        continue;
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
      if (!res.ok) continue;
      const data = (await res.json()) as { content?: Array<{ type?: string; text?: string }> };
      const content = data.content?.find((b) => b.type === "text")?.text ?? null;
      if (content) return content;
    } catch (error) {
      console.error("[completeJson]", cfg.provider, error);
    }
  }

  return null;
};
