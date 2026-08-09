"use client";

import { useEffect, useState } from "react";
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

function payloadLocale(payload: Payload): Locale {
  return payload.locale ?? payload.result.locale ?? "ko";
}

export default function SessionResults({ locale: localeProp }: { locale?: Locale }) {
  const { locale: themeLocale } = useTheme();
  const locale = localeProp ?? themeLocale;
  const dictionary = getDictionary(locale);
  const t = dictionary.results;
  const [payload, setPayload] = useState<Payload | null>(null);
  const [ready, setReady] = useState(false);
  const [isRefreshingLocale, setIsRefreshingLocale] = useState(false);
  const [refreshError, setRefreshError] = useState(false);
  const [retryToken, setRetryToken] = useState(0);

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
    if (!ready || !payload) return;
    if (payloadLocale(payload) === locale) {
      queueMicrotask(() => {
        setRefreshError(false);
        setIsRefreshingLocale(false);
      });
      return;
    }

    const options = optionsFromPayload(payload);
    if (options.length < 2) {
      queueMicrotask(() => setRefreshError(true));
      return;
    }

    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setIsRefreshingLocale(true);
        setRefreshError(false);
      }
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
        if (cancelled) return;
        if (!body?.result) {
          setRefreshError(true);
          return;
        }
        const next: Payload = {
          query: body.result.options.join(" vs "),
          options: body.result.options,
          locale,
          result: body.result
        };
        setPayload(next);
        setRefreshError(false);
        sessionStorage.setItem(SESSION_RESULT_KEY, JSON.stringify(next));
      })
      .catch(() => {
        if (!cancelled) setRefreshError(true);
      })
      .finally(() => {
        if (!cancelled) setIsRefreshingLocale(false);
      });

    return () => {
      cancelled = true;
    };
  }, [locale, payload, ready, retryToken]);

  if (!ready) {
    return null;
  }

  if (!payload) {
    return (
      <main className="container narrow results-empty-state">
        <div className="results-empty-inner">
          <span className="results-empty-icon" aria-hidden>⚡</span>
          <h2 className="results-empty-title">{t.emptyTitle}</h2>
          <p className="results-empty-sub">{t.emptySub}</p>
          <Link href="/" className="btn-primary results-empty-cta">
            {t.emptyCta}
          </Link>
        </div>
      </main>
    );
  }

  const localeMismatch = payloadLocale(payload) !== locale;

  if (localeMismatch && refreshError) {
    return (
      <main className="container narrow results-empty-state">
        <div className="results-empty-inner">
          <h2 className="results-empty-title">{dictionary.error.title}</h2>
          <p className="results-empty-sub">{t.localeRefreshFailed}</p>
          <div className="results-empty-actions" style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setRetryToken((n) => n + 1)}
            >
              {dictionary.error.retry}
            </button>
            <Link href="/" className="btn-outline">
              {dictionary.error.backHome}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (localeMismatch || isRefreshingLocale) {
    return (
      <main className="container narrow">
        <p className="hint">{dictionary.error.loading}</p>
      </main>
    );
  }

  return <ResultsView query={payload.query} result={payload.result} locale={locale} />;
}
