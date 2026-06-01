export type Locale = "ko" | "en" | "ja";

export const SUPPORTED_LOCALES: Locale[] = ["ko", "en", "ja"];
export const DEFAULT_LOCALE: Locale = "ko";
export const LOCALE_COOKIE = "axis-locale";
export const THEME_COOKIE = "axis-theme";

export const LOCALE_LABELS: Record<Locale, string> = {
  ko: "한국어",
  en: "English",
  ja: "日本語"
};

/** ISO 3166-1 country code → preferred locale. */
export const COUNTRY_LOCALE: Record<string, Locale> = {
  KR: "ko",
  JP: "ja"
  // All others fall back to "en"
};

export type Dictionary = typeof import("./ko").ko;
