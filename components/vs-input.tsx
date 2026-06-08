"use client";

import { Fragment, FormEvent, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { SESSION_RESULT_KEY } from "@/components/session-results";
import { PREFILL_EVENT, type PrefillDetail } from "@/components/example-chips";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { ComparisonResult } from "@/lib/types";

// ── 단독 입력 시 자동 비교 파트너 제안 ───────────────────────────────────────
const AUTO_PAIRS: Record<string, string> = {
  "에어팟 프로": "갤럭시 버즈3 프로",
  "airpods pro": "Galaxy Buds3 Pro",
  "에어팟 4": "갤럭시 버즈3",
  "airpods 4": "Galaxy Buds3",
  "에어팟 맥스": "Sony WH-1000XM5",
  "airpods max": "Sony WH-1000XM5",
  "아이폰 16": "갤럭시 S25",
  "iphone 16": "Galaxy S25",
  "아이폰 16 프로": "갤럭시 S25 울트라",
  "iphone 16 pro": "Galaxy S25 Ultra",
  "아이폰 16 프로 맥스": "갤럭시 S25 울트라",
  "iphone 16 pro max": "Galaxy S25 Ultra",
  "갤럭시 s25": "아이폰 16",
  "galaxy s25": "iPhone 16",
  "갤럭시 s25 울트라": "아이폰 16 프로 맥스",
  "galaxy s25 ultra": "iPhone 16 Pro Max",
  "맥북 에어": "갤럭시북4 프로",
  "macbook air": "Galaxy Book4 Pro",
  "맥북 프로": "LG 그램 16",
  "macbook pro": "LG gram 16",
  "갤럭시북4 프로": "맥북 에어 M4",
  "galaxy book4 pro": "MacBook Air M4",
  "아이패드 프로": "갤럭시 탭 S10 울트라",
  "ipad pro": "Galaxy Tab S10 Ultra",
  "소니 wh-1000xm5": "에어팟 맥스",
  "sony wh-1000xm5": "AirPods Max",
};

function getSuggestedPartner(input: string): string | null {
  const key = input.trim().toLowerCase();
  return AUTO_PAIRS[key] ?? null;
}

type CompareResponse = {
  result: ComparisonResult;
  comparisonId?: string;
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function VsInput({ maxOptions = 2, locale = "ko" }: { maxOptions?: number; locale?: Locale }) {
  const t = getDictionary(locale).input;
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => { setIsMounted(true); }, []);

  const canAdd = options.length < Math.min(maxOptions, LETTERS.length);

  useEffect(() => {
    function onPrefill(e: Event) {
      const detail = (e as CustomEvent<PrefillDetail>).detail;
      const incoming = detail?.options?.map((o) => o.trim()).filter(Boolean) ?? [];
      if (incoming.length < 2) return;
      const next = incoming.slice(0, Math.max(2, maxOptions));
      setOptions(next.length < 2 ? [...next, ""] : next);
      setError("");
      requestAnimationFrame(() => {
        formRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        formRef.current?.querySelector<HTMLInputElement>("input")?.focus({ preventScroll: true });
      });
    }
    window.addEventListener(PREFILL_EVENT, onPrefill);
    return () => window.removeEventListener(PREFILL_EVENT, onPrefill);
  }, [maxOptions]);

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

    let trimmed = options.map((o) => o.trim()).filter(Boolean);

    // 단독 입력 시 자동 파트너 제안 → 바로 채워서 비교
    if (trimmed.length === 1 && options.length === 2) {
      const partner = getSuggestedPartner(trimmed[0]);
      if (partner) {
        trimmed = [trimmed[0], partner];
        setOptions([trimmed[0], partner]);
      } else {
        setError(t.errorEmpty);
        return;
      }
    } else if (trimmed.length < 2) {
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
    setLoadingOptions(trimmed);
    setIsLoading(true);

    const res = await fetch("/api/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ options: trimmed }),
    });

    if (!res.ok) {
      const body = (await res.json()) as { error?: string };
      setError(body.error ?? t.errorGeneral);
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
      sessionStorage.setItem(
        SESSION_RESULT_KEY,
        JSON.stringify({ query, options: trimmed, locale, result: body.result })
      );
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

  const overlay = isLoading && isMounted
    ? createPortal(
        <div className="analyze-overlay" role="status" aria-label="분석 중">
          <div className="analyze-modal">
            <div className="analyze-logo">axis</div>
            <div className="analyze-comparing">
              {loadingOptions.map((opt, i) => (
                <Fragment key={i}>
                  {i > 0 && <span className="analyze-vs-badge">vs</span>}
                  <span className="analyze-pill">{opt}</span>
                </Fragment>
              ))}
            </div>
            <div className="analyze-bar">
              <div className="analyze-progress" />
            </div>
            <p className="analyze-status">{t.submitting}</p>
          </div>
        </div>,
        document.body
      )
    : null;

  return (
    <>
      {overlay}
      <form id="compare" ref={formRef} className="vs-shell" onSubmit={(e) => void handleSubmit(e)}>
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

        <button className={`btn-primary large${isLoading ? " btn-loading" : ""}`} type="submit" disabled={isLoading}>
          {isLoading ? (
            <span className="btn-loading-inner">
              <span className="btn-spinner" aria-hidden />
              {t.submitting}
            </span>
          ) : t.submit}
        </button>

        {error && <p className="hint error">{error}</p>}
      </form>
    </>
  );
}
