import { Fragment } from "react";
import type { ComparisonResult, ComparisonRow } from "@/lib/types";
import Link from "next/link";

type Props = {
  query: string;
  result: ComparisonResult;
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

  return { options, rows, sources };
}

export default function ResultsView({ query, result }: Props) {
  const { options, rows, sources } = normalize(result, query);
  const selectedIndex = options.findIndex((o) => o === result.selectedOption);
  const cols = options.length;

  return (
    <main className="container narrow">
      <p className="back-link">
        <Link href="/">← 다시 선택하기</Link>
      </p>

      <div className="result-chips">
        {options.map((opt, i) => {
          const url = sources?.[i];
          const cls = `result-chip${i === selectedIndex ? " win" : ""}${url ? " link" : ""}`;
          return (
            <Fragment key={i}>
              {i > 0 && <span className="result-vs">vs</span>}
              {url ? (
                <a className={cls} href={url} target="_blank" rel="noreferrer" title={`${opt} 공식 페이지`}>
                  {opt}
                  <span className="chip-ext" aria-hidden>
                    ↗
                  </span>
                </a>
              ) : (
                <span className={cls}>{opt}</span>
              )}
            </Fragment>
          );
        })}
      </div>

      <section className="result-card">
        <p className="label">AXIS의 선택</p>
        <h1>{result.selectedOption}</h1>
        <p>{result.oneLineConclusion ?? "이번에는 이걸 선택하는 것이 더 적합합니다."}</p>
      </section>

      <section className="detail-card">
        <h2>왜 이렇게 선택했을까?</h2>
        <ul>
          {result.reasons.map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      </section>

      <section className="detail-card">
        <h2>항목별 비교</h2>
        {sources?.some(Boolean) && (
          <p className="source-links">
            {sources.map((src, i) =>
              src ? (
                <a key={i} href={src} target="_blank" rel="noreferrer">
                  {options[i]} 공식
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
                {i === selectedIndex && <span className="cmp-win-tag">선택</span>}
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

      <section className="detail-card">
        <h2>상세 설명</h2>
        <p>{result.detail}</p>
      </section>
    </main>
  );
}
