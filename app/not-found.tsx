import Link from "next/link";

export default function NotFound() {
  return (
    <main className="container narrow">
      <section className="hero compact">
        <div className="logo">a.</div>
        <h1>페이지를 찾을 수 없어요</h1>
        <p className="sub">주소가 바뀌었거나 삭제된 페이지일 수 있습니다.</p>
      </section>
      <Link className="btn-primary block" href="/">
        홈으로 돌아가기
      </Link>
    </main>
  );
}
