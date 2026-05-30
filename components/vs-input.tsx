"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmedA = optionA.trim();
    const trimmedB = optionB.trim();

    if (!trimmedA || !trimmedB) {
      return;
    }

    setError("");
    setIsLoading(true);

    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ optionA: trimmedA, optionB: trimmedB })
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setError(body.error ?? "분석 중 오류가 발생했습니다.");
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

    const encoded = encodeURIComponent(JSON.stringify({ query, result: body.result }));
    router.push(`/results?payload=${encoded}`);
    router.refresh();
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
    </form>
  );
}
