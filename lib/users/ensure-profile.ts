import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Ensure a public.users row exists for the authenticated user.
 *
 * A DB trigger (handle_new_user) normally creates this on signup; this is a
 * best-effort safety net for accounts created before the trigger existed.
 * Uses an idempotent upsert (ignoreDuplicates) so concurrent requests can't
 * race into a unique-violation, and never throws — a profile hiccup must not
 * fail the surrounding request.
 */
export async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  if (!user.email) {
    return;
  }

  const { error } = await supabase
    .from("users")
    .upsert({ id: user.id, email: user.email }, { onConflict: "id", ignoreDuplicates: true });

  if (error) {
    console.error("[ensureUserProfile]", error.message);
  }
}
