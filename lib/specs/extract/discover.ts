import { resolveVerifiedAny } from "@/lib/specs/dataset";
import { completeJson, type CompleteFn } from "@/lib/ai/complete";
import type { Country } from "@/lib/i18n";
import { safeHttpUrl } from "@/lib/safe-url";
import type { Category } from "@/lib/types";
import { normalizeProductName } from "@/lib/specs/product-aliases";
import { buildBrandUrlCandidates } from "./url-patterns";
import { fetchPageHtml } from "./fetch";
import { searchWeb, type SearchResult } from "./web-search";

/**
 * Official-page discovery: turn a product name into the manufacturer's official
 * spec URL — the page the AI extractor reads.
 *
 * Two sources, in order:
 *   1. Catalog (known, trusted source URLs) — works today.
 *   2. Search (injected), filtered to a manufacturer-domain allowlist so we
 *      never extract from a retailer, blog, or SEO-spam page masquerading as
 *      "official". The allowlist is the trust guard for discovery.
 */

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

/** Returns candidate result URLs for a query. Plug a real search API in here. */
export type SearchCandidate = string | SearchResult;
export type SearchFn = (query: string, country: Country) => Promise<SearchCandidate[]>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function candidateUrl(candidate: SearchCandidate): string {
  return typeof candidate === "string" ? candidate : candidate.url;
}

function candidateText(candidate: SearchCandidate): string {
  if (typeof candidate === "string") return candidate;
  return [candidate.title, candidate.url, candidate.snippet].filter(Boolean).join(" — ");
}

function searchQuery(productName: string, country: Country): string {
  if (country === "US") return `${productName} official specifications`;
  if (country === "JP") return `${productName} 公式 仕様`;
  return `${productName} 공식 사양`;
}

function parseChosenUrl(value: string | null): string | null {
  if (!value) return null;
  try {
    const parsed: unknown = JSON.parse(value);
    if (!isRecord(parsed)) return null;
    const url = parsed.url;
    return typeof url === "string" ? safeHttpUrl(url) ?? null : null;
  } catch (error) {
    if (error instanceof SyntaxError) return null;
    throw error;
  }
}

async function chooseOfficialUrlWithAi(params: {
  productName: string;
  category: Category;
  country: Country;
  candidates: SearchCandidate[];
  complete: CompleteFn;
}): Promise<string | null> {
  const officialCandidates = params.candidates.filter((candidate) => isOfficialUrl(candidateUrl(candidate)));
  if (!officialCandidates.length) return null;

  const system = [
    "You select one official product specification page from search results.",
    "Return JSON only: {\"url\":\"https://...\"} or {\"url\":\"\"}.",
    "Choose only if the URL is a manufacturer official product/spec/support page and matches the product.",
    "Do not choose retailers, blogs, press articles, SEO pages, or unrelated products."
  ].join("\n");
  const user = JSON.stringify(
    {
      productName: params.productName,
      category: params.category,
      country: params.country,
      candidates: officialCandidates.map((candidate) => ({
        url: candidateUrl(candidate),
        text: candidateText(candidate)
      }))
    },
    null,
    2
  );

  const chosen = parseChosenUrl(await params.complete(system, user));
  if (!chosen) return null;
  return officialCandidates.some((candidate) => safeHttpUrl(candidateUrl(candidate)) === chosen) ? chosen : null;
}

/** Verify a candidate URL by fetching it and checking for meaningful content. */
async function verifyBrandUrl(url: string): Promise<boolean> {
  const html = await fetchPageHtml(url);
  return html !== null && html.length > 1000;
}

/**
 * Try to resolve the official URL from brand URL patterns (no API key needed).
 * Normalizes the product name to English first, then constructs candidate URLs
 * for Apple / Samsung based on their predictable URL structures.
 */
async function tryBrandUrlPatterns(productName: string, country: Country): Promise<string | null> {
  const normalized = normalizeProductName(productName);
  const candidates = buildBrandUrlCandidates(normalized, country);

  for (const url of candidates) {
    if (await verifyBrandUrl(url)) return url;
  }
  return null;
}

/**
 * Resolve a product name to an official spec URL.
 *   1. Verified catalog (dataset) — instant, no network.
 *   2. Brand URL patterns — derive URL from name, verify with GET. Works for
 *      Apple and Samsung without any API key.
 *   3. Web search — injected search filtered to official domains. Needs
 *      BRAVE_SEARCH_API_KEY or GOOGLE_SEARCH_API_KEY.
 *
 * Returns null when nothing trustworthy is found (no fabrication).
 */
export async function discoverOfficialUrl(
  productName: string,
  _category: Category,
  opts?: { country?: Country; search?: SearchFn; complete?: CompleteFn }
): Promise<string | null> {
  const known = resolveVerifiedAny(productName)?.source;
  if (known) return known;

  const country = opts?.country ?? "KR";

  const brandUrl = await tryBrandUrlPatterns(productName, country);
  if (brandUrl) return brandUrl;

  const search = opts?.search ?? searchWeb;
  const complete = opts?.complete ?? completeJson;
  let results: SearchCandidate[] = [];
  try {
    results = await search(searchQuery(productName, country), country);
  } catch (error) {
    if (!(error instanceof Error)) throw error;
  }
  return chooseOfficialUrlWithAi({
    productName,
    category: _category,
    country,
    candidates: results,
    complete
  });
}
