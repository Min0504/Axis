import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-route";
import type { ComparisonResult } from "@/lib/types";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
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

  const { data, error } = await supabase
    .from("comparisons")
    .select("id, query, analysis_result")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (error || !data) {
    return NextResponse.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
  }

  return NextResponse.json({
    query: data.query,
    result: data.analysis_result as ComparisonResult
  });
}
