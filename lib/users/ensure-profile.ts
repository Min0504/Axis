import type { User } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

export async function ensureUserProfile(supabase: SupabaseClient, user: User) {
  if (!user.email) {
    return;
  }

  const { data: existing } = await supabase.from("users").select("id").eq("id", user.id).maybeSingle();

  if (existing) {
    return;
  }

  await supabase.from("users").insert({
    id: user.id,
    email: user.email
  });
}
