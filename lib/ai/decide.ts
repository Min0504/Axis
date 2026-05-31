import { buildAxisSystemPrompt, buildAxisUserPrompt } from "@/lib/ai/axis-prompt";
import type { AiDecisionInput, AiDecisionPayload } from "@/lib/ai/types";

type Provider = "openai" | "gemini" | "anthropic";

const AI_TIMEOUT_MS = 20_000;

/** True if at least one provider API key is configured (regardless of call success). */
export function isAiConfigured() {
  return Boolean(
    process.env.OPENAI_API_KEY || process.env.GEMINI_API_KEY || process.env.ANTHROPIC_API_KEY
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

function resolveProvider(): Provider | null {
  const preferred = process.env.AI_PROVIDER?.toLowerCase();

  if (preferred === "openai" && process.env.OPENAI_API_KEY) {
    return "openai";
  }
  if (preferred === "gemini" && process.env.GEMINI_API_KEY) {
    return "gemini";
  }
  if (preferred === "anthropic" && process.env.ANTHROPIC_API_KEY) {
    return "anthropic";
  }

  if (process.env.OPENAI_API_KEY) {
    return "openai";
  }
  if (process.env.GEMINI_API_KEY) {
    return "gemini";
  }
  if (process.env.ANTHROPIC_API_KEY) {
    return "anthropic";
  }

  return null;
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

async function callOpenAi(input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const response = await fetchWithTimeout("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: buildAxisSystemPrompt() },
        { role: "user", content: buildAxisUserPrompt(input) }
      ]
    })
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };

  return parseAiJson(data.choices?.[0]?.message?.content ?? "");
}

async function callGemini(input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const model = process.env.GEMINI_MODEL ?? "gemini-2.0-flash";
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

  const response = await fetchWithTimeout(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          role: "user",
          parts: [{ text: `${buildAxisSystemPrompt()}\n\n${buildAxisUserPrompt(input)}` }]
        }
      ],
      generationConfig: {
        temperature: 0.4,
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };

  return parseAiJson(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "");
}

async function callAnthropic(input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const response = await fetchWithTimeout("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
      "content-type": "application/json"
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022",
      max_tokens: 1200,
      temperature: 0.4,
      system: buildAxisSystemPrompt(),
      messages: [{ role: "user", content: buildAxisUserPrompt(input) }]
    })
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = data.content?.find((block) => block.type === "text")?.text ?? "";
  return parseAiJson(text);
}

export async function runAiDecision(input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const provider = resolveProvider();
  if (!provider) {
    return null;
  }

  let raw: AiDecisionPayload | null = null;
  try {
    raw =
      provider === "openai"
        ? await callOpenAi(input)
        : provider === "gemini"
          ? await callGemini(input)
          : await callAnthropic(input);
  } catch (err) {
    console.error(`[runAiDecision:${provider}]`, err);
    return null;
  }

  if (!raw) {
    return null;
  }

  return {
    ...raw,
    selectedOption: normalizeSelectedOption(raw.selectedOption, input.options)
  };
}
