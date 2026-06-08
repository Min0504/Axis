import webpush from "web-push";
import type { AlertReason } from "@/lib/watch/types";
import { formatPrice, type Currency } from "@/lib/pricing/types";

const REASON_TEXT: Record<AlertReason, Record<"ko" | "en", string>> = {
  target:       { ko: "목표가 도달", en: "Target price hit" },
  all_time_low: { ko: "역대 최저가", en: "All-time low" },
  drop:         { ko: "가격 급락",   en: "Notable price drop" },
};

function getVapidConfig() {
  const subject = process.env.VAPID_SUBJECT ?? "mailto:hello@axis.so";
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) throw new Error("VAPID keys not configured");
  return { subject, publicKey, privateKey };
}

export type PushResult = "sent" | "gone" | "error";

export async function sendPricePush({
  subscription,
  productName,
  price,
  currency,
  reason,
  buyUrl,
}: {
  subscription: webpush.PushSubscription;
  productName: string;
  price: number;
  currency: Currency;
  reason: AlertReason;
  buyUrl: string;
}): Promise<PushResult> {
  const { subject, publicKey, privateKey } = getVapidConfig();
  webpush.setVapidDetails(subject, publicKey, privateKey);

  const isKorean = currency === "KRW";
  const lang = isKorean ? "ko" : "en";
  const priceStr = formatPrice(price, currency);
  const reasonText = REASON_TEXT[reason][lang];

  const payload = JSON.stringify({
    title: `📉 ${productName}`,
    body: `${priceStr} — ${reasonText}`,
    data: { buyUrl, url: "/" },
  });

  try {
    await webpush.sendNotification(subscription, payload);
    return "sent";
  } catch (err: unknown) {
    const status = (err as { statusCode?: number }).statusCode;
    // 404 / 410 = subscription expired or unsubscribed → caller should delete it
    if (status === 404 || status === 410) return "gone";
    console.error("[sendPricePush]", err);
    return "error";
  }
}
