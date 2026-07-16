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
};

type ShareCopy = {
  readonly eyebrow: string;
  readonly title: string;
  readonly body: string;
  readonly buyHint: string;
  readonly storeHint: string;
  readonly shareHint: string;
};

function shareCopy(locale: Locale, storeLabel: string): ShareCopy {
  if (locale === "en") {
    return {
      eyebrow: "Share card",
      title: "Axis picked this as the better buy.",
      body: "Send the verdict card to a friend before the group chat turns into another spec debate.",
      buyHint: "Live marketplace check",
      storeHint: `${storeLabel} search opens in a new tab`,
      shareHint: "Creates a public result card",
    };
  }

  if (locale === "ja") {
    return {
      eyebrow: "シェアカード",
      title: "Axisのおすすめをそのまま共有できます。",
      body: "スペック比較の結論を、相談相手にすぐ送れるカードにしました。",
      buyHint: "マーケット価格を確認",
      storeHint: `${storeLabel}検索を新しいタブで開きます`,
      shareHint: "公開結果カードを作成",
    };
  }

  return {
    eyebrow: "공유 카드",
    title: "Axis가 고른 결론을 바로 공유하세요.",
    body: "스펙 논쟁이 길어지기 전에, 추천 결과와 구매 링크를 한 장으로 전달합니다.",
    buyHint: "마켓 최저가 확인",
    storeHint: `${storeLabel} 검색을 새 탭으로 엽니다`,
    shareHint: "공개 결과 카드 생성",
  };
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
}: Props) {
  const [token, setToken] = useState(shareToken ?? "");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const buyLink = primaryBuyLink(selectedOption, category, locale);
  const t = getDictionary(locale).share;
  const copy = shareCopy(locale, buyLink.label);

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
    } catch (error) {
      if (!(error instanceof Error)) {
        throw error;
      }
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
      <div className="share-card-preview" aria-label={copy.title}>
        <span className="share-card-eyebrow">{copy.eyebrow}</span>
        <strong className="share-card-pick">{selectedOption}</strong>
        <p>{copy.body}</p>
      </div>

      <a
        className="btn-buy"
        href={buyLink.url}
        target="_blank"
        rel="noreferrer sponsored"
        onClick={trackAffiliate}
      >
        <span className="buy-icon" aria-hidden>↗</span>
        <span className="buy-copy">
          <span className="buy-text">{t.buyOn(selectedOption)}</span>
          <span className="buy-hint">{copy.buyHint}</span>
        </span>
        <span className="buy-store">{buyLink.label}</span>
      </a>

      <div className="share-row">
        <button
          type="button"
          className="btn-share"
          onClick={() => void handleShare()}
          disabled={sharing}
        >
          <span aria-live="polite">{sharing ? t.sharing : copied ? t.copied : t.shareBtn}</span>
          <span className="share-hint">{copy.shareHint}</span>
        </button>
      </div>

      <p className="affiliate-note">
        <span>{copy.storeHint}</span>
        <span>{t.affiliateNote}</span>
      </p>
    </div>
  );
}
