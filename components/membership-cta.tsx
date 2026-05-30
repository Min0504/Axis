"use client";

import { useState } from "react";

// Payment integration (Toss/Stripe) is intentionally not wired yet. For now the
// upgrade CTA registers interest so the funnel is real and measurable.
export default function MembershipCta({ isPro }: { isPro: boolean }) {
  const [joined, setJoined] = useState(false);

  if (isPro) {
    return <p className="plan-current">현재 Pro 멤버입니다. 감사합니다 🙌</p>;
  }

  if (joined) {
    return <p className="plan-current">대기자 명단에 등록됐어요. 출시되면 가장 먼저 알려드릴게요!</p>;
  }

  return (
    <button type="button" className="btn-primary block" onClick={() => setJoined(true)}>
      Pro 업그레이드 (출시 알림 받기)
    </button>
  );
}
