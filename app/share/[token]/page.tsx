import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ResultsView from "@/components/results-view";
import type { ComparisonResult } from "@/lib/types";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

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
  const [data, locale] = await Promise.all([loadShared(token), getLocale()]);
  const t = getDictionary(locale);
  if (!data) {
    return { title: t.share.sharedFallback };
  }

  const result = data.analysis_result as ComparisonResult;
  const title = `${result.selectedOption} — ${t.results.axisChoice}`;
  return {
    title,
    description: result.oneLineConclusion ?? data.query,
    openGraph: {
      title: t.share.shareTitle(result.selectedOption),
      description: result.oneLineConclusion ?? data.query
    }
  };
}

export default async function SharePage({ params }: Props) {
  const { token } = await params;
  const [data, locale] = await Promise.all([loadShared(token), getLocale()]);
  const t = getDictionary(locale).share;

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
        locale={locale}
        shareToken={token}
      />

      {showWatermark && (
        <div className="share-watermark">
          <p>
            <strong>axis</strong>{t.watermarkText}
          </p>
          <Link className="btn-primary block" href="/" style={{ marginTop: "0.6rem", maxWidth: 300, margin: "0.6rem auto 0" }}>
            {t.watermarkCta}
          </Link>
        </div>
      )}
    </>
  );
}
