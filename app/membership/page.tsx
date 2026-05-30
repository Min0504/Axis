import Link from "next/link";
import MembershipCta from "@/components/membership-cta";
import { getCurrentProfile } from "@/lib/users/get-profile";
import { FREE_DAILY_LIMIT, PLAN_FEATURES, PRO_PRICE_KRW } from "@/lib/plan";

export const metadata = { title: "멤버십" };

function Cell({ value }: { value: string | boolean }) {
  if (typeof value === "boolean") {
    return <span className={value ? "feat-yes" : "feat-no"}>{value ? "✓" : "—"}</span>;
  }
  return <span>{value}</span>;
}

export default async function MembershipPage() {
  const profile = await getCurrentProfile();
  const isPro = profile?.plan === "pro";

  return (
    <main className="container narrow">
      <p className="back-link">
        <Link href="/">← 홈으로</Link>
      </p>

      <section className="hero compact">
        <p className="badge">● 멤버십</p>
        <h1>결정에 한계를 두지 마세요</h1>
        <p className="sub">무료로 충분히, 그리고 더 필요할 땐 Pro로.</p>
      </section>

      <div className="plan-grid">
        <section className="plan-card">
          <header className="plan-head">
            <h2>Free</h2>
            <p className="plan-price">
              ₩0<span>/월</span>
            </p>
            <p className="plan-tagline">가볍게 시작하기</p>
          </header>
          <ul className="plan-points">
            <li>하루 {FREE_DAILY_LIMIT}회 결정</li>
            <li>기본 AI 분석</li>
            <li>결정 기록 저장</li>
          </ul>
          {profile ? (
            <p className="plan-current">{isPro ? "이전 플랜" : "현재 플랜"}</p>
          ) : (
            <Link className="btn-outline" href="/login">
              무료로 시작하기
            </Link>
          )}
        </section>

        <section className="plan-card featured">
          <span className="plan-ribbon">추천</span>
          <header className="plan-head">
            <h2>Pro</h2>
            <p className="plan-price">
              ₩{PRO_PRICE_KRW.toLocaleString("ko-KR")}
              <span>/월</span>
            </p>
            <p className="plan-tagline">결정을 무제한으로</p>
          </header>
          <ul className="plan-points">
            <li>무제한 결정</li>
            <li>고급 AI 분석</li>
            <li>공식 스펙 비교</li>
            <li>결과 공유 · 내보내기</li>
            <li>우선 처리</li>
          </ul>
          <MembershipCta isPro={Boolean(isPro)} />
        </section>
      </div>

      <section className="detail-card feature-table">
        <h2>플랜 비교</h2>
        <div className="feat-grid">
          <div className="feat-row feat-header">
            <span>기능</span>
            <span>Free</span>
            <span>Pro</span>
          </div>
          {PLAN_FEATURES.map((f) => (
            <div className="feat-row" key={f.label}>
              <span>{f.label}</span>
              <Cell value={f.free} />
              <Cell value={f.pro} />
            </div>
          ))}
        </div>
      </section>

      <p className="hint">결제 연동(Toss·Stripe)은 준비 중입니다.</p>
    </main>
  );
}
