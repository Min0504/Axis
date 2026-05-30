"use client";

import { FormEvent, useState } from "react";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { ensureUserProfile } from "@/lib/users/ensure-profile";

export default function AuthCard() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleAuth(mode: "signIn" | "signUp") {
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
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
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
      <form
        className="auth-form"
        onSubmit={(e: FormEvent) => {
          e.preventDefault();
          void handleAuth("signIn");
        }}
      >
        <label>
          이메일
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isSubmitting}
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
          />
        </label>
        <button type="submit" className="btn-primary" disabled={isSubmitting}>
          {isSubmitting ? "처리 중..." : "로그인"}
        </button>
      </form>
      <button type="button" className="btn-outline" disabled={isSubmitting} onClick={() => void handleAuth("signUp")}>
        회원가입
      </button>
      {!hasSupabaseEnv() && <p className="hint">Supabase 환경변수가 필요합니다.</p>}
      {message && <p className="hint">{message}</p>}
    </div>
  );
}
