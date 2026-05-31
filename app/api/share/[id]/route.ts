import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-route";

function generateToken() {
  const chars = "abcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export async function POST(req: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const supabase = await createSupabaseRouteClient(req);

  if (!supabase) {
    return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }

  // Return existing token if already shared.
  const { data: existing } = await supabase
    .from("comparisons")
    .select("share_token")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!existing) {
    return NextResponse.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
  }

  if (existing.share_token) {
    return NextResponse.json({ token: existing.share_token });
  }

  const token = generateToken();
  const { error } = await supabase
    .from("comparisons")
    .update({ share_token: token, is_public: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: "공유 링크 생성에 실패했습니다." }, { status: 500 });
  }

  return NextResponse.json({ token });
}
