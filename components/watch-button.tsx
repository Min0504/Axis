"use client";

import { useSyncExternalStore, useCallback, useMemo } from "react";
import { isWatched, subscribeWatches, addWatch, removeWatch } from "@/lib/watch/store";
import type { Region } from "@/lib/pricing/types";
import type { Watch } from "@/lib/watch/types";

function useIsWatched(productId: string): boolean {
  return useSyncExternalStore(subscribeWatches, () => isWatched(productId), () => false);
}

/** Local-only watch toggle (browser storage). No push / server sync. */
export default function WatchButton({
  productId,
  name,
  region,
  label,
  labelOn,
}: {
  productId: string;
  name: string;
  region: Region;
  label: string;
  labelOn: string;
  locale?: string;
}) {
  const watched = useIsWatched(productId);
  const watch: Watch = useMemo(
    () => ({ productId, name, region, addedAt: new Date().toISOString() }),
    [productId, name, region]
  );

  const handleClick = useCallback(() => {
    if (watched) removeWatch(productId);
    else addWatch(watch);
  }, [watched, productId, watch]);

  return (
    <button
      type="button"
      className={`watch-btn${watched ? " on" : ""}`}
      aria-pressed={watched}
      onClick={handleClick}
    >
      <span aria-hidden>{watched ? "★" : "☆"}</span>
      {watched ? labelOn : label}
    </button>
  );
}
