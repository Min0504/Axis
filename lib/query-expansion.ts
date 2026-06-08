import type { Locale } from "@/lib/i18n";

type BrandExpansion = {
  id: "iphone" | "galaxy" | "airpods" | "galaxy_buds";
  mode: "recent_series" | "latest";
  patterns: RegExp[];
  options: Record<Locale, string[]>;
};

const EXPANSIONS: BrandExpansion[] = [
  {
    id: "iphone",
    mode: "recent_series",
    patterns: [/^아이폰$/i, /^iphone$/i, /^i\s*phone$/i, /^アイフォン$/i],
    options: {
      ko: ["아이폰 17", "아이폰 16", "아이폰 15"],
      en: ["iPhone 17", "iPhone 16", "iPhone 15"],
      ja: ["iPhone 17", "iPhone 16", "iPhone 15"]
    }
  },
  {
    id: "galaxy",
    mode: "recent_series",
    patterns: [/^갤럭시$/i, /^galaxy$/i, /^galaxy\s+s$/i, /^ギャラクシー$/i],
    options: {
      ko: ["갤럭시 S25", "갤럭시 S24", "갤럭시 S23"],
      en: ["Galaxy S25", "Galaxy S24", "Galaxy S23"],
      ja: ["Galaxy S25", "Galaxy S24", "Galaxy S23"]
    }
  },
  {
    id: "airpods",
    mode: "latest",
    patterns: [/^에어팟$/i, /^airpods$/i, /^air\s*pods$/i, /^エアポッズ$/i],
    options: {
      ko: ["에어팟 4"],
      en: ["AirPods 4"],
      ja: ["AirPods 4"]
    }
  },
  {
    id: "galaxy_buds",
    mode: "latest",
    patterns: [/^갤럭시\s*버즈$/i, /^갤럭시버즈$/i, /^버즈$/i, /^galaxy\s*buds$/i],
    options: {
      ko: ["갤럭시 버즈3 프로"],
      en: ["Galaxy Buds3 Pro"],
      ja: ["Galaxy Buds3 Pro"]
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

export function expandComparisonOptions(
  options: string[],
  maxOptionsAllowed: number,
  locale: Locale = "ko"
): string[] {
  const brands = options.map(resolveBrand);
  if (brands.some((brand) => !brand)) return options.slice(0, maxOptionsAllowed);

  const uniqueIds = new Set(brands.map((brand) => brand?.id));
  if (uniqueIds.size !== brands.length) return options.slice(0, maxOptionsAllowed);

  if (brands.every((brand) => brand?.mode === "latest")) {
    return brands
      .map((brand) => brand?.options[locale][0])
      .filter((option): option is string => Boolean(option))
      .slice(0, maxOptionsAllowed);
  }

  if (brands.some((brand) => brand?.mode !== "recent_series")) {
    return brands
      .map((brand) => brand?.options[locale][0])
      .filter((option): option is string => Boolean(option))
      .slice(0, maxOptionsAllowed);
  }

  const expanded = interleave(brands.map((brand) => brand?.options[locale] ?? []));
  return expanded.slice(0, Math.max(2, maxOptionsAllowed));
}
