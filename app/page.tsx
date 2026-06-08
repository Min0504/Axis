import Link from "next/link";
import HistoryList from "@/components/history-list";
import UserNav from "@/components/user-nav";
import VsInput from "@/components/vs-input";
import SettingsBar from "@/components/settings-bar";
import ExampleChips from "@/components/example-chips";
import WatchList from "@/components/watch-list";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";
import { COMPARISONS } from "@/lib/compare-pages/comparisons";
import { createServiceClient } from "@/lib/supabase-server";

type PopularQuery = { query: string; count: number };

/** 실제 사용자 비교 쿼리 기반 인기 순위. 데이터 없으면 빈 배열. */
async function getPopularQueries(limit = 8): Promise<PopularQuery[]> {
  try {
    const db = createServiceClient();
    const { data } = await db
      .from("comparisons")
      .select("query")
      .not("query", "is", null)
      .order("created_at", { ascending: false })
      .limit(500); // 최근 500건에서 집계

    if (!data?.length) return [];

    // 클라이언트 측 집계 (쿼리 정규화 후 카운트)
    const counts = new Map<string, number>();
    for (const row of data) {
      const q = (row.query as string).trim().toLowerCase();
      if (q.length < 3) continue;
      counts.set(q, (counts.get(q) ?? 0) + 1);
    }

    return Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query, count]) => ({ query, count }));
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
          <ul className="home-rank-list">
            {hasRealData
              ? popularQueries.map((item, i) => (
                  <li key={item.query} className="home-rank-item">
                    <Link href={`/?q=${encodeURIComponent(item.query)}`} className="home-rank-link">
                      <span className="home-rank-num">{i + 1}</span>
                      <span className="home-rank-text">{item.query}</span>
                    </Link>
                  </li>
                ))
              : COMPARISONS.slice(0, 10).map((c, i) => (
                  <li key={c.slug} className="home-rank-item">
                    <Link href={`/compare/${c.slug}`} className="home-rank-link">
                      <span className="home-rank-num">{i + 1}</span>
                      <span className="home-rank-text">{c.title}</span>
                    </Link>
                  </li>
                ))
            }
          </ul>
          <div className="home-rank-fade" aria-hidden />
        </div>

        <div className="home-compare-more">
          <Link href="/compare">{t.home.compareViewAll(COMPARISONS.length)}</Link>
        </div>
      </section>

      <WatchList locale={locale} />
      <HistoryList locale={locale} />
    </main>
  );
}
