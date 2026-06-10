/**
 * 価格.com (kakaku.com) spec scraper — Japanese market.
 *
 * Flow:
 *   1. Search: 製品名 → kakaku 検索 → 最も関連性が高い商品 URL 取得
 *   2. Spec page: https://kakaku.com/item/KXXXXXXXXXXXXXXXX/spec/
 *   3. Parse: スペック表 HTML → key-value マップ
 *
 * 価格.com は日本市場でのスペック・価格情報の最も信頼性の高いソース。
 * JP エントリには JPY 価格と日本市場固有のスペックを格納する。
 */

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ja-JP,ja;q=0.9",
  Accept: "text/html,application/xhtml+xml",
  Referer: "https://kakaku.com/"
};

const FETCH_TIMEOUT_MS = 15_000;

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 価格.com 検索 → 最上位商品の spec ページ URL を返す
 * 例: "https://kakaku.com/item/K0001234567/spec/"
 */
export async function searchKakaku(query: string): Promise<string | null> {
  const url = `https://kakaku.com/search_results/?query=${encodeURIComponent(query)}&category=&narrow=0&sort=popular`;
  const html = await fetchHtml(url);
  if (!html) return null;

  // 商品 URL パターン: /item/K0001234567/ または /item/K0001234567/spec/
  const itemPattern = /href="(\/item\/K\d+\/)"/gi;
  const matches = [...html.matchAll(itemPattern)];
  if (!matches.length) return null;

  // 最初の商品 → スペックページに変換
  const itemPath = matches[0][1];
  return `https://kakaku.com${itemPath}spec/`;
}

/** 価格.com スペックページ HTML → key-value マップ */
export function parseKakakuSpecs(html: string): Record<string, string> {
  const specs: Record<string, string> = {};

  // 価格.com スペック表: <th>ラベル</th><td>値</td>
  const rowPattern = /<th[^>]*>\s*([\s\S]*?)\s*<\/th>\s*<td[^>]*>\s*([\s\S]*?)\s*<\/td>/gi;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(html)) !== null) {
    const rawLabel = match[1].replace(/<[^>]+>/g, "").trim();
    const rawValue = match[2]
      .replace(/<br\s*\/?>/gi, " ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!rawLabel || !rawValue || rawValue === "-" || rawValue === "―") continue;

    const label = rawLabel.replace(/\s+/g, " ").replace(/&amp;/g, "&");
    const value = rawValue.replace(/\s+/g, " ").replace(/&amp;/g, "&");

    specs[label] = value;
  }

  return specs;
}

/**
 * 価格.com ラベル → schema fieldKey マッピング
 * 日本語ラベル対応
 */
export const KAKAKU_LABEL_MAP: Record<string, string> = {
  // ── Smartphone ────────────────────────────────────────────────────────────
  "機種名": "model_name",
  "発売日": "release_date",
  "発売年月": "release_date",
  "本体価格": "launch_price_jpy",
  "画面サイズ": "display_inch",
  "ディスプレイサイズ": "display_inch",
  "プロセッサ": "chipset",
  "CPU": "chipset",
  "RAM": "ram_gb",
  "内蔵メモリ": "storage_gb",
  "ストレージ": "storage_gb",
  "カメラ画素数": "camera_mp",
  "メインカメラ": "camera_mp",
  "バッテリー容量": "battery",
  "充電": "charging",
  "本体重量": "weight_g",
  "重量": "weight_g",
  "OS": "os",
  "解像度": "resolution",
  "リフレッシュレート": "refresh_hz",
  "最大輝度": "brightness_nits",

  // ── Laptop ───────────────────────────────────────────────────────────────
  "CPU種類": "cpu",
  "グラフィックス": "gpu",
  "GPU": "gpu",
  "メモリ": "ram_gb",
  "SSD容量": "storage_gb",
  "ストレージ容量": "storage_gb",
  "画面解像度": "resolution",
  "バッテリー駆動時間": "battery_wh",
  "パネル": "panel",
  "輝度": "brightness_nits",

  // ── Earphones ─────────────────────────────────────────────────────────────
  "ドライバ": "driver",
  "ドライバー口径": "driver",
  "ノイズキャンセリング": "anc",
  "連続再生時間": "battery_hr",
  "合計再生時間": "battery_total_hr",
  "充電方式": "charging_type",
  "防水性能": "water_resist",
  "対応コーデック": "codec",
};

/** 価格.com ラベル → fieldKey 変換（部分一致含む） */
export function mapKakakuLabel(label: string): string | null {
  const trimmed = label.trim();
  if (KAKAKU_LABEL_MAP[trimmed]) return KAKAKU_LABEL_MAP[trimmed];

  for (const [key, fieldKey] of Object.entries(KAKAKU_LABEL_MAP)) {
    if (trimmed.includes(key) || key.includes(trimmed)) return fieldKey;
  }
  return null;
}

/** 価格.com から製品スペック全体を収集 */
export async function fetchKakakuSpecs(
  productName: string
): Promise<{ source: string; specs: Record<string, string> } | null> {
  // 1. 検索
  const specUrl = await searchKakaku(productName);
  if (!specUrl) {
    console.warn(`[kakaku] "${productName}" 検索結果なし`);
    return null;
  }

  // 2. スペックページ取得
  const html = await fetchHtml(specUrl);
  if (!html) {
    console.warn(`[kakaku] "${productName}" スペックページ取得失敗 (${specUrl})`);
    return null;
  }

  // 3. パース
  const rawSpecs = parseKakakuSpecs(html);
  if (Object.keys(rawSpecs).length === 0) {
    console.warn(`[kakaku] "${productName}" スペックパース失敗`);
    return null;
  }

  // 4. ラベル → fieldKey 変換
  const mappedSpecs: Record<string, string> = {};
  for (const [label, value] of Object.entries(rawSpecs)) {
    const fieldKey = mapKakakuLabel(label);
    if (fieldKey) mappedSpecs[fieldKey] = value;
  }

  console.log(
    `[kakaku] "${productName}" → ${specUrl}, 抽出フィールド: ${Object.keys(mappedSpecs).join(", ")}`
  );

  return { source: specUrl, specs: mappedSpecs };
}
