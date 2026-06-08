import type { ProductRegistryEntry } from "@/lib/specs/types";

/**
 * Curated product registry — high-confidence URL overrides.
 *
 * DESIGN INTENT: This registry is NOT meant to cover every model. It exists
 * for two cases:
 *
 *   1. Older models whose pages have moved to Apple Support / Samsung Support
 *      (non-standard URL structure that the brand pattern builder can't derive).
 *
 *   2. Products whose canonical URL differs from the slug-based pattern (e.g.
 *      a MacBook page that covers multiple sizes at one URL).
 *
 * For current-generation Apple products (iPhone 15+, AirPods, MacBook M3/M4)
 * the brand URL pattern builder (url-patterns.ts) handles discovery automatically
 * without hardcoding — DO NOT add those here unless the pattern fails in testing.
 *
 * Samsung flagship phones (S24+) are also handled by patterns now; registry
 * entries remain for models with Support page URLs.
 */

export const registry: Record<string, ProductRegistryEntry> = {

  // ── Apple — older models on Support pages (non-standard URL) ─────────────

  "iphone 14": {
    officialUrl: "https://support.apple.com/en-us/111850",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 14 plus": {
    officialUrl: "https://support.apple.com/en-us/111854",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 14 pro": {
    officialUrl: "https://support.apple.com/en-us/111849",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 14 pro max": {
    officialUrl: "https://support.apple.com/en-us/111846",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 15": {
    officialUrl: "https://support.apple.com/en-us/111831",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 15 plus": {
    officialUrl: "https://support.apple.com/en-us/111830",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 15 pro": {
    officialUrl: "https://support.apple.com/en-us/111900",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 15 pro max": {
    officialUrl: "https://support.apple.com/en-us/111901",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 16 pro": {
    officialUrl: "https://www.apple.com/iphone-16-pro/specs/",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 16 pro max": {
    officialUrl: "https://www.apple.com/iphone-16-pro-max/specs/",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },
  "iphone 16 plus": {
    officialUrl: "https://www.apple.com/iphone-16-plus/specs/",
    parser: "apple",
    columnClass: "iphone",
    level: 1
  },

  // ── Apple — AirPods (generation numbers NOT in URL for Pro/Max) ───────────

  "airpods pro": {
    officialUrl: "https://www.apple.com/airpods-pro/",
    parser: "apple",
    level: 1
  },
  "airpods pro 2": {
    officialUrl: "https://www.apple.com/airpods-pro/",
    parser: "apple",
    level: 1
  },
  "airpods max": {
    officialUrl: "https://www.apple.com/airpods-max/",
    parser: "apple",
    level: 1
  },

  // ── Apple — iPad (chip model NOT in URL; Apple updates in-place) ──────────

  "ipad pro": {
    officialUrl: "https://www.apple.com/ipad-pro/specs/",
    parser: "apple",
    level: 1
  },
  "ipad pro m4": {
    officialUrl: "https://www.apple.com/ipad-pro/specs/",
    parser: "apple",
    level: 1
  },
  "ipad air": {
    officialUrl: "https://www.apple.com/ipad-air/specs/",
    parser: "apple",
    level: 1
  },
  "ipad air m2": {
    officialUrl: "https://www.apple.com/ipad-air/specs/",
    parser: "apple",
    level: 1
  },
  "ipad mini": {
    officialUrl: "https://www.apple.com/ipad-mini/specs/",
    parser: "apple",
    level: 1
  },
  "ipad": {
    officialUrl: "https://www.apple.com/ipad/specs/",
    parser: "apple",
    level: 1
  },

  // ── Apple — MacBook pages cover multiple models at one URL ────────────────

  "macbook air 13 m4": {
    officialUrl: "https://www.apple.com/macbook-air/specs/",
    parser: "apple",
    level: 1
  },
  "macbook air 15 m4": {
    officialUrl: "https://www.apple.com/macbook-air/specs/",
    parser: "apple",
    level: 1
  },
  "macbook air 13 m3": {
    officialUrl: "https://www.apple.com/macbook-air-13-and-15-m3/specs/",
    parser: "apple",
    level: 1
  },
  "macbook air m3": {
    officialUrl: "https://www.apple.com/macbook-air-13-and-15-m3/specs/",
    parser: "apple",
    level: 1
  },
  "macbook pro 14": {
    officialUrl: "https://www.apple.com/macbook-pro-14-and-16/specs/",
    parser: "apple",
    level: 1
  },
  "macbook pro 16": {
    officialUrl: "https://www.apple.com/macbook-pro-14-and-16/specs/",
    parser: "apple",
    level: 1
  },

  // ── Samsung — models with explicit Support model URLs ─────────────────────

  "galaxy s23": {
    officialUrl: "https://www.samsung.com/sec/support/model/SM-S911NZEFKOO/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/support/model/SM-S911NZEFKOO/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s25": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s25/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s25/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s25/",
      JP: "https://www.samsung.com/jp/smartphones/galaxy-s25/specs/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s25+": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s25plus/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s25plus/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s25plus/",
      JP: "https://www.samsung.com/jp/smartphones/galaxy-s25plus/specs/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s25 plus": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s25plus/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s25plus/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s25plus/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s25 ultra": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s25-ultra/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s25-ultra/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s25-ultra/",
      JP: "https://www.samsung.com/jp/smartphones/galaxy-s25-ultra/specs/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s24": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s24/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s24/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s24/",
      JP: "https://www.samsung.com/jp/smartphones/galaxy-s24/specs/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s24+": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s24plus/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s24plus/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s24plus/",
      JP: "https://www.samsung.com/jp/smartphones/galaxy-s24plus/specs/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s24 plus": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s24plus/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s24plus/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s24plus/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s24 ultra": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s24-ultra/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s24-ultra/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s24-ultra/",
      JP: "https://www.samsung.com/jp/smartphones/galaxy-s24-ultra/specs/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s24 fe": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s24-fe/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s24-fe/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s24-fe/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s23 ultra": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s23-ultra/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-s23-ultra/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-s23-ultra/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy s23+": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-s23plus/specs/",
    parser: "samsung",
    level: 1
  },
  "galaxy z fold 6": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-z-fold-6/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-z-fold-6/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-z-fold-6/",
      JP: "https://www.samsung.com/jp/smartphones/galaxy-z-fold-6/specs/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy z flip 6": {
    officialUrl: "https://www.samsung.com/sec/smartphones/galaxy-z-flip-6/specs/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/smartphones/galaxy-z-flip-6/specs/",
      US: "https://www.samsung.com/us/smartphones/galaxy-z-flip-6/",
      JP: "https://www.samsung.com/jp/smartphones/galaxy-z-flip-6/specs/"
    },
    parser: "samsung",
    level: 1
  },
  "galaxy book4 pro": {
    officialUrl: "https://www.samsung.com/sec/support/model/NT960QGK-KD70G/",
    parser: "samsung",
    level: 1
  },
  "galaxy buds3 pro": {
    officialUrl: "https://www.samsung.com/sec/audio-sound/galaxy-buds3-pro/",
    officialUrls: {
      KR: "https://www.samsung.com/sec/audio-sound/galaxy-buds3-pro/"
    },
    parser: "samsung",
    level: 1
  },

  // ── Sony — authorized importer fallback ───────────────────────────────────

  "sony wf-1000xm4": {
    officialUrl: "https://www.sony.com/electronics/support/wireless-headphones-bluetooth-headphones/wf-1000xm4/specifications",
    importerUrls: {
      KR: "https://store.sony.co.kr/product-view/102182200"
    },
    allowImporterFallback: true,
    parser: "generic",
    level: 2
  }
};
