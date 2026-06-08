"use client";

import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n/types";

export default function LogoutButton({
  locale,
  className = "btn-outline",
}: {
  locale: Locale;
  className?: string;
}) {
  const t = getDictionary(locale).nav;
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    if (supabase) await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <button type="button" className={className} onClick={() => void handleSignOut()}>
      {t.logout}
    </button>
  );
}
