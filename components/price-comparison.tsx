"use client";

import { useEffect, useState } from "react";
import type { PriceApiResult } from "@/app/api/price/route";
import { formatPrice, localeToRegion } from "@/lib/pricing/types";
import WatchButton from "@/components/watch-button";
import { getDictionary, type Locale } from "@/lib/i18n";

/** Below-average fraction at which we call the current price a "good deal". */
const DEAL_THRESHOLD = 0.05;

function Sparkline({ values, deal }: { values: number[]; deal: boolean }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const w = 72;
  const h = 22;
  const pts = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / span) * h;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`} aria-hidden>
      <polyline
        points={pts}
        fill="none"
        stroke={deal ? "var(--accent)" : "currentColor"}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default function PriceComparison({
  options,
  locale = "ko"
}: {
  options: string[];
  locale?: Locale;
}) {
  const t = getDictionary(locale).price;
  const tw = getDictionary(locale).watch;
  const region = localeToRegion(locale);
  const [results, setResults] = useState<PriceApiResult[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let alive = true;
    void (async () => {
      const found = await Promise.all(
        options.map(async (name) => {
          try {
            const res = await fetch(
              `/api/price?name=${encodeURIComponent(name)}&locale=${locale}`
            );
            if (!res.ok) return null;
            const body = (await res.json()) as { result: PriceApiResult | null };
            return body.result;
          } catch {
            return null;
          }
        })
      );
      if (!alive) return;
      setResults(found.filter((r): r is PriceApiResult => Boolean(r)));
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [options, locale]);

  // Honest empty state: no price source / no catalog match → render nothing.
  if (!ready || results.length === 0) return null;

  const cheapest = Math.min(...results.map((r) => r.current));
  const isSeed = results.some((r) => r.source === "seed");

  return (
    <section className="detail-card price-card">
      <div className="price-head">
        <h2>{t.title}</h2>
        {isSeed && <span className="price-demo">{t.demo}</span>}
      </div>

      <ul className="price-list">
        {results.map((r) => {
          const deal = r.dealScore >= DEAL_THRESHOLD;
          const isCheapest = r.current === cheapest && results.length > 1;
          return (
            <li className={`price-row${isCheapest ? " cheapest" : ""}`} key={r.productId}>
              <div className="price-main">
                <span className="price-name">{r.name}</span>
                <span className="price-tags">
                  {isCheapest && <span className="price-tag cheapest-tag">{t.cheapest}</span>}
                  {deal && <span className="price-tag deal-tag">{t.deal}</span>}
                </span>
              </div>

              <Sparkline values={r.spark} deal={deal} />

              <div className="price-figures">
                <a className="price-now" href={r.url} target="_blank" rel="noreferrer sponsored">
                  {formatPrice(r.current, r.currency)}
                  <span className="price-go" aria-hidden> ↗</span>
                </a>
                <span className="price-sub">
                  {t.lowest} {formatPrice(r.lowest, r.currency)}
                </span>
              </div>

              <WatchButton
                productId={r.productId}
                name={r.name}
                region={region}
                label={tw.track}
                labelOn={tw.tracking}
                locale={locale}
              />
            </li>
          );
        })}
      </ul>
    </section>
  );
}
