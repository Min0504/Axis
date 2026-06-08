"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { listWatches, removeWatch, subscribeWatches } from "@/lib/watch/store";
import type { Watch } from "@/lib/watch/types";
import type { PriceApiResult } from "@/app/api/price/route";
import { formatPrice } from "@/lib/pricing/types";
import { getDictionary, type Locale } from "@/lib/i18n";

const ENDPOINT_KEY = "axis:push:endpoint";
const EMAIL_KEY = "axis:watch:email";

function getStoredEndpoint() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(ENDPOINT_KEY) ?? "";
}
function getStoredEmail() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(EMAIL_KEY) ?? "";
}

const EMPTY_WATCHES: Watch[] = [];

function useWatches(): Watch[] {
  return useSyncExternalStore(subscribeWatches, listWatches, () => EMPTY_WATCHES);
}

async function syncRemove(productId: string, region: Watch["region"]) {
  const endpoint = getStoredEndpoint();
  if (endpoint) {
    fetch("/api/push/subscribe", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint, productId, region }),
    }).catch(() => null);
  }
  const email = getStoredEmail();
  if (email) {
    fetch("/api/watches", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, productId, region }),
    }).catch(() => null);
  }
}

export default function WatchList({ locale = "ko" }: { locale?: Locale }) {
  const t = getDictionary(locale).watch;
  const watches = useWatches();
  const [prices, setPrices] = useState<Record<string, PriceApiResult>>({});

  useEffect(() => {
    let alive = true;
    void (async () => {
      const entries = await Promise.all(
        watches.map(async (w) => {
          try {
            const res = await fetch(`/api/price?id=${encodeURIComponent(w.productId)}&locale=${locale}`);
            if (!res.ok) return null;
            const body = (await res.json()) as { result: PriceApiResult | null };
            return body.result ? ([w.productId, body.result] as const) : null;
          } catch {
            return null;
          }
        })
      );
      if (!alive) return;
      const map: Record<string, PriceApiResult> = {};
      for (const e of entries) if (e) map[e[0]] = e[1];
      setPrices(map);
    })();
    return () => { alive = false; };
  }, [watches, locale]);

  if (watches.length === 0) return null;

  return (
    <section className="watch-card" id="watchlist">
      <div className="watch-head">
        <h3>{t.title}</h3>
        <span className="watch-count">{watches.length}</span>
      </div>
      <ul className="watch-items">
        {watches.map((w) => {
          const p = prices[w.productId];
          return (
            <li className="watch-item" key={w.productId}>
              <span className="watch-name">{w.name}</span>
              <span className="watch-right">
                {p && (
                  <a className="watch-price" href={p.url} target="_blank" rel="noreferrer sponsored">
                    {formatPrice(p.current, p.currency)}
                  </a>
                )}
                <button
                  type="button"
                  className="watch-remove"
                  onClick={() => {
                    removeWatch(w.productId);
                    void syncRemove(w.productId, w.region);
                  }}
                  aria-label={t.remove}
                >
                  ×
                </button>
              </span>
            </li>
          );
        })}
      </ul>
      <p className="watch-note">{t.alertNote}</p>
    </section>
  );
}
