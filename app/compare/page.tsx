import type { Metadata } from "next";
import Link from "next/link";
import { COMPARISONS, CATEGORY_LABELS } from "@/lib/compare-pages/comparisons";
import type { ComparisonDef } from "@/lib/compare-pages/comparisons";

export const metadata: Metadata = {
  title: "제품 비교 모음 — Axis",
  description:
    "노트북·스마트폰·이어폰·태블릿 인기 비교 모음. 공식 스펙과 실사용 기준으로 어떤 걸 살지 바로 알려드립니다.",
};

const CATEGORIES: ComparisonDef["category"][] = ["laptop", "smartphone", "earphones", "tablet"];

export default function ComparePage() {
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
        <h1>제품 비교 모음</h1>
        <p className="sub">
          공식 스펙 + AI 분석으로 뭘 살지 바로 결론 내드립니다.
        </p>
      </section>

      {CATEGORIES.map((cat) => (
        <section key={cat} className="compare-index-section">
          <h2 className="compare-index-category">{CATEGORY_LABELS[cat]}</h2>
          <ul className="compare-index-list">
            {byCategory[cat].map((c) => (
              <li key={c.slug} className="compare-index-item">
                <Link href={`/compare/${c.slug}`} className="compare-index-link">
                  <span className="compare-index-title">{c.title}</span>
                  <p className="compare-index-desc">{c.description.slice(0, 72)}...</p>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="compare-cta">
        <p className="compare-cta-copy">목록에 없는 제품? 직접 비교해보세요.</p>
        <Link href="/" className="btn-primary compare-cta-btn">
          직접 비교하기 →
        </Link>
      </section>
    </main>
  );
}
