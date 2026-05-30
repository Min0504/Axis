"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createSupabaseBrowserClient, hasSupabaseEnv } from "@/lib/supabase";

export default function UserNav() {
  const [email, setEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(hasSupabaseEnv());
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    if (!supabase) {
      return;
    }

    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
      setLoading(false);
    });

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setEmail(session?.user?.email ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      return;
    }

    await supabase.auth.signOut();
    setEmail(null);
    router.refresh();
  }

  if (!hasSupabaseEnv()) {
    return (
      <Link className="menu" href="/login">
        로그인
      </Link>
    );
  }

  if (loading) {
    return <div className="menu menu-muted">...</div>;
  }

  if (!email) {
    return (
      <Link className="menu" href="/login">
        로그인
      </Link>
    );
  }

  return (
    <div className="user-nav">
      <span className="user-email">{email}</span>
      <button type="button" className="menu" onClick={() => void handleSignOut()}>
        로그아웃
      </button>
    </div>
  );
}
