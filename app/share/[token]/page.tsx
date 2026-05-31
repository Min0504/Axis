import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ResultsView from "@/components/results-view";
import type { ComparisonResult } from "@/lib/types";
import type { Metadata } from "next";

type Props = { params: Promise<{ token: string }> };

async function loadShared(token: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("comparisons")
    .select("query, analysis_result, user_id, plan:users(plan)")
    .eq("share_token", token)
    .eq("is_public", true)
    .maybeSingle();

  return data ?? null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const data = await loadShared(token);
  if (!data) {
    return { title: "공유된 선택" };
  }

  const result = data.analysis_result as ComparisonResult;
  return {
    title: `${result.selectedOption} — Axis의 선택`,
    description: result.oneLineConclusion ?? data.query,
    openGraph: {
      title: `Axis가 선택했어요: ${result.selectedOption}`,
      description: result.oneLineConclusion ?? data.query
    }
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const data = await loadShared(token);

  if (!data) {
    notFound();
  }

  const result = data.analysis_result as ComparisonResult;

  // Determine if the sharer is on a paid plan (watermark shown for free/guest).
  // Guest shares (no user_id) always show the watermark.
  const sharerPlan = (data as { plan?: { plan?: string } | null }).plan?.plan ?? "free";
  const showWatermark = sharerPlan === "free" || !data.user_id;

  return (
    <>
      <ResultsView
        query={data.query}
        result={result}
        shareToken={token}
      />

      {showWatermark && (
        <div className="share-watermark">
          <p>
            <strong>axis</strong>로 비교한 결과예요.
          </p>
          <Link className="btn-primary block" href="/" style={{ marginTop: "0.6rem", maxWidth: 300, margin: "0.6rem auto 0" }}>
            나도 비교해보기 →
          </Link>
        </div>
      )}
    </>
  );
}
