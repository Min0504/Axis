import Link from "next/link";
import MembershipCta from "@/components/membership-cta";
import { getCurrentProfile } from "@/lib/users/get-profile";
import {
  PLAN_FEATURES,
  PLAN_LABELS,
  PLAN_ORDER,
  PLAN_POINTS,
  PLAN_PRICE_KRW,
  PLAN_TAGLINES,
  type Plan
} from "@/lib/plan";

export const metadata = { title: "멤버십" };

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return <span className={value ? "feat-yes" : "feat-no"}>{value ? "✓" : "—"}</span>;
  }
  return <span>{value}</span>;
}

function priceLabel(plan: Plan) {
  const price = PLAN_PRICE_KRW[plan];
  return price === 0 ? "₩0" : `₩${price.toLocaleString("ko-KR")}`;
}

export default async function MembershipPage() {
  const profile = await getCurrentProfile();
  const currentPlan = profile?.plan ?? null;

  return (
    <main className="container membership">
      <p className="back-link">
        <Link href="/">← 홈으로</Link>
      </p>

      <section className="hero compact">
        <p className="badge">● 멤버십</p>
        <h1>결정에 한계를 두지 마세요</h1>
        <p className="sub">필요한 만큼만, 부담 없는 가격으로.</p>
      </section>

      <div className="plan-grid three">
        {PLAN_ORDER.map((plan) => {
          const featured = plan === "plus";
          return (
            <section key={plan} className={`plan-card${featured ? " featured" : ""}`}>
              {featured && <span className="plan-ribbon">가장 인기</span>}
              <header className="plan-head">
                <h2>{PLAN_LABELS[plan]}</h2>
                <p className="plan-price">
                  {priceLabel(plan)}
                  <span>/월</span>
                </p>
                <p className="plan-tagline">{PLAN_TAGLINES[plan]}</p>
              </header>
              <ul className="plan-points">
                {PLAN_POINTS[plan].map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
              <MembershipCta plan={plan} currentPlan={currentPlan} />
            </section>
          );
        })}
      </div>

      <section className="detail-card feature-table">
        <h2>플랜 비교</h2>
        <div className="feat-grid three">
          <div className="feat-row feat-header">
            <span>기능</span>
            <span>Free</span>
            <span>Plus</span>
            <span>Pro</span>
          </div>
          {PLAN_FEATURES.map((f) => (
            <div className="feat-row" key={f.label}>
              <span>{f.label}</span>
              <Cell value={f.free} />
              <Cell value={f.plus} />
              <Cell value={f.pro} />
            </div>
          ))}
        </div>
      </section>

      <p className="hint">결제 연동(Toss·Stripe)은 준비 중입니다. 언제든 해지할 수 있어요.</p>
    </main>
  );
}
