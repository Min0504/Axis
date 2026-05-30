import { NextResponse } from "next/server";
import { createSupabaseRouteClient } from "@/lib/supabase-route";

export async function GET(req: Request) {
  const supabase = await createSupabaseRouteClient(req);

  if (!supabase) {
    return NextResponse.json({ history: [] });
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ history: [] });
  }

  const { data, error } = await supabase
    .from("comparisons")
    .select("id, query, selected_option, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    return NextResponse.json({ history: [] });
  }

  return NextResponse.json({ history: data ?? [] });
}
