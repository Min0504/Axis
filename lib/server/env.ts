/**
 * Declarative environment variable registry.
 *
 * Scattered `process.env.X` reads make it impossible to answer "what does
 * this service need to run?" — the registry centralizes that answer and
 * powers the /api/health readiness report.
 *
 * Deliberately NOT fail-fast at import time: the CI build must succeed with
 * zero secrets (see .github/workflows/ci.yml), and several features degrade
 * gracefully when unconfigured. Instead, envReport() surfaces what's missing
 * at runtime through the health endpoint / logs.
 */

type EnvVarSpec = {
  name: string;
  /** Feature group shown in the health report. */
  group: "supabase" | "ai" | "pricing" | "email" | "push" | "cron" | "site";
  /** True when the core product breaks without it (vs. optional feature). */
  core: boolean;
};

const ENV_REGISTRY: EnvVarSpec[] = [
  { name: "NEXT_PUBLIC_SUPABASE_URL", group: "supabase", core: true },
  { name: "NEXT_PUBLIC_SUPABASE_ANON_KEY", group: "supabase", core: true },
  { name: "SUPABASE_SERVICE_ROLE_KEY", group: "supabase", core: true },

  // AI: at least one key must exist; individual keys are interchangeable.
  { name: "GROQ_API_KEY", group: "ai", core: false },
  { name: "OPENAI_API_KEY", group: "ai", core: false },
  { name: "GEMINI_API_KEY", group: "ai", core: false },
  { name: "ANTHROPIC_API_KEY", group: "ai", core: false },

  { name: "AXIS_PRICE_SOURCE", group: "pricing", core: false },
  { name: "NAVER_CLIENT_ID", group: "pricing", core: false },
  { name: "NAVER_CLIENT_SECRET", group: "pricing", core: false },

  { name: "RESEND_API_KEY", group: "email", core: false },
  { name: "NEXT_PUBLIC_VAPID_PUBLIC_KEY", group: "push", core: false },
  { name: "VAPID_PRIVATE_KEY", group: "push", core: false },

  { name: "CRON_SECRET", group: "cron", core: false },
  { name: "NEXT_PUBLIC_SITE_URL", group: "site", core: false }
];

function isSet(name: string): boolean {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

export type EnvReport = {
  /** Core vars that are missing — the app is degraded without these. */
  missingCore: string[];
  /** Per-group readiness. Variable VALUES are never included (secret safety). */
  groups: Record<string, { configured: string[]; missing: string[] }>;
  /** True when at least one AI provider key is present. */
  aiConfigured: boolean;
};

export function envReport(): EnvReport {
  const groups: EnvReport["groups"] = {};
  const missingCore: string[] = [];

  for (const spec of ENV_REGISTRY) {
    const bucket = (groups[spec.group] ??= { configured: [], missing: [] });
    if (isSet(spec.name)) {
      bucket.configured.push(spec.name);
    } else {
      bucket.missing.push(spec.name);
      if (spec.core) missingCore.push(spec.name);
    }
  }

  const aiConfigured = (groups["ai"]?.configured.length ?? 0) > 0;
  return { missingCore, groups, aiConfigured };
}
