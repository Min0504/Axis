"use client";

import { useEffect, useState } from "react";
import ResultsView from "@/components/results-view";
import type { ComparisonResult } from "@/lib/types";
import type { Plan } from "@/lib/plan";

export const SESSION_RESULT_KEY = "axis:lastResult";

type Payload = {
  query: string;
  result: ComparisonResult;
};

export default function SessionResults({ plan = "free" }: { plan?: Plan }) {
  const [payload, setPayload] = useState<Payload | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(SESSION_RESULT_KEY);
      if (raw) {
        setPayload(JSON.parse(raw) as Payload);
      }
    } catch {
      // ignore malformed session data
    }
    setReady(true);
  }, []);

  if (!ready) {
    return null;
  }

  if (!payload) {
    return (
      <main className="container narrow">
        <p className="hint error">결과를 찾을 수 없습니다. 다시 비교해 주세요.</p>
      </main>
    );
  }

  return <ResultsView query={payload.query} result={payload.result} plan={plan} />;
}
