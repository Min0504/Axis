import type {
  ProductRegistryEntry,
  ProductSourceCandidate,
  RegionalUrlMap
} from "@/lib/specs/types";
import type { Country } from "@/lib/i18n";
import { normalizeProductName } from "@/lib/specs/product-aliases";
import { registry } from "@/lib/specs/product-registry-data";

const SAMSUNG_COUNTRY_MARKERS: Record<Country, string> = {
  KR: "/sec/",
  US: "/us/",
  JP: "/jp/"
};

export function resolveOfficialProduct(name: string): ProductRegistryEntry | null {
  const key = normalizeProductName(name);
  if (registry[key]) return registry[key];

  const fuzzy = Object.entries(registry).find(([registryKey]) => (
    key.includes(registryKey) || registryKey.includes(key)
  ));
  return fuzzy ? fuzzy[1] : null;
}

function regionalUrl(urls: RegionalUrlMap | undefined, country: Country): string | null {
  return urls?.[country] ?? null;
}

function countryForLegacyLocale(locale: string): Country {
  if (locale === "ko") return "KR";
  if (locale === "ja") return "JP";
  return "US";
}

function localizedManufacturerUrl(
  url: string,
  parser: ProductRegistryEntry["parser"],
  country: Country,
  officialUrls?: ProductRegistryEntry["officialUrls"]
): string | null {
  const explicit = regionalUrl(officialUrls, country);
  if (explicit) return explicit;

  if (url.startsWith("https://support.apple.com/")) {
    if (country === "KR") return url.replace("/en-us/", "/ko-kr/");
    if (country === "JP") return url.replace("/en-us/", "/ja-jp/");
    return url;
  }

  if (parser === "apple" && url.startsWith("https://www.apple.com/")) {
    if (country === "KR") return url.replace("https://www.apple.com/", "https://www.apple.com/kr/");
    if (country === "JP") return url.replace("https://www.apple.com/", "https://www.apple.com/jp/");
    return url;
  }

  if (parser === "samsung") {
    return url.includes(SAMSUNG_COUNTRY_MARKERS[country]) ? url : null;
  }

  return country === "US" ? url : null;
}

export function resolveProductSource(
  entry: ProductRegistryEntry,
  country: Country
): ProductSourceCandidate | null {
  const officialUrl = localizedManufacturerUrl(entry.officialUrl, entry.parser, country, entry.officialUrls);
  if (officialUrl) {
    return { url: officialUrl, tier: 1, kind: "manufacturer" };
  }

  const importerUrl = regionalUrl(entry.importerUrls, country);
  if (entry.allowImporterFallback && importerUrl) {
    return { url: importerUrl, tier: 2, kind: "authorized_importer" };
  }

  return null;
}

export function localizeOfficialUrl(
  url: string,
  parser: ProductRegistryEntry["parser"],
  locale: string,
  officialUrls?: ProductRegistryEntry["officialUrls"]
): string {
  const country = countryForLegacyLocale(locale);
  const explicit = regionalUrl(officialUrls, country);
  if (explicit) return explicit;
  if (url.startsWith("https://support.apple.com/")) {
    if (locale === "ko") return url.replace("/en-us/", "/ko-kr/");
    if (locale === "ja") return url.replace("/en-us/", "/ja-jp/");
    return url;
  }
  if (parser === "apple") {
    if (locale === "ko") return url.replace("https://www.apple.com/", "https://www.apple.com/kr/");
    if (locale === "ja") return url.replace("https://www.apple.com/", "https://www.apple.com/jp/");
  }
  return url;
}
