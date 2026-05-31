export type Plan = "free" | "plus" | "pro";

export const PLAN_ORDER: Plan[] = ["free", "plus", "pro"];

/** Decisions allowed per calendar day. null = unlimited. */
export const PLAN_DAILY_LIMIT: Record<Plan, number | null> = {
  free: 3,
  plus: 50,
  pro: null
};

/** Monthly price in KRW (박리다매: intentionally low). */
export const PLAN_PRICE_KRW: Record<Plan, number> = {
  free: 0,
  plus: 2900,
  pro: 5900
};

export const PLAN_LABELS: Record<Plan, string> = {
  free: "Free",
  plus: "Plus",
  pro: "Pro"
};

export const PLAN_TAGLINES: Record<Plan, string> = {
  free: "가볍게 시작하기",
  plus: "매일 충분하게",
  pro: "결정을 무제한으로"
};

export function isPlan(value: string | null | undefined): value is Plan {
  return value === "free" || value === "plus" || value === "pro";
}

export function normalizePlan(value: string | null | undefined): Plan {
  return isPlan(value) ? value : "free";
}

export function dailyLimit(plan: Plan): number | null {
  return PLAN_DAILY_LIMIT[plan];
}

export type PlanFeature = {
  label: string;
  free: string | boolean;
  plus: string | boolean;
  pro: string | boolean;
};

/** Marketing feature matrix shown on the membership page. */
export const PLAN_FEATURES: PlanFeature[] = [
  { label: "하루 결정 횟수", free: "3회", plus: "50회", pro: "무제한" },
  { label: "AI 결정 분석", free: "기본", plus: "고급", pro: "고급" },
  { label: "결정 기록 저장", free: true, plus: true, pro: true },
  { label: "공식 스펙 비교", free: false, plus: true, pro: true },
  { label: "결과 공유 · 내보내기", free: false, plus: false, pro: true },
  { label: "우선 처리 (빠른 응답)", free: false, plus: false, pro: true }
];

/** Short bullet list per plan used on pricing cards. */
export const PLAN_POINTS: Record<Plan, string[]> = {
  free: ["하루 3회 결정", "기본 AI 분석", "결정 기록 저장"],
  plus: ["하루 50회 결정", "고급 AI 분석", "공식 스펙 비교", "결정 기록 저장"],
  pro: ["무제한 결정", "고급 AI 분석", "공식 스펙 비교", "결과 공유 · 내보내기", "우선 처리"]
};
