import Link from "next/link";
import UserNav from "@/components/user-nav";
import VsInput from "@/components/vs-input";
import SettingsBar from "@/components/settings-bar";
import ExampleChips from "@/components/example-chips";
import WatchList from "@/components/watch-list";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";
import { COMPARISONS } from "@/lib/compare-pages/comparisons";

/** 노트북 비교만 (이미 파일에 laptop만 남김). */
const HOME_COMPARISONS = COMPARISONS.filter((c) => c.category === "laptop");

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

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

      <VsInput maxOptions={2} locale={locale} />

      <section className="home-section home-examples">
        <div className="section-copy center">
          <h2>{t.home.examplesTitle}</h2>
          <p>{t.home.examplesSub}</p>
        </div>
        <ExampleChips examples={t.home.examples} cta={t.home.tryThis} />
      </section>

      <section className="home-section home-compare-list">
        <div className="section-copy center">
          <h2>{t.home.compareTitle}</h2>
          <p className="compare-data-note">{t.home.compareSub}</p>
        </div>

        <div className="home-rank-wrap">
          <ul className="home-rank-list">
            {HOME_COMPARISONS.slice(0, 10).map((c, i) => (
              <li key={c.slug} className="home-rank-item">
                <Link href={`/compare/${c.slug}`} className="home-rank-link">
                  <span className="home-rank-num">{i + 1}</span>
                  <span className="home-rank-text">{c.title}</span>
                  <span className="home-rank-arrow" aria-hidden>
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
          <div className="home-rank-fade" aria-hidden />
        </div>

        <div className="home-compare-more">
          <Link href="/compare">{t.home.compareViewAll(HOME_COMPARISONS.length)}</Link>
        </div>
      </section>

      <WatchList locale={locale} />
    </main>
  );
}
