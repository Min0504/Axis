import { Resend } from "resend";
import type { AlertReason } from "@/lib/watch/types";
import { formatPrice, type Currency } from "@/lib/pricing/types";

const REASON_KO: Record<AlertReason, string> = {
  target: "목표가에 도달했어요",
  all_time_low: "역대 최저가예요",
  drop: "가격이 크게 떨어졌어요",
};

const REASON_EN: Record<AlertReason, string> = {
  target: "Hit your target price",
  all_time_low: "All-time low price",
  drop: "Notable price drop",
};

export async function sendPriceAlert({
  to,
  productName,
  price,
  currency,
  reason,
  targetPrice,
  buyUrl,
}: {
  to: string;
  productName: string;
  price: number;
  currency: Currency;
  reason: AlertReason;
  targetPrice?: number;
  buyUrl: string;
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY not set");

  const resend = new Resend(apiKey);
  const priceStr = formatPrice(price, currency);
  const isKorean = currency === "KRW";
  const reasons = isKorean ? REASON_KO : REASON_EN;
  const reasonText = reasons[reason];
  const targetNote =
    targetPrice != null && reason === "target"
      ? `<p style="color:#555;margin:0 0 16px;">목표가: ${formatPrice(targetPrice, currency)}</p>`
      : "";

  const subject = isKorean
    ? `📉 ${productName} — ${priceStr} (${reasonText})`
    : `📉 ${productName} — ${priceStr} (${reasonText})`;

  const html = `
<!DOCTYPE html>
<html lang="${isKorean ? "ko" : "en"}">
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
    <tr><td align="center">
      <table width="480" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;padding:32px;max-width:480px;">
        <tr><td>
          <p style="margin:0 0 4px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:.05em;">Axis · 가격 알림</p>
          <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;">${productName}</h1>
          <p style="margin:0 0 4px;font-size:14px;color:#888;">${reasonText}</p>
          <p style="margin:24px 0;font-size:36px;font-weight:800;color:#111;">${priceStr}</p>
          ${targetNote}
          <a href="${buyUrl}"
             style="display:inline-block;padding:14px 28px;background:#111;color:#fff;text-decoration:none;border-radius:8px;font-size:15px;font-weight:600;">
            ${isKorean ? "지금 구매하기 →" : "Buy now →"}
          </a>
          <hr style="margin:32px 0;border:none;border-top:1px solid #eee;" />
          <p style="margin:0;font-size:12px;color:#aaa;">
            ${isKorean ? "Axis에서 가격 추적 중인 제품입니다." : "You're tracking this product on Axis."}
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Axis <alerts@axis.so>",
    to,
    subject,
    html,
  });
}
