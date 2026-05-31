"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/users/ensure-profile";
import { PLAN_DAILY_LIMIT } from "@/lib/plan";

type Mode = "signIn" | "signUp";

export default function AuthCard() {
  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function switchMode(next: Mode) {
    setMode(next);
    setMessage("");
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      setMessage("`.env.local`에 Supabase URL과 ANON KEY를 추가해 주세요.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    if (mode === "signIn") {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
        setIsSubmitting(false);
        return;
      }
      if (data.user) {
        await ensureUserProfile(supabase, data.user);
      }
      window.location.href = "/";
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
    });

    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    if (data.user) {
      await ensureUserProfile(supabase, data.user);
    }

    if (data.session) {
      window.location.href = "/";
      return;
    }

    setMessage("회원가입 완료! 이메일 인증 링크를 확인한 뒤 로그인해 주세요.");
  }

  return (
    <div className="auth-card">
      <div className="auth-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signIn"}
          className={mode === "signIn" ? "active" : ""}
          onClick={() => switchMode("signIn")}
        >
          로그인
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "signUp"}
          className={mode === "signUp" ? "active" : ""}
          onClick={() => switchMode("signUp")}
        >
          회원가입
        </button>
      </div>

      <form className="auth-form" onSubmit={(e) => void handleSubmit(e)}>
        <label>
          이메일
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
            autoComplete="email"
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            disabled={isSubmitting}
            autoComplete={mode === "signIn" ? "current-password" : "new-password"}
          />
        </label>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : mode === "signIn" ? "로그인" : "회원가입"}
        </button>
      </form>

      {mode === "signUp" && (
        <p className="auth-foot">가입하면 하루 {PLAN_DAILY_LIMIT.free}회 무료로 이용할 수 있어요.</p>
      )}
      {!hasSupabaseEnv() && <p className="hint">Supabase 환경변수가 필요합니다.</p>}
      {message && <p className="hint">{message}</p>}
    </div>
  );
}
