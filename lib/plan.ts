export type Plan = "free" | "pro";

/** Free accounts may make this many decisions per calendar day. */
export const FREE_DAILY_LIMIT = 3;

/** Pro price (KRW, monthly). */
export const PRO_PRICE_KRW = 6900;

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  pro: "Pro"
};

export function isPlan(value: string | null | undefined): value is Plan {
  return value === "free" || value === "pro";
}

export function normalizePlan(value: string | null | undefined): Plan {
  return isPlan(value) ? value : "free";
}

export type PlanFeature = {
  label: string;
  free: string | boolean;
  pro: string | boolean;
};

/** Marketing feature matrix shown on the membership page. */
export const PLAN_FEATURES: PlanFeature[] = [
  { label: "하루 결정 횟수", free: `${FREE_DAILY_LIMIT}회`, pro: "무제한" },
  { label: "AI 결정 분석", free: "기본 모델", pro: "고급 모델" },
  { label: "결정 기록 저장", free: true, pro: true },
  { label: "공식 스펙 비교", free: false, pro: true },
  { label: "결과 공유 · 내보내기", free: false, pro: true },
  { label: "우선 처리 (빠른 응답)", free: false, pro: true }
];
