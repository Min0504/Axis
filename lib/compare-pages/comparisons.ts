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
];

/** Category labels in Korean */
export const CATEGORY_LABELS: Record<ComparisonDef["category"], string> = {
  laptop: "노트북",
  smartphone: "스마트폰",
  earphones: "이어폰·헤드폰",
  tablet: "태블릿",
};
