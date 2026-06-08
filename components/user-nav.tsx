"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

export default function UserNav({ locale }: { locale: Locale }) {
  const t = getDictionary(locale).nav;
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(hasSupabaseEnv());
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) return;

    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!open) return;
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    setEmail(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  if (!hasSupabaseEnv()) {
    return <Link className="menu" href="/login">{t.login}</Link>;
  }

  if (loading) {
    return <div className="menu menu-muted">···</div>;
  }

  if (!email) {
    return <Link className="menu" href="/login">{t.login}</Link>;
  }

  const initial = email.charAt(0).toUpperCase();

  return (
    <div className="user-nav" ref={menuRef}>
      <button
        type="button"
        className="user-trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span className="user-avatar">{initial}</span>
        <span className="user-email">{email}</span>
        <span className="user-caret" aria-hidden>▾</span>
      </button>

      {open && (
        <div className="user-dropdown" role="menu">
          <div className="user-dropdown-head">
            <span className="user-avatar lg">{initial}</span>
            <div className="user-dropdown-id">
              <strong>{email}</strong>
              <span>{t.loggedIn}</span>
            </div>
          </div>
          <div className="user-dropdown-list">
            <Link href="/account" role="menuitem" onClick={() => setOpen(false)}>
              {t.myInfo}
            </Link>
            <Link href="/#history" role="menuitem" onClick={() => setOpen(false)}>
              {t.recentHistory}
            </Link>
          </div>
          <button type="button" className="user-dropdown-signout" onClick={() => void handleSignOut()}>
            {t.logout}
          </button>
        </div>
      )}
    </div>
  );
}
