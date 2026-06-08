import { createServiceClient } from "@/lib/supabase-server";
import type { Watch } from "@/lib/watch/types";
import type { Region } from "@/lib/pricing/types";
import type webpush from "web-push";

export type PushWatchRow = {
  id: string;
  endpoint: string;
  subscription: webpush.PushSubscription;
  product_id: string;
  product_name: string;
  region: Region;
  target_price: number | null;
  added_at: string;
  last_notified_price: number | null;
  last_notified_at: string | null;
};

export async function upsertPushWatch(
  subscription: webpush.PushSubscription,
  watch: Watch
): Promise<void> {
  const db = createServiceClient();
  const { error } = await db.from("push_watches").upsert(
    {
      endpoint: subscription.endpoint,
      subscription: subscription as unknown as Record<string, unknown>,
      product_id: watch.productId,
      product_name: watch.name,
      region: watch.region,
      target_price: watch.targetPrice ?? null,
      added_at: watch.addedAt,
    },
    { onConflict: "endpoint,product_id,region" }
  );
  if (error) console.error("[upsertPushWatch]", error.message);
}

export async function deletePushWatch(
  endpoint: string,
  productId: string,
  region: Region
): Promise<void> {
  const db = createServiceClient();
  await db
    .from("push_watches")
    .delete()
    .eq("endpoint", endpoint)
    .eq("product_id", productId)
    .eq("region", region);
}

export async function listAllPushWatches(): Promise<PushWatchRow[]> {
  const db = createServiceClient();
  const { data } = await db.from("push_watches").select("*");
  return (data ?? []) as PushWatchRow[];
}

export async function updatePushLastNotified(id: string, price: number): Promise<void> {
  const db = createServiceClient();
  await db
    .from("push_watches")
    .update({ last_notified_price: price, last_notified_at: new Date().toISOString() })
    .eq("id", id);
}

export async function deletePushWatchById(id: string): Promise<void> {
  const db = createServiceClient();
  await db.from("push_watches").delete().eq("id", id);
}
