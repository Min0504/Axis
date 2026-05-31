"use client";

import Link from "next/link";
import { useState } from "react";
import { PLAN_LABELS, PLAN_ORDER, type Plan } from "@/lib/plan";

// Payment integration (Toss/Stripe) is intentionally not wired yet. The upgrade
// CTA registers interest so the funnel is real and measurable.
export default function MembershipCta({
  plan,
  currentPlan
}: {
  plan: Plan;
  currentPlan: Plan | null;
}) {
  const [joined, setJoined] = useState(false);
  const primary = plan === "plus";
  const cls = primary ? "btn-primary block" : "btn-outline";

  if (!currentPlan) {
    return (
      <Link className={cls} href="/login">
        {plan === "free" ? "무료로 시작하기" : `${PLAN_LABELS[plan]} 시작하기`}
      </Link>
    );
  }

  const currentIdx = PLAN_ORDER.indexOf(currentPlan);
  const targetIdx = PLAN_ORDER.indexOf(plan);

  if (targetIdx === currentIdx) {
    return <p className="plan-current">현재 플랜</p>;
  }
  if (targetIdx < currentIdx) {
    return <p className="plan-current">포함됨</p>;
  }
  if (joined) {
    return <p className="plan-current">대기자 등록 완료 🙌</p>;
  }

  return (
    <button type="button" className={cls} onClick={() => setJoined(true)}>
      {PLAN_LABELS[plan]} 업그레이드
    </button>
  );
}
