import { updateSession } from "@/lib/supabase/middleware";
import { COUNTRY_COOKIE, LOCALE_COOKIE, detectCountry, detectLocale } from "@/lib/i18n";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const existingCountry = request.cookies.get(COUNTRY_COOKIE)?.value;
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    undefined;
  const acceptLang = request.headers.get("accept-language") ?? undefined;

  const locale = detectLocale(existingLocale, country, acceptLang);
  const sourceCountry = detectCountry(existingCountry, country, locale);

  const response = await updateSession(request);

  if (!existingLocale || existingLocale !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax"
    });
  }
  if (!existingCountry || existingCountry !== sourceCountry) {
    response.cookies.set(COUNTRY_COOKIE, sourceCountry, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax"
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
