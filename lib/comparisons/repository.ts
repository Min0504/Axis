/**
 * Repository for the `comparisons` table.
 *
 * Data-access layer: route handlers stop writing inline Supabase queries and
 * call named operations instead. Benefits —
 *  - one place to see every query against the table (index/RLS review),
 *  - handlers become thin and testable (mock the repository, not the DB),
 *  - query changes (pagination, column selection) don't touch HTTP code.
 *
 * Every function takes the SESSION-scoped client (RLS applies) as its first
 * argument — explicit dependency injection instead of importing a global,
 * which is what makes unit testing possible.
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ComparisonResult } from "@/lib/types";
import { encodeCursor, type HistoryCursor } from "@/lib/server/pagination";

export type HistoryItem = {
  id: string;
  query: string;
  selected_option: string;
  created_at: string;
};

export type HistoryPage = {
  items: HistoryItem[];
  /** Opaque cursor for the next page; null when this is the last page. */
  nextCursor: string | null;
};

export async function insertComparison(
  supabase: SupabaseClient,
  input: {
    userId: string;
    query: string;
    category: string;
    selectedOption: string;
    result: ComparisonResult;
  }
): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("comparisons")
    .insert({
      user_id: input.userId,
      query: input.query,
      category: input.category,
      selected_option: input.selectedOption,
      analysis_result: input.result
    })
    .select("id")
    .single();

  if (error) return { id: null, error: error.message };
  return { id: data.id as string, error: null };
}

/**
 * Keyset-paginated history. Cursor decoding/validation happens at the HTTP
 * boundary (the route returns 400 for malformed cursors); this layer only
 * deals with already-validated values.
 */
export async function listHistoryPage(
  supabase: SupabaseClient,
  userId: string,
  opts: { limit: number; cursor: HistoryCursor | null }
): Promise<HistoryPage> {
  let query = supabase
    .from("comparisons")
    .select("id, query, selected_option, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    // Overfetch by one row: the extra row's existence tells us whether a
    // next page exists without a second COUNT query.
    .limit(opts.limit + 1);

  if (opts.cursor) {
    query = query.lt("created_at", opts.cursor.createdAt);
  }

  const { data, error } = await query;
  if (error || !data) return { items: [], nextCursor: null };

  const rows = data as HistoryItem[];
  const hasMore = rows.length > opts.limit;
  const items = hasMore ? rows.slice(0, opts.limit) : rows;
  const last = items[items.length - 1];

  return {
    items,
    nextCursor: hasMore && last ? encodeCursor({ createdAt: last.created_at, id: last.id }) : null
  };
}

export async function getComparisonForUser(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<{ query: string; result: ComparisonResult } | null> {
  const { data, error } = await supabase
    .from("comparisons")
    .select("id, query, analysis_result")
    .eq("id", id)
    .eq("user_id", userId) // RLS also enforces ownership; this is defense-in-depth.
    .maybeSingle();

  if (error || !data) return null;
  return { query: data.query as string, result: data.analysis_result as ComparisonResult };
}

export async function deleteComparisonForUser(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<boolean> {
  const { error } = await supabase
    .from("comparisons")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  return !error;
}

export async function getShareTokenForUser(
  supabase: SupabaseClient,
  id: string,
  userId: string
): Promise<{ found: boolean; token: string | null }> {
  const { data } = await supabase
    .from("comparisons")
    .select("share_token")
    .eq("id", id)
    .eq("user_id", userId)
    .maybeSingle();

  if (!data) return { found: false, token: null };
  return { found: true, token: (data.share_token as string | null) ?? null };
}

export async function setShareToken(
  supabase: SupabaseClient,
  id: string,
  userId: string,
  token: string
): Promise<boolean> {
  const { error } = await supabase
    .from("comparisons")
    .update({ share_token: token, is_public: true })
    .eq("id", id)
    .eq("user_id", userId);

  return !error;
}

export async function insertGuestShare(
  supabase: SupabaseClient,
  input: { query: string; result: ComparisonResult; token: string }
): Promise<{ error: string | null }> {
  const { error } = await supabase.from("comparisons").insert({
    user_id: null,
    query: input.query,
    category: input.result.category ?? "general",
    selected_option: input.result.selectedOption,
    analysis_result: input.result,
    share_token: input.token,
    is_public: true
  });

  return { error: error ? error.message : null };
}
