import type { VerifiedProduct } from "./types";

/**
 * 스마트폰 검증 데이터셋 — 완전 하드코딩 (2020년 이후 주요 모델).
 *
 * 출처: 각 제조사 공식 페이지 (Apple KR, Samsung SEC).
 * canonicalName=한국어, nameEn=영어(검색·표시), 별칭은 한/영 혼용 입력 전부 커버.
 *
 * camera_mp = 메인(광각) 센서 화소 기준 (스키마 hint).
 */
export const smartphones: VerifiedProduct[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // iPhone 16 시리즈 (2024)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "iphone-16",
    canonicalName: "아이폰 16",
    nameEn: "iPhone 16",
    aliases: ["아이폰 16", "아이폰16", "iphone 16", "iphone16", "아이폰 16 기본"],
    category: "smartphone",
    country: "KR",
    source: "https://www.apple.com/kr/iphone-16/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16", release_date: "2024년 9월", launch_price_krw: "125만원부터",
      os: "iOS 18", chipset: "A18", display_inch: "6.1", brightness_nits: "2000",
      ram_gb: "8", storage_gb: "128", camera_mp: "48", battery: "동영상 재생 최대 22시간",
      charging: "25W 유선, 25W MagSafe 무선", water_resist: "IP68", weight_g: "170", refresh_hz: "60"
    }
  },
  {
    id: "iphone-16-plus",
    canonicalName: "아이폰 16 플러스",
    nameEn: "iPhone 16 Plus",
    aliases: ["아이폰 16 플러스", "아이폰16 플러스", "아이폰16플러스", "iphone 16 plus", "iphone16 plus", "16 플러스", "16플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://www.apple.com/kr/iphone-16/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16 Plus", release_date: "2024년 9월", launch_price_krw: "135만원부터",
      os: "iOS 18", chipset: "A18", display_inch: "6.7", brightness_nits: "2000",
      ram_gb: "8", storage_gb: "128", camera_mp: "48", battery: "동영상 재생 최대 27시간",
      charging: "25W 유선, 25W MagSafe 무선", water_resist: "IP68", weight_g: "203", refresh_hz: "60"
    }
  },
  {
    id: "iphone-16-pro",
    canonicalName: "아이폰 16 프로",
    nameEn: "iPhone 16 Pro",
    aliases: ["아이폰 16 프로", "아이폰16 프로", "아이폰16프로", "아이폰 16pro", "아이폰16pro", "iphone 16 pro", "iphone16 pro", "iphone 16pro", "16 프로", "16프로"],
    category: "smartphone",
    country: "KR",
    source: "https://www.apple.com/kr/iphone-16-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16 Pro", release_date: "2024년 9월", launch_price_krw: "155만원부터",
      os: "iOS 18", chipset: "A18 Pro", display_inch: "6.3", brightness_nits: "2000",
      ram_gb: "8", storage_gb: "128", camera_mp: "48", battery: "동영상 재생 최대 27시간",
      charging: "25W 유선, 25W MagSafe 무선", water_resist: "IP68", weight_g: "199", refresh_hz: "120"
    }
  },
  {
    id: "iphone-16-pro-max",
    canonicalName: "아이폰 16 프로 맥스",
    nameEn: "iPhone 16 Pro Max",
    aliases: ["아이폰 16 프로 맥스", "아이폰16 프로 맥스", "아이폰16프로맥스", "아이폰 16 프로맥스", "iphone 16 pro max", "iphone16 pro max", "iphone 16 promax", "16 프로 맥스", "16프로맥스"],
    category: "smartphone",
    country: "KR",
    source: "https://www.apple.com/kr/iphone-16-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16 Pro Max", release_date: "2024년 9월", launch_price_krw: "189만원부터",
      os: "iOS 18", chipset: "A18 Pro", display_inch: "6.9", brightness_nits: "2000",
      ram_gb: "8", storage_gb: "256", camera_mp: "48", battery: "동영상 재생 최대 33시간",
      charging: "25W 유선, 25W MagSafe 무선", water_resist: "IP68", weight_g: "227", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // iPhone 15 시리즈 (2023)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "iphone-15",
    canonicalName: "아이폰 15",
    nameEn: "iPhone 15",
    aliases: ["아이폰 15", "아이폰15", "iphone 15", "iphone15", "아이폰 15 기본"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111831",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 15", release_date: "2023년 9월", launch_price_krw: "125만원부터",
      os: "iOS 17", chipset: "A16 Bionic", display_inch: "6.1", brightness_nits: "2000",
      ram_gb: "6", storage_gb: "128", camera_mp: "48", battery: "동영상 재생 최대 20시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "171", refresh_hz: "60"
    }
  },
  {
    id: "iphone-15-plus",
    canonicalName: "아이폰 15 플러스",
    nameEn: "iPhone 15 Plus",
    aliases: ["아이폰 15 플러스", "아이폰15 플러스", "아이폰15플러스", "iphone 15 plus", "15 플러스", "15플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111830",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 15 Plus", release_date: "2023년 9월", launch_price_krw: "135만원부터",
      os: "iOS 17", chipset: "A16 Bionic", display_inch: "6.7", brightness_nits: "2000",
      ram_gb: "6", storage_gb: "128", camera_mp: "48", battery: "동영상 재생 최대 26시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "201", refresh_hz: "60"
    }
  },
  {
    id: "iphone-15-pro",
    canonicalName: "아이폰 15 프로",
    nameEn: "iPhone 15 Pro",
    aliases: ["아이폰 15 프로", "아이폰15 프로", "아이폰15프로", "아이폰 15pro", "아이폰15pro", "iphone 15 pro", "15 프로", "15프로"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111900",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 15 Pro", release_date: "2023년 9월", launch_price_krw: "155만원부터",
      os: "iOS 17", chipset: "A17 Pro", display_inch: "6.1", brightness_nits: "2000",
      ram_gb: "8", storage_gb: "128", camera_mp: "48", battery: "동영상 재생 최대 23시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "187", refresh_hz: "120"
    }
  },
  {
    id: "iphone-15-pro-max",
    canonicalName: "아이폰 15 프로 맥스",
    nameEn: "iPhone 15 Pro Max",
    aliases: ["아이폰 15 프로 맥스", "아이폰15 프로 맥스", "아이폰15프로맥스", "아이폰 15 프로맥스", "iphone 15 pro max", "15 프로 맥스", "15프로맥스"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111901",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 15 Pro Max", release_date: "2023년 9월", launch_price_krw: "189만원부터",
      os: "iOS 17", chipset: "A17 Pro", display_inch: "6.7", brightness_nits: "2000",
      ram_gb: "8", storage_gb: "256", camera_mp: "48", battery: "동영상 재생 최대 29시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "221", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // iPhone 14 시리즈 (2022)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "iphone-14",
    canonicalName: "아이폰 14",
    nameEn: "iPhone 14",
    aliases: ["아이폰 14", "아이폰14", "iphone 14", "iphone14", "아이폰 14 기본"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111850",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 14", release_date: "2022년 9월", launch_price_krw: "125만원부터",
      os: "iOS 16", chipset: "A15 Bionic", display_inch: "6.1", brightness_nits: "1200",
      ram_gb: "6", storage_gb: "128", camera_mp: "12", battery: "동영상 재생 최대 20시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "172", refresh_hz: "60"
    }
  },
  {
    id: "iphone-14-plus",
    canonicalName: "아이폰 14 플러스",
    nameEn: "iPhone 14 Plus",
    aliases: ["아이폰 14 플러스", "아이폰14 플러스", "아이폰14플러스", "iphone 14 plus", "14 플러스", "14플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111854",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 14 Plus", release_date: "2022년 10월", launch_price_krw: "135만원부터",
      os: "iOS 16", chipset: "A15 Bionic", display_inch: "6.7", brightness_nits: "1200",
      ram_gb: "6", storage_gb: "128", camera_mp: "12", battery: "동영상 재생 최대 26시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "203", refresh_hz: "60"
    }
  },
  {
    id: "iphone-14-pro",
    canonicalName: "아이폰 14 프로",
    nameEn: "iPhone 14 Pro",
    aliases: ["아이폰 14 프로", "아이폰14 프로", "아이폰14프로", "아이폰 14pro", "아이폰14pro", "iphone 14 pro", "14 프로", "14프로"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111849",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 14 Pro", release_date: "2022년 9월", launch_price_krw: "155만원부터",
      os: "iOS 16", chipset: "A16 Bionic", display_inch: "6.1", brightness_nits: "2000",
      ram_gb: "6", storage_gb: "128", camera_mp: "48", battery: "동영상 재생 최대 23시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "206", refresh_hz: "120"
    }
  },
  {
    id: "iphone-14-pro-max",
    canonicalName: "아이폰 14 프로 맥스",
    nameEn: "iPhone 14 Pro Max",
    aliases: ["아이폰 14 프로 맥스", "아이폰14 프로 맥스", "아이폰14프로맥스", "아이폰 14 프로맥스", "iphone 14 pro max", "14 프로 맥스", "14프로맥스"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111846",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 14 Pro Max", release_date: "2022년 9월", launch_price_krw: "189만원부터",
      os: "iOS 16", chipset: "A16 Bionic", display_inch: "6.7", brightness_nits: "2000",
      ram_gb: "6", storage_gb: "256", camera_mp: "48", battery: "동영상 재생 최대 29시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "240", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // iPhone 13 시리즈 (2021)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "iphone-13",
    canonicalName: "아이폰 13",
    nameEn: "iPhone 13",
    aliases: ["아이폰 13", "아이폰13", "iphone 13", "iphone13", "아이폰 13 기본"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111872",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 13", release_date: "2021년 9월", launch_price_krw: "109만원부터",
      os: "iOS 15", chipset: "A15 Bionic", display_inch: "6.1", brightness_nits: "800",
      ram_gb: "4", storage_gb: "128", camera_mp: "12", battery: "동영상 재생 최대 19시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "173", refresh_hz: "60"
    }
  },
  {
    id: "iphone-13-mini",
    canonicalName: "아이폰 13 미니",
    nameEn: "iPhone 13 mini",
    aliases: ["아이폰 13 미니", "아이폰13 미니", "아이폰13미니", "iphone 13 mini", "13 미니", "13미니"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111869",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 13 mini", release_date: "2021년 9월", launch_price_krw: "95만원부터",
      os: "iOS 15", chipset: "A15 Bionic", display_inch: "5.4", brightness_nits: "800",
      ram_gb: "4", storage_gb: "128", camera_mp: "12", battery: "동영상 재생 최대 17시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "140", refresh_hz: "60"
    }
  },
  {
    id: "iphone-13-pro",
    canonicalName: "아이폰 13 프로",
    nameEn: "iPhone 13 Pro",
    aliases: ["아이폰 13 프로", "아이폰13 프로", "아이폰13프로", "아이폰 13pro", "아이폰13pro", "iphone 13 pro", "13 프로", "13프로"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111877",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 13 Pro", release_date: "2021년 9월", launch_price_krw: "135만원부터",
      os: "iOS 15", chipset: "A15 Bionic", display_inch: "6.1", brightness_nits: "1000",
      ram_gb: "6", storage_gb: "128", camera_mp: "12", battery: "동영상 재생 최대 22시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "203", refresh_hz: "120"
    }
  },
  {
    id: "iphone-13-pro-max",
    canonicalName: "아이폰 13 프로 맥스",
    nameEn: "iPhone 13 Pro Max",
    aliases: ["아이폰 13 프로 맥스", "아이폰13 프로 맥스", "아이폰13프로맥스", "아이폰 13 프로맥스", "iphone 13 pro max", "13 프로 맥스", "13프로맥스"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111880",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 13 Pro Max", release_date: "2021년 9월", launch_price_krw: "149만원부터",
      os: "iOS 15", chipset: "A15 Bionic", display_inch: "6.7", brightness_nits: "1000",
      ram_gb: "6", storage_gb: "128", camera_mp: "12", battery: "동영상 재생 최대 28시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "240", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // iPhone 12 시리즈 (2020)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "iphone-12",
    canonicalName: "아이폰 12",
    nameEn: "iPhone 12",
    aliases: ["아이폰 12", "아이폰12", "iphone 12", "iphone12", "아이폰 12 기본"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111886",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 12", release_date: "2020년 10월", launch_price_krw: "109만원부터",
      os: "iOS 14", chipset: "A14 Bionic", display_inch: "6.1", brightness_nits: "625",
      ram_gb: "4", storage_gb: "64", camera_mp: "12", battery: "동영상 재생 최대 17시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "162", refresh_hz: "60"
    }
  },
  {
    id: "iphone-12-mini",
    canonicalName: "아이폰 12 미니",
    nameEn: "iPhone 12 mini",
    aliases: ["아이폰 12 미니", "아이폰12 미니", "아이폰12미니", "iphone 12 mini", "12 미니", "12미니"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111883",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 12 mini", release_date: "2020년 11월", launch_price_krw: "95만원부터",
      os: "iOS 14", chipset: "A14 Bionic", display_inch: "5.4", brightness_nits: "625",
      ram_gb: "4", storage_gb: "64", camera_mp: "12", battery: "동영상 재생 최대 15시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "135", refresh_hz: "60"
    }
  },
  {
    id: "iphone-12-pro",
    canonicalName: "아이폰 12 프로",
    nameEn: "iPhone 12 Pro",
    aliases: ["아이폰 12 프로", "아이폰12 프로", "아이폰12프로", "아이폰 12pro", "아이폰12pro", "iphone 12 pro", "12 프로", "12프로"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111889",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 12 Pro", release_date: "2020년 10월", launch_price_krw: "135만원부터",
      os: "iOS 14", chipset: "A14 Bionic", display_inch: "6.1", brightness_nits: "800",
      ram_gb: "6", storage_gb: "128", camera_mp: "12", battery: "동영상 재생 최대 17시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "187", refresh_hz: "60"
    }
  },
  {
    id: "iphone-12-pro-max",
    canonicalName: "아이폰 12 프로 맥스",
    nameEn: "iPhone 12 Pro Max",
    aliases: ["아이폰 12 프로 맥스", "아이폰12 프로 맥스", "아이폰12프로맥스", "아이폰 12 프로맥스", "iphone 12 pro max", "12 프로 맥스", "12프로맥스"],
    category: "smartphone",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111892",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 12 Pro Max", release_date: "2020년 11월", launch_price_krw: "149만원부터",
      os: "iOS 14", chipset: "A14 Bionic", display_inch: "6.7", brightness_nits: "800",
      ram_gb: "6", storage_gb: "128", camera_mp: "12", battery: "동영상 재생 최대 20시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP68", weight_g: "226", refresh_hz: "60"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S25 시리즈 (2025)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s25",
    canonicalName: "갤럭시 S25",
    nameEn: "Galaxy S25",
    aliases: ["갤럭시 s25", "갤럭시s25", "galaxy s25", "갤럭시 S25 기본", "s25"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s25/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S25", release_date: "2025년 2월", launch_price_krw: "115만 5천원부터",
      os: "Android 15 (One UI 7)", chipset: "Snapdragon 8 Elite for Galaxy", display_inch: "6.2", brightness_nits: "2600",
      ram_gb: "12", storage_gb: "256", camera_mp: "50", battery: "4000mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "162", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s25-plus",
    canonicalName: "갤럭시 S25+",
    nameEn: "Galaxy S25+",
    aliases: ["갤럭시 s25+", "갤럭시s25+", "갤럭시 s25 플러스", "갤럭시s25플러스", "galaxy s25+", "galaxy s25 plus", "s25+", "s25 플러스", "s25플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s25plus/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S25+", release_date: "2025년 2월", launch_price_krw: "135만 5천원부터",
      os: "Android 15 (One UI 7)", chipset: "Snapdragon 8 Elite for Galaxy", display_inch: "6.7", brightness_nits: "2600",
      ram_gb: "12", storage_gb: "256", camera_mp: "50", battery: "4900mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "190", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s25-ultra",
    canonicalName: "갤럭시 S25 울트라",
    nameEn: "Galaxy S25 Ultra",
    aliases: ["갤럭시 s25 울트라", "갤럭시s25울트라", "갤럭시s25 울트라", "galaxy s25 ultra", "s25 울트라", "s25울트라"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s25-ultra/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S25 Ultra", release_date: "2025년 2월", launch_price_krw: "175만 5천원부터",
      os: "Android 15 (One UI 7)", chipset: "Snapdragon 8 Elite for Galaxy", display_inch: "6.9", brightness_nits: "2600",
      ram_gb: "12", storage_gb: "256", camera_mp: "200", battery: "5000mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "218", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S24 시리즈 (2024)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s24",
    canonicalName: "갤럭시 S24",
    nameEn: "Galaxy S24",
    aliases: ["갤럭시 s24", "갤럭시s24", "galaxy s24", "갤럭시 S24 기본", "s24"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s24/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S24", release_date: "2024년 1월", launch_price_krw: "115만 5천원부터",
      os: "Android 14 (One UI 6.1)", chipset: "Exynos 2400", display_inch: "6.2", brightness_nits: "2600",
      ram_gb: "8", storage_gb: "256", camera_mp: "50", battery: "4000mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "167", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s24-plus",
    canonicalName: "갤럭시 S24+",
    nameEn: "Galaxy S24+",
    aliases: ["갤럭시 s24+", "갤럭시s24+", "갤럭시 s24 플러스", "갤럭시s24플러스", "galaxy s24+", "galaxy s24 plus", "s24+", "s24 플러스", "s24플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s24plus/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S24+", release_date: "2024년 1월", launch_price_krw: "135만 5천원부터",
      os: "Android 14 (One UI 6.1)", chipset: "Exynos 2400", display_inch: "6.7", brightness_nits: "2600",
      ram_gb: "12", storage_gb: "256", camera_mp: "50", battery: "4900mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "196", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s24-ultra",
    canonicalName: "갤럭시 S24 울트라",
    nameEn: "Galaxy S24 Ultra",
    aliases: ["갤럭시 s24 울트라", "갤럭시s24울트라", "갤럭시s24 울트라", "galaxy s24 ultra", "s24 울트라", "s24울트라"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s24-ultra/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S24 Ultra", release_date: "2024년 1월", launch_price_krw: "169만 8천원부터",
      os: "Android 14 (One UI 6.1)", chipset: "Snapdragon 8 Gen 3 for Galaxy", display_inch: "6.8", brightness_nits: "2600",
      ram_gb: "12", storage_gb: "256", camera_mp: "200", battery: "5000mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "232", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S23 시리즈 (2023)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s23",
    canonicalName: "갤럭시 S23",
    nameEn: "Galaxy S23",
    aliases: ["갤럭시 s23", "갤럭시s23", "galaxy s23", "s23"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s23/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S23", release_date: "2023년 2월", launch_price_krw: "115만원부터",
      os: "Android 13 (One UI 5.1)", chipset: "Snapdragon 8 Gen 2 for Galaxy", display_inch: "6.1", brightness_nits: "1750",
      ram_gb: "8", storage_gb: "256", camera_mp: "50", battery: "3900mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "168", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s23-ultra",
    canonicalName: "갤럭시 S23 울트라",
    nameEn: "Galaxy S23 Ultra",
    aliases: ["갤럭시 s23 울트라", "갤럭시s23울트라", "galaxy s23 ultra", "s23 울트라", "s23울트라"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s23-ultra/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S23 Ultra", release_date: "2023년 2월", launch_price_krw: "159만 9천원부터",
      os: "Android 13 (One UI 5.1)", chipset: "Snapdragon 8 Gen 2 for Galaxy", display_inch: "6.8", brightness_nits: "1750",
      ram_gb: "12", storage_gb: "256", camera_mp: "200", battery: "5000mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "234", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S22 시리즈 (2022)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s22",
    canonicalName: "갤럭시 S22",
    nameEn: "Galaxy S22",
    aliases: ["갤럭시 s22", "갤럭시s22", "galaxy s22", "s22"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s22/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S22", release_date: "2022년 2월", launch_price_krw: "99만 9천원부터",
      os: "Android 12 (One UI 4.1)", chipset: "Snapdragon 8 Gen 1", display_inch: "6.1", brightness_nits: "1300",
      ram_gb: "8", storage_gb: "256", camera_mp: "50", battery: "3700mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "167", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s22-ultra",
    canonicalName: "갤럭시 S22 울트라",
    nameEn: "Galaxy S22 Ultra",
    aliases: ["갤럭시 s22 울트라", "갤럭시s22울트라", "galaxy s22 ultra", "s22 울트라", "s22울트라"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s22-ultra/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S22 Ultra", release_date: "2022년 2월", launch_price_krw: "145만 2천원부터",
      os: "Android 12 (One UI 4.1)", chipset: "Snapdragon 8 Gen 1", display_inch: "6.8", brightness_nits: "1750",
      ram_gb: "12", storage_gb: "256", camera_mp: "108", battery: "5000mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "228", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S21 시리즈 (2021)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s21",
    canonicalName: "갤럭시 S21",
    nameEn: "Galaxy S21",
    aliases: ["갤럭시 s21", "갤럭시s21", "galaxy s21", "s21"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s21-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S21 5G", release_date: "2021년 1월", launch_price_krw: "99만 9천원부터",
      os: "Android 11 (One UI 3.1)", chipset: "Exynos 2100", display_inch: "6.2", brightness_nits: "1300",
      ram_gb: "8", storage_gb: "256", camera_mp: "12", battery: "4000mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "169", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s21-ultra",
    canonicalName: "갤럭시 S21 울트라",
    nameEn: "Galaxy S21 Ultra",
    aliases: ["갤럭시 s21 울트라", "갤럭시s21울트라", "galaxy s21 ultra", "s21 울트라", "s21울트라"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s21-ultra-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S21 Ultra 5G", release_date: "2021년 1월", launch_price_krw: "145만 2천원부터",
      os: "Android 11 (One UI 3.1)", chipset: "Exynos 2100", display_inch: "6.8", brightness_nits: "1500",
      ram_gb: "12", storage_gb: "256", camera_mp: "108", battery: "5000mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "227", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy Z 시리즈 (폴더블)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-z-fold6",
    canonicalName: "갤럭시 Z 폴드6",
    nameEn: "Galaxy Z Fold6",
    aliases: ["갤럭시 z 폴드6", "갤럭시 z 폴드 6", "갤럭시z폴드6", "갤럭시 폴드6", "갤럭시폴드6", "galaxy z fold6", "galaxy z fold 6", "galaxy fold 6", "폴드6", "fold6", "z폴드6"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-fold6/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Fold6", release_date: "2024년 7월", launch_price_krw: "222만 5천원부터",
      os: "Android 14 (One UI 6.1.1)", chipset: "Snapdragon 8 Gen 3 for Galaxy", display_inch: "7.6", brightness_nits: "2600",
      ram_gb: "12", storage_gb: "256", camera_mp: "50", battery: "4400mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP48", weight_g: "239", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-z-flip6",
    canonicalName: "갤럭시 Z 플립6",
    nameEn: "Galaxy Z Flip6",
    aliases: ["갤럭시 z 플립6", "갤럭시 z 플립 6", "갤럭시z플립6", "갤럭시 플립6", "갤럭시플립6", "galaxy z flip6", "galaxy z flip 6", "galaxy flip 6", "플립6", "flip6", "z플립6"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-flip6/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Flip6", release_date: "2024년 7월", launch_price_krw: "148만 5천원부터",
      os: "Android 14 (One UI 6.1.1)", chipset: "Snapdragon 8 Gen 3 for Galaxy", display_inch: "6.7", brightness_nits: "2600",
      ram_gb: "12", storage_gb: "256", camera_mp: "50", battery: "4000mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP48", weight_g: "187", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-z-fold5",
    canonicalName: "갤럭시 Z 폴드5",
    nameEn: "Galaxy Z Fold5",
    aliases: ["갤럭시 z 폴드5", "갤럭시 z 폴드 5", "갤럭시z폴드5", "갤럭시 폴드5", "galaxy z fold5", "galaxy z fold 5", "폴드5", "fold5", "z폴드5"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-fold5/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Fold5", release_date: "2023년 8월", launch_price_krw: "209만 8천원부터",
      os: "Android 13 (One UI 5.1.1)", chipset: "Snapdragon 8 Gen 2 for Galaxy", display_inch: "7.6", brightness_nits: "1750",
      ram_gb: "12", storage_gb: "256", camera_mp: "50", battery: "4400mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IPX8", weight_g: "253", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-z-flip5",
    canonicalName: "갤럭시 Z 플립5",
    nameEn: "Galaxy Z Flip5",
    aliases: ["갤럭시 z 플립5", "갤럭시 z 플립 5", "갤럭시z플립5", "갤럭시 플립5", "galaxy z flip5", "galaxy z flip 5", "플립5", "flip5", "z플립5"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-flip5/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Flip5", release_date: "2023년 8월", launch_price_krw: "139만 7천원부터",
      os: "Android 13 (One UI 5.1.1)", chipset: "Snapdragon 8 Gen 2 for Galaxy", display_inch: "6.7", brightness_nits: "1750",
      ram_gb: "8", storage_gb: "256", camera_mp: "50", battery: "3700mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IPX8", weight_g: "187", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S20 시리즈 (2020)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s20",
    canonicalName: "갤럭시 S20",
    nameEn: "Galaxy S20",
    aliases: ["갤럭시 s20", "갤럭시s20", "galaxy s20", "s20"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s20-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S20 5G", release_date: "2020년 2월", launch_price_krw: "124만 3천원부터",
      os: "Android 10 (One UI 2.1)", chipset: "Exynos 990", display_inch: "6.2", brightness_nits: "1200",
      ram_gb: "12", storage_gb: "128", camera_mp: "12", battery: "4000mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "163", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s20-ultra",
    canonicalName: "갤럭시 S20 울트라",
    nameEn: "Galaxy S20 Ultra",
    aliases: ["갤럭시 s20 울트라", "갤럭시s20울트라", "galaxy s20 ultra", "s20 울트라", "s20울트라"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s20-ultra-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S20 Ultra 5G", release_date: "2020년 2월", launch_price_krw: "159만 5천원부터",
      os: "Android 10 (One UI 2.1)", chipset: "Exynos 990", display_inch: "6.9", brightness_nits: "1400",
      ram_gb: "12", storage_gb: "256", camera_mp: "108", battery: "5000mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "222", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // iPhone SE 3세대 / 16e
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "iphone-se-3",
    canonicalName: "아이폰 SE 3세대",
    nameEn: "iPhone SE (3rd generation)",
    aliases: ["아이폰 se 3세대", "아이폰se3세대", "아이폰 se3", "아이폰se3", "iphone se 3", "iphone se3", "iphone se 3세대", "se 3세대", "se3세대", "아이폰 se"],
    category: "smartphone",
    country: "KR",
    source: "https://www.apple.com/kr/iphone-se/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone SE (3세대)", release_date: "2022년 3월", launch_price_krw: "65만원부터",
      os: "iOS 15", chipset: "A15 Bionic", display_inch: "4.7", brightness_nits: "625",
      ram_gb: "4", storage_gb: "64", camera_mp: "12", battery: "동영상 재생 최대 15시간",
      charging: "20W 유선, 15W MagSafe 무선", water_resist: "IP67", weight_g: "144", refresh_hz: "60"
    }
  },
  {
    id: "iphone-16e",
    canonicalName: "아이폰 16e",
    nameEn: "iPhone 16e",
    aliases: ["아이폰 16e", "아이폰16e", "iphone 16e", "iphone16e", "아이폰 se 4세대", "아이폰 se4"],
    category: "smartphone",
    country: "KR",
    source: "https://www.apple.com/kr/iphone-16e/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPhone 16e", release_date: "2025년 2월", launch_price_krw: "79만원부터",
      os: "iOS 18", chipset: "A16 Bionic", display_inch: "6.1", brightness_nits: "1200",
      ram_gb: "8", storage_gb: "128", camera_mp: "48", battery: "동영상 재생 최대 18시간",
      charging: "20W 유선, 25W MagSafe 무선", water_resist: "IP68", weight_g: "167", refresh_hz: "60"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S20 시리즈 추가 (2020)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s20-plus",
    canonicalName: "갤럭시 S20+",
    nameEn: "Galaxy S20+",
    aliases: ["갤럭시 s20+", "갤럭시s20+", "galaxy s20+", "galaxy s20 plus", "s20+", "s20플러스", "갤럭시 s20 플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s20-plus-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S20+ 5G", release_date: "2020년 2월", launch_price_krw: "135만 3천원부터",
      os: "Android 10 (One UI 2.1)", chipset: "Exynos 990", display_inch: "6.7", brightness_nits: "1300",
      ram_gb: "12", storage_gb: "128", camera_mp: "64", battery: "4500mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "186", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s20-fe",
    canonicalName: "갤럭시 S20 FE",
    nameEn: "Galaxy S20 FE",
    aliases: ["갤럭시 s20 fe", "갤럭시s20fe", "galaxy s20 fe", "s20 fe", "s20fe", "갤럭시 s20 팬에디션"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s20-fe-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S20 FE 5G", release_date: "2020년 10월", launch_price_krw: "89만 9천원부터",
      os: "Android 10 (One UI 2.5)", chipset: "Exynos 990", display_inch: "6.5", brightness_nits: "1200",
      ram_gb: "6", storage_gb: "128", camera_mp: "12", battery: "4500mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "190", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S21 시리즈 추가 (2021)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s21-plus",
    canonicalName: "갤럭시 S21+",
    nameEn: "Galaxy S21+",
    aliases: ["갤럭시 s21+", "갤럭시s21+", "galaxy s21+", "galaxy s21 plus", "s21+", "s21플러스", "갤럭시 s21 플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s21-plus-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S21+ 5G", release_date: "2021년 1월", launch_price_krw: "135만 3천원부터",
      os: "Android 11 (One UI 3.1)", chipset: "Exynos 2100", display_inch: "6.7", brightness_nits: "1300",
      ram_gb: "8", storage_gb: "128", camera_mp: "12", battery: "4800mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "200", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s21-fe",
    canonicalName: "갤럭시 S21 FE",
    nameEn: "Galaxy S21 FE",
    aliases: ["갤럭시 s21 fe", "갤럭시s21fe", "galaxy s21 fe", "s21 fe", "s21fe", "갤럭시 s21 팬에디션"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s21-fe-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S21 FE 5G", release_date: "2022년 1월", launch_price_krw: "89만 9천원부터",
      os: "Android 12 (One UI 4.0)", chipset: "Snapdragon 888", display_inch: "6.4", brightness_nits: "1200",
      ram_gb: "6", storage_gb: "128", camera_mp: "12", battery: "4500mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "177", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S22 시리즈 추가 (2022)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s22-plus",
    canonicalName: "갤럭시 S22+",
    nameEn: "Galaxy S22+",
    aliases: ["갤럭시 s22+", "갤럭시s22+", "galaxy s22+", "galaxy s22 plus", "s22+", "s22플러스", "갤럭시 s22 플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s22-plus-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S22+ 5G", release_date: "2022년 2월", launch_price_krw: "135만 3천원부터",
      os: "Android 12 (One UI 4.1)", chipset: "Exynos 2200", display_inch: "6.6", brightness_nits: "1750",
      ram_gb: "8", storage_gb: "128", camera_mp: "50", battery: "4500mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "196", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S23 시리즈 추가 (2023)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s23-plus",
    canonicalName: "갤럭시 S23+",
    nameEn: "Galaxy S23+",
    aliases: ["갤럭시 s23+", "갤럭시s23+", "galaxy s23+", "galaxy s23 plus", "s23+", "s23플러스", "갤럭시 s23 플러스"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s23-plus-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S23+ 5G", release_date: "2023년 2월", launch_price_krw: "135만 3천원부터",
      os: "Android 13 (One UI 5.1)", chipset: "Snapdragon 8 Gen 2", display_inch: "6.6", brightness_nits: "1750",
      ram_gb: "8", storage_gb: "256", camera_mp: "50", battery: "4700mAh",
      charging: "45W 유선, 15W 무선", water_resist: "IP68", weight_g: "195", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s23-fe",
    canonicalName: "갤럭시 S23 FE",
    nameEn: "Galaxy S23 FE",
    aliases: ["갤럭시 s23 fe", "갤럭시s23fe", "galaxy s23 fe", "s23 fe", "s23fe", "갤럭시 s23 팬에디션"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s23-fe-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S23 FE 5G", release_date: "2023년 10월", launch_price_krw: "79만 9천원부터",
      os: "Android 14 (One UI 6.0)", chipset: "Exynos 2200", display_inch: "6.4", brightness_nits: "1200",
      ram_gb: "8", storage_gb: "128", camera_mp: "50", battery: "4500mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "209", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy S24 FE / S25 Edge (2024–2025)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-s24-fe",
    canonicalName: "갤럭시 S24 FE",
    nameEn: "Galaxy S24 FE",
    aliases: ["갤럭시 s24 fe", "갤럭시s24fe", "galaxy s24 fe", "s24 fe", "s24fe", "갤럭시 s24 팬에디션"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s24-fe-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S24 FE 5G", release_date: "2024년 10월", launch_price_krw: "89만 9천원부터",
      os: "Android 14 (One UI 7.0)", chipset: "Exynos 2500", display_inch: "6.7", brightness_nits: "1900",
      ram_gb: "8", storage_gb: "128", camera_mp: "50", battery: "4700mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "213", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-s25-edge",
    canonicalName: "갤럭시 S25 엣지",
    nameEn: "Galaxy S25 Edge",
    aliases: ["갤럭시 s25 엣지", "갤럭시s25엣지", "galaxy s25 edge", "s25 엣지", "s25edge", "s25 edge"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-s25-edge/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy S25 Edge", release_date: "2025년 5월", launch_price_krw: "169만 4천원부터",
      os: "Android 15 (One UI 7.0)", chipset: "Snapdragon 8 Elite", display_inch: "6.7", brightness_nits: "2600",
      ram_gb: "12", storage_gb: "256", camera_mp: "200", battery: "3900mAh",
      charging: "25W 유선, 15W 무선", water_resist: "IP68", weight_g: "163", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy Z Fold 시리즈 (2020–2022)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-z-fold2",
    canonicalName: "갤럭시 Z 폴드2",
    nameEn: "Galaxy Z Fold2",
    aliases: ["갤럭시 z 폴드2", "갤럭시z폴드2", "galaxy z fold2", "galaxy z fold 2", "z폴드2", "z 폴드2"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-fold2-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Fold2 5G", release_date: "2020년 9월", launch_price_krw: "239만 8천원부터",
      os: "Android 10 (One UI 2.5)", chipset: "Snapdragon 865+", display_inch: "7.6 (메인) / 6.23 (커버)",
      brightness_nits: "1200", ram_gb: "12", storage_gb: "256", camera_mp: "12",
      battery: "4500mAh", charging: "25W 유선, 11W 무선", water_resist: "IPX8", weight_g: "282", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-z-fold3",
    canonicalName: "갤럭시 Z 폴드3",
    nameEn: "Galaxy Z Fold3",
    aliases: ["갤럭시 z 폴드3", "갤럭시z폴드3", "galaxy z fold3", "galaxy z fold 3", "z폴드3", "z 폴드3"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-fold3-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Fold3 5G", release_date: "2021년 8월", launch_price_krw: "199만 8천원부터",
      os: "Android 11 (One UI 3.1.1)", chipset: "Snapdragon 888", display_inch: "7.6 (메인) / 6.2 (커버)",
      brightness_nits: "1200", ram_gb: "12", storage_gb: "256", camera_mp: "12",
      battery: "4400mAh", charging: "25W 유선, 10W 무선", water_resist: "IPX8", weight_g: "271", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-z-fold4",
    canonicalName: "갤럭시 Z 폴드4",
    nameEn: "Galaxy Z Fold4",
    aliases: ["갤럭시 z 폴드4", "갤럭시z폴드4", "galaxy z fold4", "galaxy z fold 4", "z폴드4", "z 폴드4"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-fold4-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Fold4 5G", release_date: "2022년 8월", launch_price_krw: "199만 4천원부터",
      os: "Android 12 (One UI 4.1.1)", chipset: "Snapdragon 8+ Gen 1", display_inch: "7.6 (메인) / 6.2 (커버)",
      brightness_nits: "1200", ram_gb: "12", storage_gb: "256", camera_mp: "50",
      battery: "4400mAh", charging: "25W 유선, 15W 무선", water_resist: "IPX8", weight_g: "263", refresh_hz: "120"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Galaxy Z Flip 시리즈 (2020–2022)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-z-flip",
    canonicalName: "갤럭시 Z 플립",
    nameEn: "Galaxy Z Flip",
    aliases: ["갤럭시 z 플립", "갤럭시z플립", "galaxy z flip", "z플립", "z 플립", "갤럭시 z 플립 2020"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-flip/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Flip", release_date: "2020년 2월", launch_price_krw: "165만원부터",
      os: "Android 10 (One UI 2.0)", chipset: "Snapdragon 855+", display_inch: "6.7 (메인) / 1.1 (커버)",
      brightness_nits: "1100", ram_gb: "8", storage_gb: "256", camera_mp: "12",
      battery: "3300mAh", charging: "15W 유선", water_resist: "없음", weight_g: "183", refresh_hz: "60"
    }
  },
  {
    id: "galaxy-z-flip3",
    canonicalName: "갤럭시 Z 플립3",
    nameEn: "Galaxy Z Flip3",
    aliases: ["갤럭시 z 플립3", "갤럭시z플립3", "galaxy z flip3", "galaxy z flip 3", "z플립3", "z 플립3"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-flip3-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Flip3 5G", release_date: "2021년 8월", launch_price_krw: "135만 3천원부터",
      os: "Android 11 (One UI 3.1.1)", chipset: "Snapdragon 888", display_inch: "6.7 (메인) / 1.9 (커버)",
      brightness_nits: "1200", ram_gb: "8", storage_gb: "128", camera_mp: "12",
      battery: "3300mAh", charging: "15W 유선, 10W 무선", water_resist: "IPX8", weight_g: "183", refresh_hz: "120"
    }
  },
  {
    id: "galaxy-z-flip4",
    canonicalName: "갤럭시 Z 플립4",
    nameEn: "Galaxy Z Flip4",
    aliases: ["갤럭시 z 플립4", "갤럭시z플립4", "galaxy z flip4", "galaxy z flip 4", "z플립4", "z 플립4"],
    category: "smartphone",
    country: "KR",
    source: "https://www.samsung.com/sec/smartphones/galaxy-z-flip4-5g/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Z Flip4 5G", release_date: "2022년 8월", launch_price_krw: "135만 3천원부터",
      os: "Android 12 (One UI 4.1.1)", chipset: "Snapdragon 8+ Gen 1", display_inch: "6.7 (메인) / 1.9 (커버)",
      brightness_nits: "1200", ram_gb: "8", storage_gb: "128", camera_mp: "12",
      battery: "3700mAh", charging: "25W 유선, 15W 무선", water_resist: "IPX8", weight_g: "187", refresh_hz: "120"
    }
  },
];
