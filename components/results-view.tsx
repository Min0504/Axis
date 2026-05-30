import type { ComparisonResult } from "@/lib/types";
import Link from "next/link";

type Props = {
  query: string;
  result: ComparisonResult;
};

export default function ResultsView({ query, result }: Props) {
  return (
    <main className="container narrow">
      <p className="back-link">
        <Link href="/">← 다시 결정하기</Link>
      </p>
      <p className="hint history-query">{query}</p>

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
        <h2>공식 스펙 비교</h2>
        {(result.officialSources?.a || result.officialSources?.b) && (
          <p className="source-links">
            {result.officialSources?.a && (
              <a href={result.officialSources.a} target="_blank" rel="noreferrer">
                A 공식 페이지
              </a>
            )}
            {result.officialSources?.b && (
              <a href={result.officialSources.b} target="_blank" rel="noreferrer">
                B 공식 페이지
              </a>
            )}
          </p>
        )}
        {result.specCollectionNote && <p className="hint">{result.specCollectionNote}</p>}
        <div className="spec-grid">
          {result.comparison.map((row) => (
            <div key={row.key} className="spec-row">
              <strong>{row.key}</strong>
              <span>{row.a}</span>
              <span>{row.b}</span>
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
