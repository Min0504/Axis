import HistoryList from "@/components/history-list";
import UserNav from "@/components/user-nav";
import VsInput from "@/components/vs-input";
import SettingsBar from "@/components/settings-bar";
import { getCurrentProfile } from "@/lib/users/get-profile";
import { GUEST_MAX_OPTIONS, devPlanOverride, maxOptions } from "@/lib/plan";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export default async function Home() {
  const [profile, locale] = await Promise.all([getCurrentProfile(), getLocale()]);
  const t = getDictionary(locale);
  const dev = devPlanOverride();
  const maxOpts = dev ? maxOptions(dev) : profile ? maxOptions(profile.plan) : GUEST_MAX_OPTIONS;

  return (
    <main className="container">
      <header className="topbar">
        <div className="brand">
          axis<span className="brand-beta">beta</span>
        </div>
        <div className="topbar-right">
          <SettingsBar />
          <UserNav />
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
            <span className="proof-pill" key={item.label}>
              <strong>{item.value}</strong>
              {item.label}
            </span>
          ))}
        </div>
      </section>

      <VsInput maxOptions={maxOpts} locale={locale} />

      <section className="home-section home-examples">
        <div className="section-copy">
          <p className="section-kicker">Buying decisions</p>
          <h2>{t.home.examplesTitle}</h2>
          <p>{t.home.examplesSub}</p>
        </div>
        <div className="example-grid">
          {t.home.examples.map((item) => (
            <article className="example-card" key={item.query}>
              <span>{item.category}</span>
              <h3>{item.query}</h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="home-section home-method">
        <div className="section-copy">
          <p className="section-kicker">Decision method</p>
          <h2>{t.home.methodTitle}</h2>
          <p>{t.home.methodSub}</p>
        </div>
        <div className="method-grid">
          {t.home.method.map((item, index) => (
            <article className="method-item" key={item.title}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <HistoryList locale={locale} />
    </main>
  );
}
