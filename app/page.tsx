import HistoryList from "@/components/history-list";
import UserNav from "@/components/user-nav";
import VsInput from "@/components/vs-input";
import { getCurrentProfile } from "@/lib/users/get-profile";
import { GUEST_MAX_OPTIONS, devPlanOverride, maxOptions } from "@/lib/plan";

export default async function Home() {
  const profile = await getCurrentProfile();
  const dev = devPlanOverride();
  const maxOpts = dev ? maxOptions(dev) : profile ? maxOptions(profile.plan) : GUEST_MAX_OPTIONS;

  return (
    <main className="container">
      <header className="topbar">
        <div className="brand">
          axis<span className="brand-beta">beta</span>
        </div>
        <UserNav />
      </header>

      <section className="hero">
        <p className="badge">● AI 선택 도우미</p>
        <h1>
          까다로운 당신을 위해,
          <br />
          <span>고민을 단정하게.</span>
        </h1>
        <p className="sub">비교할 선택지를 적어주세요. Axis가 장단점을 정리해 당신의 선택을 돕습니다.</p>
      </section>

      <VsInput maxOptions={maxOpts} />
      <HistoryList />
    </main>
  );
}
