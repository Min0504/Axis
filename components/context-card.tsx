"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SESSION_RESULT_KEY } from "@/components/session-results";
import type { ComparisonResult } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";

type Props = {
  originalQuery: string;
  locale?: Locale;
};

type CompareResponse = {
  result: ComparisonResult;
  comparisonId?: string;
};

export default function ContextCard({ originalQuery, locale = "ko" }: Props) {
  const router = useRouter();
  const t = getDictionary(locale).context;
  const useCases = [
    { value: "daily", label: t.useCaseDaily },
    { value: "work", label: t.useCaseWork },
    { value: "creator", label: t.useCaseCreator },
    { value: "game", label: t.useCaseGame },
    { value: "student", label: t.useCaseStudent },
  ] as const;
  const budgets = [
    { value: "under50", label: t.budgetUnder50 },
    { value: "50to100", label: t.budget50to100 },
    { value: "100to200", label: t.budget100to200 },
    { value: "over200", label: t.budgetOver200 },
  ] as const;
  const [open, setOpen] = useState(false);
  const [useCase, setUseCase] = useState("");
  const [budget, setBudget] = useState("");
  const [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function buildContext(): string {
    const parts: string[] = [];
    if (useCase) {
      parts.push(`${t.useCasePrefix}: ${useCases.find((u) => u.value === useCase)?.label}`);
    }
    if (budget) {
      parts.push(`${t.budgetPrefix}: ${budgets.find((b) => b.value === budget)?.label}`);
    }
    if (extra.trim()) parts.push(extra.trim());
    return parts.join(", ");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;

    const context = buildContext();
    if (!context) {
      setError(t.errorNeedInput);
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
        setError(body.error ?? t.errorRetry);
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
      setError(t.errorNetwork);
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <button type="button" className="cc-trigger" onClick={() => setOpen(true)}>
        <span className="cc-trigger-text">
          <span className="cc-trigger-title">{t.triggerTitle}</span>
          <span className="cc-trigger-hint">{t.triggerHint}</span>
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
          <p className="cc-head-title">{t.headTitle}</p>
          <p className="cc-head-sub">{t.headSub}</p>
        </div>
        <button
          type="button"
          className="cc-close"
          onClick={() => setOpen(false)}
          aria-label={t.closeAria}
          disabled={loading}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
            <path d="M2.5 2.5l9 9M11.5 2.5l-9 9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="cc-form">
        <div className="cc-field">
          <p className="cc-field-label">{t.useCaseLabel}</p>
          <div className="cc-chips">
            {useCases.map((u) => (
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
          <p className="cc-field-label">{t.budgetLabel}</p>
          <div className="cc-chips">
            {budgets.map((b) => (
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
            {t.memoLabel} <span className="cc-optional">{t.memoOptional}</span>
          </p>
          <input
            type="text"
            className="cc-input"
            placeholder={t.memoPlaceholder}
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
              {t.submitting}
            </>
          ) : (
            <>
              {t.submit}
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
