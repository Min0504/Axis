import { buildAxisSystemPrompt, buildAxisUserPrompt } from "@/lib/ai/axis-prompt";
import type { AiDecisionInput, AiDecisionPayload } from "@/lib/ai/types";

type Provider = "openai" | "gemini" | "anthropic";

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

function parseAiJson(text: string): AiDecisionPayload | null {
  try {
    const cleaned = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned) as AiDecisionPayload;

    if (!parsed.selectedOption || !parsed.reasons?.length || !parsed.comparison?.length) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

function normalizeSelectedOption(selected: string, optionA: string, optionB: string) {
  const normalized = selected.trim().toLowerCase();
  if (normalized === optionA.toLowerCase() || normalized.includes(optionA.toLowerCase())) {
    return optionA;
  }
  if (normalized === optionB.toLowerCase() || normalized.includes(optionB.toLowerCase())) {
    return optionB;
  }
  return selected;
}

async function callOpenAi(input: AiDecisionInput): Promise<AiDecisionPayload | null> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
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

  const response = await fetch(url, {
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
  const response = await fetch("https://api.anthropic.com/v1/messages", {
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

  const raw =
    provider === "openai"
      ? await callOpenAi(input)
      : provider === "gemini"
        ? await callGemini(input)
        : await callAnthropic(input);

  if (!raw) {
    return null;
  }

  return {
    ...raw,
    selectedOption: normalizeSelectedOption(raw.selectedOption, input.optionA, input.optionB)
  };
}
