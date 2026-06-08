import type { VerifiedProduct } from "./types";

export const smartphones: VerifiedProduct[] = [
  // ── iPhone 16 series ──────────────────────────────────────────────────────
  {
    id: "iphone-16",
    canonicalName: "아이폰 16",
    aliases: ["아이폰 16", "아이폰16", "iphone 16"],
    category: "smartphone",
    source: "https://www.apple.com/kr/iphone-16/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16",
      os: "iOS",
      chipset: "A18",
      display_inch: "6.1",
      brightness_nits: "2000",
      battery: "동영상 재생 최대 22시간",
      weight_g: "170",
      camera_mp: "48",
      storage_gb: "128",
      refresh_hz: "60"
    }
  },
  {
    id: "iphone-16-plus",
    canonicalName: "아이폰 16 플러스",
    aliases: ["아이폰 16 플러스", "iphone 16 plus", "아이폰16 플러스"],
    category: "smartphone",
    source: "https://www.apple.com/kr/iphone-16-plus/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16 Plus",
      os: "iOS",
      chipset: "A18",
      display_inch: "6.7",
      brightness_nits: "2000",
      battery: "27시간",
      weight_g: "203",
      camera_mp: "48",
      storage_gb: "128",
      refresh_hz: "60"
    }
  },
  {
    id: "iphone-16-pro",
    canonicalName: "아이폰 16 프로",
    aliases: ["아이폰 16 프로", "iphone 16 pro", "아이폰16 프로"],
    category: "smartphone",
    source: "https://www.apple.com/kr/iphone-16-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16 Pro",
      os: "iOS",
      chipset: "A18 Pro",
      display_inch: "6.3",
      brightness_nits: "2000",
      battery: "27시간",
      weight_g: "199",
      camera_mp: "48",
      storage_gb: "128",
      refresh_hz: "120"
    }
  },
  {
    id: "iphone-16-pro-max",
    canonicalName: "아이폰 16 프로 맥스",
    aliases: ["아이폰 16 프로 맥스", "iphone 16 pro max", "아이폰16 프로맥스"],
    category: "smartphone",
    source: "https://www.apple.com/kr/iphone-16-pro-max/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16 Pro Max",
      os: "iOS",
      chipset: "A18 Pro",
      display_inch: "6.9",
      brightness_nits: "2000",
      battery: "33시간",
      weight_g: "227",
      camera_mp: "48",
      storage_gb: "256",
      refresh_hz: "120"
    }
  },

  // ── iPhone 15 series ──────────────────────────────────────────────────────
  {
    id: "iphone-15-pro",
    canonicalName: "아이폰 15 프로",
    aliases: ["아이폰 15 프로", "iphone 15 pro"],
    category: "smartphone",
    source: "https://support.apple.com/ko-kr/111900",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 15 Pro",
      os: "iOS",
      chipset: "A17 Pro",
      display_inch: "6.1",
      brightness_nits: "2000",
      battery: "23시간",
      weight_g: "187",
      camera_mp: "48",
      storage_gb: "128",
      refresh_hz: "120"
    }
  },
  {
    id: "iphone-15-pro-max",
    canonicalName: "아이폰 15 프로 맥스",
    aliases: ["아이폰 15 프로 맥스", "iphone 15 pro max"],
    category: "smartphone",
    source: "https://support.apple.com/ko-kr/111901",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 15 Pro Max",
      os: "iOS",
      chipset: "A17 Pro",
      display_inch: "6.7",
      brightness_nits: "2000",
      battery: "29시간",
      weight_g: "221",
      camera_mp: "48",
      storage_gb: "256",
      refresh_hz: "120"
    }
  },

  // ── Galaxy S25 series ─────────────────────────────────────────────────────
  {
    id: "galaxy-s25",
    canonicalName: "갤럭시 S25",
    aliases: ["갤럭시 s25", "갤럭시s25", "galaxy s25"],
    category: "smartphone",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s25/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S25",
      os: "Android",
      chipset: "Snapdragon 8 Elite for Galaxy",
      display_inch: "6.2",
      brightness_nits: "2600",
      battery: "4000mAh",
      weight_g: "162",
      camera_mp: "50",
      storage_gb: "256",
      refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s25-plus",
    canonicalName: "갤럭시 S25+",
    aliases: ["갤럭시 s25+", "갤럭시 s25 플러스", "galaxy s25+", "galaxy s25 plus"],
    category: "smartphone",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s25plus/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S25+",
      os: "Android",
      chipset: "Snapdragon 8 Elite for Galaxy",
      display_inch: "6.7",
      brightness_nits: "2600",
      battery: "4900mAh",
      weight_g: "190",
      camera_mp: "50",
      storage_gb: "256",
      refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s25-ultra",
    canonicalName: "갤럭시 S25 울트라",
    aliases: ["갤럭시 s25 울트라", "galaxy s25 ultra"],
    category: "smartphone",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s25-ultra/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S25 Ultra",
      os: "Android",
      chipset: "Snapdragon 8 Elite for Galaxy",
      display_inch: "6.9",
      brightness_nits: "2600",
      battery: "5000mAh",
      weight_g: "218",
      camera_mp: "200",
      storage_gb: "256",
      refresh_hz: "120"
    }
  },

  // ── Galaxy S24 series ─────────────────────────────────────────────────────
  {
    id: "galaxy-s24",
    canonicalName: "갤럭시 S24",
    aliases: ["갤럭시 s24", "galaxy s24"],
    category: "smartphone",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s24/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S24",
      os: "Android",
      chipset: "Exynos 2400",
      display_inch: "6.2",
      brightness_nits: "2600",
      battery: "4000mAh",
      weight_g: "167",
      camera_mp: "50",
      storage_gb: "256",
      refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s24-ultra",
    canonicalName: "갤럭시 S24 울트라",
    aliases: ["갤럭시 s24 울트라", "galaxy s24 ultra"],
    category: "smartphone",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s24-ultra/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S24 Ultra",
      os: "Android",
      chipset: "Snapdragon 8 Gen 3 for Galaxy",
      display_inch: "6.8",
      brightness_nits: "2600",
      battery: "5000mAh",
      weight_g: "232",
      camera_mp: "200",
      storage_gb: "256",
      refresh_hz: "120"
    }
  }
];
