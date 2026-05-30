"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container narrow">
      <section className="hero compact">
        <div className="logo">a.</div>
        <h1>문제가 발생했어요</h1>
        <p className="sub">잠시 후 다시 시도해 주세요.</p>
      </section>
      <button type="button" className="btn-primary" onClick={() => reset()}>
        다시 시도
      </button>
    </main>
  );
}
