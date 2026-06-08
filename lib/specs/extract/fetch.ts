import { safeHttpUrl } from "@/lib/safe-url";

/**
 * Fetch an official product page's HTML. Key-less (plain HTTP), but only ever
 * called with manufacturer URLs from our own catalog — never user input — so
 * there's no SSRF surface. JS-rendered pages may return shell HTML; a renderer
 * can be slotted in later behind this same function.
 */

const FETCH_TIMEOUT_MS = 10_000;

const HEADERS = {
  "User-Agent": "AxisSpecBot/1.0 (+https://axis.app; official-spec-extraction)",
  Accept: "text/html,application/xhtml+xml",
  "Accept-Language": "en,ko;q=0.8"
};

export async function fetchPageHtml(url: string): Promise<string | null> {
  const safe = safeHttpUrl(url);
  if (!safe) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(safe, {
      headers: HEADERS,
      signal: controller.signal,
      next: { revalidate: 60 * 60 * 12 }
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
