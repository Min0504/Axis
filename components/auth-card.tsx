"use client";

import { useState } from "react";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

type Mode = "login" | "signup";
type Step = "idle" | "loading" | "reset_sent" | "signup_done";

export default function AuthCard({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).auth;
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");

  const supabase = createSupabaseBrowserClient();
  const isLoading = step === "loading";
  const disabled = isLoading || !hasSupabaseEnv();

  function switchMode(m: Mode) {
    setMode(m);
    setError("");
    setPassword("");
    setPasswordConfirm("");
  }

  async function handleGoogle() {
    if (!supabase) return;
    setStep("loading");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { access_type: "offline", prompt: "consent" },
      },
    });
    if (error) { setError(error.message); setStep("idle"); }
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setError("");
    setStep("loading");
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    if (error) {
      setError(
        error.message.includes("Invalid login credentials")
          ? t.invalidCredentials
          : error.message
      );
      setStep("idle");
    } else {
      window.location.href = "/";
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (password !== passwordConfirm) { setError(t.passwordMismatch); return; }
    if (password.length < 6) { setError(t.passwordTooShort); return; }
    setError("");
    setStep("loading");
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });
    setStep("idle");
    if (error) { setError(error.message); } else { setStep("signup_done"); }
  }

  async function handleReset() {
    if (!supabase || !email.trim()) { setError(t.emailRequired); return; }
    setStep("loading");
    await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    setStep("reset_sent");
  }

  if (step === "signup_done") {
    return (
      <div className="auth-done">
        <div className="auth-done-icon">✉️</div>
        <h2>{t.emailVerifyTitle}</h2>
        <p><strong>{email}</strong> — {t.emailVerifyBody(email)}</p>
        <button type="button" onClick={() => setStep("idle")}>{t.back}</button>
      </div>
    );
  }

  if (step === "reset_sent") {
    return (
      <div className="auth-done">
        <div className="auth-done-icon">🔑</div>
        <h2>{t.resetTitle}</h2>
        <p>{t.resetBody(email)}</p>
        <button type="button" onClick={() => setStep("idle")}>{t.back}</button>
      </div>
    );
  }

  return (
    <div className="auth-form-wrap">
      {/* ── Email / Password form ── */}
      <form
        onSubmit={(e) => void (mode === "login" ? handleLogin(e) : handleSignup(e))}
        className="auth-fields"
      >
        <div className="auth-field">
          <label htmlFor="auth-email">{t.email}</label>
          <input
            id="auth-email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
            autoComplete="email"
          />
        </div>

        <div className="auth-field">
          <div className="auth-field-row">
            <label htmlFor="auth-pw">{t.password}</label>
            {mode === "login" && (
              <button
                type="button"
                className="auth-forgot"
                onClick={() => void handleReset()}
                disabled={isLoading}
              >
                {t.forgotPassword}
              </button>
            )}
          </div>
          <input
            id="auth-pw"
            type="password"
            placeholder={mode === "signup" ? t.passwordMinHint : t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            minLength={6}
          />
        </div>

        {mode === "signup" && (
          <div className="auth-field">
            <label htmlFor="auth-pw2">{t.passwordConfirm}</label>
            <input
              id="auth-pw2"
              type="password"
              placeholder={t.passwordConfirmPlaceholder}
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
          </div>
        )}

        {error && <p className="auth-error">{error}</p>}

        <button
          type="submit"
          className="btn-auth-primary"
          disabled={disabled || !email.trim() || !password}
        >
          {isLoading ? t.processing : mode === "login" ? t.loginBtn : t.signupBtn}
        </button>
      </form>

      {/* ── Mode switch ── */}
      <p className="auth-switch">
        {mode === "login" ? (
          <>
            {t.noAccount}{" "}
            <button type="button" onClick={() => switchMode("signup")}>{t.signupLink}</button>
          </>
        ) : (
          <>
            {t.hasAccount}{" "}
            <button type="button" onClick={() => switchMode("login")}>{t.loginLink}</button>
          </>
        )}
      </p>

      {/* ── Divider ── */}
      <div className="auth-sep"><span>{t.orSeparator}</span></div>

      {/* ── Google ── */}
      <button
        type="button"
        className="btn-auth-google"
        onClick={() => void handleGoogle()}
        disabled={disabled}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {t.googleBtn}
      </button>
    </div>
  );
}
