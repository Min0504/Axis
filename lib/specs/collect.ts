import { resolveOfficialProduct } from "@/lib/specs/product-registry";
import { parseAppleSpecsHtml } from "@/lib/specs/parsers/apple";
import { parseGenericSpecsHtml } from "@/lib/specs/parsers/generic";
import { parseSamsungSpecsHtml } from "@/lib/specs/parsers/samsung";
import type { OfficialProductSpecs } from "@/lib/specs/types";

const FETCH_HEADERS = {
  "User-Agent": "AxisSpecBot/1.0 (+https://axis.local; official-spec-collection)",
  Accept: "text/html,application/xhtml+xml"
};

const FETCH_TIMEOUT_MS = 8_000;

async function fetchHtml(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: FETCH_HEADERS,
      next: { revalidate: 60 * 60 * 12 },
      signal: controller.signal
    });

    if (!response.ok) {
      throw new Error(`공식 페이지를 가져오지 못했습니다 (${response.status}): ${url}`);
    }

    return response.text();
  } finally {
    clearTimeout(timer);
  }
}

/** Localize Apple spec page URL based on user locale. */
function localizeUrl(url: string, parser: string, locale: string): string {
  if (parser !== "apple") return url;
  if (locale === "ko") return url.replace("https://www.apple.com/", "https://www.apple.com/kr/");
  if (locale === "ja") return url.replace("https://www.apple.com/", "https://www.apple.com/jp/");
  return url;
}

export async function collectOfficialSpecs(
  productName: string,
  locale = "ko"
): Promise<OfficialProductSpecs | null> {
  const entry = resolveOfficialProduct(productName);
  if (!entry) {
    return null;
  }

  const targetUrl = localizeUrl(entry.officialUrl, entry.parser, locale);
  const html = await fetchHtml(targetUrl);
  const specs =
    entry.parser === "apple"
      ? parseAppleSpecsHtml(html, { url: targetUrl, columnClass: entry.columnClass })
      : entry.parser === "samsung"
        ? parseSamsungSpecsHtml(html, targetUrl)
        : parseGenericSpecsHtml(html, targetUrl);

  if (!specs.length) {
    return null;
  }

  return {
    productName,
    officialUrl: targetUrl,
    specs,
    fetchedAt: new Date().toISOString(),
    level: entry.level
  };
}
