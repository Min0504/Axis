import type { Locale } from "@/lib/i18n";

const EN_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December"
] as const;

/**
 * Localize Korean-canonical dataset/scrape/AI text values for EN/JA UI.
 * Safe to call at display time — already-localized English/Japanese is left alone
 * when patterns do not match.
 */
export function localizeSpecValue(fieldKey: string, value: string, locale: Locale): string {
  if (locale === "ko" || !value || value === "—") return value;

  let next: string;
  switch (fieldKey) {
    case "release_date":
      next = localizeReleaseDate(value, locale);
      break;
    case "battery":
    case "battery_wh":
    case "battery_hr":
    case "battery_total_hr":
      next = localizeBattery(value, locale);
      break;
    case "charging":
    case "charging_type":
      next = localizeCharging(value, locale);
      break;
    case "launch_price_krw":
    case "price_krw":
      next = localizeKrwPrice(value, locale);
      break;
    case "ports":
      next = localizePorts(value, locale);
      break;
    case "stylus":
      next = localizeStylus(value, locale);
      break;
    case "cellular":
      next = localizeCellular(value, locale);
      break;
    case "water_resist":
    case "anc":
    case "form":
      next = localizeCommonPhrases(value, locale);
      break;
    default:
      next = value;
  }

  return localizeCommonPhrases(next, locale);
}

export function localizeSpecsRecord(
  specs: Record<string, string>,
  locale: Locale
): Record<string, string> {
  if (locale === "ko") return specs;
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(specs)) {
    out[key] = localizeSpecValue(key, value, locale);
  }
  return out;
}

function localizeReleaseDate(value: string, locale: Locale): string {
  const ym = value.match(/(\d{4})\s*년\s*(\d{1,2})\s*월/);
  if (ym) {
    const year = ym[1];
    const month = Number(ym[2]);
    if (month >= 1 && month <= 12) {
      if (locale === "en") return `${EN_MONTHS[month - 1]} ${year}`;
      if (locale === "ja") return `${year}年${month}月`;
    }
  }

  const yOnly = value.match(/(\d{4})\s*년(?!\s*\d)/);
  if (yOnly) {
    if (locale === "en") return yOnly[1];
    if (locale === "ja") return `${yOnly[1]}年`;
  }

  return value;
}

function localizeBattery(value: string, locale: Locale): string {
  let next = value;

  next = next.replace(
    /동영상\s*재생\s*최대\s*(\d+)\s*시간/g,
    (_m, hours: string) =>
      locale === "en"
        ? `Up to ${hours} hours video playback`
        : `動画再生最大${hours}時間`
  );

  next = next.replace(
    /동영상\s*스트리밍\s*최대\s*(\d+)\s*시간/g,
    (_m, hours: string) =>
      locale === "en"
        ? `Up to ${hours} hours video streaming`
        : `動画ストリーミング最大${hours}時間`
  );

  next = next.replace(
    /최대\s*(\d+)\s*시간/g,
    (_m, hours: string) =>
      locale === "en" ? `Up to ${hours} hours` : `最大${hours}時間`
  );

  next = next.replace(/(\d+)\s*시간/g, (_m, hours: string) =>
    locale === "en" ? `${hours} hours` : `${hours}時間`
  );

  return next;
}

function localizeCharging(value: string, locale: Locale): string {
  let next = value;
  if (locale === "en") {
    next = next
      .replace(/(\d+)\s*분\s*충전/g, "$1 min charge")
      .replace(/(\d+)\s*시간\s*재생/g, "$1 h playback")
      .replace(/유선/g, " wired")
      .replace(/무선/g, " wireless")
      .replace(/\s+/g, " ")
      .trim();
  } else if (locale === "ja") {
    next = next
      .replace(/(\d+)\s*분\s*충전/g, "$1分充電")
      .replace(/(\d+)\s*시간\s*재생/g, "$1時間再生")
      .replace(/유선/g, "有線")
      .replace(/무선/g, "無線");
  }
  return next;
}

function localizeKrwPrice(value: string, locale: Locale): string {
  // e.g. "149만 9천원부터", "125만원부터", "189만 8천원부터"
  const fromManChun = value.match(/([\d.]+)\s*만\s*(?:(\d+)\s*천)?\s*원?\s*부터/);
  if (fromManChun) {
    const man = Number(fromManChun[1]);
    const chun = fromManChun[2] ? Number(fromManChun[2]) : 0;
    if (Number.isFinite(man) && Number.isFinite(chun)) {
      const won = Math.round(man * 10_000 + chun * 1_000);
      if (locale === "en") return `from ₩${won.toLocaleString("en-US")}`;
      if (locale === "ja") return `₩${won.toLocaleString("ja-JP")}から`;
    }
  }

  // e.g. "769,000원" / "379,000원"
  const plainWon = value.match(/^([\d,]+)\s*원$/);
  if (plainWon) {
    const won = Number(plainWon[1].replace(/,/g, ""));
    if (Number.isFinite(won)) {
      if (locale === "en") return `₩${won.toLocaleString("en-US")}`;
      if (locale === "ja") return `₩${won.toLocaleString("ja-JP")}`;
    }
  }

  if (locale === "en") {
    return value.replace(/원/g, " KRW").replace(/부터/g, " from").trim();
  }
  if (locale === "ja") {
    return value.replace(/원/g, "ウォン").replace(/부터/g, "から");
  }
  return value;
}

function localizePorts(value: string, locale: Locale): string {
  return localizeCommonPhrases(value, locale);
}

function localizeStylus(value: string, locale: Locale): string {
  return localizeCommonPhrases(value, locale);
}

function localizeCellular(value: string, locale: Locale): string {
  return localizeCommonPhrases(value, locale);
}

function ordinalGen(n: number, locale: Locale): string {
  if (locale === "ja") return `${n}世代`;
  if (n === 1) return "1st gen";
  if (n === 2) return "2nd gen";
  if (n === 3) return "3rd gen";
  return `${n}th gen`;
}

/** Shared Korean fragment replacements used across free-text spec fields. */
function localizeCommonPhrases(value: string, locale: Locale): string {
  if (locale === "ko" || !/[가-힣]/.test(value)) return value;

  let next = value;

  next = next.replace(/(\d+)\s*세대/g, (_m, n: string) => ordinalGen(Number(n), locale));

  if (locale === "en") {
    next = next
      .replace(/없음/g, "None")
      .replace(/지원/g, "supported")
      .replace(/호버/g, "hover")
      .replace(/헤드폰/g, "headphone")
      .replace(/SD카드/g, "SD card")
      .replace(/셀룰러/g, "cellular")
      .replace(/옵션/g, "option")
      .replace(/오버이어/g, "over-ear")
      .replace(/오픈형/g, "open-ear")
      .replace(/노이즈캔슬링/g, "noise cancelling")
      .replace(/\s+/g, " ")
      .trim();
  } else if (locale === "ja") {
    next = next
      .replace(/없음/g, "なし")
      .replace(/지원/g, "対応")
      .replace(/호버/g, "ホバー")
      .replace(/헤드폰/g, "ヘッドホン")
      .replace(/SD카드/g, "SDカード")
      .replace(/셀룰러/g, "セルラー")
      .replace(/옵션/g, "オプション")
      .replace(/오버이어/g, "オーバーイヤー")
      .replace(/오픈형/g, "オープン型")
      .replace(/노이즈캔슬링/g, "ノイズキャンセリング");
  }

  return next;
}
