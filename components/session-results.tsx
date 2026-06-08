"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResultsView from "@/components/results-view";
import type { ComparisonResult } from "@/lib/types";
import { useTheme } from "@/components/theme-provider";
import { getDictionary, type Locale } from "@/lib/i18n";

export const SESSION_RESULT_KEY = "axis:lastResult";

type Payload = {
  query: string;
  options?: string[];
  locale?: Locale;
  result: ComparisonResult;
};

type CompareResponse = {
  result: ComparisonResult;
  comparisonId?: string;
};

function optionsFromPayload(payload: Payload): string[] {
  if (Array.isArray(payload.options) && payload.options.length >= 2) return payload.options;
  return payload.query
    .split(/\s+vs\s+|\s대\s/i)
    .map((value) => value.trim())
    .filter(Boolean);
}

export default function SessionResults({ locale: localeProp }: { locale?: Locale }) {
  const { locale: themeLocale } = useTheme();
  const locale = localeProp ?? themeLocale;
  const dictionary = getDictionary(locale);
  const t = dictionary.results;
  const [payload, setPayload] = useState<Payload | null>(null);
  const [ready, setReady] = useState(false);
  const [isRefreshingLocale, setIsRefreshingLocale] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      try {
        const raw = sessionStorage.getItem(SESSION_RESULT_KEY);
        if (raw) {
          setPayload(JSON.parse(raw) as Payload);
        }
      } catch {
        // ignore malformed session data
      }
      setReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!ready || !payload || payload.locale === locale) return;

    const options = optionsFromPayload(payload);
    if (options.length < 2) return;

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) setIsRefreshingLocale(true);
    });

    fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ options })
    })
      .then(async (response) => {
        if (!response.ok) return null;
        return (await response.json()) as CompareResponse;
      })
      .then((body) => {
        if (cancelled || !body?.result) return;
        const next = {
          query: body.result.options.join(" vs "),
          options: body.result.options,
          locale,
          result: body.result
        };
        setPayload(next);
        sessionStorage.setItem(SESSION_RESULT_KEY, JSON.stringify(next));
      })
      .finally(() => {
        if (!cancelled) setIsRefreshingLocale(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, payload, ready]);

  if (!ready) {
    return null;
  }

  if (!payload) {
    // 결과 데이터 없이 /results 직접 접근한 경우 → 홈으로 부드럽게 유도
    return (
      <main className="container narrow results-empty-state">
        <div className="results-empty-inner">
          <span className="results-empty-icon" aria-hidden>⚡</span>
          <h2 className="results-empty-title">비교를 시작해볼까요?</h2>
          <p className="results-empty-sub">
            두 제품을 입력하면 Axis가 공식 스펙을 분석해 최적의 선택을 골라드립니다.
          </p>
          <Link href="/" className="btn-primary results-empty-cta">
            비교 시작하기 →
          </Link>
        </div>
      </main>
    );
  }

  if (isRefreshingLocale) {
    return (
      <main className="container narrow">
        <p className="hint">{dictionary.error.loading}</p>
      </main>
    );
  }

  return <ResultsView query={payload.query} result={payload.result} locale={locale} />;
}
