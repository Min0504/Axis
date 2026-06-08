"use client";

import { useState, useEffect } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import BrandLogo from "@/components/brand-logo";
import Link from "next/link";

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [hasSession, setHasSession] = useState(false);

  const supabase = createSupabaseBrowserClient();

  useEffect(() => {
    // Check if user has a valid recovery session
    supabase?.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
    });
  }, [supabase]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) { setError("비밀번호가 일치하지 않습니다."); return; }
    if (password.length < 6) { setError("비밀번호는 6자 이상이어야 합니다."); return; }

    setError("");
    setStatus("loading");

    const { error } = await supabase!.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setStatus("error");
    } else {
      setStatus("done");
      setTimeout(() => { window.location.href = "/"; }, 2000);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-wrap">
        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            <BrandLogo size={36} className="auth-logo-mark" />
            axis
          </Link>
          <p className="auth-tagline">새 비밀번호 설정</p>
        </div>

        {!hasSession ? (
          <div className="auth-form-wrap" style={{ textAlign: "center", padding: "2rem" }}>
            <p style={{ color: "var(--muted)", fontSize: "0.9rem" }}>
              유효하지 않은 링크입니다.<br />비밀번호 찾기를 다시 시도해주세요.
            </p>
            <Link href="/login" className="btn-auth-primary" style={{ display: "block", marginTop: "1rem", textDecoration: "none", textAlign: "center" }}>
              로그인 페이지로 →
            </Link>
          </div>
        ) : status === "done" ? (
          <div className="auth-done">
            <div className="auth-done-icon">✅</div>
            <h2>비밀번호가 변경됐습니다</h2>
            <p>잠시 후 홈으로 이동합니다...</p>
          </div>
        ) : (
          <form className="auth-form-wrap" onSubmit={(e) => void handleSubmit(e)}>
            <div className="auth-fields">
              <div className="auth-field">
                <label htmlFor="new-pw">새 비밀번호</label>
                <input
                  id="new-pw"
                  type="password"
                  placeholder="6자 이상"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  disabled={status === "loading"}
                />
              </div>
              <div className="auth-field">
                <label htmlFor="confirm-pw">비밀번호 확인</label>
                <input
                  id="confirm-pw"
                  type="password"
                  placeholder="비밀번호 재입력"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  autoComplete="new-password"
                  disabled={status === "loading"}
                />
              </div>

              {error && <p className="auth-error">{error}</p>}

              <button
                type="submit"
                className="btn-auth-primary"
                disabled={status === "loading" || !password || !confirm}
              >
                {status === "loading" ? "변경 중..." : "비밀번호 변경"}
              </button>
            </div>
          </form>
        )}

        <Link className="auth-guest" href="/login">← 로그인으로 돌아가기</Link>
      </div>
    </main>
  );
}
