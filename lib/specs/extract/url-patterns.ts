import type { Country } from "@/lib/i18n";

/**
 * Brand-specific URL pattern generators.
 *
 * Instead of hardcoding per-model URLs, these functions derive the official
 * spec page URL from a normalized English product name + country. The generated
 * URL is verified (HTTP GET) before use — if the page doesn't exist, the caller
 * falls back to web search.
 *
 * Priority: Apple (very predictable /specs/ pattern) → Samsung → LG → Sony
 */

function appleCountryBase(country: Country): string {
  if (country === "KR") return "https://www.apple.com/kr";
  if (country === "JP") return "https://www.apple.com/jp";
  return "https://www.apple.com";
}

function samsungCountryBase(country: Country): string {
  if (country === "KR") return "https://www.samsung.com/sec";
  if (country === "JP") return "https://www.samsung.com/jp";
  return "https://www.samsung.com/us";
}

function slugify(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/\+/g, "plus")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

// ── Brand detectors ────────────────────────────────────────────────────────

function isAppleProduct(name: string): boolean {
  return /iphone|macbook|ipad|airpods?|imac|mac\s*mini|mac\s*studio|mac\s*pro|apple\s*watch/i.test(name);
}

function isSamsungProduct(name: string): boolean {
  return /galaxy|samsung/i.test(name);
}

function isLgProduct(name: string): boolean {
  return /\blg\b|그램|gram/i.test(name);
}

function isSonyProduct(name: string): boolean {
  return /\bsony\b|wf-\d|wh-\d|xm\d/i.test(name);
}

// ── URL builders ───────────────────────────────────────────────────────────

/**
 * Derive the Apple URL slug.
 * Rules:
 *  - iPad: chip suffix (M1/M2/M4 etc.) is NOT in Apple's URL — strip it.
 *    e.g. "ipad pro m4" → "ipad-pro",  "ipad air m2" → "ipad-air"
 *  - AirPods Pro: generation number is NOT in Apple's URL.
 *    e.g. "airpods pro 2" → "airpods-pro",  "airpods 4" → "airpods-4" (fine)
 *  - Everything else: use the slug as-is.
 */
function appleSlug(normalizedName: string): string {
  const name = normalizedName.replace(/^apple\s+/i, "");

  // iPad: strip trailing chip suffix like M1, M2, M4, etc.
  if (/^ipad/i.test(name)) {
    const stripped = name.replace(/\s+m\d+$/i, "").trim();
    return slugify(stripped);
  }

  // AirPods Pro: strip trailing generation number (stays at /airpods-pro/)
  if (/^airpods?\s+pro\s+\d+$/i.test(name)) {
    return slugify(name.replace(/\s+\d+$/, "").trim());
  }

  return slugify(name);
}

function buildAppleCandidates(normalizedName: string, country: Country): string[] {
  const slug = appleSlug(normalizedName);
  const base = appleCountryBase(country);

  // AirPods/accessories: root page first (no separate /specs/ path for some)
  const isAccessory = /airpods?/i.test(normalizedName);
  return isAccessory
    ? [`${base}/${slug}/`, `${base}/${slug}/specs/`]
    : [`${base}/${slug}/specs/`, `${base}/${slug}/`];
}

function buildSamsungCandidates(normalizedName: string, country: Country): string[] {
  const name = normalizedName.replace(/^samsung\s+/i, "");
  const slug = slugify(name);
  const base = samsungCountryBase(country);

  const isPhone = /galaxy[\s-]?(?:s|z|a|note|fold|flip)/i.test(name);
  const isEarphone = /buds/i.test(name);
  const isLaptop = /book/i.test(name);
  const isWatch = /watch/i.test(name);

  // Samsung spec pages typically end with /specs/ or /buy/ — try /specs/ first
  if (isPhone) {
    return [
      `${base}/smartphones/${slug}/specs/`,
      `${base}/smartphones/${slug}/`
    ];
  }
  if (isEarphone) {
    return [
      `${base}/audio-sound/${slug}/specs/`,
      `${base}/audio-sound/${slug}/`,
      `${base}/buds/galaxy-buds/${slug}/`
    ];
  }
  if (isLaptop) {
    return [
      `${base}/pc/galaxy-book/${slug}/specs/`,
      `${base}/pc/galaxy-book/${slug}/`
    ];
  }
  if (isWatch) {
    return [
      `${base}/watches/${slug}/specs/`,
      `${base}/watches/${slug}/`
    ];
  }
  return [`${base}/all-products/${slug}/specs/`, `${base}/all-products/${slug}/`];
}

function buildLgCandidates(normalizedName: string, country: Country): string[] {
  const slug = slugify(normalizedName.replace(/^lg\s+/i, ""));

  // LG Gram laptops — consistent URL structure
  if (/gram/i.test(normalizedName)) {
    if (country === "KR") {
      return [`https://www.lge.co.kr/laptops/${slug}`];
    }
    return [`https://www.lg.com/us/laptops/${slug}`];
  }
  return [];
}

function buildSonyCandidates(normalizedName: string, country: Country): string[] {
  // Sony model numbers are in the name (WF-1000XM5, WH-1000XM5, etc.)
  const modelMatch = normalizedName.match(/(?:wf|wh|linkbuds|inzone)-?[\w-]+/i);
  if (!modelMatch) return [];

  const model = modelMatch[0].toUpperCase().replace(/\s+/g, "-");

  if (country === "KR") {
    // Sony Korea store tends to have cleaner spec pages
    return [`https://www.sony.co.kr/ko/products/${model.toLowerCase()}`];
  }
  if (country === "JP") {
    return [`https://www.sony.jp/headphone/${model.toLowerCase()}/spec.html`];
  }
  // US Sony — specification path
  return [
    `https://www.sony.com/en/articles/${model.toLowerCase()}-specifications`,
    `https://electronics.sony.com/audio/headphones/all-headphones/p/${model.toLowerCase()}`
  ];
}

/**
 * Given a normalized (English) product name and country, returns a ranked list
 * of candidate official spec URLs to try. Returns [] if the brand is unrecognized.
 */
export function buildBrandUrlCandidates(normalizedName: string, country: Country): string[] {
  if (isAppleProduct(normalizedName)) return buildAppleCandidates(normalizedName, country);
  if (isSamsungProduct(normalizedName)) return buildSamsungCandidates(normalizedName, country);
  if (isLgProduct(normalizedName)) return buildLgCandidates(normalizedName, country);
  if (isSonyProduct(normalizedName)) return buildSonyCandidates(normalizedName, country);
  return [];
}
