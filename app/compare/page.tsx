import type { Metadata } from "next";
import Link from "next/link";
import { COMPARISONS } from "@/lib/compare-pages/comparisons";
import type { ComparisonDef } from "@/lib/compare-pages/comparisons";
import { localizedComparisonTitle } from "@/lib/compare-pages/localized-title";
import { getDictionary } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n/server";

const CATEGORIES: ComparisonDef["category"][] = ["laptop", "smartphone", "earphones", "tablet"];

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return {
    title: t.home.compareIndex.metaTitle,
    description: t.home.compareIndex.metaDescription,
  };
}

export default async function ComparePage() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  const byCategory = Object.fromEntries(
    CATEGORIES.map((cat) => [cat, COMPARISONS.filter((c) => c.category === cat)])
  ) as Record<ComparisonDef["category"], ComparisonDef[]>;

  return (
    <main className="container narrow">
      <header className="topbar">
        <Link href="/" className="brand">
          axis<span className="brand-beta">beta</span>
        </Link>
      </header>

      <section className="hero compact">
        <h1>{t.home.compareIndex.title}</h1>
        <p className="sub">{t.home.compareIndex.sub}</p>
      </section>

      {CATEGORIES.map((cat) => (
        <section key={cat} className="compare-index-section">
          <h2 className="compare-index-category">{t.home.categoryLabels[cat]}</h2>
          <ul className="compare-index-list">
            {byCategory[cat].map((c) => (
              <li key={c.slug} className="compare-index-item">
                <Link href={`/compare/${c.slug}`} className="compare-index-link">
                  <span className="compare-index-title">{localizedComparisonTitle(c, locale)}</span>
                  {locale === "ko" ? (
                    <p className="compare-index-desc">{c.description.slice(0, 72)}...</p>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="compare-cta">
        <p className="compare-cta-copy">{t.home.compareIndex.ctaCopy}</p>
        <Link href="/" className="btn-primary compare-cta-btn">
          {t.home.compareIndex.cta}
        </Link>
      </section>
    </main>
  );
}
