"use client";

import { useState } from "react";
import { primaryBuyLink } from "@/lib/affiliate";
import type { Category, ComparisonResult } from "@/lib/types";
import { getDictionary, type Locale } from "@/lib/i18n";

type Props = {
  selectedOption: string;
  category: Category;
  locale?: Locale;
  comparisonId?: string;
  shareToken?: string;
  guestPayload?: { query: string; result: ComparisonResult };
  slug?: string;
  region?: string;
  query?: string;
  summary?: string;
};

function splitQuery(query: string | undefined): readonly string[] {
  if (!query) return [];
  return query
    .split(/\s+vs\s+|\s+대\s+/i)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 6);
}

export default function ShareActions({
  selectedOption,
  category,
  locale = "ko",
  comparisonId,
  shareToken,
  guestPayload,
  slug,
  region,
  query,
  summary,
}: Props) {
  const [token, setToken] = useState(shareToken ?? "");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const buyLink = primaryBuyLink(selectedOption, category, locale);
  const t = getDictionary(locale).share;
  const queryParts = splitQuery(query);

  async function getShareUrl(): Promise<string> {
    if (token) return `${location.origin}/share/${token}`;

    setSharing(true);

    try {
      if (comparisonId) {
        const res = await fetch(`/api/share/${comparisonId}`, { method: "POST" });
        if (res.ok) {
          const data = (await res.json()) as { token?: string };
          if (data.token) {
            setToken(data.token);
            return `${location.origin}/share/${data.token}`;
          }
        }
      }

      if (guestPayload) {
        const res = await fetch("/api/share/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(guestPayload),
        });
        if (res.ok) {
          const data = (await res.json()) as { token?: string };
          if (data.token) {
            setToken(data.token);
            return `${location.origin}/share/${data.token}`;
          }
        }
      }
    } catch {
      // fall through to plain URL
    } finally {
      setSharing(false);
    }

    return location.href;
  }

  async function handleShare() {
    const url = await getShareUrl();
    const text = t.shareMessage(selectedOption, url);

    if (navigator.share) {
      await navigator.share({ title: t.shareTitle(selectedOption), url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text).catch(() => null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function trackAffiliate() {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "affiliate",
        product_id: selectedOption,
        slug: slug ?? null,
        region: region ?? locale.toUpperCase(),
        retailer: buyLink.label,
      }),
    }).catch(() => null);
  }

  return (
    <div className="share-actions">
      <section className="share-preview-card" aria-label={t.shareTitle(selectedOption)}>
        <div className="share-preview-top">
          <p className="share-preview-kicker">{t.shareCardLabel}</p>
          <span className="share-preview-badge">{t.shareCardBadge}</span>
        </div>
        <h3 className="share-preview-title">{selectedOption}</h3>
        <p className="share-preview-summary">{summary ?? t.shareCardFallback}</p>
        {queryParts.length > 0 ? (
          <div className="share-preview-query" aria-label={query}>
            {queryParts.map((part, index) => (
              <span className="share-query-chip" key={`${part}-${index}`}>
                {part}
              </span>
            ))}
          </div>
        ) : null}
      </section>

      <div className="share-action-grid">
        <button
          type="button"
          className="btn-share btn-share-primary"
          onClick={() => void handleShare()}
          disabled={sharing}
        >
          {sharing ? t.sharing : copied ? t.copied : t.shareBtn}
        </button>

        <a
          className="btn-buy btn-buy-secondary"
          href={buyLink.url}
          target="_blank"
          rel="noreferrer sponsored"
          onClick={trackAffiliate}
        >
          <span className="buy-icon" aria-hidden>↗</span>
          <span className="buy-text">{t.buyOn(selectedOption)}</span>
          <span className="buy-store">{buyLink.label}</span>
        </a>
      </div>

      <p className="affiliate-note">{t.affiliateNote}</p>
    </div>
  );
}
