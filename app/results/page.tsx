import ResultsView from "@/components/results-view";
import SessionResults from "@/components/session-results";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ComparisonResult } from "@/lib/types";

type Payload = {
  query: string;
  result: ComparisonResult;
};

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
  searchParams: Promise<{ historyId?: string }>;
}) {
  const params = await searchParams;

  // Logged-in path: load the saved comparison by id (server-side, RLS-guarded).
  if (params.historyId) {
    const parsed = await loadFromHistory(params.historyId);

    if (!parsed) {
      return (
        <main className="container narrow">
          <p className="hint error">결과를 찾을 수 없습니다. 다시 비교해 주세요.</p>
        </main>
      );
    }

    return (
      <ResultsView
        query={parsed.query}
        result={parsed.result}
        comparisonId={params.historyId}
      />
    );
  }

  // Guest path: the result was stashed in sessionStorage by the compare form,
  // so render it client-side instead of carrying it in the URL.
  return <SessionResults />;
}
