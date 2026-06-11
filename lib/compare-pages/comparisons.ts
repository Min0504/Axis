import type { Locale } from "@/lib/i18n";

export type ComparisonDef = {
  slug: string;
  /** Page H1 / OG title */
  title: string;
  /** Options passed to the AI decision engine */
  options: string[];
  /** Meta description — include natural keywords */
  description: string;
  locale: Locale;
  /** For grouping on homepage / sitemap */
  category: "laptop" | "smartphone" | "earphones" | "tablet";
};

/**
 * Curated from Korean tech YouTube (잇섭·기즈모·JK·랩터), Clien, Quasarzone,
 * and Naver 지식iN — the comparisons people actually search for.
 *
 * Naming convention: {product-a}-vs-{product-b} in English slugs.
 */
export const COMPARISONS: ComparisonDef[] = [

  // ── 노트북 ────────────────────────────────────────────────────────────────

  {
    slug: "macbook-air-m4-vs-macbook-pro-m4",
    title: "맥북 에어 M4 vs 맥북 프로 M4",
    options: ["맥북 에어 13 M4", "맥북 프로 14 M4"],
    description:
      "M4 세대 맥북 라인업 비교. 일반 사용자·개발자·크리에이터 상황별로 어느 쪽이 더 가성비 있는지 정리합니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-m3-vs-macbook-pro-m3",
    title: "맥북 에어 M3 vs 맥북 프로 M3",
    options: ["맥북 에어 13 M3", "맥북 프로 14 M3"],
    description:
      "30만 원 넘는 가격 차이, 정말 맥북 프로가 나을까요? 상황별로 어느 쪽이 더 가성비 있는지 정리합니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-13-vs-macbook-air-15",
    title: "맥북 에어 13인치 vs 15인치",
    options: ["맥북 에어 13 M4", "맥북 에어 15 M4"],
    description:
      "같은 M4 칩인데 인치만 다릅니다. 휴대성이 중요한지, 화면 크기가 중요한지에 따라 선택이 갈립니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-m3-vs-lg-gram-16",
    title: "맥북 에어 M3 vs LG 그램 16",
    options: ["맥북 에어 13 M3", "LG 그램 16"],
    description:
      "macOS vs Windows, 성능 vs 화면 크기. 가격대가 비슷한 프리미엄 노트북 두 제품을 배터리·무게·호환성 기준으로 비교합니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-m3-vs-galaxy-book4-pro",
    title: "맥북 에어 M3 vs 갤럭시북4 프로",
    options: ["맥북 에어 13 M3", "갤럭시북4 프로 14"],
    description:
      "애플 실리콘 vs 인텔 코어 울트라. 삼성 생태계 사용자라면 맥북 대신 갤럭시북이 나을 수도 있습니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "lg-gram-16-vs-galaxy-book4-pro",
    title: "LG 그램 16 vs 갤럭시북4 프로",
    options: ["LG 그램 16", "갤럭시북4 프로 14"],
    description:
      "국내 프리미엄 윈도우 노트북 양강 대결. 화면 크기·무게·배터리 모두 다른 두 제품 중 내 업무에 더 맞는 건 무엇일까요?",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-m4-vs-lg-gram-16",
    title: "맥북 에어 M4 vs LG 그램 16",
    options: ["맥북 에어 13 M4", "LG 그램 16"],
    description:
      "2025년 기준 경량 프리미엄 노트북 비교. M4 칩의 성능과 배터리 효율이 Windows 노트북 대비 얼마나 차이 나는지 확인합니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-m4-vs-galaxy-book5-pro",
    title: "맥북 에어 M4 vs 갤럭시북5 프로",
    options: ["맥북 에어 13 M4", "갤럭시북5 프로 14"],
    description:
      "2025년 최신 플래그십 노트북 대결. 삼성 갤럭시 생태계를 쓴다면 갤럭시북5 프로가, macOS가 필요하다면 맥북 에어가 답입니다. 가격·성능·배터리 상세 비교.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-m4-vs-lg-gram-pro-16",
    title: "맥북 에어 M4 vs LG 그램 Pro 16",
    options: ["맥북 에어 13 M4", "LG 그램 Pro 16"],
    description:
      "애플 실리콘 vs Intel Arc, 13인치 vs 16인치. 화면이 크면서 가벼운 노트북을 찾는다면 그램 Pro가 유리할 수 있습니다. 용도별 선택 가이드.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-m3-vs-macbook-air-m4",
    title: "맥북 에어 M3 vs M4 — 업그레이드 가성비",
    options: ["맥북 에어 13 M3", "맥북 에어 13 M4"],
    description:
      "M3에서 M4로 넘어갈 가치가 있을까요? 성능 차이, 가격 차이, 실사용 체감을 기준으로 업그레이드 여부를 판단합니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "macbook-air-m2-vs-macbook-air-m3",
    title: "맥북 에어 M2 vs M3 — 중고 vs 신형",
    options: ["맥북 에어 13 M2", "맥북 에어 13 M3"],
    description:
      "중고 M2와 신형 M3 가격 차이가 좁아졌습니다. 지금 구매한다면 어느 쪽이 더 합리적인지 스펙 차이와 수명 기준으로 비교합니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "lg-gram-pro-16-vs-galaxy-book5-pro",
    title: "LG 그램 Pro 16 vs 갤럭시북5 프로",
    options: ["LG 그램 Pro 16", "갤럭시북5 프로 14"],
    description:
      "국산 프리미엄 윈도우 노트북 2025년 양강. 화면 크기·OLED vs IPS·무게·배터리 기준으로 실업무 환경에 더 맞는 쪽을 정리합니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "lg-gram-16-vs-lg-gram-pro-16",
    title: "LG 그램 16 vs 그램 Pro 16",
    options: ["LG 그램 16", "LG 그램 Pro 16"],
    description:
      "같은 그램인데 Pro가 더 나을까요? GPU 차이, 가격 차이, 외관 디자인 차이를 비교하고 업그레이드 가치를 판단합니다.",
    locale: "ko",
    category: "laptop",
  },
  {
    slug: "galaxy-book5-pro-vs-galaxy-book4-pro",
    title: "갤럭시북5 프로 vs 북4 프로 — 1년 차이의 가치",
    options: ["갤럭시북5 프로 14", "갤럭시북4 프로 14"],
    description:
      "신형 갤럭시북5 프로로 바꿀 이유가 있을까요? CPU 세대 업그레이드와 가격 차이를 실사용 관점으로 분석합니다.",
    locale: "ko",
    category: "laptop",
  },

  // ── 스마트폰 ──────────────────────────────────────────────────────────────

  {
    slug: "iphone-16-vs-galaxy-s25",
    title: "아이폰 16 vs 갤럭시 S25",
    options: ["아이폰 16", "갤럭시 S25"],
    description:
      "2024-25 국민 스마트폰 대결. 카메라·배터리·생태계·사후 지원까지 꼼꼼하게 비교해 어느 쪽이 내 상황에 더 맞는지 알려드립니다.",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "iphone-16-pro-vs-galaxy-s25-ultra",
    title: "아이폰 16 프로 vs 갤럭시 S25 울트라",
    options: ["아이폰 16 프로", "갤럭시 S25 울트라"],
    description:
      "각 브랜드의 최상위 플래그십 비교. 카메라 화질·S펜·티타늄 디자인·처리 성능까지 분석합니다.",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "iphone-16-vs-iphone-16-pro",
    title: "아이폰 16 vs 아이폰 16 프로",
    options: ["아이폰 16", "아이폰 16 프로"],
    description:
      "애플 인텔리전스·카메라 컨트롤·ProMotion 디스플레이... 20만 원 차이가 나는 두 모델, 프로로 올릴 이유가 있을까요?",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "galaxy-s25-vs-galaxy-s25-ultra",
    title: "갤럭시 S25 vs S25 울트라",
    options: ["갤럭시 S25", "갤럭시 S25 울트라"],
    description:
      "S펜이 필요 없다면 50만 원 더 비싼 울트라가 의미 있을까요? 카메라 망원·화면 크기·배터리 차이를 실사용 기준으로 비교합니다.",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "iphone-15-vs-iphone-16",
    title: "아이폰 15 vs 아이폰 16 — 업그레이드할 가치 있나?",
    options: ["아이폰 15", "아이폰 16"],
    description:
      "카메라 버튼·애플 인텔리전스·A18 칩... 아이폰 15에서 16으로 갈아탈 실질적인 이유가 있는지 정리합니다.",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "galaxy-s24-vs-galaxy-s25",
    title: "갤럭시 S24 vs S25 — 바꿀 이유 있나?",
    options: ["갤럭시 S24", "갤럭시 S25"],
    description:
      "스냅드래곤 8 Elite vs 스냅드래곤 8 Gen 3. S24 사용자라면 S25로 넘어갈 가치가 있는지 분석합니다.",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "iphone-16-pro-max-vs-galaxy-s25-ultra",
    title: "아이폰 16 프로 맥스 vs 갤럭시 S25 울트라",
    options: ["아이폰 16 프로 맥스", "갤럭시 S25 울트라"],
    description:
      "각 브랜드 최대 사이즈 플래그십 대결. 대화면·최장 배터리·최고 카메라 성능 비교. 100만 원 이상 폰에서 두 제품의 실력 차이를 살펴봅니다.",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "iphone-14-pro-vs-iphone-15-pro",
    title: "아이폰 14 프로 vs 아이폰 15 프로",
    options: ["아이폰 14 프로", "아이폰 15 프로"],
    description:
      "다이나믹 아일랜드·USB-C·A17 Pro 칩. 아이폰 14 프로 사용자가 15 프로로 올릴 이유가 있는지 스펙 기준으로 비교합니다.",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "iphone-15-pro-vs-iphone-16-pro",
    title: "아이폰 15 프로 vs 아이폰 16 프로",
    options: ["아이폰 15 프로", "아이폰 16 프로"],
    description:
      "카메라 컨트롤 버튼·A18 Pro·4K 120fps 촬영. 아이폰 15 프로 사용자가 16 프로로 교체할 가치가 있는지 분석합니다.",
    locale: "ko",
    category: "smartphone",
  },
  {
    slug: "galaxy-s24-ultra-vs-galaxy-s25-ultra",
    title: "갤럭시 S24 울트라 vs S25 울트라",
    options: ["갤럭시 S24 울트라", "갤럭시 S25 울트라"],
    description:
      "티타늄 프레임·Snapdragon 8 Elite·Galaxy AI 확장. S24 울트라에서 S25 울트라로 교체할 이유를 스펙으로 확인합니다.",
    locale: "ko",
    category: "smartphone",
  },

  // ── 이어폰·헤드폰 ─────────────────────────────────────────────────────────

  {
    slug: "airpods-pro-2-vs-galaxy-buds3-pro",
    title: "에어팟 프로 2 vs 갤럭시 버즈3 프로",
    options: ["에어팟 프로 2세대", "갤럭시 버즈3 프로"],
    description:
      "생태계가 다르면 선택지도 달라집니다. 노이즈캔슬링 성능·통화 품질·착용감을 기준으로 두 프리미엄 이어폰을 비교합니다.",
    locale: "ko",
    category: "earphones",
  },
  {
    slug: "airpods-pro-2-vs-sony-wf1000xm5",
    title: "에어팟 프로 2 vs 소니 WF-1000XM5",
    options: ["에어팟 프로 2세대", "소니 WF-1000XM5"],
    description:
      "애플 생태계 최강자 vs 소니 ANC 최강자. 노이즈캔슬링·음질·배터리를 솔직하게 비교해 어느 쪽을 살지 알려드립니다.",
    locale: "ko",
    category: "earphones",
  },
  {
    slug: "sony-wh1000xm5-vs-bose-qc-ultra",
    title: "소니 WH-1000XM5 vs 보스 QC Ultra",
    options: ["소니 WH-1000XM5", "보스 QC Ultra 헤드폰"],
    description:
      "노캔 헤드폰 양대 산맥 비교. 재택근무·장거리 비행·음악 감상 용도별로 어느 쪽이 더 나은 선택인지 분석합니다.",
    locale: "ko",
    category: "earphones",
  },
  {
    slug: "airpods-4-vs-galaxy-buds3",
    title: "에어팟 4세대 vs 갤럭시 버즈3",
    options: ["에어팟 4세대", "갤럭시 버즈3"],
    description:
      "오픈형 이어폰 신흥 강자 대결. 개방형 착용감을 원하지만 좋은 소리도 포기할 수 없다면 어느 쪽을 선택해야 할까요?",
    locale: "ko",
    category: "earphones",
  },
  {
    slug: "airpods-pro-2-vs-airpods-4",
    title: "에어팟 프로 2 vs 에어팟 4 — 프로가 필요한가?",
    options: ["에어팟 프로 2세대", "에어팟 4세대"],
    description:
      "5만 원 차이, 노이즈캔슬링이 없어도 에어팟 4가 충분할까요? 실사용 관점에서 두 제품의 차이를 정리합니다.",
    locale: "ko",
    category: "earphones",
  },
  {
    slug: "galaxy-buds3-pro-vs-sony-wf1000xm5",
    title: "갤럭시 버즈3 프로 vs 소니 WF-1000XM5",
    options: ["갤럭시 버즈3 프로", "소니 WF-1000XM5"],
    description:
      "삼성 생태계 최상위 이어폰 vs 안드로이드 진영 ANC 최강자. 음질·노캔·배터리·통화 품질을 비교합니다.",
    locale: "ko",
    category: "earphones",
  },

  // ── 태블릿 ────────────────────────────────────────────────────────────────

  {
    slug: "ipad-pro-m4-vs-galaxy-tab-s10-ultra",
    title: "아이패드 프로 M4 vs 갤럭시 탭 S10 울트라",
    options: ["아이패드 프로 M4", "갤럭시 탭 S10 울트라"],
    description:
      "프리미엄 태블릿 최고봉 두 제품. 필기·그림 작업·영상 시청·노트북 대용 용도별로 어느 쪽이 실제로 더 활용도가 높은지 비교합니다.",
    locale: "ko",
    category: "tablet",
  },
  {
    slug: "ipad-air-m2-vs-galaxy-tab-s9-plus",
    title: "아이패드 에어 M2 vs 갤럭시 탭 S9+",
    options: ["아이패드 에어 M2", "갤럭시 탭 S9 플러스"],
    description:
      "100만 원 이하 중상급 태블릿 대결. 학생·직장인 기준으로 필기·앱 생태계·S펜 포함 여부를 따져 최적의 선택을 찾아드립니다.",
    locale: "ko",
    category: "tablet",
  },
  {
    slug: "ipad-pro-m4-vs-ipad-air-m2",
    title: "아이패드 프로 M4 vs 아이패드 에어 M2 — 프로가 필요한가?",
    options: ["아이패드 프로 M4 11인치", "아이패드 에어 M2 11인치"],
    description:
      "OLED·M4 칩·Apple Pencil Pro 지원. 40만 원 이상 차이가 나는 두 아이패드, 학생·직장인에게 프로가 과연 필요한지 분석합니다.",
    locale: "ko",
    category: "tablet",
  },
  {
    slug: "ipad-10th-vs-galaxy-tab-s9-fe",
    title: "아이패드 10세대 vs 갤럭시 탭 S9 FE",
    options: ["아이패드 10세대", "갤럭시 탭 S9 FE"],
    description:
      "50만 원대 실용 태블릿 비교. 부담 없는 가격에서 교육·유튜브·업무 보조 용도로 어느 쪽이 더 오래 쓸 수 있는지 알아봅니다.",
    locale: "ko",
    category: "tablet",
  },
];

/** Category labels in Korean */
export const CATEGORY_LABELS: Record<ComparisonDef["category"], string> = {
  laptop: "노트북",
  smartphone: "스마트폰",
  earphones: "이어폰·헤드폰",
  tablet: "태블릿",
};
