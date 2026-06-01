import { Fragment } from "react";
import type { ComparisonResult, ComparisonRow } from "@/lib/types";
import Link from "next/link";
import ShareActions from "@/components/share-actions";
import SettingsBar from "@/components/settings-bar";
import UserNav from "@/components/user-nav";
import type { Plan } from "@/lib/plan";
import { getDictionary, type Locale } from "@/lib/i18n";

type Props = {
  query: string;
  result: ComparisonResult;
  plan?: Plan;
  comparisonId?: string;
  shareToken?: string;
  locale?: Locale;
};

type NormalizedRow = { key: string; values: string[] };

// Support both the current N-option shape and legacy 2-way saved history
// (rows with { a, b } and officialSources { a, b }).
function normalize(result: ComparisonResult, query: string) {
  let options =
    Array.isArray(result.options) && result.options.length
      ? result.options
      : query
          .split(/\s+vs\s+/i)
          .map((s) => s.trim())
          .filter(Boolean);
  if (options.length < 2) {
    options = ["A", "B"];
  }

  const rows: NormalizedRow[] = (result.comparison ?? []).map((row: ComparisonRow) => {
    if (Array.isArray(row.values) && row.values.length) {
      return { key: row.key, values: row.values };
    }
    return { key: row.key, values: [row.a ?? "—", row.b ?? "—"] };
  });

  const sources = Array.isArray(result.officialSources) ? result.officialSources : undefined;
  const analyses = Array.isArray(result.analyses) ? result.analyses : [];

  return { options, rows, sources, analyses };
}

export default function ResultsView({ query, result, plan = "free", comparisonId, shareToken, locale = "ko" }: Props) {
  const { options, rows, sources, analyses } = normalize(result, query);
  const selectedIndex = options.findIndex((o) => o === result.selectedOption);
  const cols = options.length;
  const t = getDictionary(locale).results;

  return (
    <div className="container">
      <header className="topbar results-topbar">
        <Link href="/" className="brand">
          axis<span className="brand-beta">beta</span>
        </Link>
        <div className="topbar-right">
          <SettingsBar />
          <UserNav />
        </div>
      </header>

      <main className="results-body">
      <Link href="/" className="btn-back">{t.back}</Link>

      <section className="result-card">
        <p className="result-context">
          {options.map((opt, i) => (
            <Fragment key={i}>
              {i > 0 && <span className="result-context-sep"> vs </span>}
              <span className={i === selectedIndex ? "result-context-win" : ""}>{opt}</span>
            </Fragment>
          ))}
        </p>
        <p className="label">{t.axisChoice}</p>
        <h1>{result.selectedOption}</h1>
        <p>{result.oneLineConclusion ?? t.defaultConclusion}</p>
      </section>

      <section className="decision-basis" aria-label={t.basisTitle}>
        {t.basis.map((item) => (
          <article key={item.title}>
            <strong>{item.title}</strong>
            <span>{item.body}</span>
          </article>
        ))}
      </section>

      <section className="detail-card">
        <h2>{t.whyChosen}</h2>
        <ul className="reason-list">
          {result.reasons.map((reason) => (
            <li key={reason}>
              <span className="reason-mark" aria-hidden>✓</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-card">
        <h2>{t.specComparison}</h2>
        {sources?.some(Boolean) && (
          <p className="source-links">
            {sources.map((src, i) =>
              src ? (
                <a key={i} href={src} target="_blank" rel="noreferrer">
                  {t.officialLink(options[i])}
                </a>
              ) : null
            )}
          </p>
        )}
        {result.specCollectionNote && <p className="hint">{result.specCollectionNote}</p>}

        <div className="cmp-table" style={{ ["--cols" as string]: cols }}>
          <div className="cmp-row cmp-head">
            <span className="cmp-key" />
            {options.map((opt, i) => (
              <span key={i} className={`cmp-col${i === selectedIndex ? " winner" : ""}`}>
                {i === selectedIndex && <span className="cmp-win-tag">{t.winner}</span>}
                {opt}
              </span>
            ))}
          </div>
          {rows.map((row) => (
            <div className="cmp-row" key={row.key}>
              <span className="cmp-key">{row.key}</span>
              {Array.from({ length: cols }).map((_, i) => (
                <span key={i} className={`cmp-col${i === selectedIndex ? " winner" : ""}`}>
                  {row.values[i] ?? "—"}
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {analyses.some(Boolean) && (
        <section className="detail-card">
          <h2>{t.perItemAnalysis}</h2>
          <div className="analysis-list">
            {options.map((opt, i) =>
              analyses[i] ? (
                <div className="analysis-item" id={`analysis-${i}`} key={i}>
                  <div className="analysis-head">
                    <span className="analysis-letter">{String.fromCharCode(65 + i)}</span>
                    <span className="analysis-name">{opt}</span>
                    {i === selectedIndex && <span className="analysis-pick">{t.winner}</span>}
                    {sources?.[i] && (
                      <a className="analysis-official" href={sources[i]} target="_blank" rel="noreferrer">
                        {t.officialShort}
                      </a>
                    )}
                  </div>
                  <p>{analyses[i]}</p>
                </div>
              ) : null
            )}
          </div>
        </section>
      )}

      <section className="detail-card">
        <h2>{t.summary}</h2>
        <p>{result.detail}</p>
      </section>

      <section className="detail-card purchase-card">
        <div className="purchase-head">
          <h2>{t.purchaseTitle}</h2>
          <p>{t.purchaseSub}</p>
        </div>
        <ShareActions
          selectedOption={result.selectedOption}
          category={result.category}
          plan={plan}
          locale={locale}
          comparisonId={comparisonId}
          shareToken={shareToken}
          guestPayload={!comparisonId ? { query, result } : undefined}
        />
      </section>
      </main>
    </div>
  );
}
