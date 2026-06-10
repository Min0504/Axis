"use client";

/**
 * PopularRankList — renders the "많이 찾는 비교" list on the homepage.
 *
 * Clicking any item POSTs directly to /api/compare, saves the result to
 * sessionStorage, then navigates to /results — so the user lands on the
 * comparison result page immediately without having to re-submit the form.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_RESULT_KEY } from "@/components/session-results";
import type { ComparisonResult } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type PopularItem = {
  query: string;
  count?: number;
};

type Props = {
  items: PopularItem[];
  locale: Locale;
  startIndex?: number;
};

type CompareBody = {
  result: ComparisonResult;
  comparisonId?: string;
};

function splitQuery(query: string): string[] {
  return query
    .split(/\s*\bvs\b\s*|\s+대\s+/i)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function PopularRankList({ items, locale, startIndex = 0 }: Props) {
  const [loadingQuery, setLoadingQuery] = useState<string | null>(null);
  const router = useRouter();

  async function handleClick(query: string) {
    if (loadingQuery) return;
    setLoadingQuery(query);

    try {
      const options = splitQuery(query);
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ options })
      });

      if (!res.ok) {
        // On API error, fall back to filling the form
        setLoadingQuery(null);
        router.push(`/?q=${encodeURIComponent(query)}`);
        return;
      }

      const body = (await res.json()) as CompareBody;

      // If there's a persisted comparison ID, navigate by historyId
      if (body.comparisonId) {
        router.push(`/results?historyId=${body.comparisonId}`);
        return;
      }

      // Otherwise save to sessionStorage and navigate to /results
      try {
        sessionStorage.setItem(
          SESSION_RESULT_KEY,
          JSON.stringify({
            query,
            options,
            locale,
            result: body.result
          })
        );
      } catch {
        // sessionStorage unavailable (private mode, etc.)
      }
      router.push("/results");
    } catch {
      setLoadingQuery(null);
    }
  }

  return (
    <ul className="home-rank-list">
      {items.map((item, i) => {
        const isLoading = loadingQuery === item.query;
        return (
          <li key={item.query} className="home-rank-item">
            <button
              type="button"
              className={`home-rank-link${isLoading ? " home-rank-loading" : ""}`}
              onClick={() => void handleClick(item.query)}
              disabled={!!loadingQuery}
              aria-busy={isLoading}
            >
              <span className="home-rank-num">{startIndex + i + 1}</span>
              <span className="home-rank-text">{item.query}</span>
              {isLoading ? (
                <span className="home-rank-spinner" aria-hidden />
              ) : (
                <span className="home-rank-arrow" aria-hidden>→</span>
              )}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
