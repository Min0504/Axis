import { notFound } from "next/navigation";
import Link from "next/link";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import ResultsView from "@/components/results-view";
import type { ComparisonResult } from "@/lib/types";
import type { Metadata } from "next";
import { buildDecision } from "@/lib/decision-engine";
import { getCountry, getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

type Props = { params: Promise<{ token: string }> };

async function loadShared(token: string) {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const { data } = await supabase
    .from("comparisons")
    .select("query, analysis_result, user_id")
    .eq("share_token", token)
    .eq("is_public", true)
    .maybeSingle();

  return data ?? null;
}

async function resultForLocale(query: string, result: ComparisonResult, locale: Awaited<ReturnType<typeof getLocale>>) {
  if (result.locale === locale) return result;
  const country = await getCountry();
  return buildDecision(query, 6, locale, country);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { token } = await params;
  const [data, locale] = await Promise.all([loadShared(token), getLocale()]);
  const t = getDictionary(locale);
  if (!data) {
    return { title: t.share.sharedFallback };
  }

  const result = await resultForLocale(data.query, data.analysis_result as ComparisonResult, locale);
  const title = `${result.selectedOption} — ${t.results.axisChoice}`;
  // Verification gate: only verified spec tables are allowed into the search
  // index. AI-grade / partial results render but stay noindex so we never
  // present unverified specs as authority.
  const indexable = result.verification === "verified";
  return {
    title,
    description: result.oneLineConclusion ?? data.query,
    robots: indexable ? undefined : { index: false, follow: true },
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

  const result = await resultForLocale(data.query, data.analysis_result as ComparisonResult, locale);

  // Guests (no user_id) get the viral watermark; logged-in shares are clean.
  const showWatermark = !data.user_id;

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
