import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { COMPARISONS, CATEGORY_LABELS } from "@/lib/compare-pages/comparisons";
import { buildDecision, buildQuery } from "@/lib/decision-engine";
import { createServiceClient } from "@/lib/supabase-server";
import ResultsView from "@/components/results-view";
import PageViewTracker from "@/components/page-view-tracker";
import type { ComparisonResult } from "@/lib/types";
import { getSiteUrl } from "@/lib/site-url";
import { isIndexable } from "@/lib/specs/source";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary, type Locale } from "@/lib/i18n";

// Re-generate at most once per day.
export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

function isSafeCachedResult(result: ComparisonResult): boolean {
  if (result.verification !== "verified") return false;
  return !result.comparison.some((row) => row.values.some((value) => value.includes(" 관점")));
}

export function generateStaticParams() {
  return COMPARISONS.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const def = COMPARISONS.find((c) => c.slug === slug);
  if (!def) return { title: "비교" };

  const title = `${def.title} — Axis의 선택은?`;
  const siteUrl = getSiteUrl();
  // SEO metadata stays Korean (KR index pages).
  const result = await getOrGenerate(slug, def.options, "ko");
  const indexable = result ? isIndexable(result.verification ?? "unverified") : false;

  return {
    title,
    description: def.description,
    robots: indexable ? undefined : { index: false, follow: true },
    openGraph: {
      title,
      description: def.description,
      url: `${siteUrl}/compare/${slug}`,
      type: "article",
    },
    twitter: { card: "summary", title, description: def.description },
    alternates: { canonical: `${siteUrl}/compare/${slug}` },
  };
}

async function getOrGenerate(
  slug: string,
  options: string[],
  locale: Locale
): Promise<ComparisonResult | null> {
  const db = createServiceClient();
  const query = buildQuery(options);

  // 1. Try cache — only reuse when cached result language matches.
  const { data } = await db
    .from("seo_comparisons")
    .select("result")
    .eq("slug", slug)
    .maybeSingle();

  if (data?.result && isSafeCachedResult(data.result as ComparisonResult)) {
    const cached = data.result as ComparisonResult;
    if ((cached.locale ?? "ko") === locale) return cached;
  }

  // 2. Generate with AI for the active UI locale
  let result: ComparisonResult;
  try {
    result = await buildDecision(query, 6, locale);
  } catch {
    return null;
  }

  // Persist only Korean SEO cache so KR index pages stay stable.
  if (locale === "ko" && result.verification === "verified") {
    db.from("seo_comparisons")
      .upsert({ slug, query, result, generated_at: new Date().toISOString() })
      .then(({ error }) => { if (error) console.error("[seo_comparisons.upsert]", error.message); });
  }

  return result;
}

export default async function ComparePage({ params }: Props) {
  const { slug } = await params;
  const def = COMPARISONS.find((c) => c.slug === slug);
  if (!def) notFound();

  const locale = await getLocale();
  const t = getDictionary(locale);
  const result = await getOrGenerate(slug, def.options, locale);
  if (!result) notFound();

  const query = buildQuery(def.options);
  const relatedComparisons = COMPARISONS.filter(
    (c) => c.category === def.category && c.slug !== slug
  ).slice(0, 4);

  const siteUrl = getSiteUrl();
  const categoryLabel =
    t.home.categoryLabels[def.category as keyof typeof t.home.categoryLabels] ??
    CATEGORY_LABELS[def.category];

  // JSON-LD structured data (KR SEO)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${def.title} — Axis의 선택은?`,
    description: def.description,
    url: `${siteUrl}/compare/${slug}`,
    author: { "@type": "Organization", name: "Axis" },
    dateModified: new Date().toISOString(),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="compare-breadcrumb">
        <Link href="/">axis</Link>
        <span aria-hidden>›</span>
        <Link href="/compare">{categoryLabel}</Link>
        <span aria-hidden>›</span>
        <span>{def.title}</span>
      </div>

      <PageViewTracker slug={slug} region="KR" />
      <ResultsView
        query={query}
        result={result}
        locale={locale}
        hidePrices
        slug={slug}
        region="KR"
      />

      {relatedComparisons.length > 0 && (
        <section className="compare-related">
          <h2 className="compare-related-title">{t.home.compareTitle}</h2>
          <ul className="compare-related-list">
            {relatedComparisons.map((c) => (
              <li key={c.slug}>
                <Link href={`/compare/${c.slug}`} className="compare-related-link">
                  {c.title}
                  <span aria-hidden> →</span>
                </Link>
                <p className="compare-related-desc">{c.description.slice(0, 60)}...</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="compare-cta">
        <p className="compare-cta-copy">{t.home.compareIndex.ctaCopy}</p>
        <Link href={`/?q=${encodeURIComponent(def.options.join(" vs "))}`} className="btn-primary compare-cta-btn">
          {t.home.compareIndex.cta}
        </Link>
      </section>
    </>
  );
}
