import { GoogleGenerativeAI } from "@google/generative-ai";
import { buildAxisSystemPrompt, buildAxisUserPrompt } from "@/lib/ai/axis-prompt";
import type { AiDecisionInput, AiDecisionPayload } from "@/lib/ai/types";

const AI_TIMEOUT_MS = 20_000;

/**
 * Resolved provider configuration — derived once per request, never mutates
 * process.env (which caused cross-request pollution in concurrent environments).
 */
type ProviderConfig =
  | { kind: "openai"; apiKey: string; baseUrl: string; model: string }
  | { kind: "gemini"; apiKey: string; model: string }
  | { kind: "anthropic"; apiKey: string; model: string };

/** True if at least one provider API key is configured (regardless of call success). */
export function isAiConfigured() {
  return Boolean(
    process.env.OPENAI_API_KEY ||
    process.env.GROQ_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.ANTHROPIC_API_KEY
  );
}

async function fetchWithTimeout(url: string, init: RequestInit) {
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

/** Extract the outermost {...} object from a string that may have surrounding prose. */
function extractJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) {
    return null;
  }
  return text.slice(start, end + 1);
}

export function parseAiJson(text: string): AiDecisionPayload | null {
  const cleaned = text.replace(/```json|```/g, "").trim();
  const candidate = extractJsonObject(cleaned) ?? cleaned;

  try {
    const parsed = JSON.parse(candidate) as AiDecisionPayload;

    if (!parsed.selectedOption || !parsed.reasons?.length || !parsed.comparison?.length) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function normalizeSelectedOption(selected: string, options: string[]) {
  const s = selected.trim().toLowerCase();
  const lower = options.map((o) => o.toLowerCase());

  // Exact match.
  const exact = lower.indexOf(s);
  if (exact !== -1) return options[exact];

  // Options whose name is contained in the AI's answer; prefer the most
  // specific (longest) one to disambiguate nested names ("iPhone" vs "iPhone Pro").
  const contained = lower
    .map((o, i) => ({ o, i }))
    .filter(({ o }) => o.length > 0 && s.includes(o))
    .sort((x, y) => y.o.length - x.o.length);
  if (contained.length) return options[contained[0].i];

  // Or the answer may be a substring of one option name.
  const within = lower.findIndex((o) => o.includes(s));
  if (within !== -1) return options[within];

  return selected;
}

async function callOpenAiConfig(cfg: Extract<ProviderConfig, { kind: "openai" }>, input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const response = await fetchWithTimeout(`${cfg.baseUrl}/v1/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cfg.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: cfg.model,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildAxisSystemPrompt() },
        { role: "user", content: buildAxisUserPrompt(input) }
      ]
    })
  });
  if (!response.ok) {
    // 429(TPM rate limit) 등은 조용히 deterministic fallback으로 — 로그만 남긴다.
    if (response.status === 429) console.warn("[ai] rate limited (429) — falling back");
    return null;
  }
  const data = (await response.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return parseAiJson(data.choices?.[0]?.message?.content ?? "");
}

async function callGeminiConfig(cfg: Extract<ProviderConfig, { kind: "gemini" }>, input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const genAI = new GoogleGenerativeAI(cfg.apiKey);
  const model = genAI.getGenerativeModel({
    model: cfg.model,
    systemInstruction: buildAxisSystemPrompt(),
    generationConfig: { temperature: 0.4, responseMimeType: "application/json" }
  });

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
  try {
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: buildAxisUserPrompt(input) }] }]
    });
    return parseAiJson(result.response.text());
  } finally {
    clearTimeout(timer);
  }
}

async function callAnthropicConfig(cfg: Extract<ProviderConfig, { kind: "anthropic" }>, input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": cfg.apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: cfg.model,
      max_tokens: 1200,
      temperature: 0.4,
      system: buildAxisSystemPrompt(),
      messages: [{ role: "user", content: buildAxisUserPrompt(input) }]
    })
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { content?: Array<{ type?: string; text?: string }> };
  return parseAiJson(data.content?.find((b) => b.type === "text")?.text ?? "");
}

export async function runAiDecision(input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const configs = resolveProviderConfigs();

  for (const cfg of configs) {
    try {
      const raw =
        cfg.kind === "openai"
          ? await callOpenAiConfig(cfg, input)
          : cfg.kind === "gemini"
            ? await callGeminiConfig(cfg, input)
            : await callAnthropicConfig(cfg, input);

      if (raw) return { ...raw, selectedOption: normalizeSelectedOption(raw.selectedOption, input.options) };
    } catch (error) {
      if (error instanceof Error) {
        console.error("[runAiDecision]", cfg.kind, error.message);
      } else {
        console.error("[runAiDecision]", cfg.kind, "unknown provider error");
      }
    }
  }

  return null;
}
