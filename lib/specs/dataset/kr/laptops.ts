/**
 * 한국 시장 laptop 스펙 데이터셋.
 *
 * 자동 수집: 다나와 (danawa.com)
 * 수집일: 2026-06-09
 *
 * ⚠️ 자동 생성 파일입니다. 수동 편집 시 재수집 시 덮어씌워집니다.
 *    수집 명령: npx tsx scripts/collect-specs/index.ts laptop KR
 */

import type { VerifiedProduct } from "@/lib/specs/dataset/types";

export const laptops: VerifiedProduct[] = [
  {
    id: "macbook-air-13-m4",
    canonicalName: "맥북 에어 13 M4",
    aliases: ["맥북 에어 m4", "macbook air m4", "맥북 에어 13 m4"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=77378204",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1240",
      chipset: "M4",
      ram_gb: "16",
      storage_gb: "512",
      launch_price_krw: "189만원",
      release_date: "2025년 3월"
    }
  },
  {
    id: "macbook-air-15-m4",
    canonicalName: "맥북 에어 15 M4",
    aliases: ["맥북 에어 15 m4", "macbook air 15 m4"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=77378312",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1510",
      chipset: "M4",
      ram_gb: "16",
      storage_gb: "256",
      launch_price_krw: "189만원",
      release_date: "2025년 3월"
    }
  },
  {
    id: "macbook-air-13-m3",
    canonicalName: "맥북 에어 13 M3",
    aliases: ["맥북 에어 m3", "macbook air m3", "맥북 에어 13 m3", "맥북 에어"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=39249308",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1240",
      chipset: "M3",
      ram_gb: "8",
      storage_gb: "512",
      launch_price_krw: "186만원",
      release_date: "2024년 3월"
    }
  },
  {
    id: "macbook-air-15-m3",
    canonicalName: "맥북 에어 15 M3",
    aliases: ["맥북 에어 15", "macbook air 15", "맥북 에어 15 m3"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=39249983",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1510",
      chipset: "M3",
      ram_gb: "8",
      storage_gb: "256",
      launch_price_krw: "189만원",
      release_date: "2024년 3월"
    }
  },
  {
    id: "macbook-pro-14-m4",
    canonicalName: "맥북 프로 14 M4",
    aliases: ["맥북 프로 14 m4", "macbook pro 14 m4"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=70250684",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1600",
      chipset: "M4 Pro",
      ram_gb: "24",
      storage_gb: "1024",
      launch_price_krw: "359만원",
      release_date: "2024년 11월"
    }
  },
  {
    id: "macbook-pro-16-m4",
    canonicalName: "맥북 프로 16 M4",
    aliases: ["맥북 프로 16 m4", "macbook pro 16 m4"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=70251404",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "2140",
      chipset: "M4 Pro",
      ram_gb: "24",
      storage_gb: "512",
      launch_price_krw: "369만원",
      release_date: "2024년 11월"
    }
  },
  {
    id: "macbook-pro-14-m3",
    canonicalName: "맥북 프로 14 M3",
    aliases: ["맥북 프로 14 m3", "맥북프로 14", "macbook pro 14 m3", "맥북 프로 14"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=29622560",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1610",
      chipset: "M3 Pro",
      ram_gb: "18",
      storage_gb: "512",
      launch_price_krw: "299만원",
      release_date: "2023년 11월"
    }
  },
  {
    id: "lg-gram-16",
    canonicalName: "LG 그램 16",
    aliases: ["lg 그램 16", "그램 16", "lg gram 16"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=103451483",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1199",
      ram_gb: "16",
      storage_gb: "512",
      launch_price_krw: "269만원",
      release_date: "2026년 1월"
    }
  },
  {
    id: "lg-gram-14",
    canonicalName: "LG 그램 14",
    aliases: ["lg 그램 14", "그램 14"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=103451186",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1120",
      ram_gb: "16",
      storage_gb: "512",
      launch_price_krw: "214만원",
      release_date: "2026년 1월"
    }
  },
  {
    id: "galaxy-book4-pro-14",
    canonicalName: "갤럭시 북4 프로 14",
    aliases: ["갤럭시북4 프로", "갤럭시 북4 프로", "galaxy book4 pro"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=31347431",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1230",
      chipset: "코어 울트라5",
      ram_gb: "16",
      storage_gb: "256",
      launch_price_krw: "188만원",
      release_date: "2024년 1월"
    }
  },
  {
    id: "galaxy-book5-pro-14",
    canonicalName: "갤럭시 북5 프로 14",
    aliases: ["갤럭시북5 프로", "갤럭시 북5 프로", "galaxy book5 pro"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=73614713",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1230",
      chipset: "코어 울트라5(S2)",
      ram_gb: "16",
      storage_gb: "256",
      launch_price_krw: "180만원",
      release_date: "2025년 1월"
    }
  },
  {
    id: "dell-xps-13",
    canonicalName: "델 XPS 13",
    aliases: ["델 xps 13", "dell xps 13"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=20661845",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      weight_g: "1230",
      chipset: "코어i5-10세대",
      ram_gb: "16",
      storage_gb: "500",
      release_date: "2023년 6월"
    }
  },
  {
    id: "lenovo-thinkpad-x1-carbon",
    canonicalName: "레노버 씽크패드 X1 카본",
    aliases: ["씽크패드 x1", "thinkpad x1 carbon"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=101072093",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      chipset: "코어 울트라7(S2)",
      ram_gb: "32",
      storage_gb: "1024",
      launch_price_krw: "416만원",
      release_date: "2025년 11월"
    }
  },
  {
    id: "asus-zenbook-14",
    canonicalName: "에이수스 젠북 14",
    aliases: ["젠북 14", "zenbook 14", "asus zenbook 14"],
    category: "laptop",
    country: "KR",
    source: "https://prod.danawa.com/info/?pcode=75537797",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      chipset: "스냅드래곤 X",
      ram_gb: "16",
      storage_gb: "512",
      launch_price_krw: "140만원",
      release_date: "2025년 2월"
    }
  }
];
