/**
 * GSMArena spec scraper — global/US market.
 *
 * Flow:
 *   1. Search: product name → GSMArena search → best match slug
 *   2. Spec page: https://www.gsmarena.com/{slug}.php
 *   3. Parse: spec table → key-value map
 *
 * GSMArena is the de-facto global database for smartphone and earphone hardware
 * specs. Values are hardware-level (not market-specific), so they serve as GLOBAL
 * entries in the dataset. US launch prices come from brand sites directly.
 */

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "en-US,en;q=0.9",
  Accept: "text/html,application/xhtml+xml",
  Referer: "https://www.gsmarena.com/"
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
 * GSMArena search → best match slug (e.g. "apple_iphone_16-12568")
 * Returns full spec page URL.
 */
export async function searchGsmarena(query: string): Promise<string | null> {
  const url = `https://www.gsmarena.com/search.php3?sQuickSearch=${encodeURIComponent(query)}`;
  const html = await fetchHtml(url);
  if (!html) return null;

  // GSMArena search result links: href="/apple_iphone_16-12568.php"
  const slugPattern = /href="\/([a-z0-9_]+-\d+)\.php"/gi;
  const matches = [...html.matchAll(slugPattern)];
  if (!matches.length) return null;

  // First result = highest relevance
  return `https://www.gsmarena.com/${matches[0][1]}.php`;
}

/** Parse GSMArena spec page HTML → raw key-value map */
export function parseGsmarenaSpecs(html: string): Record<string, string> {
  const specs: Record<string, string> = {};

  // GSMArena spec table structure:
  // <tr><td class="ttl"><a>Label</a></td><td class="nfo">Value</td></tr>
  // or: <tr><td colspan="2"><span>Section header</span></td></tr>
  const rowPattern = /<td[^>]*class="ttl"[^>]*>\s*<a[^>]*>([\s\S]*?)<\/a>\s*<\/td>\s*<td[^>]*class="nfo"[^>]*>([\s\S]*?)<\/td>/gi;
  let match: RegExpExecArray | null;

  while ((match = rowPattern.exec(html)) !== null) {
    const rawLabel = match[1].replace(/<[^>]+>/g, "").trim();
    const rawValue = match[2]
      .replace(/<br\s*\/?>/gi, " | ")
      .replace(/<[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!rawLabel || !rawValue || rawValue === "-") continue;

    const label = rawLabel.replace(/\s+/g, " ");
    const value = rawValue.replace(/\s+/g, " ").replace(/&amp;/g, "&");

    specs[label] = value;
  }

  return specs;
}

/**
 * GSMArena label → schema fieldKey mapping.
 * GSMArena uses English labels; values are hardware-level global specs.
 */
export const GSMARENA_LABEL_MAP: Record<string, string> = {
  // ── Smartphone ────────────────────────────────────────────────────────────
  "Model": "model_name",
  "Announced": "release_date",
  "Status": "release_date",
  "Size": "display_inch",
  "Type": "panel",
  "Resolution": "resolution",
  "OS": "os",
  "Chipset": "chipset",
  "CPU": "chipset",
  "RAM": "ram_gb",
  "Internal": "storage_gb",
  "Main Camera": "camera_mp",
  "Triple": "camera_mp",
  "Dual": "camera_mp",
  "Single": "camera_mp",
  "Capacity": "battery",
  "Charging": "charging",
  "Weight": "weight_g",
  "Refresh rate": "refresh_hz",
  "Brightness": "brightness_nits",
  "Price": "launch_price_usd",

  // ── Earphones ─────────────────────────────────────────────────────────────
  "Driver": "driver",
  "Active noise cancellation": "anc",
  "ANC": "anc",
  "Playback": "battery_hr",
  "Battery life": "battery_hr",
  "Codec": "codec",
  "Water resistance": "water_resist",
  "Charging time": "charging_type",
};

/** GSMArena label → schema fieldKey (with partial matching) */
export function mapGsmarenaLabel(label: string): string | null {
  const trimmed = label.trim();
  if (GSMARENA_LABEL_MAP[trimmed]) return GSMARENA_LABEL_MAP[trimmed];

  for (const [key, fieldKey] of Object.entries(GSMARENA_LABEL_MAP)) {
    if (trimmed.toLowerCase().includes(key.toLowerCase()) ||
        key.toLowerCase().includes(trimmed.toLowerCase())) {
      return fieldKey;
    }
  }
  return null;
}

/** Post-process raw GSMArena values for specific fields */
function cleanGsmarenaValue(fieldKey: string, raw: string): string {
  switch (fieldKey) {
    case "display_inch": {
      // "6.1 inches, 89.0 cm2" → "6.1"
      const m = raw.match(/^([\d.]+)\s*inches?/i);
      return m ? m[1] : raw;
    }
    case "weight_g": {
      // "174 g (6.14 oz)" → "174"
      const m = raw.match(/([\d.]+)\s*g/i);
      return m ? m[1] : raw;
    }
    case "battery": {
      // "3279 mAh" → "3279mAh"
      return raw.replace(/\s*(mAh)\s*/i, "mAh");
    }
    case "ram_gb": {
      // "6 GB RAM, 128 GB" → "6"
      const m = raw.match(/^([\d]+)\s*GB\s*RAM/i);
      return m ? m[1] : raw.split(",")[0].replace(/GB/i, "").trim();
    }
    case "storage_gb": {
      // "128GB" or "128 GB" → "128"
      const m = raw.match(/([\d]+)\s*GB/i);
      return m ? m[1] : raw;
    }
    case "camera_mp": {
      // "48 MP, f/1.6, 26mm..." → "48"
      const m = raw.match(/^([\d]+)\s*MP/i);
      return m ? m[1] : raw;
    }
    case "refresh_hz": {
      // "60Hz" or "1-120Hz" → "120"
      const m = raw.match(/([\d]+)\s*Hz/i);
      return m ? m[1] : raw;
    }
    case "brightness_nits": {
      // "2000 nits" → "2000"
      const m = raw.match(/([\d]+)\s*nits?/i);
      return m ? m[1] : raw;
    }
    default:
      return raw;
  }
}

/** Full GSMArena fetch pipeline — returns {source, specs} or null */
export async function fetchGsmarenaSpecs(
  productName: string
): Promise<{ source: string; specs: Record<string, string> } | null> {
  // 1. Search
  const specUrl = await searchGsmarena(productName);
  if (!specUrl) {
    console.warn(`[gsmarena] "${productName}" 검색 결과 없음`);
    return null;
  }

  // 2. Fetch spec page
  const html = await fetchHtml(specUrl);
  if (!html) {
    console.warn(`[gsmarena] "${productName}" 스펙 페이지 로드 실패 (${specUrl})`);
    return null;
  }

  // 3. Parse raw specs
  const rawSpecs = parseGsmarenaSpecs(html);
  if (Object.keys(rawSpecs).length === 0) {
    console.warn(`[gsmarena] "${productName}" 스펙 파싱 실패`);
    return null;
  }

  // 4. Map + clean
  const mappedSpecs: Record<string, string> = {};
  for (const [label, value] of Object.entries(rawSpecs)) {
    const fieldKey = mapGsmarenaLabel(label);
    if (fieldKey && !mappedSpecs[fieldKey]) {
      // Keep first match per fieldKey (most specific)
      mappedSpecs[fieldKey] = cleanGsmarenaValue(fieldKey, value);
    }
  }

  console.log(
    `[gsmarena] "${productName}" → ${specUrl}, 추출 필드: ${Object.keys(mappedSpecs).join(", ")}`
  );

  return { source: specUrl, specs: mappedSpecs };
}
