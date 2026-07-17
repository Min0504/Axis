"use client";

import { primaryBuyLink } from "@/lib/affiliate";
import type { Category } from "@/lib/types";
import type { Locale } from "@/lib/i18n";

type Props = {
  selectedOption: string;
  category: Category;
  locale?: Locale;
  slug?: string;
  region?: string;
};

/** Buy CTA only — no share / guest links. */
export default function BuyActions({
  selectedOption,
  category,
  locale = "ko",
  slug,
  region,
}: Props) {
  const buyLink = primaryBuyLink(selectedOption, category, locale);

  function trackClick() {
    void fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_type: "affiliate",
        product_id: selectedOption,
        slug: slug ?? null,
        region: region ?? null,
        retailer: buyLink.store,
      }),
    }).catch(() => null);
  }

  return (
    <div className="share-actions">
      <a
        className="buy-primary"
        href={buyLink.url}
        target="_blank"
        rel="noreferrer sponsored"
        onClick={trackClick}
      >
        {buyLink.label}에서 최저가 보기 →
      </a>
      <p className="buy-hint">쿠팡 검색으로 이동합니다. 제휴 링크일 수 있습니다.</p>
    </div>
  );
}
