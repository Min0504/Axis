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

const LETTERS = ["A", "B", "C", "D", "E"];
const ORDINALS = ["첫 번째", "두 번째", "세 번째", "네 번째", "다섯 번째"];

export default function VsInput({ maxOptions = 2 }: { maxOptions?: number }) {
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [limitReached, setLimitReached] = useState(false);
  const router = useRouter();

  const canAdd = options.length < Math.min(maxOptions, LETTERS.length);

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((opt, i) => (i === index ? value : opt)));
  }

  function addOption() {
    setOptions((prev) => (prev.length < maxOptions ? [...prev, ""] : prev));
  }

  function removeOption(index: number) {
    setOptions((prev) => (prev.length > 2 ? prev.filter((_, i) => i !== index) : prev));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const trimmed = options.map((o) => o.trim()).filter(Boolean);
    if (trimmed.length < 2) {
      setError("두 개 이상의 선택지를 입력해주세요.");
      return;
    }

    setError("");
    setLimitReached(false);
    setIsLoading(true);

    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ options: trimmed })
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string; limitReached?: boolean };
      setError(body.error ?? "분석 중 오류가 발생했습니다.");
      setLimitReached(Boolean(body.limitReached));
      setIsLoading(false);
      return;
    }

    const body = (await res.json()) as CompareResponse;
    const query = trimmed.join(" vs ");

    if (body.comparisonId) {
      router.push(`/results?historyId=${body.comparisonId}`);
      router.refresh();
      return;
    }

    try {
      sessionStorage.setItem(SESSION_RESULT_KEY, JSON.stringify({ query, result: body.result }));
    } catch {
      // sessionStorage unavailable (e.g. private mode)
    }
    router.push("/results");
  }

  return (
    <form className="vs-shell" onSubmit={(e) => void handleSubmit(e)}>
      <div className="opt-grid">
        {options.map((value, index) => (
          <label className={`opt-card opt-${index}`} key={index}>
            <div className="opt-card-top">
              <span className="opt-tag">{LETTERS[index]}</span>
              <span className="opt-label">{ORDINALS[index]} 선택지</span>
              {options.length > 2 && (
                <button
                  type="button"
                  className="opt-remove"
                  onClick={() => removeOption(index)}
                  aria-label="선택지 삭제"
                >
                  ×
                </button>
              )}
            </div>
            <input
              value={value}
              onChange={(e) => updateOption(index, e.target.value)}
              placeholder={index === 0 ? "예: 아이폰 16" : index === 1 ? "예: 갤럭시 S25" : "예: 픽셀 9"}
              required={index < 2}
            />
            <span className="opt-watermark" aria-hidden>
              {LETTERS[index]}
            </span>
          </label>
        ))}
      </div>

      {canAdd && (
        <button type="button" className="opt-add-btn" onClick={addOption}>
          ＋ 선택지 추가
          <span className="opt-add-count">{options.length}/{maxOptions}</span>
        </button>
      )}

      <button className="btn-primary large" type="submit" disabled={isLoading}>
        {isLoading ? "Axis가 선택 중..." : "Axis에게 물어보기 →"}
      </button>

      {maxOptions < 3 && (
        <p className="vs-upsell">
          3개 이상 한 번에 비교하고 싶다면 <Link href="/membership">Pro</Link>
        </p>
      )}

      {error && <p className="hint error">{error}</p>}
      {limitReached && (
        <Link className="btn-outline upgrade-cta" href="/membership">
          더 많이 선택하려면 업그레이드 →
        </Link>
      )}
    </form>
  );
}
