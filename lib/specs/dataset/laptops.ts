import type { VerifiedProduct } from "./types";

/**
 * 노트북 검증 데이터셋 — 완전 하드코딩 (2023년 이후 주요 모델).
 *
 * 출처: 각 제조사 공식 페이지 (Apple KR, Samsung SEC, LG). 기본 구성 기준.
 * canonicalName=한국어, nameEn=영어(검색·표시).
 */
export const laptops: VerifiedProduct[] = [

  // ── MacBook Air M4 (2025) ────────────────────────────────────────────────
  {
    id: "macbook-air-13-m4",
    canonicalName: "맥북 에어 13 M4",
    nameEn: "MacBook Air 13 M4",
    aliases: [
      "맥북 에어 m4", "맥북에어 m4", "맥북에어m4", "맥북 에어 13 m4", "맥북에어 13 m4",
      "맥북 에어 13", "맥북에어13", "macbook air m4", "macbook air 13 m4", "macbook air 13",
      "맥북 에어", "맥북에어"
    ],
    category: "laptop",
    country: "KR",
    source: "https://www.apple.com/kr/macbook-air/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "MacBook Air 13-inch M4", os: "macOS", cpu: "Apple M4 (10코어 CPU)", gpu: "Apple M4 (10코어 GPU)",
      ram_gb: "16", storage_gb: "256", display_inch: "13.6", brightness_nits: "500", panel: "IPS (Liquid Retina)",
      resolution: "2560×1664", refresh_hz: "60", weight_g: "1240", battery_wh: "52.6",
      ports: "Thunderbolt 4 ×2, MagSafe 3, 3.5mm 헤드폰", launch_price_krw: "149만 9천원부터", release_date: "2025년 3월"
    }
  },
  {
    id: "macbook-air-15-m4",
    canonicalName: "맥북 에어 15 M4",
    nameEn: "MacBook Air 15 M4",
    aliases: ["맥북 에어 15 m4", "맥북에어 15 m4", "맥북에어15m4", "맥북 에어 15", "맥북에어15", "macbook air 15 m4", "macbook air 15"],
    category: "laptop",
    country: "KR",
    source: "https://www.apple.com/kr/macbook-air/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "MacBook Air 15-inch M4", os: "macOS", cpu: "Apple M4 (10코어 CPU)", gpu: "Apple M4 (10코어 GPU)",
      ram_gb: "16", storage_gb: "256", display_inch: "15.3", brightness_nits: "500", panel: "IPS (Liquid Retina)",
      resolution: "2880×1864", refresh_hz: "60", weight_g: "1510", battery_wh: "66.5",
      ports: "Thunderbolt 4 ×2, MagSafe 3, 3.5mm 헤드폰", launch_price_krw: "179만 9천원부터", release_date: "2025년 3월"
    }
  },

  // ── MacBook Air M3 (2024) ────────────────────────────────────────────────
  {
    id: "macbook-air-13-m3",
    canonicalName: "맥북 에어 13 M3",
    nameEn: "MacBook Air 13 M3",
    aliases: ["맥북 에어 m3", "맥북에어 m3", "맥북에어m3", "맥북 에어 13 m3", "맥북에어 13 m3", "macbook air m3", "macbook air 13 m3"],
    category: "laptop",
    country: "KR",
    source: "https://www.apple.com/kr/macbook-air/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "MacBook Air 13-inch M3", os: "macOS", cpu: "Apple M3 (8코어 CPU)", gpu: "Apple M3 (10코어 GPU)",
      ram_gb: "8", storage_gb: "256", display_inch: "13.6", brightness_nits: "500", panel: "IPS (Liquid Retina)",
      resolution: "2560×1664", refresh_hz: "60", weight_g: "1240", battery_wh: "52.6",
      ports: "Thunderbolt 3 ×2, MagSafe 3, 3.5mm 헤드폰", launch_price_krw: "149만 9천원부터", release_date: "2024년 3월"
    }
  },
  {
    id: "macbook-air-15-m3",
    canonicalName: "맥북 에어 15 M3",
    nameEn: "MacBook Air 15 M3",
    aliases: ["맥북 에어 15 m3", "맥북에어 15 m3", "맥북에어15m3", "macbook air 15 m3"],
    category: "laptop",
    country: "KR",
    source: "https://www.apple.com/kr/macbook-air/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "MacBook Air 15-inch M3", os: "macOS", cpu: "Apple M3 (8코어 CPU)", gpu: "Apple M3 (10코어 GPU)",
      ram_gb: "8", storage_gb: "256", display_inch: "15.3", brightness_nits: "500", panel: "IPS (Liquid Retina)",
      resolution: "2880×1864", refresh_hz: "60", weight_g: "1510", battery_wh: "66.5",
      ports: "Thunderbolt 3 ×2, MagSafe 3, 3.5mm 헤드폰", launch_price_krw: "169만 9천원부터", release_date: "2024년 3월"
    }
  },

  // ── MacBook Pro M4 (2024) ────────────────────────────────────────────────
  {
    id: "macbook-pro-14-m4",
    canonicalName: "맥북 프로 14 M4",
    nameEn: "MacBook Pro 14 M4",
    aliases: [
      "맥북 프로 14 m4", "맥북프로 14 m4", "맥북프로14m4", "맥북 프로 m4", "맥북프로 m4", "맥북프로m4",
      "맥북 프로 14", "맥북프로14", "macbook pro 14 m4", "macbook pro m4", "macbook pro 14",
      "맥북 프로", "맥북프로"
    ],
    category: "laptop",
    country: "KR",
    source: "https://www.apple.com/kr/macbook-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "MacBook Pro 14-inch M4", os: "macOS", cpu: "Apple M4 (10코어 CPU)", gpu: "Apple M4 (10코어 GPU)",
      ram_gb: "16", storage_gb: "512", display_inch: "14.2", brightness_nits: "1000", panel: "OLED (Liquid Retina XDR)",
      resolution: "3024×1964", refresh_hz: "120", weight_g: "1610", battery_wh: "72.4",
      ports: "Thunderbolt 4 ×3, HDMI, SD카드, MagSafe 3, 3.5mm 헤드폰", launch_price_krw: "199만 9천원부터", release_date: "2024년 11월"
    }
  },
  {
    id: "macbook-pro-16-m4",
    canonicalName: "맥북 프로 16 M4",
    nameEn: "MacBook Pro 16 M4",
    aliases: ["맥북 프로 16 m4", "맥북프로 16 m4", "맥북프로16m4", "맥북 프로 16", "맥북프로16", "macbook pro 16 m4", "macbook pro 16"],
    category: "laptop",
    country: "KR",
    source: "https://www.apple.com/kr/macbook-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "MacBook Pro 16-inch M4", os: "macOS", cpu: "Apple M4 (10코어 CPU)", gpu: "Apple M4 (10코어 GPU)",
      ram_gb: "24", storage_gb: "512", display_inch: "16.2", brightness_nits: "1000", panel: "OLED (Liquid Retina XDR)",
      resolution: "3456×2234", refresh_hz: "120", weight_g: "2140", battery_wh: "99.6",
      ports: "Thunderbolt 4 ×3, HDMI, SD카드, MagSafe 3, 3.5mm 헤드폰", launch_price_krw: "299만 9천원부터", release_date: "2024년 11월"
    }
  },

  // ── MacBook Pro M3 (2023) ────────────────────────────────────────────────
  {
    id: "macbook-pro-14-m3",
    canonicalName: "맥북 프로 14 M3",
    nameEn: "MacBook Pro 14 M3",
    aliases: ["맥북 프로 14 m3", "맥북프로 14 m3", "맥북프로14m3", "macbook pro 14 m3"],
    category: "laptop",
    country: "KR",
    source: "https://www.apple.com/kr/macbook-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "MacBook Pro 14-inch M3", os: "macOS", cpu: "Apple M3 (8코어 CPU)", gpu: "Apple M3 (10코어 GPU)",
      ram_gb: "8", storage_gb: "512", display_inch: "14.2", brightness_nits: "1000", panel: "OLED (Liquid Retina XDR)",
      resolution: "3024×1964", refresh_hz: "120", weight_g: "1610", battery_wh: "72.4",
      ports: "Thunderbolt 3 ×3, HDMI, SD카드, MagSafe 3, 3.5mm 헤드폰", launch_price_krw: "199만 9천원부터", release_date: "2023년 11월"
    }
  },
  {
    id: "macbook-pro-16-m3",
    canonicalName: "맥북 프로 16 M3",
    nameEn: "MacBook Pro 16 M3",
    aliases: ["맥북 프로 16 m3", "맥북프로 16 m3", "맥북프로16m3", "macbook pro 16 m3"],
    category: "laptop",
    country: "KR",
    source: "https://www.apple.com/kr/macbook-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "MacBook Pro 16-inch M3 Pro", os: "macOS", cpu: "Apple M3 Pro (12코어 CPU)", gpu: "Apple M3 Pro (18코어 GPU)",
      ram_gb: "18", storage_gb: "512", display_inch: "16.2", brightness_nits: "1000", panel: "OLED (Liquid Retina XDR)",
      resolution: "3456×2234", refresh_hz: "120", weight_g: "2140", battery_wh: "99.6",
      ports: "Thunderbolt 3 ×3, HDMI, SD카드, MagSafe 3, 3.5mm 헤드폰", launch_price_krw: "319만 9천원부터", release_date: "2023년 11월"
    }
  },

  // ── LG 그램 ──────────────────────────────────────────────────────────────
  {
    id: "lg-gram-16",
    canonicalName: "LG 그램 16",
    nameEn: "LG gram 16",
    aliases: ["lg 그램 16", "그램 16", "그램16", "lg그램16", "lg 그램16", "lg gram 16", "gram 16", "lg 그램", "그램", "lg gram"],
    category: "laptop",
    country: "KR",
    source: "https://www.lge.co.kr/notebooks",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "LG gram 16", os: "Windows 11", cpu: "Intel Core Ultra 7 155H", gpu: "Intel Arc Graphics",
      ram_gb: "16", storage_gb: "512", display_inch: "16", brightness_nits: "350", panel: "IPS",
      resolution: "2560×1600", refresh_hz: "60", weight_g: "1199", battery_wh: "80",
      ports: "Thunderbolt 4 ×2, USB-A ×2, HDMI, USB-C", launch_price_krw: "169만원부터", release_date: "2024년 1월"
    }
  },
  {
    id: "lg-gram-14",
    canonicalName: "LG 그램 14",
    nameEn: "LG gram 14",
    aliases: ["lg 그램 14", "그램 14", "그램14", "lg그램14", "lg 그램14", "lg gram 14", "gram 14"],
    category: "laptop",
    country: "KR",
    source: "https://www.lge.co.kr/notebooks",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "LG gram 14", os: "Windows 11", cpu: "Intel Core Ultra 7 155H", gpu: "Intel Arc Graphics",
      ram_gb: "16", storage_gb: "512", display_inch: "14", brightness_nits: "350", panel: "IPS",
      resolution: "1920×1200", refresh_hz: "60", weight_g: "980", battery_wh: "72",
      ports: "Thunderbolt 4 ×2, USB-A ×2, HDMI", launch_price_krw: "149만원부터", release_date: "2024년 1월"
    }
  },

  // ── Samsung Galaxy Book ──────────────────────────────────────────────────
  {
    id: "galaxy-book4-pro-14",
    canonicalName: "갤럭시 북4 프로 14",
    nameEn: "Galaxy Book4 Pro 14",
    aliases: ["갤럭시북4 프로", "갤럭시 북4 프로", "갤럭시북4프로", "갤럭시북 프로", "galaxy book4 pro", "galaxy book4 pro 14", "갤럭시북4", "갤럭시 북4", "갤럭시북", "갤럭시 북"],
    category: "laptop",
    country: "KR",
    source: "https://www.samsung.com/sec/notebooks/galaxy-book4-pro/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Book4 Pro 14", os: "Windows 11", cpu: "Intel Core Ultra 7 155H", gpu: "Intel Arc Graphics",
      ram_gb: "16", storage_gb: "512", display_inch: "14", brightness_nits: "400", panel: "OLED (Dynamic AMOLED 2X)",
      resolution: "2880×1800", refresh_hz: "120", weight_g: "1170", battery_wh: "63",
      ports: "Thunderbolt 4 ×2, USB-A, HDMI, microSD", launch_price_krw: "189만 8천원부터", release_date: "2024년 1월"
    }
  },
  {
    id: "galaxy-book5-pro-14",
    canonicalName: "갤럭시 북5 프로 14",
    nameEn: "Galaxy Book5 Pro 14",
    aliases: ["갤럭시북5 프로", "갤럭시 북5 프로", "갤럭시북5프로", "galaxy book5 pro", "galaxy book5 pro 14", "갤럭시북5", "갤럭시 북5"],
    category: "laptop",
    country: "KR",
    source: "https://www.samsung.com/sec/notebooks/galaxy-book5-pro/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Book5 Pro 14", os: "Windows 11", cpu: "Intel Core Ultra 7 256V", gpu: "Intel Arc Graphics 140V",
      ram_gb: "16", storage_gb: "512", display_inch: "14", brightness_nits: "400", panel: "OLED (Dynamic AMOLED 2X)",
      resolution: "2880×1800", refresh_hz: "120", weight_g: "1230", battery_wh: "61.8",
      ports: "Thunderbolt 4 ×2, USB-A, HDMI 2.1, microSD", launch_price_krw: "219만 9천원부터", release_date: "2025년 1월"
    }
  }
];
