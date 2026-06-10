import type { Locale } from "@/lib/i18n";

/**
 * Brand → latest concrete model mapping.
 *
 * When a user types a bare brand name (e.g. "에어팟", "갤럭시 버즈"),
 * resolve it to the specific current-generation product so the comparison
 * is always against a named model — never a random or ambiguous entry.
 *
 * Rules:
 * - "latest" mode  → resolve to the single most recent model
 * - "recent_series" → expand to the top 2-3 recent generations (for cross-gen comparisons)
 *
 * Update this map when new flagships launch.
 */

type BrandExpansion = {
  id: string;
  mode: "recent_series" | "latest";
  patterns: RegExp[];
  options: Record<Locale, string[]>;
};

const EXPANSIONS: BrandExpansion[] = [
  // ── iPhone ───────────────────────────────────────────────────────────────
  {
    id: "iphone",
    mode: "recent_series",
    patterns: [/^아이폰$/i, /^iphone$/i, /^i\s*phone$/i, /^アイフォン$/i],
    options: {
      ko: ["아이폰 16", "아이폰 15"],
      en: ["iPhone 16", "iPhone 15"],
      ja: ["iPhone 16", "iPhone 15"]
    }
  },
  {
    id: "iphone_pro",
    mode: "latest",
    patterns: [/^아이폰\s*프로$/i, /^iphone\s*pro$/i],
    options: {
      ko: ["아이폰 16 프로"],
      en: ["iPhone 16 Pro"],
      ja: ["iPhone 16 Pro"]
    }
  },

  // ── Galaxy S series ───────────────────────────────────────────────────────
  {
    id: "galaxy",
    mode: "recent_series",
    patterns: [/^갤럭시$/i, /^galaxy$/i, /^galaxy\s+s$/i, /^ギャラクシー$/i],
    options: {
      ko: ["갤럭시 S25", "갤럭시 S24"],
      en: ["Galaxy S25", "Galaxy S24"],
      ja: ["Galaxy S25", "Galaxy S24"]
    }
  },
  {
    id: "galaxy_ultra",
    mode: "latest",
    patterns: [/^갤럭시\s*울트라$/i, /^galaxy\s*ultra$/i],
    options: {
      ko: ["갤럭시 S25 울트라"],
      en: ["Galaxy S25 Ultra"],
      ja: ["Galaxy S25 Ultra"]
    }
  },

  // ── AirPods ───────────────────────────────────────────────────────────────
  {
    id: "airpods",
    mode: "latest",
    patterns: [/^에어팟$/i, /^airpods?$/i, /^air\s*pods?$/i, /^エアポッズ$/i],
    options: {
      ko: ["에어팟 4 ANC"],
      en: ["AirPods 4 ANC"],
      ja: ["AirPods 4 ANC"]
    }
  },
  {
    id: "airpods_pro",
    mode: "latest",
    // "에어팟 프로" alone (no generation number) → latest AirPods Pro
    patterns: [/^에어팟\s*프로$/i, /^airpods?\s*pro$/i, /^エアポッズ\s*プロ$/i],
    options: {
      ko: ["에어팟 프로 2세대"],
      en: ["AirPods Pro 2nd generation"],
      ja: ["AirPods Pro 第2世代"]
    }
  },
  {
    id: "airpods_max",
    mode: "latest",
    patterns: [/^에어팟\s*맥스$/i, /^airpods?\s*max$/i],
    options: {
      ko: ["에어팟 맥스"],
      en: ["AirPods Max"],
      ja: ["AirPods Max"]
    }
  },

  // ── Galaxy Buds ───────────────────────────────────────────────────────────
  {
    id: "galaxy_buds",
    mode: "latest",
    patterns: [
      /^갤럭시\s*버즈$/i,
      /^갤럭시버즈$/i,
      /^버즈$/i,
      /^galaxy\s*buds$/i,
      /^ギャラクシー\s*バッズ$/i
    ],
    options: {
      ko: ["갤럭시 버즈4 프로"],
      en: ["Galaxy Buds4 Pro"],
      ja: ["Galaxy Buds4 Pro"]
    }
  },
  {
    id: "galaxy_buds_pro",
    mode: "latest",
    patterns: [/^갤럭시\s*버즈\s*프로$/i, /^galaxy\s*buds\s*pro$/i],
    options: {
      ko: ["갤럭시 버즈4 프로"],
      en: ["Galaxy Buds4 Pro"],
      ja: ["Galaxy Buds4 Pro"]
    }
  },

  // ── Galaxy Z series ───────────────────────────────────────────────────────
  {
    id: "galaxy_fold",
    mode: "latest",
    patterns: [/^갤럭시\s*(?:z\s*)?폴드$/i, /^galaxy\s*(?:z\s*)?fold$/i],
    options: {
      ko: ["갤럭시 Z 폴드 6"],
      en: ["Galaxy Z Fold 6"],
      ja: ["Galaxy Z Fold 6"]
    }
  },
  {
    id: "galaxy_flip",
    mode: "latest",
    patterns: [/^갤럭시\s*(?:z\s*)?플립$/i, /^galaxy\s*(?:z\s*)?flip$/i],
    options: {
      ko: ["갤럭시 Z 플립 6"],
      en: ["Galaxy Z Flip 6"],
      ja: ["Galaxy Z Flip 6"]
    }
  },

  // ── MacBook ───────────────────────────────────────────────────────────────
  {
    id: "macbook_air",
    mode: "latest",
    patterns: [/^맥북\s*에어$/i, /^macbook\s*air$/i],
    options: {
      ko: ["맥북 에어 M4"],
      en: ["MacBook Air M4"],
      ja: ["MacBook Air M4"]
    }
  },
  {
    id: "macbook_pro",
    mode: "latest",
    patterns: [/^맥북\s*프로$/i, /^macbook\s*pro$/i],
    options: {
      ko: ["맥북 프로 14 M4"],
      en: ["MacBook Pro 14 M4"],
      ja: ["MacBook Pro 14 M4"]
    }
  },
  {
    id: "macbook",
    mode: "latest",
    patterns: [/^맥북$/i, /^macbook$/i],
    options: {
      ko: ["맥북 에어 M4"],
      en: ["MacBook Air M4"],
      ja: ["MacBook Air M4"]
    }
  },

  // ── Galaxy Book ───────────────────────────────────────────────────────────
  {
    id: "galaxy_book",
    mode: "latest",
    patterns: [/^갤럭시북$/i, /^갤럭시\s*북$/i, /^galaxy\s*book$/i],
    options: {
      ko: ["갤럭시북4 프로"],
      en: ["Galaxy Book4 Pro"],
      ja: ["Galaxy Book4 Pro"]
    }
  },

  // ── iPad ─────────────────────────────────────────────────────────────────
  {
    id: "ipad_pro",
    mode: "latest",
    patterns: [/^아이패드\s*프로$/i, /^ipad\s*pro$/i],
    options: {
      ko: ["아이패드 프로 M4"],
      en: ["iPad Pro M4"],
      ja: ["iPad Pro M4"]
    }
  },
  {
    id: "ipad_air",
    mode: "latest",
    patterns: [/^아이패드\s*에어$/i, /^ipad\s*air$/i],
    options: {
      ko: ["아이패드 에어 M2"],
      en: ["iPad Air M2"],
      ja: ["iPad Air M2"]
    }
  },
  {
    id: "ipad",
    mode: "latest",
    patterns: [/^아이패드$/i, /^ipad$/i],
    options: {
      ko: ["아이패드 에어 M2"],
      en: ["iPad Air M2"],
      ja: ["iPad Air M2"]
    }
  },

  // ── Sony ─────────────────────────────────────────────────────────────────
  {
    id: "sony_wh",
    mode: "latest",
    patterns: [/^소니\s*(?:헤드폰|wh)?$/i, /^sony\s*(?:headphone|wh)?$/i],
    options: {
      ko: ["소니 WH-1000XM5"],
      en: ["Sony WH-1000XM5"],
      ja: ["Sony WH-1000XM5"]
    }
  }
];

