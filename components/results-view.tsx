import type { ComparisonResult, ComparisonRow, OfficialSourceMeta } from "@/lib/types";
import Link from "next/link";
import ShareActions from "@/components/share-actions";
import SettingsBar from "@/components/settings-bar";
import UserNav from "@/components/user-nav";
import ContextCard from "@/components/context-card";
import TimingSection from "@/components/timing-section";
import { getDictionary, type Locale } from "@/lib/i18n";
import { verificationLabel } from "@/lib/specs/source";
import { resolveFieldByLabel } from "@/lib/specs/schema";
import type { Category } from "@/lib/types";

type Props = {
  query: string;
  result: ComparisonResult;
  comparisonId?: string;
  shareToken?: string;
  locale?: Locale;
  hidePrices?: boolean;
  slug?: string;
  region?: string;
};

type NormalizedRow = { key: string; values: string[] };

function normalize(result: ComparisonResult, query: string) {
  let options =
    Array.isArray(result.options) && result.options.length
      ? result.options
      : query
          .split(/\s+vs\s+/i)
          .map((s) => s.trim())
          .filter(Boolean);
  if (options.length < 2) options = ["A", "B"];

  const rows: NormalizedRow[] = (result.comparison ?? []).map((row: ComparisonRow) => {
    if (Array.isArray(row.values) && row.values.length) return { key: row.key, values: row.values };
    return { key: row.key, values: [row.a ?? "—", row.b ?? "—"] };
  });

  const sources = Array.isArray(result.officialSources) ? result.officialSources : undefined;
  const sourceMeta = Array.isArray(result.officialSourceMeta) ? result.officialSourceMeta : undefined;
  const analyses = Array.isArray(result.analyses) ? result.analyses : [];

  return { options, rows, sources, sourceMeta, analyses };
}

function computeFitScores(
  options: string[],
  comparison: ComparisonRow[],
  category: Category
): number[] | null {
  const scores = options.map(() => 0);
  let total = 0;

  for (const row of comparison) {
    const field = resolveFieldByLabel(category, row.key);
    if (!field || field.better === "none") continue;

    const parsed = row.values.map((v) => {
      const m = (v ?? "").replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
      return m ? Number(m[0]) : null;
    });
    if (parsed.some((v) => v === null)) continue;
    const nums = parsed as number[];
    const target = field.better === "higher" ? Math.max(...nums) : Math.min(...nums);
    const winners = nums.map((n, i) => ({ n, i })).filter(({ n }) => n === target);
    if (winners.length !== 1) continue;

    scores[winners[0].i]++;
    total++;
  }

  if (total === 0) return null;
  return scores.map((s) => Math.round((s / total) * 100));
}

function sourceLabel(source: OfficialSourceMeta | undefined, t: ReturnType<typeof getDictionary>["results"]) {
  if (!source) return t.officialShort;
  return source.kind === "authorized_importer" ? t.sourceImporter : t.sourceManufacturer;
}

