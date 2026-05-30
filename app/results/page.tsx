import ResultsView from "@/components/results-view";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ComparisonResult } from "@/lib/types";

type Payload = {
  query: string;
  result: ComparisonResult;
};

function parsePayload(payload?: string): Payload | null {
  if (!payload) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(payload)) as Payload;
  } catch {
    return null;
  }
}

async function loadFromHistory(historyId: string): Promise<Payload | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("comparisons")
    .select("query, analysis_result")
    .eq("id", historyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) {
    return null;
  }

  return {
    query: data.query,
    result: data.analysis_result as ComparisonResult
  };
}

export default async function ResultsPage({
  searchParams
}: {
  searchParams: Promise<{ payload?: string; historyId?: string }>;
}) {
  const params = await searchParams;

  const parsed = params.historyId
    ? await loadFromHistory(params.historyId)
    : parsePayload(params.payload);

  if (!parsed) {
    return (
      <main className="container narrow">
        <p className="hint error">결과를 찾을 수 없습니다. 다시 비교해 주세요.</p>
      </main>
    );
  }

  return <ResultsView query={parsed.query} result={parsed.result} />;
}
