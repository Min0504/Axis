import type { VerifiedProduct } from "./types";

/**
 * 이어폰·헤드폰 검증 데이터셋 — 완전 하드코딩 (2020년 이후 주요 모델).
 *
 * 출처: 각 제조사 공식 페이지 (Apple KR, Samsung SEC, Sony KR, Bose KR).
 * canonicalName=한국어, nameEn=영어(검색·표시).
 *
 * 필드: battery_hr=본체 단독(ANC 켬), battery_total_hr=케이스 포함, weight_g=한쪽.
 */
export const earphones: VerifiedProduct[] = [

  // ══════════════════════════════════════════════════════════════════════════
  // Apple AirPods 시리즈
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "airpods-pro-2",
    canonicalName: "에어팟 프로 2세대",
    nameEn: "AirPods Pro 2nd Gen",
    aliases: [
      "에어팟 프로 2세대", "에어팟프로 2세대", "에어팟 프로2세대", "에어팟프로2세대",
      "에어팟 프로 2", "에어팟프로2", "에어팟 프로2", "에어팟 프로", "에어팟프로",
      "airpods pro 2", "airpods pro 2세대", "airpods pro 2nd", "airpods pro 2nd generation", "airpods pro"
    ],
    category: "earphones",
    country: "KR",
    source: "https://www.apple.com/kr/airpods-pro/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "AirPods Pro (2세대)", driver: "맞춤형 Apple 고역치 드라이버",
      anc: "액티브 노이즈 캔슬링, 적응형 투명도 모드", battery_hr: "6", battery_total_hr: "30",
      charging_type: "USB-C, MagSafe, Qi2 무선 충전", water_resist: "IP54", weight_g: "5.3",
      launch_price_krw: "359,000원", release_date: "2022년 9월", form: "커널형", codec: "AAC, SBC"
    }
  },
  {
    id: "airpods-4-anc",
    canonicalName: "에어팟 4 ANC",
    nameEn: "AirPods 4 (ANC)",
    aliases: [
      "에어팟 4 anc", "에어팟4 anc", "에어팟 4 (anc)", "에어팟 4(anc)", "에어팟4anc", "에어팟4(anc)",
      "에어팟 4", "에어팟4", "에어팟4세대", "airpods 4 anc", "airpods 4 (anc)", "airpods 4", "airpods4 anc"
    ],
    category: "earphones",
    country: "KR",
    source: "https://www.apple.com/kr/airpods-4/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "에어팟 4 (ANC)", driver: "맞춤형 Apple 드라이버",
      anc: "액티브 노이즈 캔슬링, 투명 모드", battery_hr: "5", battery_total_hr: "30",
      charging_type: "USB-C, MagSafe, Qi2 무선 충전", water_resist: "IP54", weight_g: "4.4",
      launch_price_krw: "229,000원", release_date: "2024년 9월", form: "오픈형", codec: "AAC, SBC"
    }
  },
  {
    id: "airpods-4",
    canonicalName: "에어팟 4 (표준)",
    nameEn: "AirPods 4",
    aliases: ["에어팟 4 표준", "에어팟4 표준", "airpods 4 standard"],
    category: "earphones",
    country: "KR",
    source: "https://www.apple.com/kr/airpods-4/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "에어팟 4", driver: "맞춤형 Apple 드라이버", anc: "없음",
      battery_hr: "5", battery_total_hr: "30", charging_type: "USB-C, MagSafe, Qi2 무선 충전",
      water_resist: "IPX4", weight_g: "4.3", launch_price_krw: "179,000원",
      release_date: "2024년 9월", form: "오픈형", codec: "AAC, SBC"
    }
  },
  {
    id: "airpods-3",
    canonicalName: "에어팟 3세대",
    nameEn: "AirPods 3rd Gen",
    aliases: ["에어팟 3세대", "에어팟3세대", "에어팟 3", "에어팟3", "airpods 3", "airpods 3rd", "airpods 3세대"],
    category: "earphones",
    country: "KR",
    source: "https://support.apple.com/ko-kr/111851",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "에어팟 3세대", driver: "맞춤형 고진폭 Apple 드라이버", anc: "없음 (적응형 EQ)",
      battery_hr: "6", battery_total_hr: "30", charging_type: "Lightning, MagSafe, Qi 무선 충전",
      water_resist: "IPX4", weight_g: "4.3", launch_price_krw: "249,000원",
      release_date: "2021년 10월", form: "오픈형", codec: "AAC, SBC"
    }
  },
  {
    id: "airpods-max",
    canonicalName: "에어팟 맥스",
    nameEn: "AirPods Max",
    aliases: ["에어팟 맥스", "에어팟맥스", "airpods max", "airpodsmax"],
    category: "earphones",
    country: "KR",
    source: "https://www.apple.com/kr/airpods-max/specs/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "AirPods Max", driver: "40mm 맞춤형 Apple 드라이버",
      anc: "액티브 노이즈 캔슬링, 투명 모드", battery_hr: "20", battery_total_hr: "20",
      charging_type: "USB-C 충전", water_resist: "IPX4", weight_g: "385",
      launch_price_krw: "769,000원", release_date: "2020년 12월", form: "오버이어", codec: "AAC, SBC"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Samsung Galaxy Buds 시리즈
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-buds4-pro",
    canonicalName: "갤럭시 버즈4 프로",
    nameEn: "Galaxy Buds4 Pro",
    aliases: ["갤럭시 버즈4 프로", "갤럭시버즈4 프로", "갤럭시버즈4프로", "버즈4 프로", "버즈4프로", "galaxy buds4 pro", "galaxy buds 4 pro", "buds4 pro", "갤럭시 버즈 4 프로", "버즈 4 프로"],
    category: "earphones",
    country: "KR",
    source: "https://www.samsung.com/sec/mobile-accessories/galaxy-buds4-pro/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Buds4 Pro", driver: "10mm 우퍼 + 6.1mm 트위터 (이중 드라이버)",
      anc: "Intelligent ANC, 360 Audio", battery_hr: "6", battery_total_hr: "26",
      charging_type: "USB-C, Qi 무선 충전", water_resist: "IP57", weight_g: "5.5",
      launch_price_krw: "249,000원", release_date: "2025년 7월", form: "커널형", codec: "SBC, AAC, Samsung Seamless Codec (SSC)"
    }
  },
  {
    id: "galaxy-buds4",
    canonicalName: "갤럭시 버즈4",
    nameEn: "Galaxy Buds4",
    aliases: ["갤럭시 버즈4", "갤럭시버즈4", "버즈4", "galaxy buds4", "galaxy buds 4", "buds4", "갤럭시 버즈 4", "버즈 4"],
    category: "earphones",
    country: "KR",
    source: "https://www.samsung.com/sec/mobile-accessories/galaxy-buds4/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Buds4", driver: "10mm 동적 드라이버", anc: "ANC 지원, 주변음 허용 모드",
      battery_hr: "6", battery_total_hr: "27", charging_type: "USB-C, Qi 무선 충전",
      water_resist: "IP54", weight_g: "5.7", launch_price_krw: "149,000원",
      release_date: "2025년 7월", form: "오픈형", codec: "SBC, AAC, Samsung Seamless Codec (SSC)"
    }
  },
  {
    id: "galaxy-buds3-pro",
    canonicalName: "갤럭시 버즈3 프로",
    nameEn: "Galaxy Buds3 Pro",
    aliases: ["갤럭시 버즈3 프로", "갤럭시버즈3 프로", "갤럭시버즈3프로", "버즈3 프로", "버즈3프로", "galaxy buds3 pro", "galaxy buds 3 pro", "buds3 pro", "갤럭시 버즈 3 프로", "버즈 3 프로"],
    category: "earphones",
    country: "KR",
    source: "https://www.samsung.com/sec/audio-sound/galaxy-buds3-pro/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Buds3 Pro", driver: "10.5mm 우퍼 + 6mm 트위터 (이중 드라이버)",
      anc: "Intelligent ANC, 주변음 허용 모드", battery_hr: "6", battery_total_hr: "26",
      charging_type: "USB-C, Qi 무선 충전", water_resist: "IPX7", weight_g: "6.2",
      launch_price_krw: "299,000원", release_date: "2024년 7월", form: "커널형", codec: "SBC, AAC, Samsung Seamless Codec (SSC HiFi)"
    }
  },
  {
    id: "galaxy-buds2-pro",
    canonicalName: "갤럭시 버즈2 프로",
    nameEn: "Galaxy Buds2 Pro",
    aliases: ["갤럭시 버즈2 프로", "갤럭시버즈2 프로", "갤럭시버즈2프로", "버즈2 프로", "버즈2프로", "galaxy buds2 pro", "galaxy buds 2 pro", "buds2 pro"],
    category: "earphones",
    country: "KR",
    source: "https://www.samsung.com/sec/audio-sound/galaxy-buds2-pro/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Buds2 Pro", driver: "10mm 우퍼 + 5.3mm 트위터 (이중 드라이버)",
      anc: "지능형 ANC, 주변음 허용 모드", battery_hr: "5", battery_total_hr: "18",
      charging_type: "USB-C, Qi 무선 충전", water_resist: "IPX7", weight_g: "5.5",
      launch_price_krw: "279,000원", release_date: "2022년 8월", form: "커널형", codec: "SBC, AAC, Samsung Seamless Codec (SSC HiFi)"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Sony 시리즈
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "sony-wf-1000xm5",
    canonicalName: "소니 WF-1000XM5",
    nameEn: "Sony WF-1000XM5",
    aliases: ["소니 wf-1000xm5", "소니wf1000xm5", "wf-1000xm5", "wf1000xm5", "sony wf-1000xm5", "sony wf1000xm5", "소니 1000xm5"],
    category: "earphones",
    country: "KR",
    source: "https://store.sony.co.kr/product-view/102303600",
    fetchedAt: "2026-06",
    tier: 2,
    specs: {
      model_name: "WF-1000XM5", driver: "8.4mm 드라이버 유닛", anc: "Integrated Processor V2 탑재 고성능 ANC",
      battery_hr: "8", battery_total_hr: "24", charging_type: "USB-C, Qi 무선 충전",
      water_resist: "IPX4", weight_g: "5.9", launch_price_krw: "359,000원",
      release_date: "2023년 6월", form: "커널형", codec: "SBC, AAC, LDAC, LC3"
    }
  },
  {
    id: "sony-wf-1000xm4",
    canonicalName: "소니 WF-1000XM4",
    nameEn: "Sony WF-1000XM4",
    aliases: ["소니 wf-1000xm4", "소니wf1000xm4", "wf-1000xm4", "wf1000xm4", "sony wf-1000xm4", "sony wf1000xm4"],
    category: "earphones",
    country: "KR",
    source: "https://store.sony.co.kr/product-view/101908550",
    fetchedAt: "2026-06",
    tier: 2,
    specs: {
      model_name: "WF-1000XM4", driver: "6mm 드라이버 유닛", anc: "Integrated Processor V1 탑재 ANC",
      battery_hr: "8", battery_total_hr: "24", charging_type: "USB-C, Qi 무선 충전",
      water_resist: "IPX4", weight_g: "7.3", launch_price_krw: "319,000원",
      release_date: "2021년 6월", form: "커널형", codec: "SBC, AAC, LDAC"
    }
  },
  {
    id: "sony-wh-1000xm5",
    canonicalName: "소니 WH-1000XM5",
    nameEn: "Sony WH-1000XM5",
    aliases: ["소니 wh-1000xm5", "소니wh1000xm5", "wh-1000xm5", "wh1000xm5", "sony wh-1000xm5", "sony wh1000xm5", "소니 헤드폰"],
    category: "earphones",
    country: "KR",
    source: "https://store.sony.co.kr/product-view/102291940",
    fetchedAt: "2026-06",
    tier: 2,
    specs: {
      model_name: "WH-1000XM5", driver: "30mm 드라이버 유닛", anc: "고성능 ANC, 주변음 모드",
      battery_hr: "30", battery_total_hr: "30", charging_type: "USB-C 충전",
      water_resist: "없음", weight_g: "250", launch_price_krw: "449,000원",
      release_date: "2022년 5월", form: "오버이어", codec: "SBC, AAC, LDAC"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Bose
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "bose-qc-ultra-earbuds",
    canonicalName: "보스 QC 울트라 이어버드",
    nameEn: "Bose QuietComfort Ultra Earbuds",
    aliases: ["보스 qc 울트라", "보스qc울트라", "보스 qc울트라이어버드", "bose qc ultra earbuds", "bose qc ultra", "보스 콰이어트컴포트 울트라"],
    category: "earphones",
    country: "KR",
    source: "https://www.bose.com/ko_kr/products/headphones/earbuds/quietcomfort-ultra-earbuds.html",
    fetchedAt: "2026-06",
    tier: 2,
    specs: {
      model_name: "Bose QuietComfort Ultra Earbuds", driver: "커스텀 드라이버",
      anc: "QuietComfort 기술 ANC, Aware Mode", battery_hr: "6", battery_total_hr: "24",
      charging_type: "USB-C, Qi 무선 충전", water_resist: "IPX4", weight_g: "6.2",
      launch_price_krw: "379,000원", release_date: "2023년 10월", form: "커널형", codec: "SBC, AAC, aptX Adaptive"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Samsung Galaxy Buds 추가 (2020–2024)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "galaxy-buds-live",
    canonicalName: "갤럭시 버즈 라이브",
    nameEn: "Galaxy Buds Live",
    aliases: ["갤럭시 버즈 라이브", "갤럭시버즈라이브", "galaxy buds live", "buds live", "버즈라이브", "버즈 라이브"],
    category: "earphones",
    country: "KR",
    source: "https://www.samsung.com/sec/audio-sound/galaxy-buds-live/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Buds Live", driver: "12mm 우퍼 + 5.6mm 트위터",
      anc: "능동형 노이즈 캔슬링 (ANC)", battery_hr: "6", battery_total_hr: "21",
      charging_type: "USB-C, 무선 충전(Qi)", water_resist: "IPX2", weight_g: "5.6",
      launch_price_krw: "199,000원", release_date: "2020년 8월", form: "오픈형 (빈 형태)", codec: "AAC, SBC"
    }
  },
  {
    id: "galaxy-buds-pro",
    canonicalName: "갤럭시 버즈 프로",
    nameEn: "Galaxy Buds Pro",
    aliases: ["갤럭시 버즈 프로", "갤럭시버즈프로", "galaxy buds pro", "buds pro", "버즈프로", "버즈 프로"],
    category: "earphones",
    country: "KR",
    source: "https://www.samsung.com/sec/audio-sound/galaxy-buds-pro/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Buds Pro", driver: "11mm 우퍼 + 6.5mm 트위터",
      anc: "인텔리전트 ANC (최대 11dB 노이즈 캔슬링)", battery_hr: "5", battery_total_hr: "28",
      charging_type: "USB-C, 무선 충전(Qi)", water_resist: "IPX7", weight_g: "6.3",
      launch_price_krw: "249,000원", release_date: "2021년 1월", form: "커널형", codec: "AAC, SBC"
    }
  },
  {
    id: "galaxy-buds2",
    canonicalName: "갤럭시 버즈2",
    nameEn: "Galaxy Buds2",
    aliases: ["갤럭시 버즈2", "갤럭시버즈2", "galaxy buds2", "galaxy buds 2", "buds2", "버즈2", "버즈 2"],
    category: "earphones",
    country: "KR",
    source: "https://www.samsung.com/sec/audio-sound/galaxy-buds2/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Buds2", driver: "11mm 우퍼 + 6.5mm 트위터",
      anc: "액티브 노이즈 캔슬링 (ANC)", battery_hr: "5", battery_total_hr: "20",
      charging_type: "USB-C, 무선 충전(Qi)", water_resist: "IPX2", weight_g: "5.0",
      launch_price_krw: "149,000원", release_date: "2021년 8월", form: "커널형", codec: "AAC, SBC"
    }
  },
  {
    id: "galaxy-buds3",
    canonicalName: "갤럭시 버즈3",
    nameEn: "Galaxy Buds3",
    aliases: ["갤럭시 버즈3", "갤럭시버즈3", "galaxy buds3", "galaxy buds 3", "buds3", "버즈3", "버즈 3"],
    category: "earphones",
    country: "KR",
    source: "https://www.samsung.com/sec/audio-sound/galaxy-buds3/",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "Galaxy Buds3", driver: "11mm 우퍼 + 6.5mm 트위터",
      anc: "액티브 노이즈 캔슬링 (ANC)", battery_hr: "7", battery_total_hr: "30",
      charging_type: "USB-C, 무선 충전(Qi)", water_resist: "IPX5", weight_g: "5.5",
      launch_price_krw: "199,000원", release_date: "2024년 7월", form: "오픈형 (블레이드)", codec: "AAC, SBC"
    }
  },

  // ══════════════════════════════════════════════════════════════════════════
  // Sony WH-1000XM4 헤드폰 (2020)
  // ══════════════════════════════════════════════════════════════════════════
  {
    id: "sony-wh1000xm4",
    canonicalName: "소니 WH-1000XM4",
    nameEn: "Sony WH-1000XM4",
    aliases: ["소니 wh-1000xm4", "소니wh1000xm4", "sony wh-1000xm4", "sony wh1000xm4", "wh1000xm4", "wh-1000xm4", "소니 xm4 헤드폰"],
    category: "earphones",
    country: "KR",
    source: "https://www.sony.co.kr/handler/Product-Start?pid=WH1000XM4",
    fetchedAt: "2026-06",
    tier: 1,
    specs: {
      model_name: "WH-1000XM4", driver: "40mm 돔형",
      anc: "HD 노이즈 캔슬링 프로세서 QN1, 듀얼 노이즈 센서", battery_hr: "30", battery_total_hr: "30",
      charging_type: "USB-C (10분 충전 5시간 재생)", water_resist: "없음", weight_g: "254",
      launch_price_krw: "379,000원", release_date: "2020년 8월", form: "오버이어 헤드폰", codec: "LDAC, AAC, SBC, aptX"
    }
  },
];
