const aliases: Record<string, string> = {
  // ── iPhone 14 series ──────────────────────────────────────────────────────
  "아이폰 14": "iphone 14",
  "아이폰 14 플러스": "iphone 14 plus",
  "아이폰 14 프로": "iphone 14 pro",
  "아이폰 14 pro": "iphone 14 pro",
  "아이폰 14 프로 맥스": "iphone 14 pro max",
  "아이폰 14 pro max": "iphone 14 pro max",

  // ── iPhone 15 series ──────────────────────────────────────────────────────
  "아이폰 15": "iphone 15",
  "아이폰 15 플러스": "iphone 15 plus",
  "아이폰 15 프로": "iphone 15 pro",
  "아이폰 15 pro": "iphone 15 pro",
  "아이폰 15 프로 맥스": "iphone 15 pro max",
  "아이폰 15 pro max": "iphone 15 pro max",
  "iphone 15 pro": "iphone 15 pro",
  "iphone 15 pro max": "iphone 15 pro max",
  "iphone 15 plus": "iphone 15 plus",

  // ── iPhone 16 series ──────────────────────────────────────────────────────
  "아이폰 16": "iphone 16",
  "아이폰 16 플러스": "iphone 16 plus",
  "아이폰 16 프로": "iphone 16 pro",
  "아이폰 16 pro": "iphone 16 pro",
  "아이폰 16 프로 맥스": "iphone 16 pro max",
  "아이폰 16 pro max": "iphone 16 pro max",
  "iphone 16 pro": "iphone 16 pro",
  "iphone 16 pro max": "iphone 16 pro max",
  "iphone 16 plus": "iphone 16 plus",

  // ── iPhone 17 series ──────────────────────────────────────────────────────
  "아이폰 17": "iphone 17",
  "아이폰 17 플러스": "iphone 17 plus",
  "아이폰 17 프로": "iphone 17 pro",
  "아이폰 17 pro": "iphone 17 pro",
  "아이폰 17 프로 맥스": "iphone 17 pro max",
  "아이폰 17 pro max": "iphone 17 pro max",

  // ── Galaxy S25 series ─────────────────────────────────────────────────────
  "갤럭시 s25": "galaxy s25",
  "갤럭시 s25+": "galaxy s25+",
  "갤럭시 s25 플러스": "galaxy s25+",
  "갤럭시 s25 울트라": "galaxy s25 ultra",
  "galaxy s25 plus": "galaxy s25+",

  // ── Galaxy S24 series ─────────────────────────────────────────────────────
  "갤럭시 s24": "galaxy s24",
  "갤럭시 s24+": "galaxy s24+",
  "갤럭시 s24 플러스": "galaxy s24+",
  "갤럭시 s24 울트라": "galaxy s24 ultra",
  "galaxy s24+": "galaxy s24+",
  "galaxy s24 plus": "galaxy s24+",
  "galaxy s24 ultra": "galaxy s24 ultra",
  "갤럭시 s24 fe": "galaxy s24 fe",
  "galaxy s24 fe": "galaxy s24 fe",

  // ── Galaxy S23 series ─────────────────────────────────────────────────────
  "갤럭시 s23": "galaxy s23",
  "갤럭시 s23 울트라": "galaxy s23 ultra",
  "galaxy s23 ultra": "galaxy s23 ultra",
  "갤럭시 s23+": "galaxy s23+",

  // ── Galaxy Z series ───────────────────────────────────────────────────────
  "갤럭시 z 폴드 6": "galaxy z fold 6",
  "갤럭시 폴드 6": "galaxy z fold 6",
  "galaxy z fold 6": "galaxy z fold 6",
  "갤럭시 z 플립 6": "galaxy z flip 6",
  "갤럭시 플립 6": "galaxy z flip 6",
  "galaxy z flip 6": "galaxy z flip 6",
  "갤럭시 z 폴드 5": "galaxy z fold 5",
  "galaxy z fold 5": "galaxy z fold 5",
  "갤럭시 z 플립 5": "galaxy z flip 5",
  "galaxy z flip 5": "galaxy z flip 5",

  // ── Galaxy Tab ────────────────────────────────────────────────────────────
  "갤럭시 탭 s10": "galaxy tab s10",
  "갤럭시 탭 s10+": "galaxy tab s10+",
  "갤럭시 탭 s10 울트라": "galaxy tab s10 ultra",
  "galaxy tab s10": "galaxy tab s10",
  "galaxy tab s10+": "galaxy tab s10+",
  "galaxy tab s10 ultra": "galaxy tab s10 ultra",
  "갤럭시 탭 s9": "galaxy tab s9",
  "galaxy tab s9": "galaxy tab s9",

  // ── MacBook ───────────────────────────────────────────────────────────────
  "맥북 에어": "macbook air 13 m4",
  "맥북 에어 m4": "macbook air 13 m4",
  "macbook air m4": "macbook air 13 m4",
  "macbook air 13 m4": "macbook air 13 m4",
  "macbook air 15 m4": "macbook air 15 m4",
  "맥북 에어 15 m4": "macbook air 15 m4",
  "맥북 프로": "macbook pro 14",
  "맥북 프로 14": "macbook pro 14",
  "맥북 프로 16": "macbook pro 16",
  "macbook air": "macbook air 13 m4",
  "macbook pro": "macbook pro 14",

  // ── Galaxy Book ───────────────────────────────────────────────────────────
  "갤럭시북": "galaxy book4 pro",
  "갤럭시 북": "galaxy book4 pro",
  "갤럭시북4 프로": "galaxy book4 pro",
  "갤럭시 북4 프로": "galaxy book4 pro",
  "galaxy book": "galaxy book4 pro",
  "galaxy book4 pro": "galaxy book4 pro",

  // ── AirPods ───────────────────────────────────────────────────────────────
  "에어팟 프로": "airpods pro",
  "에어팟 프로 2": "airpods pro 2",
  "airpods pro": "airpods pro",
  "airpods pro 2": "airpods pro 2",
  "에어팟 맥스": "airpods max",
  "airpods max": "airpods max",
  "에어팟": "airpods 4",
  "airpods": "airpods 4",
  "에어팟 4": "airpods 4",
  "에어팟 4세대": "airpods 4",

  // ── Galaxy Buds ───────────────────────────────────────────────────────────
  "갤럭시 버즈": "galaxy buds3 pro",
  "버즈": "galaxy buds3 pro",
  "갤럭시 버즈3 프로": "galaxy buds3 pro",
  "galaxy buds": "galaxy buds3 pro",
  "galaxy buds3 pro": "galaxy buds3 pro",
  "갤럭시 버즈3": "galaxy buds3",
  "galaxy buds3": "galaxy buds3",
  "갤럭시 버즈 2 프로": "galaxy buds2 pro",
  "galaxy buds2 pro": "galaxy buds2 pro",

  // ── Sony Headphones ───────────────────────────────────────────────────────
  "소니 wf-1000xm4": "sony wf-1000xm4",
  "sony wf-1000xm4": "sony wf-1000xm4",
  "wf-1000xm4": "sony wf-1000xm4",
  "소니 wf-1000xm5": "sony wf-1000xm5",
  "sony wf-1000xm5": "sony wf-1000xm5",
  "wf-1000xm5": "sony wf-1000xm5",
  "소니 wh-1000xm5": "sony wh-1000xm5",
  "sony wh-1000xm5": "sony wh-1000xm5",
  "wh-1000xm5": "sony wh-1000xm5",
  "소니 wh-1000xm4": "sony wh-1000xm4",
  "sony wh-1000xm4": "sony wh-1000xm4",
  "wh-1000xm4": "sony wh-1000xm4",

  // ── iPad ─────────────────────────────────────────────────────────────────
  "아이패드 프로": "ipad pro",
  "아이패드 프로 m4": "ipad pro m4",
  "ipad pro m4": "ipad pro m4",
  "아이패드 에어": "ipad air",
  "아이패드 에어 m2": "ipad air m2",
  "ipad air m2": "ipad air m2",
  "아이패드 미니": "ipad mini",
  "아이패드": "ipad",

  // ── Apple Watch ───────────────────────────────────────────────────────────
  "애플 워치": "apple watch series 10",
  "애플 워치 시리즈 10": "apple watch series 10",
  "apple watch series 10": "apple watch series 10",
  "애플 워치 울트라 2": "apple watch ultra 2",
  "apple watch ultra 2": "apple watch ultra 2",

  // ── Galaxy Watch ──────────────────────────────────────────────────────────
  "갤럭시 워치 7": "galaxy watch 7",
  "galaxy watch 7": "galaxy watch 7",
  "갤럭시 워치 울트라": "galaxy watch ultra",
  "galaxy watch ultra": "galaxy watch ultra",

  // ── Japanese aliases ──────────────────────────────────────────────────────
  "アイフォン17": "iphone 17",
  "アイフォン 17": "iphone 17",
  "アイフォン16": "iphone 16",
  "アイフォン16プロ": "iphone 16 pro",
  "アイフォン16プロマックス": "iphone 16 pro max",
  "ギャラクシーs25": "galaxy s25",
  "ギャラクシーs24": "galaxy s24",
  "ギャラクシーs23": "galaxy s23",
  "マックブックエア": "macbook air 13 m4",
  "マックブックプロ": "macbook pro 14",
  "エアポッズプロ": "airpods pro",
  "アイパッドプロ": "ipad pro"
};

function normalizedAliasKey(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function compactAliasKey(value: string): string {
  return normalizedAliasKey(value).replace(/\s+/g, "");
}

const compactAliases = Object.fromEntries(
  Object.entries(aliases).map(([key, value]) => [compactAliasKey(key), value])
);

function canonicalIphoneShorthand(value: string): string | null {
  const compact = compactAliasKey(value);
  const match = compact.match(/^(?:iphone|아이폰)?(\d{2})(promax|pro|plus|프로맥스|프로|플러스)?$/i);
  if (!match) return null;

  const generation = match[1];
  const variant = match[2] ?? "";
  if (variant === "promax" || variant === "프로맥스") return `iphone ${generation} pro max`;
  if (variant === "pro" || variant === "프로") return `iphone ${generation} pro`;
  if (variant === "plus" || variant === "플러스") return `iphone ${generation} plus`;
  return `iphone ${generation}`;
}

export function normalizeProductName(name: string): string {
  const normalized = normalizedAliasKey(name);
  return aliases[normalized] ?? compactAliases[compactAliasKey(name)] ?? canonicalIphoneShorthand(name) ?? normalized;
}
