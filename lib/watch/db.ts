import { createServiceClient } from "@/lib/supabase-server";
import type { Watch } from "./types";
import type { Region } from "@/lib/pricing/types";

export type WatchRow = {
  id: string;
  email: string;
  product_id: string;
  product_name: string;
  region: Region;
  target_price: number | null;
  added_at: string;
  last_notified_price: number | null;
  last_notified_at: string | null;
};

export async function upsertWatch(email: string, watch: Watch): Promise<void> {
  const db = createServiceClient();
  await db.from("watches").upsert(
    {
      email,
      product_id: watch.productId,
      product_name: watch.name,
      region: watch.region,
      target_price: watch.targetPrice ?? null,
      added_at: watch.addedAt,
    },
    { onConflict: "email,product_id,region" }
  );
}

export async function deleteWatch(email: string, productId: string, region: Region): Promise<void> {
  const db = createServiceClient();
  await db.from("watches").delete()
    .eq("email", email).eq("product_id", productId).eq("region", region);
}

export async function listWatchesByEmail(email: string): Promise<WatchRow[]> {
  const db = createServiceClient();
  const { data } = await db.from("watches").select("*").eq("email", email);
  return (data ?? []) as WatchRow[];
}

export async function listAllWatches(): Promise<WatchRow[]> {
  const db = createServiceClient();
  const { data } = await db.from("watches").select("*");
  return (data ?? []) as WatchRow[];
}

export async function updateLastNotified(id: string, price: number): Promise<void> {
  const db = createServiceClient();
  await db.from("watches").update({
    last_notified_price: price,
    last_notified_at: new Date().toISOString(),
  }).eq("id", id);
}
