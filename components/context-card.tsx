"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_RESULT_KEY } from "@/components/session-results";
import type { ComparisonResult } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type Props = {
  originalQuery: string;
  locale?: Locale;
};

type CompareResponse = {
  result: ComparisonResult;
  comparisonId?: string;
};

const USE_CASES = [
  { value: "daily", label: "일상 사용" },
  { value: "work", label: "업무 · 생산성" },
  { value: "creator", label: "영상 · 편집" },
  { value: "game", label: "게임" },
  { value: "student", label: "학교 · 공부" },
];

const BUDGETS = [
  { value: "under50", label: "50만 미만" },
  { value: "50to100", label: "50–100만" },
  { value: "100to200", label: "100–200만" },
  { value: "over200", label: "200만 이상" },
];

export default function ContextCard({ originalQuery, locale = "ko" }: Props) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [useCase, setUseCase] = useState("");
  const [budget, setBudget] = useState("");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function buildContext(): string {
    const parts: string[] = [];
    if (useCase) parts.push(`용도: ${USE_CASES.find((u) => u.value === useCase)?.label}`);
    if (budget) parts.push(`예산: ${BUDGETS.find((b) => b.value === budget)?.label}`);
    if (extra.trim()) parts.push(extra.trim());
    return parts.join(", ");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const context = buildContext();
    if (!context) {
      setError("용도·예산 중 하나 이상 선택하거나 메모를 입력해주세요.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/compare", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: originalQuery, context }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string };
        setError(body.error ?? "재분석 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
        setLoading(false);
        return;
      }

      const body = (await res.json()) as CompareResponse;

      if (body.comparisonId) {
        router.push(`/results?historyId=${body.comparisonId}`);
        router.refresh();
        return;
      }

      try {
        sessionStorage.setItem(
          SESSION_RESULT_KEY,
          JSON.stringify({ query: originalQuery, locale, result: body.result })
        );
      } catch {
        // sessionStorage unavailable (private mode) — fall back to a fresh load
      }
      router.push("/results");
    } catch {
      setError("네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="cc-trigger" onClick={() => setOpen(true)}>
        <span className="cc-trigger-text">
          <span className="cc-trigger-title">내 상황에 맞게 다시 분석받기</span>
          <span className="cc-trigger-hint">용도 · 예산을 알려주면 더 정확한 추천을 드려요</span>
        </span>
        <svg className="cc-chevron" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    );
  }

  return (
    <div className="cc-card">
      <div className="cc-head">
        <div>
          <p className="cc-head-title">내 상황에 맞게 재분석</p>
          <p className="cc-head-sub">선택한 조건을 반영해 추천을 다시 계산합니다</p>
        </div>
        <button
          type="button"
          className="cc-close"
          onClick={() => setOpen(false)}
          aria-label="닫기"
          disabled={loading}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2.5 2.5l9 9M11.5 2.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="cc-form">
        <div className="cc-field">
          <p className="cc-field-label">주요 용도</p>
          <div className="cc-chips">
            {USE_CASES.map((u) => (
              <button
                key={u.value}
                type="button"
                className={`cc-chip${useCase === u.value ? " cc-chip-on" : ""}`}
                onClick={() => setUseCase(useCase === u.value ? "" : u.value)}
              >
                {u.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cc-field">
          <p className="cc-field-label">예산</p>
          <div className="cc-chips">
            {BUDGETS.map((b) => (
              <button
                key={b.value}
                type="button"
                className={`cc-chip${budget === b.value ? " cc-chip-on" : ""}`}
                onClick={() => setBudget(budget === b.value ? "" : b.value)}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        <div className="cc-field">
          <p className="cc-field-label">
            추가 메모 <span className="cc-optional">(선택)</span>
          </p>
          <input
            type="text"
            className="cc-input"
            placeholder="예: 배터리가 제일 중요해, 아이폰에서 갈아타려고"
            value={extra}
            onChange={(e) => setExtra(e.target.value)}
            maxLength={80}
          />
        </div>

        {error && <p className="cc-error">{error}</p>}

        <button type="submit" className={`cc-submit${loading ? " cc-submit-loading" : ""}`} disabled={loading}>
          {loading ? (
            <>
              <span className="cc-spinner" aria-hidden />
              다시 분석하는 중…
            </>
          ) : (
            <>
              이 상황으로 다시 분석
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" aria-hidden="true">
                <path d="M2.5 7.5h10M8.5 3.5l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </>
          )}
        </button>
      </form>
    </div>
  );
}
