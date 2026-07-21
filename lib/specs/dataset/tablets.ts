import type { VerifiedProduct } from "./types";

/**
 * 태블릿 검증 데이터셋 — 완전 하드코딩 (2020년 이후 주요 모델).
 *
 * 출처: 각 제조사 공식 페이지 (Apple KR, Samsung SEC). 기본 구성(Wi-Fi) 기준.
 * canonicalName=한국어, nameEn=영어(검색·표시).
 *
 * 필드: battery_wh=공식 표기(텍스트), stylus=펜 지원, cellular=연결 옵션.
 */
export const tablets: VerifiedProduct[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // Apple iPad Pro (M4, 2024)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "ipad-pro-13-m4",
    canonicalName: "아이패드 프로 13 M4",
    nameEn: "iPad Pro 13 M4",
    aliases: [
      "아이패드 프로 13 m4", "아이패드프로 13 m4", "아이패드 프로 13", "아이패드프로13",
      "ipad pro 13 m4", "ipad pro 13", "아이패드 프로 m4", "아이패드 프로 12.9", "ipad pro 12.9"
    ],
    category: "tablet",
    country: "KR",
    source: "https://www.apple.com/kr/ipad-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Pro 13형 (M4)", os: "iPadOS", chipset: "Apple M4", display_inch: "13",
      resolution: "2752×2064", refresh_hz: "120", storage_gb: "256", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (38.99Wh)", stylus: "Apple Pencil Pro 지원", weight_g: "579",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "189만 9천원부터"
    }
  },
  {
    id: "ipad-pro-11-m4",
    canonicalName: "아이패드 프로 11 M4",
    nameEn: "iPad Pro 11 M4",
    aliases: ["아이패드 프로 11 m4", "아이패드프로 11 m4", "아이패드 프로 11", "아이패드프로11", "ipad pro 11 m4", "ipad pro 11"],
    category: "tablet",
    country: "KR",
    source: "https://www.apple.com/kr/ipad-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Pro 11형 (M4)", os: "iPadOS", chipset: "Apple M4", display_inch: "11",
      resolution: "2420×1668", refresh_hz: "120", storage_gb: "256", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (31.29Wh)", stylus: "Apple Pencil Pro 지원", weight_g: "444",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "149만 9천원부터"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Apple iPad Air (M2, 2024)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "ipad-air-13-m2",
    canonicalName: "아이패드 에어 13 M2",
    nameEn: "iPad Air 13 M2",
    aliases: ["아이패드 에어 13 m2", "아이패드에어 13 m2", "아이패드 에어 13", "ipad air 13 m2", "ipad air 13"],
    category: "tablet",
    country: "KR",
    source: "https://www.apple.com/kr/ipad-air/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Air 13형 (M2)", os: "iPadOS", chipset: "Apple M2", display_inch: "13",
      resolution: "2732×2048", refresh_hz: "60", storage_gb: "128", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (36.59Wh)", stylus: "Apple Pencil Pro 지원", weight_g: "617",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "114만 9천원부터"
    }
  },
  {
    id: "ipad-air-11-m2",
    canonicalName: "아이패드 에어 11 M2",
    nameEn: "iPad Air 11 M2",
    aliases: [
      "아이패드 에어 11 m2", "아이패드에어 11 m2", "아이패드 에어 11", "ipad air 11 m2", "ipad air 11",
      "아이패드 에어 m2", "아이패드 에어", "아이패드에어", "ipad air m2", "ipad air"
    ],
    category: "tablet",
    country: "KR",
    source: "https://www.apple.com/kr/ipad-air/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Air 11형 (M2)", os: "iPadOS", chipset: "Apple M2", display_inch: "11",
      resolution: "2360×1640", refresh_hz: "60", storage_gb: "128", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (28.93Wh)", stylus: "Apple Pencil Pro 지원", weight_g: "462",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "92만 9천원부터"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Apple iPad / iPad mini
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "ipad-10",
    canonicalName: "아이패드 10세대",
    nameEn: "iPad (10th gen)",
    aliases: ["아이패드 10세대", "아이패드10세대", "아이패드 10", "아이패드10", "ipad 10", "ipad 10th", "아이패드 기본", "아이패드"],
    category: "tablet",
    country: "KR",
    source: "https://www.apple.com/kr/ipad-10.9/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad (10세대)", os: "iPadOS", chipset: "A14 Bionic", display_inch: "10.9",
      resolution: "2360×1640", refresh_hz: "60", storage_gb: "64", ram_gb: "4",
      battery_wh: "동영상 재생 최대 10시간 (28.6Wh)", stylus: "Apple Pencil (USB-C), 1세대 지원", weight_g: "477",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "67만 9천원부터"
    }
  },
  {
    id: "ipad-mini-7",
    canonicalName: "아이패드 미니 7세대",
    nameEn: "iPad mini 7",
    aliases: ["아이패드 미니 7", "아이패드미니7", "아이패드 미니 7세대", "ipad mini 7", "아이패드 미니", "아이패드미니", "ipad mini"],
    category: "tablet",
    country: "KR",
    source: "https://www.apple.com/kr/ipad-mini/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad mini (A17 Pro)", os: "iPadOS", chipset: "A17 Pro", display_inch: "8.3",
      resolution: "2266×1488", refresh_hz: "60", storage_gb: "128", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (19.3Wh)", stylus: "Apple Pencil Pro 지원", weight_g: "293",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "74만 9천원부터"
    }
  },
  {
    id: "ipad-mini-6",
    canonicalName: "아이패드 미니 6세대",
    nameEn: "iPad mini 6",
    aliases: ["아이패드 미니 6", "아이패드미니6", "아이패드 미니 6세대", "ipad mini 6"],
    category: "tablet",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111864",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad mini (6세대)", os: "iPadOS", chipset: "A15 Bionic", display_inch: "8.3",
      resolution: "2266×1488", refresh_hz: "60", storage_gb: "64", ram_gb: "4",
      battery_wh: "동영상 재생 최대 10시간 (19.3Wh)", stylus: "Apple Pencil 2세대 지원", weight_g: "293",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "71만 9천원부터"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Samsung Galaxy Tab S10 (2024)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-tab-s10-ultra",
    canonicalName: "갤럭시 탭 S10 울트라",
    nameEn: "Galaxy Tab S10 Ultra",
    aliases: ["갤럭시 탭 s10 울트라", "갤럭시탭 s10 울트라", "갤럭시탭s10울트라", "galaxy tab s10 ultra", "탭 s10 울트라", "tab s10 ultra"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s10/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S10 Ultra", os: "Android 14 (One UI 6.1)", chipset: "MediaTek Dimensity 9300+", display_inch: "14.6",
      resolution: "2960×1848", refresh_hz: "120", storage_gb: "256", ram_gb: "12",
      battery_wh: "11200mAh", stylus: "S펜 포함", weight_g: "718",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "149만 9천원부터"
    }
  },
  {
    id: "galaxy-tab-s10-plus",
    canonicalName: "갤럭시 탭 S10+",
    nameEn: "Galaxy Tab S10+",
    aliases: ["갤럭시 탭 s10+", "갤럭시탭 s10+", "갤럭시탭s10플러스", "갤럭시 탭 s10 플러스", "galaxy tab s10+", "galaxy tab s10 plus", "탭 s10 플러스"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s10/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S10+", os: "Android 14 (One UI 6.1)", chipset: "MediaTek Dimensity 9300+", display_inch: "12.4",
      resolution: "2800×1752", refresh_hz: "120", storage_gb: "256", ram_gb: "12",
      battery_wh: "10090mAh", stylus: "S펜 포함", weight_g: "571",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "118만 9천원부터"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Samsung Galaxy Tab S9 (2023)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-tab-s9-ultra",
    canonicalName: "갤럭시 탭 S9 울트라",
    nameEn: "Galaxy Tab S9 Ultra",
    aliases: ["갤럭시 탭 s9 울트라", "갤럭시탭 s9 울트라", "갤럭시탭s9울트라", "galaxy tab s9 ultra", "탭 s9 울트라", "tab s9 ultra"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s9/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S9 Ultra", os: "Android 13 (One UI 5.1.1)", chipset: "Snapdragon 8 Gen 2 for Galaxy", display_inch: "14.6",
      resolution: "2960×1848", refresh_hz: "120", storage_gb: "256", ram_gb: "12",
      battery_wh: "11200mAh", stylus: "S펜 포함", weight_g: "732",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "149만 9천원부터"
    }
  },
  {
    id: "galaxy-tab-s9-plus",
    canonicalName: "갤럭시 탭 S9+",
    nameEn: "Galaxy Tab S9+",
    aliases: ["갤럭시 탭 s9+", "갤럭시탭 s9+", "갤럭시탭s9플러스", "갤럭시 탭 s9 플러스", "galaxy tab s9+", "galaxy tab s9 plus"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s9/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S9+", os: "Android 13 (One UI 5.1.1)", chipset: "Snapdragon 8 Gen 2 for Galaxy", display_inch: "12.4",
      resolution: "2800×1752", refresh_hz: "120", storage_gb: "256", ram_gb: "12",
      battery_wh: "10090mAh", stylus: "S펜 포함", weight_g: "581",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "124만 9천원부터"
    }
  },
  {
    id: "galaxy-tab-s9",
    canonicalName: "갤럭시 탭 S9",
    nameEn: "Galaxy Tab S9",
    aliases: ["갤럭시 탭 s9", "갤럭시탭 s9", "갤럭시탭s9", "galaxy tab s9", "탭 s9", "tab s9", "갤럭시 탭", "갤럭시탭", "galaxy tab"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s9/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S9", os: "Android 13 (One UI 5.1.1)", chipset: "Snapdragon 8 Gen 2 for Galaxy", display_inch: "11",
      resolution: "2560×1600", refresh_hz: "120", storage_gb: "128", ram_gb: "8",
      battery_wh: "8400mAh", stylus: "S펜 포함", weight_g: "498",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "99만 9천원부터"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Apple iPad Pro M1 / M2 (2021–2022)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "ipad-pro-11-m1",
    canonicalName: "아이패드 프로 11 M1",
    nameEn: "iPad Pro 11 M1",
    aliases: ["아이패드 프로 11 m1", "아이패드프로 11 m1", "아이패드 프로 11 2021", "ipad pro 11 m1", "ipad pro 11 2021"],
    category: "tablet",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111901",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Pro 11형 (3세대, M1)", os: "iPadOS", chipset: "Apple M1", display_inch: "11",
      resolution: "2388×1668", refresh_hz: "120", storage_gb: "128", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (28.65Wh)", stylus: "Apple Pencil 2세대 지원", weight_g: "466",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "119만 9천원부터"
    }
  },
  {
    id: "ipad-pro-13-m1",
    canonicalName: "아이패드 프로 12.9 M1",
    nameEn: "iPad Pro 12.9 M1",
    aliases: [
      "아이패드 프로 12.9 m1", "아이패드프로 12.9 m1", "아이패드 프로 12.9 2021", "ipad pro 12.9 m1", "ipad pro 12.9 2021",
      "아이패드 프로 13 m1", "아이패드프로13m1"
    ],
    category: "tablet",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111901",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Pro 12.9형 (5세대, M1)", os: "iPadOS", chipset: "Apple M1", display_inch: "12.9",
      resolution: "2732×2048", refresh_hz: "120", storage_gb: "128", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (40.88Wh)", stylus: "Apple Pencil 2세대 지원", weight_g: "682",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "149만 9천원부터"
    }
  },
  {
    id: "ipad-pro-11-m2",
    canonicalName: "아이패드 프로 11 M2",
    nameEn: "iPad Pro 11 M2",
    aliases: ["아이패드 프로 11 m2", "아이패드프로 11 m2", "아이패드 프로 11 2022", "ipad pro 11 m2", "ipad pro 11 2022"],
    category: "tablet",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111901",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Pro 11형 (4세대, M2)", os: "iPadOS", chipset: "Apple M2", display_inch: "11",
      resolution: "2388×1668", refresh_hz: "120", storage_gb: "128", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (28.65Wh)", stylus: "Apple Pencil 2세대, 호버 지원", weight_g: "466",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "129만 9천원부터"
    }
  },
  {
    id: "ipad-pro-13-m2",
    canonicalName: "아이패드 프로 12.9 M2",
    nameEn: "iPad Pro 12.9 M2",
    aliases: [
      "아이패드 프로 12.9 m2", "아이패드프로 12.9 m2", "아이패드 프로 12.9 2022", "ipad pro 12.9 m2", "ipad pro 12.9 2022",
      "아이패드 프로 13 m2", "아이패드프로13m2"
    ],
    category: "tablet",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111901",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Pro 12.9형 (6세대, M2)", os: "iPadOS", chipset: "Apple M2", display_inch: "12.9",
      resolution: "2732×2048", refresh_hz: "120", storage_gb: "128", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (40.88Wh)", stylus: "Apple Pencil 2세대, 호버 지원", weight_g: "682",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "159만 9천원부터"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Apple iPad Air / iPad (일반) 추가
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "ipad-air-5-m1",
    canonicalName: "아이패드 에어 5세대 M1",
    nameEn: "iPad Air 5th Gen M1",
    aliases: [
      "아이패드 에어 5세대", "아이패드에어5세대", "아이패드 에어 m1", "아이패드에어m1",
      "ipad air 5", "ipad air 5th gen", "ipad air m1", "아이패드 에어 2022"
    ],
    category: "tablet",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111901",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad Air 5세대 (M1)", os: "iPadOS", chipset: "Apple M1", display_inch: "10.9",
      resolution: "2360×1640", refresh_hz: "60", storage_gb: "64", ram_gb: "8",
      battery_wh: "동영상 재생 최대 10시간 (28.65Wh)", stylus: "Apple Pencil 2세대 지원", weight_g: "461",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "99만원부터"
    }
  },
  {
    id: "ipad-9",
    canonicalName: "아이패드 9세대",
    nameEn: "iPad (9th generation)",
    aliases: [
      "아이패드 9세대", "아이패드9세대", "아이패드 9", "아이패드9", "ipad 9", "ipad 9th gen",
      "ipad 9세대", "아이패드 2021", "아이패드2021"
    ],
    category: "tablet",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111901",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "iPad 9세대", os: "iPadOS", chipset: "Apple A13 Bionic", display_inch: "10.2",
      resolution: "2160×1620", refresh_hz: "60", storage_gb: "64", ram_gb: "3",
      battery_wh: "동영상 재생 최대 10시간 (32.4Wh)", stylus: "Apple Pencil 1세대 지원", weight_g: "487",
      cellular: "Wi-Fi (셀룰러 옵션)", launch_price_krw: "49만 9천원부터"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Samsung Galaxy Tab S7 시리즈 (2020)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-tab-s7",
    canonicalName: "갤럭시 탭 S7",
    nameEn: "Galaxy Tab S7",
    aliases: ["갤럭시 탭 s7", "갤럭시탭s7", "galaxy tab s7", "탭 s7", "탭s7"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s7/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S7", os: "Android 10 (One UI 2.5)", chipset: "Snapdragon 865+", display_inch: "11",
      resolution: "2560×1600", refresh_hz: "120", storage_gb: "128", ram_gb: "6",
      battery_wh: "8000mAh", stylus: "S펜 포함", weight_g: "498",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "89만 9천원부터"
    }
  },
  {
    id: "galaxy-tab-s7-plus",
    canonicalName: "갤럭시 탭 S7+",
    nameEn: "Galaxy Tab S7+",
    aliases: ["갤럭시 탭 s7+", "갤럭시탭s7+", "galaxy tab s7+", "galaxy tab s7 plus", "탭 s7+", "탭s7+"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s7-plus/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S7+", os: "Android 10 (One UI 2.5)", chipset: "Snapdragon 865+", display_inch: "12.4",
      resolution: "2800×1752", refresh_hz: "120", storage_gb: "128", ram_gb: "6",
      battery_wh: "10090mAh", stylus: "S펜 포함", weight_g: "575",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "119만 9천원부터"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Samsung Galaxy Tab S8 시리즈 (2022)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-tab-s8",
    canonicalName: "갤럭시 탭 S8",
    nameEn: "Galaxy Tab S8",
    aliases: ["갤럭시 탭 s8", "갤럭시탭s8", "galaxy tab s8", "탭 s8", "탭s8"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s8/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S8", os: "Android 12 (One UI 4.1)", chipset: "Snapdragon 8 Gen 1", display_inch: "11",
      resolution: "2560×1600", refresh_hz: "120", storage_gb: "128", ram_gb: "8",
      battery_wh: "8000mAh", stylus: "S펜 포함", weight_g: "503",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "94만 9천원부터"
    }
  },
  {
    id: "galaxy-tab-s8-plus",
    canonicalName: "갤럭시 탭 S8+",
    nameEn: "Galaxy Tab S8+",
    aliases: ["갤럭시 탭 s8+", "갤럭시탭s8+", "galaxy tab s8+", "galaxy tab s8 plus", "탭 s8+", "탭s8+"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s8-plus/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S8+", os: "Android 12 (One UI 4.1)", chipset: "Snapdragon 8 Gen 1", display_inch: "12.4",
      resolution: "2800×1752", refresh_hz: "120", storage_gb: "128", ram_gb: "8",
      battery_wh: "10090mAh", stylus: "S펜 포함", weight_g: "572",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "119만 9천원부터"
    }
  },
  {
    id: "galaxy-tab-s8-ultra",
    canonicalName: "갤럭시 탭 S8 울트라",
    nameEn: "Galaxy Tab S8 Ultra",
    aliases: ["갤럭시 탭 s8 울트라", "갤럭시탭s8울트라", "galaxy tab s8 ultra", "탭 s8 울트라", "탭s8울트라"],
    category: "tablet",
    country: "KR",
    source: "https://www.samsung.com/sec/tablets/galaxy-tab-s8-ultra/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Tab S8 Ultra", os: "Android 12 (One UI 4.1)", chipset: "Snapdragon 8 Gen 1", display_inch: "14.6",
      resolution: "2960×1848", refresh_hz: "120", storage_gb: "128", ram_gb: "8",
      battery_wh: "11200mAh", stylus: "S펜 포함", weight_g: "726",
      cellular: "Wi-Fi (5G 옵션)", launch_price_krw: "159만 9천원부터"
    }
  },
];
