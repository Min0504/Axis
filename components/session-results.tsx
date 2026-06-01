"use client";

import { useEffect, useState } from "react";
import ResultsView from "@/components/results-view";
import type { ComparisonResult } from "@/lib/types";
import type { Plan } from "@/lib/plan";
import { useTheme } from "@/components/theme-provider";
import { getDictionary, type Locale } from "@/lib/i18n";

export const SESSION_RESULT_KEY = "axis:lastResult";

type Payload = {
  query: string;
  result: ComparisonResult;
};

export default function SessionResults({ plan = "free", locale: localeProp }: { plan?: Plan; locale?: Locale }) {
  const { locale: themeLocale } = useTheme();
  const locale = localeProp ?? themeLocale;
  const t = getDictionary(locale).results;
  const [payload, setPayload] = useState<Payload | null>(null);
  const [ready, setReady] = useState(false);

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

  if (!ready) {
    return null;
  }

  if (!payload) {
    return (
      <main className="container narrow">
        <p className="hint error">{t.notFound}</p>
      </main>
    );
  }

  return <ResultsView query={payload.query} result={payload.result} plan={plan} locale={locale} />;
}
