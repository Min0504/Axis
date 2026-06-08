export type Locale = "ko" | "en" | "ja";
export type Country = "KR" | "US" | "JP";

export const SUPPORTED_LOCALES: Locale[] = ["ko", "en", "ja"];
export const SUPPORTED_COUNTRIES: Country[] = ["KR", "US", "JP"];
export const DEFAULT_LOCALE: Locale = "ko";
export const DEFAULT_COUNTRY: Country = "KR";
export const LOCALE_COOKIE = "axis-locale";
export const COUNTRY_COOKIE = "axis-country";
export const THEME_COOKIE = "axis-theme";

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
};

export const COUNTRY_LABELS: Record<Country, string> = {
  KR: "대한민국",
  US: "United States",
  JP: "日本"
};

export const COUNTRY_LOCALE: Record<string, Locale> = {
  KR: "ko",
  US: "en",
  JP: "ja"
};

export const LOCALE_COUNTRY: Record<Locale, Country> = {
  ko: "KR",
  en: "US",
  ja: "JP"
};

export type Dictionary = typeof import("./ko").ko;
