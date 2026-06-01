export const en = {
  siteName: "axis",
  siteTagline: "Purchase Decision Compass",
  siteDescription: "A shopping decision guide that narrows choices using official specs and your real-world needs",

  home: {
    badge: "Official-spec shopping decision guide",
    hero1: "Narrow what to buy",
    hero2: "with reasons you can check.",
    sub: "Axis compares official specs with your budget, use case, and priorities so you spend less time stuck before buying.",
    proof: [
      { value: "Official", label: "Manufacturer specs first" },
      { value: "Context", label: "Use-case based judgment" },
      { value: "Transparent", label: "Affiliate links disclosed" }
    ],
    examplesTitle: "High-friction purchase comparisons",
    examplesSub: "Axis starts with categories where buyers compare heavily and need a clear, evidence-backed call.",
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
    methodSub: "Axis starts with verifiable information and your situation, not marketing copy.",
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
  },

  input: {
    ordinals: ["First", "Second", "Third", "Fourth", "Fifth"],
    placeholders: ["e.g. iPhone 16", "e.g. Galaxy S25", "e.g. Pixel 9", "e.g. Xiaomi 15", "e.g. OnePlus 13"],
    addOption: "＋ Add option",
    submit: "Ask Axis →",
    submitting: "Axis is deciding...",
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
    axisChoice: "AXIS RECOMMENDS",
    defaultConclusion: "This is the better choice for most cases.",
    basisTitle: "Decision basis",
    basis: [
      { title: "Official specs", body: "Verifiable official sources come first." },
      { title: "Context fit", body: "Budget, use case, portability, and longevity are weighed together." },
      { title: "Purchase transparency", body: "Buying links are disclosed separately from the recommendation." }
    ],
    whyChosen: "Why this one?",
    specComparison: "Spec comparison",
    winner: "Pick",
    officialLink: (name: string) => `${name} official`,
    perItemAnalysis: "Analysis by option",
    officialShort: "Official ↗",
    summary: "Summary",
    purchaseTitle: "Final check before buying",
    purchaseSub: "After reviewing the reasoning, compare price and availability. Affiliate links may support Axis, but they do not affect the recommendation.",
    notFound: "Result not found. Please compare again.",
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
    membership: "Membership",
    recentHistory: "History",
  },

  auth: {
    welcome: "Welcome to Axis",
    subtitle: "Your quiet companion for tough decisions",
    loginTab: "Log in",
    signupTab: "Sign up",
    email: "Email",
    password: "Password",
    loginBtn: "Log in",
    signupBtn: "Sign up",
    processing: "Processing...",
    guest: "Continue as guest",
    signupHint: (n: number) => `Get ${n} free decisions per day when you sign up.`,
    signupDone: "Done! Check your email to verify your account.",
    noSupabase: "Supabase config is required.",
    envNote: "Add your Supabase URL and ANON KEY to `.env.local`.",
  },

  account: {
    title: "Profile",
    email: "Email",
    joinedAt: "Member since",
    membershipLabel: "Plan",
    member: "member",
    todayUsage: "Today's picks",
    unlimited: "Unlimited",
    usageOf: (used: number, limit: number) => `${used} / ${limit}`,
    remaining: (n: number) => `${n} more picks available today. Resets at midnight.`,
    proUnlimited: "Pro members get unlimited picks every day.",
    needMore: "Need more picks?",
    needMoreDesc: "Plus gets 30/day. Pro is unlimited + up to 5-way comparison.",
    viewMembership: "View plans",
    editNickname: "Edit nickname",
    nicknamePlaceholder: "Enter a nickname",
    save: "Save",
    saving: "Saving...",
    cancel: "Cancel",
    saveError: "Failed to save.",
    loginRequired: "Log in required.",
  },

  membership: {
    badge: "Membership",
    title: "No limits on your decisions",
    sub: "Only what you need, at a price that makes sense.",
    popular: "Most popular",
    currentPlan: "Current plan",
    included: "Included",
    compareTitle: "Plan comparison",
    paymentNote: "Payment integration coming soon. Cancel anytime.",
    startFree: "Start for free",
    proCurrent: "You're a Pro member. Thank you 🙌",
    waitlistDone: "On the waitlist 🙌",
    upgrade: (plan: string) => `Upgrade to ${plan}`,
  },

  share: {
    shareBtn: "Share result",
    sharing: "Creating link...",
    copied: "Copied ✓",
    buyOn: (product: string) => `Check price for ${product}`,
    buyStore: "Coupang",
    buyStoreGlobal: "Amazon",
    affiliateNote: "This is an affiliate link. It helps keep Axis free. Same price for you.",
    proClean: "Pro members enjoy an ad-free experience.",
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
  },
};
