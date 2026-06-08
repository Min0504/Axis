export const en = {
  siteName: "axis",
  siteTagline: "Official spec-based purchase decisions",
  siteDescription: "A shopping decision guide that narrows choices using official specs and your real-world needs",

  home: {
    badge: "Verified specs · Instant verdict",
    hero1: "Can't decide what to buy?",
    hero2: "Axis picks one. Right now.",
    sub: "We analyze official manufacturer specs alongside your real-world needs —\nso you can make the best choice with confidence.",
    proof: [
      { value: "Official spec verified", label: "" },
      { value: "Accurate", label: " comparison" },
      { value: "Rational", label: " basis" }
    ],
    examplesTitle: "Start with one of these",
    examplesSub: "Click to fill the inputs instantly. Axis goes deep on high-stakes electronics first.",
    tryThis: "Compare →",
    examples: [
      {
        category: "Phones",
        query: "iPhone 16 vs Galaxy S25",
        note: "Camera, battery, weight, resale value"
      },
      {
        category: "Laptops",
        query: "MacBook Air vs Galaxy Book",
        note: "Portability, performance, school/work fit"
      },
      {
        category: "Earbuds",
        query: "AirPods Pro vs Galaxy Buds",
        note: "ANC, calls, ecosystem fit"
      }
    ],
    methodTitle: "How Axis decides",
    methodSubEm: "Not marketing copy —",
    methodSub: "Axis starts with verifiable information and your real-world situation.",
    features: [
      { title: "Official spec verified", body: "Based on manufacturer data" },
      { title: "AI purchase verdict", body: "Instant recommendation with reasoning" },
      { title: "Up to 5-way comparison", body: "N-way comparison supported" },
      { title: "Price tracking & alerts", body: "Alert when price drops" },
      { title: "Share results", body: "Share results with a single link" },
      { title: "Multilingual", body: "Korean · English · Japanese" },
    ],
    method: [
      {
        title: "Check official specs",
        body: "We prioritize fields that can be verified from manufacturer pages."
      },
      {
        title: "Classify by context",
        body: "Budget, use case, portability, and long-term value are weighed together."
      },
      {
        title: "Show regret cases",
        body: "We show who should avoid the recommendation, not only who should buy it."
      }
    ],
    compareTitle: "Popular comparisons",
    compareSub: "Pre-analyzed comparisons based on official specs.",
    compareRealData: "The most searched comparisons by users.",
    compareViewAll: (n: number) => `View all comparisons (${n}) →`,
    categoryLabels: {
      laptop: "Laptops",
      smartphone: "Smartphones",
      earphones: "Earphones & Headphones",
      tablet: "Tablets",
    },
  },

  input: {
    ordinals: ["First", "Second", "Third", "Fourth", "Fifth"],
    placeholders: ["e.g. iPhone 16", "e.g. Galaxy S25", "e.g. Pixel 9", "e.g. Xiaomi 15", "e.g. OnePlus 13"],
    addOption: "＋ Add option",
    submit: "Let Axis decide →",
    submitting: "Analyzing...",
    optionSlot: (n: number) => `Option ${n}`,
    proUpsell: "Compare 3+ at once with",
    pro: "Pro",
    upgradePrompt: "Upgrade for more →",
    errorEmpty: "Please enter at least two options.",
    errorLength: (n: number) => `Each option must be under ${n} characters.`,
    errorDuplicate: "Options must be unique.",
    errorGeneral: "Something went wrong. Please try again.",
  },

  results: {
    back: "← Compare again",
    axisChoice: "Axis Recommends",
    defaultConclusion: "Based on verified specs and real-world fit, this is the stronger choice.",
    basisTitle: "Decision basis",
    basis: [
      { title: "Official specs", body: "Verifiable official sources come first." },
      { title: "Context fit", body: "Budget, use case, portability, and longevity are weighed together." },
      { title: "Purchase transparency", body: "Buying links are disclosed separately from the recommendation." }
    ],
    whyChosen: "Why this pick?",
    specComparison: "Official spec comparison",
    specComparisonPending: "Spec comparison",
    specEmptyNote: "Official spec data is being collected. Check the official pages below.",
    winner: "Pick",
    officialLink: (name: string) => `${name} official`,
    perItemAnalysis: "Option breakdown",
    officialShort: "Official ↗",
    sourceManufacturer: "Manufacturer official",
    sourceImporter: "Authorized importer",
    summary: "Summary",
    purchaseTitle: "Final check before buying",
    purchaseSub: "After reviewing the reasoning, compare price and availability. Affiliate links may support Axis, but never affect the recommendation.",
    notFound: "Result not found. Please compare again.",
    productNotFoundTitle: "Product not found",
    productNotFoundConclusion: (items: string[]) => `${items.join(", ")} could not be verified on official product pages.`,
    productNotFoundReason: "It may be an unreleased model name, a typo, or a product not available in this region, so Axis did not generate a recommendation.",
    productNotFoundDetail: "Axis only compares products that can be verified from official manufacturer pages. Please check the product name or compare currently released models.",
    verificationPendingTitle: "Official spec verification pending",
    verificationPendingConclusion: "The products were found, but Axis could not collect enough official fields to build a verified spec table yet.",
    verificationPendingReason: "Axis stopped before recommending anything based on uncertain specs.",
    verificationPendingDetail: "Once official page mapping or extraction rules are improved, this comparison will be shown as a verified table.",
  },

  // Price
  price: {
    title: "Current price",
    lowest: "All-time low",
    average: "Avg",
    deal: "Good deal",
    cheapest: "Cheapest",
    viewDeal: "View price ↗",
    demo: "Demo price",
  },

  // Watch / Track
  watch: {
    track: "Track price",
    tracking: "Tracking",
    title: "Watchlist",
    empty: "Nothing tracked yet. Track a price from a comparison.",
    alertNote: "We'll notify you when the price drops.",
    remove: "Remove",
    pushPrompt: "Get instant price-drop alerts",
    pushSub: "Alerts work even with the tab closed. Cancel anytime.",
    pushAllow: "Allow notifications",
    pushSkip: "Track without alerts",
    pushDenied: "Notifications are blocked. You can enable them in browser settings.",
  },

  history: {
    title: "Recent history",
    loginPrompt: "Log in to save your comparison history.",
    loginLink: "Log in →",
    empty: "No history yet. Make your first pick.",
    viewAgain: "View",
    delete: "Delete",
    deleting: "Deleting...",
    deleteConfirm: "Delete this record? This cannot be undone.",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: (n: number) => `${n}d ago`,
  },

  nav: {
    login: "Log in",
    logout: "Log out",
    loggedIn: "Logged in",
    myInfo: "Profile",
    recentHistory: "History",
  },

  auth: {
    tagline: "Your most rational choice, made easy.",
    guestContinue: "Continue without signing in →",
    welcome: "Welcome to Axis",
    subtitle: "Verified specs. One clear answer.",
    loginTab: "Log in",
    signupTab: "Sign up",
    email: "Email",
    password: "Password",
    passwordConfirm: "Confirm password",
    passwordMinHint: "At least 6 characters",
    passwordConfirmPlaceholder: "Re-enter password",
    forgotPassword: "Forgot password",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    signupLink: "Sign up →",
    loginLink: "Log in →",
    orSeparator: "or",
    googleBtn: "Continue with Google",
    emailVerifyTitle: "Check your email",
    emailVerifyBody: (e: string) => `We sent a verification link to ${e}.`,
    resetTitle: "Reset link sent",
    resetBody: (e: string) => `We sent a password reset link to ${e}.`,
    back: "Go back",
    invalidCredentials: "Invalid email or password.",
    passwordMismatch: "Passwords do not match.",
    passwordTooShort: "Password must be at least 6 characters.",
    emailRequired: "Please enter your email first.",
    loginBtn: "Log in",
    signupBtn: "Sign up",
    processing: "Processing...",
    guest: "Continue as guest",
    signupHint: (n: number) => `Get ${n} free decisions per day when you sign up.`,
    signupDone: "Done! Check your email to verify your account.",
    noSupabase: "Supabase config is required.",
    envNote: "Add your Supabase URL and ANON KEY to `.env.local`.",
  },


  share: {
    shareBtn: "Share result",
    sharing: "Creating link...",
    copied: "Copied ✓",
    buyOn: (product: string) => `Check price — ${product}`,
    buyOnPro: (product: string) => `Best price & deals for ${product}`,
    buyStore: "Coupang",
    buyStoreGlobal: "Amazon",
    affiliateNote: "Affiliate link — same price for you. Revenue helps keep Axis free.",
    proAffiliateNote: "Pro members get optimal shopping links mapped in real-time. Recommendations are completely independent.",
    proClean: "Pro members get real-time lowest price and discount mapping from trusted stores.",
    watermarkText: "compared on",
    watermarkCta: "Try it yourself →",
    shareTitle: (product: string) => `Axis picks: ${product}`,
    shareMessage: (product: string, url: string) => `Axis picked "${product}" → ${url}`,
    sharedFallback: "Shared pick",
  },

  limit: {
    reached: "You've used all your picks for today. Upgrade for more.",
    upgrade: "Upgrade for more →",
    rateLimit: "Too many requests. Please wait a moment.",
  },

  error: {
    title: "Something went wrong",
    subtitle: "Please try again in a moment.",
    retry: "Try again",
    notFound: "Page not found",
    notFoundSub: "The page may have moved or been deleted.",
    backHome: "Back to home",
    loading: "Loading...",
  },

  settings: {
    language: "Language",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    switchToDark: "Switch to dark mode",
    switchToLight: "Switch to light mode",
  },
};
