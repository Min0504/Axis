import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { getCurrentProfile } from "@/lib/users/get-profile";
import { dailyLimit, PLAN_LABELS } from "@/lib/plan";

export const metadata = { title: "내 정보" };

export default async function AccountPage() {
  const profile = await getCurrentProfile();

  if (!profile) {
    redirect("/login");
  }

  const limit = dailyLimit(profile.plan);
  const isUnlimited = limit === null;
  const remaining = isUnlimited ? null : Math.max(0, limit - profile.dailyUsage);
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
            <span className={`plan-badge ${profile.plan}`}>{PLAN_LABELS[profile.plan]}</span>
          </span>
        </div>
        <div className="account-row">
          <span className="account-key">오늘 사용량</span>
          <span className="account-val">
            {isUnlimited ? (
              "무제한"
            ) : (
              <>
                {profile.dailyUsage} / {limit}회{" "}
                <span className="hint-inline">(남은 {remaining}회)</span>
              </>
            )}
          </span>
        </div>
      </section>

      {profile.plan !== "pro" && (
        <section className="detail-card upsell">
          <h2>더 많은 결정이 필요하세요?</h2>
          <p>Plus는 하루 50회, Pro는 무제한. 공식 스펙 비교까지 한 번에.</p>
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
