import { ko } from "./ko";
import { en } from "./en";
import { ja } from "./ja";
import {
  DEFAULT_COUNTRY,
  COUNTRY_LOCALE,
  DEFAULT_LOCALE,
  LOCALE_COUNTRY,
  SUPPORTED_COUNTRIES,
  SUPPORTED_LOCALES,
  type Country,
  type Locale
} from "./types";

export type { Country, Locale, Dictionary } from "./types";
export {
  COUNTRY_COOKIE,
  COUNTRY_LABELS,
  DEFAULT_COUNTRY,
  LOCALE_COOKIE,
  SUPPORTED_COUNTRIES,
  SUPPORTED_LOCALES,
  LOCALE_LABELS
} from "./types";

const dictionaries = { ko, en, ja } as const;

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

export function isLocale(value: string | null | undefined): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function isCountry(value: string | null | undefined): value is Country {
  return SUPPORTED_COUNTRIES.includes(value as Country);
}

export function countryForLocale(locale: Locale): Country {
  return LOCALE_COUNTRY[locale] ?? DEFAULT_COUNTRY;
}

export function detectCountry(
  cookieValue: string | undefined,
  countryCode: string | undefined,
  locale: Locale
): Country {
  if (isCountry(cookieValue)) return cookieValue;
  if (isCountry(countryCode)) return countryCode;
  return countryForLocale(locale);
}

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
