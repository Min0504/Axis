"use client";

import { useEffect, useState } from "react";
import type { PriceApiResult } from "@/app/api/price/route";

type TimingVerdict = "buy_now" | "wait_short" | "wait_model" | "collecting";

type NextModelHint = { label: string; month: string } | null;

function getNextModelHint(productName: string): NextModelHint {
  const n = productName.toLowerCase();
  if (n.includes("iphone")) return { label: "아이폰 신모델", month: "매년 9월" };
  if (n.includes("galaxy s") && !n.includes("fold") && !n.includes("flip"))
    return { label: "갤럭시 S 신모델", month: "매년 1월" };
  if (n.includes("galaxy z fold") || n.includes("galaxy z flip"))
    return { label: "갤럭시 Z 신모델", month: "매년 7월" };
  if (n.includes("macbook air")) return { label: "맥북 에어 신모델", month: "봄 (3~4월)" };
  if (n.includes("macbook pro")) return { label: "맥북 프로 신모델", month: "가을 (10~11월)" };
  if (n.includes("galaxy book")) return { label: "갤럭시 북 신모델", month: "봄 (3~5월)" };
  if (n.includes("lg gram")) return { label: "LG 그램 신모델", month: "봄 (1~3월)" };
  return null;
}

function getVerdict(price: PriceApiResult): TimingVerdict {
  if (price.dealScore >= 75) return "buy_now";
  if (price.dealScore >= 45) return "wait_short";
  return "wait_model";
}

const VERDICT_CONFIG: Record<TimingVerdict | "collecting", {
  signal: string;
  text: string;
  sub: string;
}> = {
  buy_now: {
    signal: "ts-green",
    text: "지금 사기 좋습니다",
    sub: "최근 최저가에 가깝습니다. 더 기다려도 크게 내려가기 어렵습니다.",
  },
  wait_short: {
    signal: "ts-amber",
    text: "지금 사도 크게 손해 없습니다",
    sub: "평균 가격대입니다. 할인 시즌(블프·11번가 등)을 노린다면 조금 더 기다릴 수 있습니다.",
  },
  wait_model: {
    signal: "ts-red",
    text: "잠깐, 기다려보세요",
    sub: "현재 가격이 최저가보다 많이 높습니다. 할인이나 신모델 출시 전 재고 정리를 노려보세요.",
  },
  collecting: {
    signal: "ts-gray",
    text: "가격 이력 수집 중입니다",
    sub: "매일 가격을 수집하고 있습니다. 며칠 후 정확한 타이밍 판정을 드릴게요.",
  },
};

type Props = {
  productName: string;
  locale?: string;
};

export default function TimingSection({ productName, locale = "ko" }: Props) {
  const [price, setPrice] = useState<PriceApiResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/price?name=${encodeURIComponent(productName)}&locale=${locale}`)
      .then((r) => r.json())
      .then((data: { result: PriceApiResult | null }) => setPrice(data.result ?? null))
      .catch(() => setPrice(null))
      .finally(() => setLoading(false));
  }, [productName, locale]);

  const verdict: TimingVerdict | "collecting" = price ? getVerdict(price) : "collecting";
  const cfg = VERDICT_CONFIG[verdict];
  const hint = getNextModelHint(productName);

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
        <span className="ts-label">구매 타이밍</span>
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
            <span>최저 {price.lowest.toLocaleString()}</span>
            <span className="ts-price-current">현재 {price.current.toLocaleString()}</span>
            <span>평균 {price.average.toLocaleString()}</span>
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
          {hint.label} 출시 예정: {hint.month}
        </div>
      )}
    </section>
  );
}
