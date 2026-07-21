"use client";

import { useEffect, useState } from "react";
import type { PriceApiResult } from "@/app/api/price/route";
import { getDictionary, isLocale, type Locale } from "@/lib/i18n";

type TimingVerdict = "buy_now" | "wait_short" | "wait_model" | "collecting";

type NextModelHint = { readonly label: string; readonly month: string } | null;

function getNextModelHint(productName: string, timing: ReturnType<typeof getDictionary>["timing"]): NextModelHint {
  const n = productName.toLowerCase();
  if (n.includes("iphone")) return { label: timing.iphoneLabel, month: timing.iphoneMonth };
  if (n.includes("galaxy s") && !n.includes("fold") && !n.includes("flip")) {
    return { label: timing.galaxySLabel, month: timing.galaxySMonth };
  }
  if (n.includes("galaxy z fold") || n.includes("galaxy z flip")) {
    return { label: timing.galaxyZLabel, month: timing.galaxyZMonth };
  }
  if (n.includes("macbook air")) return { label: timing.macbookAirLabel, month: timing.macbookAirMonth };
  if (n.includes("macbook pro")) return { label: timing.macbookProLabel, month: timing.macbookProMonth };
  if (n.includes("galaxy book")) return { label: timing.galaxyBookLabel, month: timing.galaxyBookMonth };
  if (n.includes("lg gram")) return { label: timing.lgGramLabel, month: timing.lgGramMonth };
  return null;
}

function getVerdict(price: PriceApiResult): TimingVerdict {
  if (price.dealScore >= 75) return "buy_now";
  if (price.dealScore >= 45) return "wait_short";
  return "wait_model";
}

function verdictConfig(timing: ReturnType<typeof getDictionary>["timing"]) {
  return {
    buy_now: {
      signal: "ts-green",
      text: timing.buyNowText,
      sub: timing.buyNowSub,
    },
    wait_short: {
      signal: "ts-amber",
      text: timing.waitShortText,
      sub: timing.waitShortSub,
    },
    wait_model: {
      signal: "ts-red",
      text: timing.waitModelText,
      sub: timing.waitModelSub,
    },
    collecting: {
      signal: "ts-gray",
      text: timing.collectingText,
      sub: timing.collectingSub,
    },
  } as const;
}

type Props = {
  productName: string;
  locale?: Locale | string;
};

export default function TimingSection({ productName, locale = "ko" }: Props) {
  const resolvedLocale: Locale = isLocale(locale) ? locale : "ko";
  const timing = getDictionary(resolvedLocale).timing;
  const [price, setPrice] = useState<PriceApiResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/price?name=${encodeURIComponent(productName)}&locale=${resolvedLocale}`)
      .then((r) => r.json())
      .then((data: { result: PriceApiResult | null }) => setPrice(data.result ?? null))
      .catch(() => setPrice(null))
      .finally(() => setLoading(false));
  }, [productName, resolvedLocale]);

  const verdict: TimingVerdict | "collecting" = price ? getVerdict(price) : "collecting";
  const cfg = verdictConfig(timing)[verdict];
  const hint = getNextModelHint(productName, timing);

  if (loading) return null;

  // Price gauge: marker position = where current sits between lowest and (average * 1.3)
  let markerPct = 50;
  if (price) {
    const lo = price.lowest;
    const hi = Math.max(price.average * 1.3, price.current * 1.05);
    markerPct = Math.min(95, Math.max(5, ((price.current - lo) / (hi - lo)) * 100));
  }

  const fillColor =
    verdict === "buy_now" ? "ts-fill-green"
    : verdict === "wait_short" ? "ts-fill-amber"
    : verdict === "wait_model" ? "ts-fill-red"
    : "ts-fill-gray";

  return (
    <section className="timing-section">
      <div className="ts-header">
        <span className="ts-label">{timing.label}</span>
        <span className={`ts-signal ${cfg.signal}`} />
      </div>

      <p className="ts-verdict">{cfg.text}</p>
      <p className="ts-sub">{cfg.sub}</p>

      {price && (
        <div className="ts-gauge-wrap">
          <div className="ts-gauge-track">
            <div
              className={`ts-gauge-fill ${fillColor}`}
              style={{ width: `${markerPct}%` }}
            />
            <div className="ts-gauge-cursor" style={{ left: `${markerPct}%` }} />
          </div>
          <div className="ts-price-row">
            <span>{timing.lowest} {price.lowest.toLocaleString()}</span>
            <span className="ts-price-current">{timing.current} {price.current.toLocaleString()}</span>
            <span>{timing.average} {price.average.toLocaleString()}</span>
          </div>
        </div>
      )}

      {hint && (
        <div className="ts-cycle">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <rect x="1" y="3" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.2"/>
            <path d="M4 1v2M8 1v2" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
            <path d="M1 6h10" stroke="currentColor" strokeWidth="1.2"/>
          </svg>
          {timing.releaseHint(hint.label, hint.month)}
        </div>
      )}
    </section>
  );
}
