export type Plan = "free" | "plus" | "pro";

export const PLAN_ORDER: Plan[] = ["free", "plus", "pro"];

/** Decisions allowed per calendar day. null = unlimited. */
export const PLAN_DAILY_LIMIT: Record<Plan, number | null> = {
  free: 5,
  plus: 30,
  pro: null
};

/** How many options can be compared at once. Pro unlocks multi-way (3+). */
export const PLAN_MAX_OPTIONS: Record<Plan, number> = {
  free: 2,
  plus: 2,
  pro: 5
};

/**
 * Whether the plan shows affiliate purchase links.
 * Pro users pay for a clean, ad-free experience.
 */
export const PLAN_SHOW_AFFILIATE: Record<Plan, boolean> = {
  free: true,
  plus: true,
  pro: false
};

/**
 * Watermark on shared pages: Free shares show an Axis CTA to drive virality;
 * paid plans share cleanly.
 */
export const PLAN_SHARE_WATERMARK: Record<Plan, boolean> = {
  free: true,
  plus: false,
  pro: false
};

/** Guests (not logged in) compare two options. */
export const GUEST_MAX_OPTIONS = 2;

/** Monthly price in KRW (박리다매: intentionally low). */
export const PLAN_PRICE_KRW: Record<Plan, number> = {
  free: 0,
  plus: 1900,
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
  pro: "여러 개를 한 번에"
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

export function maxOptions(plan: Plan): number {
  return PLAN_MAX_OPTIONS[plan];
}

/**
 * Dev-only plan override for local "체감" testing without a real account.
 * Set AXIS_DEV_PLAN=pro in .env.local to experience Pro locally. Ignored in
 * production builds.
 */
export function devPlanOverride(): Plan | null {
  if (process.env.NODE_ENV === "production") return null;
  const p = process.env.AXIS_DEV_PLAN;
  return isPlan(p) ? p : null;
}

export type PlanFeature = {
  label: string;
  free: string | boolean;
  plus: string | boolean;
  pro: string | boolean;
};

/** Marketing feature matrix shown on the membership page. */
export const PLAN_FEATURES: PlanFeature[] = [
  { label: "하루 선택 횟수", free: "5회", plus: "30회", pro: "무제한" },
  { label: "동시 비교 항목", free: "2개", plus: "2개", pro: "최대 5개" },
  { label: "공식 스펙 비교", free: true, plus: true, pro: true },
  { label: "기록 저장", free: true, plus: true, pro: true },
  { label: "결과 공유", free: true, plus: true, pro: true },
  { label: "워터마크 없는 공유", free: false, plus: true, pro: true },
  { label: "광고 없는 클린 경험", free: false, plus: false, pro: true },
  { label: "우선 처리 (빠른 응답)", free: false, plus: false, pro: true }
];

/** Short bullet list per plan used on pricing cards. */
export const PLAN_POINTS: Record<Plan, string[]> = {
  free: ["하루 5회 선택", "2개 비교", "공식 스펙 비교", "결과 공유 (워터마크)"],
  plus: ["하루 30회 선택", "2개 비교", "공식 스펙 비교", "클린 결과 공유"],
  pro: ["무제한 선택", "최대 5개 동시 비교", "공식 스펙 비교", "클린 공유 · 내보내기", "광고 없는 경험", "우선 처리"]
};
