import type { Watch } from "./types";

/**
 * Client-side watch store (localStorage). No account or Supabase needed to
 * start tracking. Pure array ops (`addTo`/`removeFrom`) are unit-tested; the
 * localStorage wrapper + pub/sub drive the UI via useSyncExternalStore.
 */

export const WATCH_KEY = "optio:watches";

// ── Pure core (testable without a browser) ────────────────────────────────

export function addTo(list: Watch[], watch: Watch): Watch[] {
  if (list.some((w) => w.productId === watch.productId)) return list;
  return [...list, watch];
}

export function removeFrom(list: Watch[], productId: string): Watch[] {
  return list.filter((w) => w.productId !== productId);
}

export function hasIn(list: Watch[], productId: string): boolean {
  return list.some((w) => w.productId === productId);
}

// ── localStorage-backed store + subscription ──────────────────────────────

const listeners = new Set<() => void>();
let cache: Watch[] = [];
let cacheKey = ""; // raw string the cache was parsed from (snapshot stability)

function read(): Watch[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(WATCH_KEY) ?? "[]";
  if (raw === cacheKey) return cache; // stable reference for useSyncExternalStore
  try {
    const parsed = JSON.parse(raw) as Watch[];
    cache = Array.isArray(parsed) ? parsed : [];
  } catch {
    cache = [];
  }
  cacheKey = raw;
  return cache;
}

function write(list: Watch[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(WATCH_KEY, JSON.stringify(list));
  listeners.forEach((fn) => fn());
}

export function listWatches(): Watch[] {
  return read();
}

export function isWatched(productId: string): boolean {
  return hasIn(read(), productId);
}

export function addWatch(watch: Watch): void {
  write(addTo(read(), watch));
}

export function removeWatch(productId: string): void {
  write(removeFrom(read(), productId));
}

export function toggleWatch(watch: Watch): void {
  const list = read();
  write(hasIn(list, watch.productId) ? removeFrom(list, watch.productId) : addTo(list, watch));
}

/** Subscribe to watch changes (same-tab writes + other-tab storage events). */
export function subscribeWatches(onChange: () => void): () => void {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === WATCH_KEY) onChange();
  };
  if (typeof window !== "undefined") window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    if (typeof window !== "undefined") window.removeEventListener("storage", onStorage);
  };
}
