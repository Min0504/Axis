import AuthCard from "@/components/auth-card";
import BrandLogo from "@/components/brand-logo";
import Link from "next/link";
import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export const metadata: Metadata = { title: "Login — Axis" };

export default async function LoginPage() {
  const locale = await getLocale();
  const t = getDictionary(locale).auth;

  return (
    <main className="auth-page">
      <div className="auth-wrap">
        <div className="auth-brand">
          <Link href="/" className="auth-logo">
            <BrandLogo size={36} className="auth-logo-mark" />
            axis
          </Link>
          <p className="auth-tagline">{t.tagline}</p>
        </div>

        <AuthCard locale={locale} />

        <Link className="auth-guest" href="/">
          {t.guestContinue}
        </Link>
      </div>
    </main>
  );
}
