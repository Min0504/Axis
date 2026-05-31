import { notFound } from "next/navigation";
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
    .select("query, analysis_result")
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

  return (
    <ResultsView
      query={data.query}
      result={data.analysis_result as ComparisonResult}
      shareToken={token}
    />
  );
}
