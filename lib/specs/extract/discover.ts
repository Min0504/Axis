import type { Country } from "@/lib/i18n";
import { safeHttpUrl } from "@/lib/safe-url";
import type { Category } from "@/lib/types";
import { buildBrandUrlCandidates } from "./url-patterns";
import { fetchPageHtml } from "./fetch";

/** Manufacturer domains we accept as "official". Hostname-suffix matched. */
export const OFFICIAL_DOMAINS = [
  "apple.com",
  "samsung.com",
  "lg.com",
  "lge.co.kr",
  "dell.com",
  "lenovo.com",
  "asus.com",
  "hp.com",
  "microsoft.com",
  "sony.com",
  "store.google.com",
  "xiaomi.com",
  "mi.com",
  "razer.com",
  "msi.com",
  "acer.com",
  "framework.com",
  "gigabyte.com"
];

export function isOfficialUrl(value: string): boolean {
  const safe = safeHttpUrl(value);
  if (!safe) return false;
  try {
    const host = new URL(safe).hostname.toLowerCase().replace(/^www\./, "");
    return OFFICIAL_DOMAINS.some((d) => host === d || host.endsWith(`.${d}`));
  } catch {
    return false;
  }
}

/**
 * Lightweight discovery: try brand URL patterns only (no web search / AI).
 * Returns the first candidate that responds with HTML.
 */
export async function discoverOfficialUrl(
  productName: string,
  _category: Category,
  opts: { country?: Country; fetchPage?: (url: string) => Promise<string | null> } = {}
): Promise<string | null> {
  const country = opts.country ?? "KR";
  const fetchPage = opts.fetchPage ?? fetchPageHtml;
  const candidates = buildBrandUrlCandidates(productName, country).filter(isOfficialUrl);

  for (const url of candidates.slice(0, 4)) {
    const html = await fetchPage(url);
    if (html && html.length > 200) return url;
  }
  return null;
}
