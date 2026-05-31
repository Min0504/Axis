"use client";

import { useState } from "react";
import { primaryBuyLink } from "@/lib/affiliate";
import type { Category } from "@/lib/types";

type Props = {
  /** The selected (winning) option name. */
  selectedOption: string;
  category: Category;
  /** If this result is saved in the DB, the id to create a share token from. */
  comparisonId?: string;
  /** Already-known share token (from /share/[token] page). */
  shareToken?: string;
};

export default function ShareActions({ selectedOption, category, comparisonId, shareToken }: Props) {
  const [token, setToken] = useState(shareToken ?? "");
  const [copying, setCopying] = useState(false);
  const [copied, setCopied] = useState(false);

  const buyUrl = primaryBuyLink(selectedOption, category);

  async function getOrCreateToken(): Promise<string> {
    if (token) return token;
    if (!comparisonId) return "";

    const res = await fetch(`/api/share/${comparisonId}`, { method: "POST" });
    if (!res.ok) return "";

    const data = (await res.json()) as { token?: string };
    if (data.token) setToken(data.token);
    return data.token ?? "";
  }

  async function handleShare() {
    setCopying(true);
    const t = await getOrCreateToken();
    const url = t
      ? `${location.origin}/share/${t}`
      : `${location.origin}/?q=${encodeURIComponent(selectedOption)}`;

    const text = `Axis가 "${selectedOption}"을(를) 선택했어요 → ${url}`;

    if (navigator.share) {
      await navigator.share({ title: `Axis의 선택: ${selectedOption}`, url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text).catch(() => null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
    setCopying(false);
  }

  function handleKakao() {
    // KakaoTalk SDK must be loaded separately for production.
    const url = token ? `${location.origin}/share/${token}` : location.href;
    window.open(
      `https://sharer.kakao.com/talk/friends/picker/link?app_key=KAKAO_APP_KEY&link_ver=4.0&template_id=${encodeURIComponent(url)}`,
      "_blank",
      "width=400,height=500"
    );
  }

  return (
    <div className="share-actions">
      <a className="btn-buy" href={buyUrl} target="_blank" rel="noreferrer sponsored">
        <span>🛒</span>
        {selectedOption} 구매하기
        <span className="buy-store">쿠팡</span>
      </a>

      <div className="share-row">
        <button type="button" className="btn-share" onClick={() => void handleShare()} disabled={copying}>
          {copied ? "복사됨 ✓" : "공유하기"}
        </button>
      </div>

      <p className="affiliate-note">
        구매 링크는 제휴 링크로, Axis 운영에 도움이 됩니다. 추가 비용 없이 동일한 가격으로 구매할 수 있어요.
      </p>
    </div>
  );
}
