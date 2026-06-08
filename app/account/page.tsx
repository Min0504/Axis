import Link from "next/link";
import { redirect } from "next/navigation";
import LogoutButton from "@/components/logout-button";
import { getCurrentProfile } from "@/lib/users/get-profile";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n";

export async function generateMetadata() {
  const locale = await getLocale();
  const t = getDictionary(locale);
  return { title: `${t.nav.myInfo} — Axis` };
}

export default async function AccountPage() {
  const [profile, locale] = await Promise.all([
    getCurrentProfile(),
    getLocale(),
  ]);

  if (!profile) redirect("/login");

  const t = getDictionary(locale);
  const joined = new Date(profile.createdAt).toLocaleDateString(
    locale === "ko" ? "ko-KR" : locale === "ja" ? "ja-JP" : "en-US"
  );
  const avatarChar = (profile.email || "A").charAt(0).toUpperCase();

  return (
    <main className="container narrow">
      <p className="back-link">
        <Link href="/">← {t.error.backHome}</Link>
      </p>

      <section className="account-hero">
        <span className="account-avatar">{avatarChar}</span>
        <p className="account-email">{profile.email}</p>
      </section>

      <section className="detail-card account-card">
        <div className="account-row">
          <span className="account-key">{t.auth.email}</span>
          <span className="account-val">{profile.email}</span>
        </div>
        <div className="account-row">
          <span className="account-key">{joined}</span>
        </div>
      </section>

      <div className="account-actions-row">
        <LogoutButton locale={locale} />
      </div>
    </main>
  );
}
