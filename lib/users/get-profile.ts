import { createSupabaseServerClient } from "@/lib/supabase-server";

export type Profile = {
  email: string;
  nickname: string | null;
  createdAt: string;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) return null;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("users")
    .select("email, nickname, created_at")
    .eq("id", user.id)
    .maybeSingle();

  return {
    email: data?.email ?? user.email ?? "",
    nickname: data?.nickname ?? null,
    createdAt: data?.created_at ?? user.created_at ?? new Date().toISOString(),
  };
}
