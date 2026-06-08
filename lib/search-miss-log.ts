/**
 * Search miss logger — records products users tried to compare but couldn't
 * be resolved to an official source. Weekly analysis of this table drives
 * coverage improvements (new registry entries, alias additions, etc.).
 */
import { createServiceClientSafe } from "@/lib/supabase-server";
import type { Category } from "@/lib/types";
import type { Country, Locale } from "@/lib/i18n";

export async function logSearchMiss(params: {
  productName: string;
  category: Category;
  country: Country;
  locale: Locale;
}): Promise<void> {
  const db = createServiceClientSafe();
  if (!db) return; // No Supabase configured (local dev without DB)

  try {
    await db.from("search_misses").insert({
      product_name: params.productName,
      category: params.category,
      country: params.country,
      locale: params.locale
    });
  } catch {
    // Non-blocking — miss logging never breaks the main flow
  }
}
