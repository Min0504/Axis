"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SESSION_RESULT_KEY } from "@/components/session-results";
import type { ComparisonResult } from "@/lib/types";

type CompareResponse = {
  result: ComparisonResult;
  comparisonId?: string;
};

export default function VsInput() {
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedA = optionA.trim();
    const trimmedB = optionB.trim();

    if (!trimmedA || !trimmedB) {
      return;
    }

    setError("");
    setLimitReached(false);
    setIsLoading(true);

    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionA: trimmedA, optionB: trimmedB })
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string; limitReached?: boolean };
      setError(body.error ?? "분석 중 오류가 발생했습니다.");
      setLimitReached(Boolean(body.limitReached));
      setIsLoading(false);
      return;
    }

    const body = (await res.json()) as CompareResponse;
    const query = `${trimmedA} vs ${trimmedB}`;
    if (body.comparisonId) {
      router.push(`/results?historyId=${body.comparisonId}`);
      router.refresh();
      return;
    }

    // Guest (not logged in): stash the result in sessionStorage instead of the
    // URL so large payloads don't hit URL-length limits or leak into logs.
    try {
      sessionStorage.setItem(SESSION_RESULT_KEY, JSON.stringify({ query, result: body.result }));
    } catch {
      // sessionStorage unavailable (e.g. private mode) — fall through to /results
    }
    router.push("/results");
  }

  return (
    <form className="vs-shell" onSubmit={(e) => void handleSubmit(e)}>
      <div className="vs-grid">
        <label className="vs-card vs-card-a">
          <span className="vs-tag">A</span>
          <span className="vs-label">첫 번째 선택지</span>
          <input
            name="optionA"
            value={optionA}
            onChange={(e) => setOptionA(e.target.value)}
            placeholder="예: 아이폰 16"
            required
          />
          <span className="vs-watermark" aria-hidden>
            A
          </span>
        </label>

        <div className="vs-divider" aria-hidden>
          VS
        </div>

        <label className="vs-card vs-card-b">
          <span className="vs-tag">B</span>
          <span className="vs-label">두 번째 선택지</span>
          <input
            name="optionB"
            value={optionB}
            onChange={(e) => setOptionB(e.target.value)}
            placeholder="예: 갤럭시 S25"
            required
          />
          <span className="vs-watermark" aria-hidden>
            B
          </span>
        </label>
      </div>

      <button className="btn-primary large" type="submit" disabled={isLoading}>
        {isLoading ? "Axis가 결정 중..." : "Axis에게 물어보기 →"}
      </button>
      {error && <p className="hint error">{error}</p>}
      {limitReached && (
        <Link className="btn-outline upgrade-cta" href="/membership">
          Pro로 업그레이드하고 무제한으로 →
        </Link>
      )}
    </form>
  );
}
