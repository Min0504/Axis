import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ensureUserProfile } from "@/lib/users/ensure-profile";
import { safeNextPath } from "@/lib/auth/safe-redirect";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const type = searchParams.get("type"); // "recovery" = 비밀번호 재설정 플로우

  // Only allow same-origin relative redirects (open-redirect guard).
  const next = safeNextPath(searchParams.get("next"));

  if (code) {
    const supabase = await createSupabaseServerClient();

    if (supabase) {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && data.user) {
        // 비밀번호 재설정 이메일에서 온 경우 → 비밀번호 변경 페이지로 이동
        if (type === "recovery") {
          return NextResponse.redirect(`${origin}/auth/update-password`);
        }
        await ensureUserProfile(supabase, data.user);
      }
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
