export const ko = {
  // Meta
  siteName: "axis",
  siteTagline: "구매 결정 나침반",
  siteDescription: "공식 스펙과 내 상황을 함께 보고 구매 결정을 빠르게 좁혀주는 선택 가이드",

  // Home
  home: {
    badge: "공식 스펙 기반 구매 결정 가이드",
    hero1: "무엇을 살지,",
    hero2: "근거 있게 좁혀드립니다.",
    sub: "제조사 공식 스펙과 예산, 용도, 우선순위를 함께 보고 구매 직전의 고민 시간을 줄여드립니다.",
    proof: [
      { value: "공식", label: "제조사 스펙 우선" },
      { value: "상황", label: "용도별 선택 기준" },
      { value: "투명", label: "제휴 링크 분리 고지" }
    ],
    examplesTitle: "많이 고민하는 구매 비교",
    examplesSub: "검색으로 들어온 사용자가 바로 이해할 수 있도록, Axis는 고관여 제품부터 깊게 비교합니다.",
    examples: [
      {
        category: "스마트폰",
        query: "아이폰 16 vs 갤럭시 S25",
        note: "카메라, 배터리, 무게, 가격 방어까지"
      },
      {
        category: "노트북",
        query: "맥북 에어 vs 갤럭시북",
        note: "휴대성, 성능, 과제/업무 용도 기준"
      },
      {
        category: "이어폰",
        query: "에어팟 프로 vs 버즈",
        note: "노이즈캔슬링, 통화, 생태계 적합도"
      }
    ],
    methodTitle: "Axis가 판단하는 방식",
    methodSub: "광고 문구가 아니라, 확인 가능한 정보와 사용자의 상황을 먼저 봅니다.",
    method: [
      {
        title: "공식 스펙 확인",
        body: "제조사 공식 페이지에서 확인 가능한 항목을 우선 비교합니다."
      },
      {
        title: "상황별 분류",
        body: "가격, 용도, 휴대성, 오래 쓸 가능성처럼 실제 구매 기준으로 다시 정리합니다."
      },
      {
        title: "후회 조건 표시",
        body: "추천 제품뿐 아니라 어떤 사람에게는 맞지 않는지도 함께 보여줍니다."
      }
    ],
  },

  // Input
  input: {
    ordinals: ["첫 번째", "두 번째", "세 번째", "네 번째", "다섯 번째"],
    placeholders: ["예: 아이폰 16", "예: 갤럭시 S25", "예: 픽셀 9", "예: 샤오미 15", "예: 원플러스 13"],
    addOption: "＋ 선택지 추가",
    submit: "Axis에게 물어보기 →",
    submitting: "Axis가 선택 중...",
    optionSlot: (n: number) => `선택지 ${n}`,
    proUpsell: "3개 이상 한 번에 비교하고 싶다면",
    pro: "Pro",
    upgradePrompt: "더 많이 선택하려면 업그레이드 →",
    errorEmpty: "두 개 이상의 선택지를 입력해주세요.",
    errorLength: (n: number) => `선택지는 각각 ${n}자 이하로 입력해주세요.`,
    errorGeneral: "분석 중 오류가 발생했습니다.",
  },

  // Results
  results: {
    back: "← 다시 선택하기",
    axisChoice: "AXIS의 추천",
    defaultConclusion: "이번에는 이걸 선택하는 것이 더 적합합니다.",
    basisTitle: "판단 기준",
    basis: [
      { title: "공식 스펙", body: "확인 가능한 공식 자료를 우선 기준으로 비교합니다." },
      { title: "상황 적합도", body: "가격, 용도, 휴대성, 장기 사용성을 함께 봅니다." },
      { title: "구매 투명성", body: "구매 링크는 추천 근거와 분리해 표시합니다." }
    ],
    whyChosen: "왜 이렇게 선택했을까?",
    specComparison: "항목별 비교",
    winner: "선택",
    officialLink: (name: string) => `${name} 공식`,
    perItemAnalysis: "선택지별 상세 분석",
    officialShort: "공식 ↗",
    summary: "종합 설명",
    purchaseTitle: "구매 전 마지막 확인",
    purchaseSub: "근거를 확인한 뒤 가격과 재고를 비교해보세요. 제휴 링크는 Axis 운영에 도움이 될 수 있지만 추천 기준에는 영향을 주지 않습니다.",
    notFound: "결과를 찾을 수 없습니다. 다시 비교해 주세요.",
  },

  // History
  history: {
    title: "최근 기록",
    loginPrompt: "로그인하면 최근 기록이 저장돼요.",
    loginLink: "로그인하기 →",
    empty: "아직 기록이 없어요. 첫 선택을 시작해보세요.",
    viewAgain: "다시 보기",
    delete: "삭제",
    deleting: "삭제 중...",
    deleteConfirm: "이 기록을 삭제할까요? 되돌릴 수 없습니다.",
    today: "오늘",
    yesterday: "어제",
    daysAgo: (n: number) => `${n}일 전`,
  },

  // Nav
  nav: {
    login: "로그인",
    logout: "로그아웃",
    loggedIn: "로그인됨",
    myInfo: "내 정보",
    membership: "멤버십",
    recentHistory: "최근 기록",
  },

  // Auth
  auth: {
    welcome: "Axis에 오신 걸 환영해요",
    subtitle: "선택에 어려움을 겪는 당신의 조용한 동반자",
    loginTab: "로그인",
    signupTab: "회원가입",
    email: "이메일",
    password: "비밀번호",
    loginBtn: "로그인",
    signupBtn: "회원가입",
    processing: "처리 중...",
    guest: "게스트로 계속하기",
    signupHint: (n: number) => `가입하면 하루 ${n}회 무료로 이용할 수 있어요.`,
    signupDone: "회원가입 완료! 이메일 인증 링크를 확인한 뒤 로그인해 주세요.",
    noSupabase: "Supabase 환경변수가 필요합니다.",
    envNote: "`.env.local`에 Supabase URL과 ANON KEY를 추가해 주세요.",
  },

  // Account
  account: {
    title: "내 정보",
    email: "이메일",
    joinedAt: "가입일",
    membershipLabel: "멤버십",
    member: "멤버",
    todayUsage: "오늘의 선택",
    unlimited: "무제한",
    usageOf: (used: number, limit: number) => `${used} / ${limit}회`,
    remaining: (n: number) => `오늘 ${n}회 더 선택할 수 있어요. 매일 0시에 초기화됩니다.`,
    proUnlimited: "Pro 멤버는 매일 무제한으로 선택할 수 있어요.",
    needMore: "더 많은 선택이 필요하세요?",
    needMoreDesc: "Plus는 하루 30회, Pro는 무제한 + 최대 5개 동시 비교.",
    viewMembership: "멤버십 보기",
    editNickname: "별명 수정",
    nicknamePlaceholder: "별명을 입력하세요",
    save: "저장",
    saving: "저장 중...",
    cancel: "취소",
    saveError: "저장하지 못했습니다.",
    loginRequired: "로그인이 필요합니다.",
  },

  // Membership
  membership: {
    badge: "멤버십",
    title: "선택에 한계를 두지 마세요",
    sub: "필요한 만큼만, 부담 없는 가격으로.",
    popular: "가장 인기",
    currentPlan: "현재 플랜",
    included: "포함됨",
    compareTitle: "플랜 비교",
    paymentNote: "결제 연동(Toss·Stripe)은 준비 중입니다. 언제든 해지할 수 있어요.",
    startFree: "무료로 시작하기",
    proCurrent: "현재 Pro 멤버입니다. 감사합니다 🙌",
    waitlistDone: "대기자 등록 완료 🙌",
    upgrade: (plan: string) => `${plan} 업그레이드`,
  },

  // Share / Affiliate
  share: {
    shareBtn: "결과 공유하기",
    sharing: "링크 생성 중...",
    copied: "복사됨 ✓",
    buyOn: (product: string) => `${product} 가격 확인하기`,
    buyStore: "쿠팡",
    buyStoreGlobal: "Amazon",
    affiliateNote: "구매 링크는 제휴 링크로, Axis 운영에 도움이 됩니다. 추가 비용 없이 동일한 가격으로 구매할 수 있어요.",
    proClean: "Pro 멤버는 광고 없는 클린 경험을 이용합니다.",
    watermarkText: "로 비교한 결과예요.",
    watermarkCta: "나도 비교해보기 →",
    shareTitle: (product: string) => `Axis의 선택: ${product}`,
    shareMessage: (product: string, url: string) => `Axis가 "${product}"을(를) 선택했어요 → ${url}`,
    sharedFallback: "공유된 선택",
  },

  // Limit
  limit: {
    reached: "오늘 선택 횟수를 모두 사용했어요. 상위 플랜으로 더 많이 선택할 수 있어요.",
    upgrade: "더 많이 선택하려면 업그레이드 →",
    rateLimit: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요.",
  },

  // Errors
  error: {
    title: "문제가 발생했어요",
    subtitle: "잠시 후 다시 시도해 주세요.",
    retry: "다시 시도",
    notFound: "페이지를 찾을 수 없어요",
    notFoundSub: "주소가 바뀌었거나 삭제된 페이지일 수 있습니다.",
    backHome: "홈으로 돌아가기",
    loading: "불러오는 중...",
  },

  // Settings
  settings: {
    language: "언어",
    theme: "테마",
    light: "라이트",
    dark: "다크",
  },
};
