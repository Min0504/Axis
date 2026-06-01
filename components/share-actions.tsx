"use client";

import { useState } from "react";
import { primaryBuyLink } from "@/lib/affiliate";
import type { Category, ComparisonResult } from "@/lib/types";
import type { Plan } from "@/lib/plan";
import { PLAN_SHOW_AFFILIATE } from "@/lib/plan";
import { getDictionary, type Locale } from "@/lib/i18n";

type Props = {
  selectedOption: string;
  category: Category;
  plan: Plan;
  locale?: Locale;
  comparisonId?: string;
  shareToken?: string;
  guestPayload?: { query: string; result: ComparisonResult };
};

export default function ShareActions({
  selectedOption,
  category,
  plan,
  locale = "ko",
  comparisonId,
  shareToken,
  guestPayload
}: Props) {
  const [token, setToken] = useState(shareToken ?? "");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const showAffiliate = PLAN_SHOW_AFFILIATE[plan];
  const buyLink = primaryBuyLink(selectedOption, category, locale);
  const t = getDictionary(locale).share;

  async function getShareUrl(): Promise<string> {
    if (token) return `${location.origin}/share/${token}`;

    setSharing(true);

    try {
      // Logged-in users: create/get token from saved comparison.
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

      // Guests: store the session result as a public anonymous comparison.
      if (guestPayload) {
        const res = await fetch("/api/share/guest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(guestPayload)
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

  return (
    <div className="share-actions">
      {showAffiliate && (
        <a className="btn-buy" href={buyLink.url} target="_blank" rel="noreferrer sponsored">
          <span className="buy-icon" aria-hidden>↗</span>
          {t.buyOn(selectedOption)}
          <span className="buy-store">{buyLink.label}</span>
        </a>
      )}

      <button
        type="button"
        className="btn-share"
        onClick={() => void handleShare()}
        disabled={sharing}
      >
        {sharing ? t.sharing : copied ? t.copied : t.shareBtn}
      </button>

      {showAffiliate && <p className="affiliate-note">{t.affiliateNote}</p>}
      {!showAffiliate && plan === "pro" && <p className="affiliate-note">{t.proClean}</p>}
    </div>
  );
}
