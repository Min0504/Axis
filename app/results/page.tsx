import type { Metadata } from "next";
import ResultsView from "@/components/results-view";
import SessionResults from "@/components/session-results";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { ComparisonResult } from "@/lib/types";
import { buildDecision } from "@/lib/decision-engine";
import { getCountry, getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = {
  robots: { index: false, follow: false }
};

type Payload = { query: string; result: ComparisonResult };

async function loadFromHistory(historyId: string): Promise<Payload | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("comparisons")
    .select("query, analysis_result")
    .eq("id", historyId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data) return null;

  return { query: data.query, result: data.analysis_result as ComparisonResult };
}

export default async function ResultsPage({
  searchParams,
}: {
  searchParams: Promise<{ historyId?: string }>;
}) {
  const params = await searchParams;
  const [locale, country] = await Promise.all([getLocale(), getCountry()]);
  const t = getDictionary(locale).results;

  if (params.historyId) {
    const parsed = await loadFromHistory(params.historyId);

    if (!parsed) {
      return (
        <main className="container narrow">
          <p className="hint error">{t.notFound}</p>
        </main>
      );
    }

    const result =
      parsed.result.locale === locale
        ? parsed.result
        : await buildDecision(parsed.query, 6, locale, country);

    return (
      <ResultsView
        query={parsed.query}
        result={result}
        locale={locale}
        comparisonId={params.historyId}
      />
    );
  }

  return <SessionResults locale={locale} />;
}