function resolveBrand(value: string): BrandExpansion | null {
  const normalized = value.trim();
  if (!normalized) return null;
  return EXPANSIONS.find((entry) => entry.patterns.some((pattern) => pattern.test(normalized))) ?? null;
}

function interleave<T>(groups: T[][]): T[] {
  const max = Math.max(...groups.map((group) => group.length));
  const out: T[] = [];
  for (let index = 0; index < max; index += 1) {
    for (const group of groups) {
      if (group[index]) out.push(group[index]);
    }
  }
  return out;
}

/**
 * Expand vague options into concrete product names.
 *
 * - If ALL options resolve to known brands → expand each to their latest model(s).
 * - If ANY option is already specific (e.g. "아이폰 16 프로") → return as-is.
 *
 * The key invariant: after expansion, the user is always comparing specific,
 * named products — never "에어팟" vs "버즈" (ambiguous).
 */
export function expandComparisonOptions(
  options: string[],
  maxOptionsAllowed: number,
  locale: Locale = "ko"
): string[] {
  const brands = options.map(resolveBrand);

  // If any option doesn't match a known brand pattern, keep all as-is
  if (brands.some((brand) => !brand)) return options.slice(0, maxOptionsAllowed);

  // Ensure all resolved brand IDs are distinct (no duplicate brand)
  const uniqueIds = new Set(brands.map((brand) => brand?.id));
  if (uniqueIds.size !== brands.length) return options.slice(0, maxOptionsAllowed);

  // All "latest" → map each to its single latest model
  if (brands.every((brand) => brand?.mode === "latest")) {
    return brands
      .map((brand) => brand?.options[locale][0])
      .filter((option): option is string => Boolean(option))
      .slice(0, maxOptionsAllowed);
  }

  // Any non-"recent_series" among the brands → use each brand's top latest
  if (brands.some((brand) => brand?.mode !== "recent_series")) {
    return brands
      .map((brand) => brand?.options[locale][0])
      .filter((option): option is string => Boolean(option))
      .slice(0, maxOptionsAllowed);
  }

  // All "recent_series" → interleave the series lists
  const expanded = interleave(brands.map((brand) => brand?.options[locale] ?? []));
  return expanded.slice(0, Math.max(2, maxOptionsAllowed));
}
