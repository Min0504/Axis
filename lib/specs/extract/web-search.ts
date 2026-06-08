import type { Country } from "@/lib/i18n";
import { safeHttpUrl } from "@/lib/safe-url";

export type SearchResult = {
  title: string;
  url: string;
  snippet: string;
};

const SEARCH_LIMIT = 8;

const COUNTRY_PARAM: Record<Country, string> = {
  KR: "kr",
  US: "us",
  JP: "jp"
};

export type SearchProvider = "brave" | "google";

export function configuredSearchProvider(): SearchProvider | null {
  if (process.env.BRAVE_SEARCH_API_KEY) return "brave";
  if (process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX) return "google";
  return null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringField(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function searchResult(title: unknown, url: unknown, snippet: unknown): SearchResult | null {
  const safe = safeHttpUrl(stringField(url));
  if (!safe) return null;
  return {
    title: stringField(title).trim(),
    url: safe,
    snippet: stringField(snippet).trim()
  };
}

function parseBraveResults(value: unknown): SearchResult[] {
  if (!isRecord(value) || !isRecord(value.web) || !Array.isArray(value.web.results)) return [];
  return value.web.results
    .map((item) => {
      if (!isRecord(item)) return null;
      return searchResult(item.title, item.url, item.description);
    })
    .filter((item): item is SearchResult => item !== null)
    .slice(0, SEARCH_LIMIT);
}

function parseGoogleResults(value: unknown): SearchResult[] {
  if (!isRecord(value) || !Array.isArray(value.items)) return [];
  return value.items
    .map((item) => {
      if (!isRecord(item)) return null;
      return searchResult(item.title, item.link, item.snippet);
    })
    .filter((item): item is SearchResult => item !== null)
    .slice(0, SEARCH_LIMIT);
}

async function fetchJson(url: string, init?: RequestInit): Promise<unknown | null> {
  try {
    const response = await fetch(url, init);
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    if (error instanceof Error) return null;
    throw error;
  }
}

export async function searchWeb(query: string, country: Country): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const provider = configuredSearchProvider();

  if (provider === "brave" && process.env.BRAVE_SEARCH_API_KEY) {
    const params = new URLSearchParams({
      q: trimmed,
      count: String(SEARCH_LIMIT),
      country: COUNTRY_PARAM[country]
    });
    const data = await fetchJson(`https://api.search.brave.com/res/v1/web/search?${params.toString()}`, {
      headers: {
        Accept: "application/json",
        "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY
      }
    });
    return parseBraveResults(data);
  }

  if (provider === "google" && process.env.GOOGLE_SEARCH_API_KEY && process.env.GOOGLE_SEARCH_CX) {
    const params = new URLSearchParams({
      key: process.env.GOOGLE_SEARCH_API_KEY,
      cx: process.env.GOOGLE_SEARCH_CX,
      q: trimmed,
      num: String(SEARCH_LIMIT),
      gl: COUNTRY_PARAM[country]
    });
    const data = await fetchJson(`https://www.googleapis.com/customsearch/v1?${params.toString()}`);
    return parseGoogleResults(data);
  }

  return [];
}
