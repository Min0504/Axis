import { NextResponse } from "next/server";
import { buildDecision, buildQuery } from "@/lib/decision-engine";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import { ensureUserProfile } from "@/lib/users/ensure-profile";

export async function POST(req: Request) {
  const body = (await req.json()) as { query?: string; optionA?: string; optionB?: string };
  const query =
    body.query?.trim() ||
    (body.optionA?.trim() && body.optionB?.trim() ? buildQuery(body.optionA, body.optionB) : "");

  if (!query) {
    return NextResponse.json({ error: "두 선택지를 모두 입력해주세요." }, { status: 400 });
  }

  let result;
  try {
    result = await buildDecision(query);
  } catch (err) {
    console.error("[buildDecision]", err);
    return NextResponse.json({ error: "분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요." }, { status: 500 });
  }
  const supabase = await createSupabaseServerClient();

  let comparisonId: string | undefined;

  if (supabase) {
    const {
      data: { user }
    } = await supabase.auth.getUser();

    if (user) {
      await ensureUserProfile(supabase, user);

      const { data, error } = await supabase
        .from("comparisons")
        .insert({
          user_id: user.id,
          query,
          category: result.category,
          selected_option: result.selectedOption,
          analysis_result: result
        })
        .select("id")
        .single();

      if (error) {
        console.error("[comparisons.insert]", error.message);
      } else {
        comparisonId = data.id;
      }
    }
  }

  return NextResponse.json({ result, comparisonId });
}
