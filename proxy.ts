import { updateSession } from "@/lib/supabase/middleware";
import { detectLocale, LOCALE_COOKIE } from "@/lib/i18n";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  // ── 1. Locale detection ────────────────────────────────────────────────
  // Priority: existing cookie → Vercel/CF country header → Accept-Language
  const existingLocale = request.cookies.get(LOCALE_COOKIE)?.value;
  const country =
    request.headers.get("x-vercel-ip-country") ??
    request.headers.get("cf-ipcountry") ??
    undefined;
  const acceptLang = request.headers.get("accept-language") ?? undefined;

  const locale = detectLocale(existingLocale, country, acceptLang);

  // ── 2. Supabase session refresh ────────────────────────────────────────
  const response = await updateSession(request);

  // ── 3. Stamp locale cookie on the response (if not already set or different)
  if (!existingLocale || existingLocale !== locale) {
    response.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
      sameSite: "lax"
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"]
};
