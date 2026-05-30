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

export async function collectOfficialSpecs(productName: string): Promise<OfficialProductSpecs | null> {
  const entry = resolveOfficialProduct(productName);
  if (!entry) {
    return null;
  }

  const html = await fetchHtml(entry.officialUrl);
  const specs =
    entry.parser === "apple"
      ? parseAppleSpecsHtml(html, { url: entry.officialUrl, columnClass: entry.columnClass })
      : entry.parser === "samsung"
        ? parseSamsungSpecsHtml(html, entry.officialUrl)
        : parseGenericSpecsHtml(html, entry.officialUrl);

  if (!specs.length) {
    return null;
  }

  return {
    productName,
    officialUrl: entry.officialUrl,
    specs,
    fetchedAt: new Date().toISOString(),
    level: entry.level
  };
}
