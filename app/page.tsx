import Link from "next/link";
import HistoryList from "@/components/history-list";
import UserNav from "@/components/user-nav";
import VsInput from "@/components/vs-input";
import SettingsBar from "@/components/settings-bar";
import ExampleChips from "@/components/example-chips";
import WatchList from "@/components/watch-list";
import PopularRankList from "@/components/popular-rank-list";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";
import { COMPARISONS } from "@/lib/compare-pages/comparisons";
import { createServiceClientSafe } from "@/lib/supabase-server";
import { aggregatePopularQueries } from "@/lib/popular-queries";
import { coverageNoteYear } from "@/lib/specs/coverage";

type PopularQuery = { query: string; count: number };

/** KR·노트북 검증 우선: 홈 정적 랭킹은 노트북 비교만. */
const HOME_COMPARISONS = COMPARISONS.filter((c) => c.category === "laptop");

/** 실제 사용자 비교 쿼리 기반 인기 순위. 민감·비비교 문구는 제외. */
async function getPopularQueries(limit = 8): Promise<PopularQuery[]> {
  try {
    const db = createServiceClientSafe();
    if (!db) return [];
    const { data } = await db
      .from("comparisons")
      .select("query")
      .not("query", "is", null)
      .order("created_at", { ascending: false })
      .limit(500);

    if (!data?.length) return [];
    return aggregatePopularQueries(data, limit);
  } catch {
    return [];
  }
}

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  // 인기 비교: DB 기반 + 부족하면 하드코딩 페이지로 채움
  const popularQueries = await getPopularQueries(10);
  const hasRealData = popularQueries.length >= 3;

  return (
    <main className="container">
      <header className="topbar">
        <Link href="/" className="brand">
          axis<span className="brand-beta">beta</span>
        </Link>
        <div className="topbar-right">
          <SettingsBar />
          <UserNav locale={locale} />
        </div>
      </header>

      <section className="hero">
        <p className="badge">{t.home.badge}</p>
        <h1>
          {t.home.hero1}
          <br />
          <span>{t.home.hero2}</span>
        </h1>
        <p className="sub">{t.home.sub}</p>
        <div className="hero-proof" aria-label="Axis decision principles">
          {t.home.proof.map((item) => (
            <span className="proof-pill" key={`${item.value}${item.label}`}>
              <strong>{item.value}</strong>
              {item.label}
            </span>
          ))}
        </div>
      </section>

      <VsInput maxOptions={6} locale={locale} />
      <p className="coverage-note coverage-note-home">{t.home.coverageNote(coverageNoteYear())}</p>

      <section className="home-section home-examples">
        <div className="section-copy center">
          <h2>{t.home.examplesTitle}</h2>
          <p>{t.home.examplesSub}</p>
        </div>
        <ExampleChips examples={t.home.examples} cta={t.home.tryThis} />
      </section>

      <section className="home-section home-method">
        <div className="section-copy">
          <p className="section-kicker">Decision method</p>
          <h2>{t.home.methodTitle}</h2>
          <p>
            <strong className="method-em">{t.home.methodSubEm}</strong>{" "}
            {t.home.methodSub}
          </p>
        </div>
        <div className="feature-grid">
          {t.home.features.map((f) => (
            <div className="feature-item" key={f.title}>
              <strong>{f.title}</strong>
              <span>{f.body}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── 인기 비교 목록 ── */}
      <section className="home-section home-compare-list">
        <div className="section-copy center">
          <h2>{t.home.compareTitle}</h2>
          <p className="compare-data-note">
            {hasRealData ? t.home.compareRealData : t.home.compareSub}
          </p>
        </div>

        <div className="home-rank-wrap">
          {hasRealData ? (
            <PopularRankList
              items={popularQueries}
              locale={locale}
            />
          ) : (
            // Static curated comparisons → direct result page (no loading needed)
            <ul className="home-rank-list">
              {HOME_COMPARISONS.slice(0, 10).map((c, i) => (
                <li key={c.slug} className="home-rank-item">
                  <Link href={`/compare/${c.slug}`} className="home-rank-link">
                    <span className="home-rank-num">{i + 1}</span>
                    <span className="home-rank-text">{c.title}</span>
                    <span className="home-rank-arrow" aria-hidden>→</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="home-rank-fade" aria-hidden />
        </div>

        <div className="home-compare-more">
          <Link href="/compare">{t.home.compareViewAll(HOME_COMPARISONS.length)}</Link>
        </div>
      </section>

      <WatchList locale={locale} />
      <HistoryList locale={locale} />
    </main>
  );
}
