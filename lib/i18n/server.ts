import "server-only";
import { cookies } from "next/headers";
import { COUNTRY_COOKIE, LOCALE_COOKIE, DEFAULT_LOCALE, DEFAULT_COUNTRY } from "./types";
import { isCountry, isLocale } from "./index";
import type { Country, Locale } from "./types";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const raw = store.get(LOCALE_COOKIE)?.value;
  return isLocale(raw) ? raw : DEFAULT_LOCALE;
}

export async function getCountry(): Promise<Country> {
  const store = await cookies();
  const raw = store.get(COUNTRY_COOKIE)?.value;
  return isCountry(raw) ? raw : DEFAULT_COUNTRY;
}
