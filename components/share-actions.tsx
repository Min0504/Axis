"use client";

import { useState } from "react";
import Link from "next/link";
import { primaryBuyLink } from "@/lib/affiliate";
import type { Category, ComparisonResult } from "@/lib/types";
import type { Plan } from "@/lib/plan";
import { PLAN_SHOW_AFFILIATE } from "@/lib/plan";

type Props = {
  selectedOption: string;
  category: Category;
  plan: Plan;
  comparisonId?: string;
  shareToken?: string;
  /** Full result + query for guest share (no DB id yet). */
  guestPayload?: { query: string; result: ComparisonResult };
};

export default function ShareActions({
  selectedOption,
  category,
  plan,
  comparisonId,
  shareToken,
  guestPayload
}: Props) {
  const [token, setToken] = useState(shareToken ?? "");
  const [sharing, setSharing] = useState(false);
  const [copied, setCopied] = useState(false);

  const showAffiliate = PLAN_SHOW_AFFILIATE[plan];
  const buyUrl = primaryBuyLink(selectedOption, category);

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
    const text = `Axis가 "${selectedOption}"을(를) 선택했어요 → ${url}`;

    if (navigator.share) {
      await navigator.share({ title: `Axis의 선택: ${selectedOption}`, url }).catch(() => null);
    } else {
      await navigator.clipboard.writeText(text).catch(() => null);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <div className="share-actions">
      {showAffiliate && (
        <a className="btn-buy" href={buyUrl} target="_blank" rel="noreferrer sponsored">
          <span>🛒</span>
          {selectedOption} 구매하기
          <span className="buy-store">쿠팡</span>
        </a>
      )}

      <button
        type="button"
        className="btn-share"
        onClick={() => void handleShare()}
        disabled={sharing}
      >
        {sharing ? "링크 생성 중..." : copied ? "복사됨 ✓" : "결과 공유하기"}
      </button>

      {showAffiliate && (
        <p className="affiliate-note">
          구매 링크는 제휴 링크로, Axis 운영에 도움이 됩니다. 추가 비용 없이 동일한 가격으로 구매할 수 있어요.
        </p>
      )}

      {!showAffiliate && plan === "pro" && (
        <p className="affiliate-note">Pro 멤버는 광고 없는 클린 경험을 이용합니다.</p>
      )}
    </div>
  );
}
