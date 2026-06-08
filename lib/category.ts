import type { Category } from "@/lib/types";
import { schemaFieldLabels } from "@/lib/specs/schema";

/**
 * Category detection rules. Order matters — the first rule whose keyword
 * appears in the query wins. `laptop` is listed before `smartphone` so that
 * laptop product lines containing a phone-brand token (e.g. "갤럭시북",
 * "Galaxy Book") classify correctly instead of falling into smartphone.
 */
const categoryRules: Array<{ category: Category; keywords: string[] }> = [
  {
    category: "laptop",
    keywords: [
      "노트북",
      "laptop",
      "맥북",
      "macbook",
      "갤럭시북",
      "galaxy book",
      "그램",
      "lg gram",
      "씽크패드",
      "thinkpad",
      "아이디어패드",
      "ideapad",
      "젠북",
      "zenbook",
      "비보북",
      "vivobook",
      "서피스 랩탑",
      "surface laptop",
      "서피스북",
      "surface book",
      "요가",
      "yoga",
      "xps",
      "rog",
      "스펙터",
      "spectre",
      "파빌리온",
      "pavilion"
    ]
  },
  {
    category: "tablet",
    keywords: [
      "아이패드",
      "ipad",
      "갤럭시 탭",
      "galaxy tab",
      "갤럭시탭",
      "태블릿",
      "tablet",
      "タブレット",
      "アイパッド"
    ]
  },
  {
    category: "monitor",
    keywords: ["모니터", "monitor", "울트라기어", "오디세이", "odyssey"]
  },
  {
    category: "earphones",
    keywords: [
      "에어팟",
      "airpods",
      "버즈",
      "galaxy buds",
      "buds",
      "이어폰",
      "이어버드",
      "earphone",
      "earbud",
      "헤드폰",
      "headphone",
      "헤드셋",
      "headset",
      "quietcomfort"
    ]
  },
  {
    category: "smartphone",
    keywords: [
      "iphone",
      "아이폰",
      "갤럭시",
      "galaxy",
      "pixel",
      "픽셀",
      "smartphone",
      "스마트폰",
      "폰",
      "휴대폰"
    ]
  },
  { category: "guitar", keywords: ["guitar", "기타", "pickup", "픽업", "fret", "스트라토", "텔레캐스터"] },
  {
    category: "multieffects",
    keywords: ["hx stomp", "nano cortex", "multieffects", "멀티이펙터", "이펙터", "amp model", "앰프"]
  }
];

/**
 * Comparison axes per category. For schema-backed categories (laptop,
 * smartphone) the axes are *derived from the schema* so there's a single
 * source of truth; legacy categories keep their flat templates until they
 * get a schema.
 */
export const categoryTemplateMap: Record<Category, string[]> = {
  laptop: schemaFieldLabels("laptop"),
  smartphone: schemaFieldLabels("smartphone"),
  tablet: schemaFieldLabels("tablet"),
  monitor: schemaFieldLabels("monitor"),
  earphones: schemaFieldLabels("earphones"),
  guitar: ["body", "neck", "fingerboard", "pickup", "bridge", "scale", "frets"],
  multieffects: ["size", "weight", "footswitch", "audio_interface", "capture", "amp_models", "effects"],
  general: ["purpose_fit", "ease_of_use", "durability", "value"]
};

export function detectCategory(query: string): Category {
  const normalized = query.toLowerCase();

  for (const rule of categoryRules) {
    if (rule.keywords.some((keyword) => normalized.includes(keyword))) {
      return rule.category;
    }
  }

  if (/(?:^|\s)(?:iphone|아이폰)?\s*\d{2}\s*(?:pro\s*max|pro|max|plus|프로\s*맥스|프로|플러스)?(?:\s|$)/i.test(normalized)) {
    return "smartphone";
  }

  return "general";
}
