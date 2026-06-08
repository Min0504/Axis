export const ko = {
  // Meta
  siteName: "axis",
  siteTagline: "공식 스펙 기반 구매 결정",
  siteDescription: "공식 스펙과 내 상황을 함께 보고 구매 결정을 빠르게 좁혀주는 선택 가이드",

  // Home
  home: {
    badge: "검증된 스펙 · 즉각 결론",
    hero1: "비교하다 지쳤다면,",
    hero2: "Axis가 지금 바로 골라드립니다.",
    sub: "제조사 공식 스펙과 실제 사용 상황을 함께 분석해,\n최적의 선택을 내릴 수 있도록 도와드립니다.",
    proof: [
      { value: "공식 스펙 검증", label: "" },
      { value: "정확한", label: " 비교" },
      { value: "합리적", label: " 근거" }
    ],
    examplesTitle: "이런 비교로 시작해보세요",
    examplesSub: "클릭하면 바로 입력창에 채워집니다. Axis는 고관여 전자기기부터 깊게 비교합니다.",
    tryThis: "비교하기 →",
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
    methodSubEm: "광고 문구가 아니라,",
    methodSub: "확인 가능한 정보와 사용자의 상황을 먼저 봅니다.",
    features: [
      { title: "공식 스펙 검증", body: "제조사 공식 데이터 기반 비교" },
      { title: "AI 구매 결론", body: "즉각적인 추천 이유 제공" },
      { title: "최대 5개 동시 비교", body: "N-way 비교 지원" },
      { title: "가격 추적 · 알림", body: "가격 하락 시 즉시 알림" },
      { title: "비교 결과 공유", body: "링크 하나로 결과 공유" },
      { title: "다국어 지원", body: "한국어 · 영어 · 일본어" },
    ],
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
    // Popular comparisons section
    compareTitle: "많이 찾는 비교",
    compareSub: "공식 스펙 기반으로 미리 분석해둔 인기 비교입니다.",
    compareRealData: "사용자들이 가장 많이 찾은 비교입니다.",
    compareViewAll: (n: number) => `비교 전체 보기 (${n}개) →`,
    categoryLabels: {
      laptop: "노트북",
      smartphone: "스마트폰",
      earphones: "이어폰·헤드폰",
      tablet: "태블릿",
    },
  },

  // Input
  input: {
    ordinals: ["첫 번째", "두 번째", "세 번째", "네 번째", "다섯 번째"],
    placeholders: ["예: 아이폰 16", "예: 갤럭시 S25", "예: 픽셀 9", "예: 샤오미 15", "예: 원플러스 13"],
    addOption: "＋ 선택지 추가",
    submit: "Axis에게 맡기기 →",
    submitting: "분석 중...",
    optionSlot: (n: number) => `선택지 ${n}`,
    proUpsell: "3개 이상 한 번에 비교하고 싶다면",
    pro: "Pro",
    upgradePrompt: "더 많이 선택하려면 업그레이드 →",
    errorEmpty: "두 개 이상의 선택지를 입력해주세요.",
    errorLength: (n: number) => `선택지는 각각 ${n}자 이하로 입력해주세요.`,
    errorDuplicate: "선택지는 중복될 수 없습니다.",
    errorGeneral: "분석 중 오류가 발생했습니다.",
  },

  // Results
  results: {
    back: "← 다시 비교하기",
    axisChoice: "Axis 추천",
    defaultConclusion: "공식 스펙과 실사용 기준으로 이 제품이 더 적합합니다.",
    basisTitle: "판단 기준",
    basis: [
      { title: "공식 스펙", body: "확인 가능한 공식 자료를 우선 기준으로 비교합니다." },
      { title: "상황 적합도", body: "가격, 용도, 휴대성, 장기 사용성을 함께 봅니다." },
      { title: "구매 투명성", body: "구매 링크는 추천 근거와 분리해 표시합니다." }
    ],
    whyChosen: "추천 이유",
    specComparison: "공식 스펙 비교",
    specComparisonPending: "스펙 비교",
    specEmptyNote: "공식 스펙 데이터 수집 중입니다. 아래 공식 페이지에서 직접 확인하세요.",
    winner: "추천",
    officialLink: (name: string) => `${name} 공식`,
    perItemAnalysis: "선택지 분석",
    officialShort: "공식 ↗",
    sourceManufacturer: "제조사 공식",
    sourceImporter: "공식 수입처",
    summary: "종합",
    purchaseTitle: "구매 전 마지막 확인",
    purchaseSub: "근거를 확인한 뒤 가격과 재고를 비교해보세요. 제휴 링크는 Axis 운영에 도움이 될 수 있지만 추천 기준에는 영향을 주지 않습니다.",
    notFound: "결과를 찾을 수 없습니다. 다시 비교해 주세요.",
    productNotFoundTitle: "제품을 찾을 수 없습니다",
    productNotFoundConclusion: (items: string[]) => `${items.join(", ")}은(는) 공식 제품 페이지에서 확인되지 않았습니다.`,
    productNotFoundReason: "출시 전 제품명, 오타, 지역 미출시 제품일 수 있어 추천을 생성하지 않았습니다.",
    productNotFoundDetail: "Axis는 공식 제조사 페이지에서 확인 가능한 제품만 비교합니다. 제품명을 다시 확인하거나 현재 출시된 모델명으로 비교해 주세요.",
    verificationPendingTitle: "공식 스펙 검증 대기",
    verificationPendingConclusion: "공식 제품은 확인됐지만 스펙 표를 만들 만큼 충분한 공식 항목을 아직 수집하지 못했습니다.",
    verificationPendingReason: "확실하지 않은 스펙으로 추천하지 않기 위해 결과 생성을 중단했습니다.",
    verificationPendingDetail: "공식 페이지 연결 또는 추출 규칙을 보강한 뒤 다시 비교하면 검증된 표로 표시됩니다.",
  },

  // Price
  price: {
    title: "현재 가격",
    lowest: "역대 최저",
    average: "평균가",
    deal: "지금 저렴",
    cheapest: "최저가",
    viewDeal: "가격 보기 ↗",
    demo: "데모 가격",
  },

  // Watch / Track
  watch: {
    track: "가격 추적",
    tracking: "추적 중",
    title: "관심 목록",
    empty: "추적 중인 제품이 없어요. 비교 결과에서 가격을 추적해보세요.",
    alertNote: "가격이 내리면 알림을 보내드려요.",
    remove: "삭제",
    pushPrompt: "가격이 내리면 바로 알림 받기",
    pushSub: "브라우저를 닫아도 알림이 와요. 언제든 해제할 수 있어요.",
    pushAllow: "알림 허용하기",
    pushSkip: "알림 없이 추적",
    pushDenied: "알림이 차단되어 있어요. 브라우저 설정에서 허용할 수 있어요.",
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
    recentHistory: "최근 기록",
  },

  // Auth
  auth: {
    tagline: "가장 합리적인 선택을 도와드립니다.",
    guestContinue: "로그인 없이 계속하기 →",
    welcome: "Axis에 오신 걸 환영해요",
    subtitle: "검증된 스펙으로 결론까지",
    loginTab: "로그인",
    signupTab: "회원가입",
    email: "이메일",
    password: "비밀번호",
    passwordConfirm: "비밀번호 확인",
    passwordMinHint: "6자 이상",
    passwordConfirmPlaceholder: "비밀번호 재입력",
    forgotPassword: "비밀번호 찾기",
    noAccount: "계정이 없으신가요?",
    hasAccount: "이미 계정이 있으신가요?",
    signupLink: "회원가입 →",
    loginLink: "로그인 →",
    orSeparator: "또는",
    googleBtn: "Google로 계속하기",
    emailVerifyTitle: "이메일을 확인해주세요",
    emailVerifyBody: (e: string) => `${e}으로 인증 링크를 보냈습니다.`,
    resetTitle: "재설정 링크를 보냈습니다",
    resetBody: (e: string) => `${e}으로 비밀번호 재설정 링크를 보냈습니다.`,
    back: "돌아가기",
    invalidCredentials: "이메일 또는 비밀번호가 올바르지 않습니다.",
    passwordMismatch: "비밀번호가 일치하지 않습니다.",
    passwordTooShort: "비밀번호는 6자 이상이어야 합니다.",
    emailRequired: "이메일을 먼저 입력해주세요.",
    loginBtn: "로그인",
    signupBtn: "회원가입",
    processing: "처리 중...",
    guest: "게스트로 계속하기",
    signupHint: (n: number) => `가입하면 하루 ${n}회 무료로 이용할 수 있어요.`,
    signupDone: "회원가입 완료! 이메일 인증 링크를 확인한 뒤 로그인해 주세요.",
    noSupabase: "Supabase 환경변수가 필요합니다.",
    envNote: "`.env.local`에 Supabase URL과 ANON KEY를 추가해 주세요.",
  },


  // Share / Affiliate
  share: {
    shareBtn: "결과 공유하기",
    sharing: "링크 생성 중...",
    copied: "복사됨 ✓",
    buyOn: (product: string) => `${product} 최저가 확인`,
    buyOnPro: (product: string) => `${product} 최저가 & 혜택 확인`,
    buyStore: "쿠팡",
    buyStoreGlobal: "Amazon",
    affiliateNote: "제휴 링크로 추가 비용 없이 동일 가격 구매 가능. 링크 수익은 Axis 운영에 사용됩니다.",
    proAffiliateNote: "Pro 멤버에게는 최적의 구매 혜택이 실시간 매핑됩니다. 추천 결과는 어떠한 상업적 대가 없이 독립적으로 도출됩니다.",
    proClean: "Pro 멤버에게는 검증된 판매처의 실시간 최저가와 혜택 정보가 자동 연동됩니다.",
    watermarkText: "로 비교한 결과예요.",
    watermarkCta: "나도 비교해보기 →",
    shareTitle: (product: string) => `Axis 추천: ${product}`,
    shareMessage: (product: string, url: string) => `Axis가 "${product}"을(를) 추천했어요 → ${url}`,
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
    switchToDark: "다크 모드로 전환",
    switchToLight: "라이트 모드로 전환",
  },
};
