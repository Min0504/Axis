import AuthCard from "@/components/auth-card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="container narrow">
      <section className="hero compact">
        <div className="logo">a.</div>
        <h1>Axis에 오신 걸 환영해요</h1>
        <p className="sub">선택에 어려움을 겪는 당신의 조용한 동반자</p>
      </section>
      <AuthCard />
      <Link className="btn-outline guest" href="/">
        게스트로 계속하기
      </Link>
    </main>
  );
}
