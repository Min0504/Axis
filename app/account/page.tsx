import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import NicknameEditor from "@/components/nickname-editor";
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
  const used = profile.dailyUsage;
  const remaining = isUnlimited ? null : Math.max(0, limit - used);
  const pct = isUnlimited ? 0 : Math.min(100, Math.round((used / limit) * 100));
  const joined = new Date(profile.createdAt).toLocaleDateString("ko-KR");
  const emailHandle = profile.email.split("@")[0] || "사용자";
  const avatarChar = (profile.nickname?.trim() || profile.email || "A").charAt(0).toUpperCase();

  return (
    <main className="container narrow">
      <p className="back-link">
        <Link href="/">← 홈으로</Link>
      </p>

      <section className="account-hero">
        <span className="account-avatar">{avatarChar}</span>
        <NicknameEditor initialNickname={profile.nickname} fallback={emailHandle} />
        <span className={`plan-badge ${profile.plan}`}>{PLAN_LABELS[profile.plan]} 멤버</span>
      </section>

      <section className="detail-card usage-card">
        <div className="usage-head">
          <h2>오늘의 결정</h2>
          <span className="usage-count">
            {isUnlimited ? "무제한" : `${used} / ${limit}회`}
          </span>
        </div>
        {!isUnlimited && (
          <>
            <div className="usage-bar">
              <span className="usage-fill" style={{ width: `${pct}%` }} />
            </div>
            <p className="usage-sub">오늘 {remaining}회 더 결정할 수 있어요. 매일 0시에 초기화됩니다.</p>
          </>
        )}
        {isUnlimited && <p className="usage-sub">Pro 멤버는 매일 무제한으로 결정할 수 있어요.</p>}
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
      </section>

      {profile.plan !== "pro" && (
        <section className="detail-card upsell">
          <h2>더 많은 결정이 필요하세요?</h2>
          <p>Plus는 하루 30회, Pro는 무제한 + 최대 5개 동시 비교.</p>
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