export default function ResultsView({
  query,
  result,
  comparisonId,
  shareToken,
  locale = "ko",
  slug,
  region,
}: Props) {
  const { options, rows, sources, sourceMeta, analyses } = normalize(result, query);
  const selectedIndex = options.findIndex((o) => o === result.selectedOption);
  const cols = options.length;
  const t = getDictionary(locale).results;
  const isBlockedResult =
    result.status === "not_found" || result.status === "verification_pending";
  const fitScores = computeFitScores(options, rows, result.category);

  const showVerifyBadge =
    result.verification != null &&
    (result.verification === "verified" || result.verification === "partial");

  return (
    <div className="container">
      <header className="topbar results-topbar">
        <Link href="/" className="brand">
          axis<span className="brand-beta">beta</span>
        </Link>
        <div className="topbar-right">
          <SettingsBar />
          <UserNav locale={locale ?? "ko"} />
        </div>
      </header>

      <main className="results-body">
        <Link href="/" className="btn-back">{t.back}</Link>

        {/* ── 1. Verdict hero ── */}
        <section className="verdict-hero">
          <div className="vh-badge">
            <span className="vh-badge-dot" aria-hidden />
            {isBlockedResult ? t.specComparisonPending : t.axisChoice}
          </div>

          <h1 className="vh-title">{result.selectedOption}</h1>
          <p className="vh-conclusion">{result.oneLineConclusion ?? t.defaultConclusion}</p>

          {/* 승부 막대: 각 옵션의 스펙 우위를 % 없이 막대 길이로만 표현 */}
          {options.length > 1 && !isBlockedResult && (
            <div className="vh-matchup" aria-label={query}>
              {options.map((opt, i) => (
                <div
                  key={i}
                  className={`vh-row${i === selectedIndex ? " vh-row-win" : ""}`}
                >
                  <div className="vh-row-head">
                    <span className="vh-row-name">{opt}</span>
                    {i === selectedIndex && <span className="vh-row-tag">{t.winner}</span>}
                  </div>
                  {fitScores && (
                    <div className="vh-bar-track" aria-hidden>
                      <div className="vh-bar-fill" style={{ width: `${Math.max(fitScores[i], 4)}%` }} />
                    </div>
                  )}
                </div>
              ))}
              {fitScores && <p className="vh-bar-note">{t.fitScoreNote}</p>}
            </div>
          )}
        </section>

        {/* ── 2. Timing + Buy ── */}
        {!isBlockedResult && (
          <div className="buy-timing-block">
            <TimingSection productName={result.selectedOption} locale={locale} />
            <div className="share-actions-wrap">
              <ShareActions
                selectedOption={result.selectedOption}
                category={result.category}
                locale={locale}
                comparisonId={comparisonId}
                shareToken={shareToken}
                guestPayload={!comparisonId ? { query, result } : undefined}
                slug={slug}
                region={region}
              />
            </div>
          </div>
        )}

        {/* ── 3. Spec table ── */}
        <section className="detail-card spec-section">
          <div className="spec-header">
            <h2>{showVerifyBadge ? t.specComparison : t.specComparisonPending}</h2>
            {showVerifyBadge && result.verification && (
              <span className={`verify-badge verify-${result.verification}`}>
                <span className="verify-dot" aria-hidden />
                {verificationLabel(result.verification)}
              </span>
            )}
          </div>

          {rows.length > 0 ? (
            <div className="spec-table-scroll">
              <div className="cmp-table" style={{ ["--cols" as string]: cols }}>
                <div className="cmp-row cmp-head">
                  <span className="cmp-key" />
                  {options.map((opt, i) => (
                    <span key={i} className={`cmp-col${i === selectedIndex ? " winner" : ""}`}>
                      {i === selectedIndex && <span className="cmp-win-tag">{t.winner}</span>}
                      <span className="cmp-head-name">
                        {opt}
                        {sources?.[i] && (
                          <a
                            className={`cmp-source-chip source-${sourceMeta?.[i]?.kind ?? "manufacturer"}`}
                            href={sources[i]}
                            target="_blank"
                            rel="noreferrer"
                            aria-label={t.officialLink(opt)}
                          >
                            {sourceLabel(sourceMeta?.[i], t)} ↗
                          </a>
                        )}
                      </span>
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
            </div>
          ) : (
            <div className="spec-empty">
              <p>{isBlockedResult ? result.detail : t.specEmptyNote}</p>
              {sources?.some(Boolean) && (
                <div className="spec-empty-links">
                  {sources.map((src, i) =>
                    src ? (
                      <a key={i} href={src} target="_blank" rel="noreferrer">
                        {sourceLabel(sourceMeta?.[i], t)} · {options[i]} →
                      </a>
                    ) : null
                  )}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ── 4. Per-option analysis ── */}
        {analyses.some(Boolean) && (
          <section className="detail-card">
            <h2>{t.perItemAnalysis}</h2>
            <div className="analysis-list">
              {options.map((opt, i) =>
                analyses[i] ? (
                  <div
                    className={`analysis-item${i === selectedIndex ? " winner-item" : ""}`}
                    id={`analysis-${i}`}
                    key={i}
                  >
                    <div className="analysis-head">
                      <span className="analysis-letter">{String.fromCharCode(65 + i)}</span>
                      <span className="analysis-name">{opt}</span>
                      {i === selectedIndex && (
                        <span className="analysis-pick">{t.winner}</span>
                      )}
                      {sources?.[i] && (
                        <a
                          className="analysis-official"
                          href={sources[i]}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {sourceLabel(sourceMeta?.[i], t)} ↗
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

        {/* ── 5. Why chosen (추천이유 — 아래로 이동) ── */}
        {!isBlockedResult && (
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
        )}

        {/* ── 6. Summary ── */}
        <section className="detail-card results-last-card">
          <h2>{t.summary}</h2>
          <p className="summary-text">{result.detail}</p>
        </section>

        {/* ── 7. Context Card ── */}
        {!isBlockedResult && (
          <ContextCard originalQuery={query} locale={locale} />
        )}
      </main>
    </div>
  );
}
