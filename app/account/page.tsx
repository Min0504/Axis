import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { getCurrentProfile } from "@/lib/users/get-profile";
import { FREE_DAILY_LIMIT, PLAN_LABELS } from "@/lib/plan";

export const metadata = { title: "내 정보" };

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const isPro = profile.plan === "pro";
  const remaining = isPro ? null : Math.max(0, FREE_DAILY_LIMIT - profile.dailyUsage);
  const joined = new Date(profile.createdAt).toLocaleDateString("ko-KR");

  return (
    <main className="container narrow">
      <p className="back-link">
        <Link href="/">← 홈으로</Link>
      </p>

      <section className="hero compact">
        <div className="logo">a.</div>
        <h1>내 정보</h1>
      </section>

      <section className="detail-card account-card">
        <div className="account-row">
          <span className="account-key">이메일</span>
          <span className="account-val">{profile.email}</span>
        </div>
        <div className="account-row">
          <span className="account-key">가입일</span>
          <span className="account-val">{joined}</span>
        </div>
        <div className="account-row">
          <span className="account-key">멤버십</span>
          <span className="account-val">
            <span className={`plan-badge ${isPro ? "pro" : "free"}`}>{PLAN_LABELS[profile.plan]}</span>
          </span>
        </div>
        <div className="account-row">
          <span className="account-key">오늘 사용량</span>
          <span className="account-val">
            {isPro ? (
              "무제한"
            ) : (
              <>
                {profile.dailyUsage} / {FREE_DAILY_LIMIT}회{" "}
                <span className="hint-inline">(남은 {remaining}회)</span>
              </>
            )}
          </span>
        </div>
      </section>

      {!isPro && (
        <section className="detail-card upsell">
          <h2>Pro로 더 많은 결정을</h2>
          <p>매일 무제한 결정, 고급 AI 분석, 공식 스펙 비교까지.</p>
          <Link className="btn-primary block" href="/membership">
            멤버십 보기
          </Link>
        </section>
      )}

      <div className="account-actions-row">
        <LogoutButton />
      </div>
    </main>
  );
}
