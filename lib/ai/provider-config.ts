export type ProviderName = "groq" | "openai" | "gemini" | "anthropic";

export type ProviderConfig =
  | { provider: "groq" | "openai"; kind: "openai"; apiKey: string; baseUrl: string; model: string }
  | { provider: "gemini"; kind: "gemini"; apiKey: string; model: string }
  | { provider: "anthropic"; kind: "anthropic"; apiKey: string; model: string };

const DEFAULT_PROVIDER_ORDER: readonly ProviderName[] = [
  "groq",
  "openai",
  "gemini",
  "anthropic"
];

function buildProviderConfig(provider: ProviderName): ProviderConfig | null {
  if (provider === "groq") {
    if (!process.env.GROQ_API_KEY) return null;
    return {
      provider,
      kind: "openai",
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai",
      model: process.env.OPENAI_MODEL ?? "llama-3.1-8b-instant"
    };
  }

  if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) return null;
    return {
      provider,
      kind: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com").replace(/\/$/, ""),
      model: process.env.OPENAI_MODEL ?? "gpt-4o-mini"
    };
  }

  if (provider === "gemini") {
    if (!process.env.GEMINI_API_KEY) return null;
    return {
      provider,
      kind: "gemini",
      apiKey: process.env.GEMINI_API_KEY,
      model: process.env.GEMINI_MODEL ?? "gemini-2.0-flash"
    };
  }

  if (!process.env.ANTHROPIC_API_KEY) return null;
  return {
    provider,
    kind: "anthropic",
    apiKey: process.env.ANTHROPIC_API_KEY,
    model: process.env.ANTHROPIC_MODEL ?? "claude-3-5-haiku-20241022"
  };
}

function providerOrderFromPreference(preferred: string | undefined): readonly ProviderName[] {
  const normalized = preferred?.toLowerCase();
  if (!normalized) return DEFAULT_PROVIDER_ORDER;
  if (!DEFAULT_PROVIDER_ORDER.includes(normalized as ProviderName)) {
    return DEFAULT_PROVIDER_ORDER;
  }

  const preferredProvider = normalized as ProviderName;
  return [
    preferredProvider,
    ...DEFAULT_PROVIDER_ORDER.filter((provider) => provider !== preferredProvider)
  ];
}

export function resolveProviderConfigs(): ProviderConfig[] {
  const orderedProviders = providerOrderFromPreference(process.env.AI_PROVIDER);
  return orderedProviders
    .map(buildProviderConfig)
    .filter((config): config is ProviderConfig => config !== null);
}
