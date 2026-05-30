import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { hasSupabaseEnv } from "@/lib/supabase";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * Auth client for Route Handlers that works for BOTH:
 *  - Web (Next.js SSR): authenticates via Supabase session cookies.
 *  - Native mobile (Android/iOS) or any non-browser client: authenticates via
 *    an `Authorization: Bearer <access_token>` header. RLS then runs under that
 *    token's `auth.uid()`, so the same API endpoints serve web and app.
 *
 * Prefer the Bearer token when present (mobile path); otherwise fall back to
 * cookies (web path).
 */
export async function createSupabaseRouteClient(req: Request) {
  if (!hasSupabaseEnv()) {
    return null;
  }

  const authHeader = req.headers.get("authorization") ?? req.headers.get("Authorization");
  const bearer = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : null;

  if (bearer) {
    return createServerClient(supabaseUrl!, supabaseAnonKey!, {
      // Token-based: ignore cookies entirely.
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {}
      },
      global: {
        headers: { Authorization: `Bearer ${bearer}` }
      }
    });
  }

  const cookieStore = await cookies();

  return createServerClient(supabaseUrl!, supabaseAnonKey!, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        cookieStore.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        cookieStore.set({ name, value: "", ...options });
      }
    }
  });
}
