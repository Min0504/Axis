import { createSupabaseServerClient } from "@/lib/supabase-server";
import { normalizePlan, type Plan } from "@/lib/plan";

export type Profile = {
  email: string;
  nickname: string | null;
  plan: Plan;
  /** Today's decision count (resets daily). */
  dailyUsage: number;
  createdAt: string;
};

export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createSupabaseServerClient();
  if (!supabase) {
    return null;
  }

  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data } = await supabase
    .from("users")
    .select("email, nickname, plan, daily_usage, usage_date, created_at")
    .eq("id", user.id)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 10);

  if (!data) {
    return {
      email: user.email ?? "",
      nickname: null,
      plan: "free",
      dailyUsage: 0,
      createdAt: user.created_at ?? new Date().toISOString()
    };
  }

  return {
    email: data.email ?? user.email ?? "",
    nickname: data.nickname ?? null,
    plan: normalizePlan(data.plan),
    dailyUsage: data.usage_date === today ? (data.daily_usage ?? 0) : 0,
    createdAt: data.created_at
  };
}
