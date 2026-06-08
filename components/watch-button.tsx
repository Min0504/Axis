"use client";

import { useSyncExternalStore, useState, useCallback, useMemo } from "react";
import { isWatched, subscribeWatches, addWatch, removeWatch } from "@/lib/watch/store";
import { getDictionary, type Locale } from "@/lib/i18n";
import type { Region } from "@/lib/pricing/types";
import type { Watch } from "@/lib/watch/types";

const ENDPOINT_KEY = "axis:push:endpoint";

function getStoredEndpoint(): string {
  if (typeof window === "undefined") return "";
  return window.localStorage.getItem(ENDPOINT_KEY) ?? "";
}

async function subscribePush(): Promise<PushSubscription | null> {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return null;
  const pubKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  if (!pubKey) return null;
  try {
    const reg = await navigator.serviceWorker.ready;
    const existing = await reg.pushManager.getSubscription();
    if (existing) return existing;
    return await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(pubKey),
    });
  } catch {
    return null;
  }
}

function supportsPush(): boolean {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const arr = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) arr[i] = raw.charCodeAt(i);
  return arr.buffer as ArrayBuffer;
}

async function apiSubscribe(sub: PushSubscription, watch: Watch): Promise<void> {
  localStorage.setItem(ENDPOINT_KEY, sub.endpoint);
  await fetch("/api/push/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ subscription: sub.toJSON(), ...watch }),
  }).catch(() => null);
}

async function apiUnsubscribe(endpoint: string, productId: string, region: Region): Promise<void> {
  await fetch("/api/push/subscribe", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ endpoint, productId, region }),
  }).catch(() => null);
}

function useIsWatched(productId: string): boolean {
  return useSyncExternalStore(subscribeWatches, () => isWatched(productId), () => false);
}

type PromptState = "idle" | "asking" | "denied";

export default function WatchButton({
  productId,
  name,
  region,
  label,
  labelOn,
  locale = "ko",
}: {
  productId: string;
  name: string;
  region: Region;
  label: string;
  labelOn: string;
  locale?: Locale;
}) {
  const tw = getDictionary(locale).watch;
  const watched = useIsWatched(productId);
  const [prompt, setPrompt] = useState<PromptState>("idle");
  const [pushSupported] = useState(supportsPush);
  const watch: Watch = useMemo(
    () => ({ productId, name, region, addedAt: new Date().toISOString() }),
    [productId, name, region]
  );

  const handleClick = useCallback(async () => {
    if (watched) {
      removeWatch(productId);
      const endpoint = getStoredEndpoint();
      if (endpoint) void apiUnsubscribe(endpoint, productId, region);
      return;
    }

    // Always add to localStorage immediately so UI responds fast.
    addWatch(watch);

    if (!pushSupported) return;

    const permission = Notification.permission;

    if (permission === "granted") {
      const sub = await subscribePush();
      if (sub) void apiSubscribe(sub, watch);
    } else if (permission === "default") {
      setPrompt("asking");
    } else {
      setPrompt("denied");
    }
  }, [watched, productId, region, watch, pushSupported]);

  const handleAllow = useCallback(async () => {
    setPrompt("idle");
    const result = await Notification.requestPermission();
    if (result === "granted") {
      const sub = await subscribePush();
      if (sub) void apiSubscribe(sub, watch);
    } else {
      setPrompt("denied");
    }
  }, [watch]);

  return (
    <span className="watch-btn-wrap">
      <button
        type="button"
        className={`watch-btn${watched ? " on" : ""}`}
        aria-pressed={watched}
        onClick={() => void handleClick()}
      >
        <span aria-hidden>{watched ? "★" : "☆"}</span>
        {watched ? labelOn : label}
      </button>

      {prompt === "asking" && (
        <div className="watch-push-prompt" role="dialog" aria-modal="true">
          <button
            type="button"
            className="watch-email-close"
            aria-label="닫기"
            onClick={() => setPrompt("idle")}
          >
            ×
          </button>
          <p className="watch-email-label">{tw.pushPrompt}</p>
          <p className="watch-push-sub">{tw.pushSub}</p>
          <button
            type="button"
            className="watch-email-confirm"
            onClick={() => void handleAllow()}
          >
            {tw.pushAllow}
          </button>
          <button
            type="button"
            className="watch-email-skip"
            onClick={() => setPrompt("idle")}
          >
            {tw.pushSkip}
          </button>
        </div>
      )}

      {prompt === "denied" && (
        <div className="watch-push-prompt watch-push-denied">
          <p className="watch-push-denied-msg">{tw.pushDenied}</p>
          <button type="button" className="watch-email-close" onClick={() => setPrompt("idle")}>×</button>
        </div>
      )}
    </span>
  );
}
