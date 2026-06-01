"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SESSION_RESULT_KEY } from "@/components/session-results";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ComparisonResult } from "@/lib/types";

type CompareResponse = {
  result: ComparisonResult;
  comparisonId?: string;
};

const LETTERS = ["A", "B", "C", "D", "E"];

export default function VsInput({ maxOptions = 2, locale = "ko" }: { maxOptions?: number; locale?: Locale }) {
  const t = getDictionary(locale).input;
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
      setError(t.errorEmpty);
      return;
    }

    const MAX_LEN = 50;
    if (trimmed.some((o) => o.length > MAX_LEN)) {
      setError(t.errorLength(MAX_LEN));
      return;
    }

    const unique = new Set(trimmed.map((o) => o.toLowerCase()));
    if (unique.size !== trimmed.length) {
      setError(t.errorDuplicate);
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
      setError(body.error ?? t.errorGeneral);
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

  const isTwoWay = options.length === 2;

  function renderCard(value: string, index: number) {
    return (
      <label className={`opt-card opt-${index}`} key={index}>
        <div className="opt-card-top">
          <span className="opt-tag">{LETTERS[index]}</span>
          <span className="opt-label">{t.optionSlot(index + 1)}</span>
          {options.length > 2 && (
            <button
              type="button"
              className="opt-remove"
              onClick={() => removeOption(index)}
              aria-label={t.optionSlot(index + 1)}
            >
              ×
            </button>
          )}
        </div>
        <input
          value={value}
          onChange={(e) => updateOption(index, e.target.value)}
          placeholder={t.placeholders[index] ?? t.placeholders[0]}
          required={index < 2}
        />
        <span className="opt-watermark" aria-hidden>
          {LETTERS[index]}
        </span>
      </label>
    );
  }

  return (
    <form className="vs-shell" onSubmit={(e) => void handleSubmit(e)}>
      {isTwoWay ? (
        <div className="vs-grid">
          {renderCard(options[0], 0)}
          <span className="vs-divider" aria-hidden>vs</span>
          {renderCard(options[1], 1)}
        </div>
      ) : (
        <div className="opt-grid">
          {options.map((value, index) => renderCard(value, index))}
        </div>
      )}

      {canAdd && (
        <button type="button" className="opt-add-btn" onClick={addOption}>
          {t.addOption}
          <span className="opt-add-count">{options.length}/{maxOptions}</span>
        </button>
      )}

      <button className="btn-primary large" type="submit" disabled={isLoading}>
        {isLoading ? t.submitting : t.submit}
      </button>

      {maxOptions < 3 && (
        <p className="vs-upsell">
          {t.proUpsell} <Link href="/membership">{t.pro}</Link>
        </p>
      )}

      {error && <p className="hint error">{error}</p>}
      {limitReached && (
        <Link className="btn-outline upgrade-cta" href="/membership">
          {t.upgradePrompt}
        </Link>
      )}
    </form>
  );
}
