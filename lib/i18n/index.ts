import { ko } from "./ko";
import { en } from "./en";
import { ja } from "./ja";
import {
  COUNTRY_LOCALE,
  DEFAULT_LOCALE,
  SUPPORTED_LOCALES,
  type Locale
} from "./types";

export type { Locale, Dictionary } from "./types";
export { LOCALE_COOKIE, SUPPORTED_LOCALES, LOCALE_LABELS } from "./types";

const dictionaries = { ko, en, ja } as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

/**
 * Detect locale from request headers (used in middleware/proxy).
 * Priority: existing cookie → Vercel country → Accept-Language → default.
 */
export function detectLocale(
  cookieValue: string | undefined,
  countryCode: string | undefined,
  acceptLanguage: string | undefined
): Locale {
  if (isLocale(cookieValue)) return cookieValue;
  if (countryCode && COUNTRY_LOCALE[countryCode]) return COUNTRY_LOCALE[countryCode];
  if (acceptLanguage) {
    const primary = acceptLanguage.split(",")[0].split(";")[0].trim().slice(0, 2).toLowerCase();
    if (isLocale(primary)) return primary as Locale;
  }
  return DEFAULT_LOCALE;
}
