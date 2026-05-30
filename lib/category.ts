import type { Category } from "@/lib/types";

const categoryRules: Array<{ category: Category; keywords: string[] }> = [
  {
    category: "smartphone",
    keywords: [
      "iphone",
      "아이폰",
      "갤럭시",
      "galaxy",
      "samsung",
      "삼성",
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

export const categoryTemplateMap: Record<Category, string[]> = {
  smartphone: ["display", "battery", "weight", "chipset", "camera", "storage"],
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

  return "general";
}
