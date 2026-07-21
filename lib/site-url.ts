const LOCAL_FALLBACK = "http://localhost:3000" as const;
const PUBLIC_FALLBACK = "https://axis-app-beta.vercel.app" as const;

type SiteUrlMode = "public" | "local";

export function getSiteUrl(mode: SiteUrlMode = "public"): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/$/, "");
  return mode === "local" ? LOCAL_FALLBACK : PUBLIC_FALLBACK;
}
