export const ja = {
  siteName: "axis",
  siteTagline: "購入判断コンパス",
  siteDescription: "公式スペックと利用シーンをもとに、買う前の迷いを短くする選択ガイド",

  home: {
    badge: "公式スペックベースの購入判断ガイド",
    hero1: "何を買うべきか、",
    hero2: "根拠つきで絞り込みます。",
    sub: "メーカー公式スペックと予算、用途、優先順位を合わせて見ながら、購入前の迷いを短くします。",
    proof: [
      { value: "公式", label: "メーカー仕様を優先" },
      { value: "状況", label: "用途別に判断" },
      { value: "透明", label: "アフィリエイトを明示" }
    ],
    examplesTitle: "よく迷う購入比較",
    examplesSub: "Axisは比較疲れが起きやすい高関与カテゴリから、根拠ある判断を深めていきます。",
    examples: [
      {
        category: "スマートフォン",
        query: "iPhone 16 vs Galaxy S25",
        note: "カメラ、バッテリー、重さ、リセール"
      },
      {
        category: "ノートPC",
        query: "MacBook Air vs Galaxy Book",
        note: "携帯性、性能、学業・仕事への適性"
      },
      {
        category: "イヤホン",
        query: "AirPods Pro vs Galaxy Buds",
        note: "ノイズキャンセル、通話、エコシステム"
      }
    ],
    methodTitle: "Axisの判断方法",
    methodSub: "広告文ではなく、確認できる情報とあなたの状況を先に見ます。",
    method: [
      {
        title: "公式スペック確認",
        body: "メーカー公式ページで確認できる項目を優先して比較します。"
      },
      {
        title: "状況別に分類",
        body: "価格、用途、携帯性、長く使えるかを合わせて整理します。"
      },
      {
        title: "後悔条件も表示",
        body: "おすすめだけでなく、どんな人には合わないかも示します。"
      }
    ],
  },

  input: {
    ordinals: ["1番目", "2番目", "3番目", "4番目", "5番目"],
    placeholders: ["例: iPhone 16", "例: Galaxy S25", "例: Pixel 9", "例: Xiaomi 15", "例: OnePlus 13"],
    addOption: "＋ 選択肢を追加",
    submit: "Axisに聞いてみる →",
    submitting: "Axisが選択中...",
    optionSlot: (n: number) => `選択肢 ${n}`,
    proUpsell: "3つ以上を一度に比較するには",
    pro: "Pro",
    upgradePrompt: "もっと選択するにはアップグレード →",
    errorEmpty: "2つ以上の選択肢を入力してください。",
    errorLength: (n: number) => `各選択肢は${n}文字以内にしてください。`,
    errorGeneral: "エラーが発生しました。もう一度お試しください。",
  },

  results: {
    back: "← もう一度選択する",
    axisChoice: "AXISのおすすめ",
    defaultConclusion: "今回はこちらを選ぶのがより適切です。",
    basisTitle: "判断基準",
    basis: [
      { title: "公式スペック", body: "確認できる公式情報を優先して比較します。" },
      { title: "状況適合度", body: "価格、用途、携帯性、長期利用を合わせて見ます。" },
      { title: "購入の透明性", body: "購入リンクは推薦理由と分けて表示します。" }
    ],
    whyChosen: "なぜこれを選んだのか？",
    specComparison: "スペック比較",
    winner: "選択",
    officialLink: (name: string) => `${name} 公式`,
    perItemAnalysis: "選択肢別の詳細分析",
    officialShort: "公式 ↗",
    summary: "まとめ",
    purchaseTitle: "購入前の最終確認",
    purchaseSub: "根拠を確認したあと、価格と在庫を比べてください。アフィリエイトリンクはAxisの運営に役立つ場合がありますが、推薦基準には影響しません。",
    notFound: "結果が見つかりません。もう一度比較してください。",
  },

  history: {
    title: "最近の履歴",
    loginPrompt: "ログインすると比較履歴が保存されます。",
    loginLink: "ログイン →",
    empty: "まだ履歴がありません。最初の選択をしてみましょう。",
    viewAgain: "もう一度見る",
    delete: "削除",
    deleting: "削除中...",
    deleteConfirm: "この履歴を削除しますか？元に戻すことはできません。",
    today: "今日",
    yesterday: "昨日",
    daysAgo: (n: number) => `${n}日前`,
  },

  nav: {
    login: "ログイン",
    logout: "ログアウト",
    loggedIn: "ログイン中",
    myInfo: "マイページ",
    membership: "メンバーシップ",
    recentHistory: "最近の履歴",
  },

  auth: {
    welcome: "Axisへようこそ",
    subtitle: "選択に迷うあなたの静かなパートナー",
    loginTab: "ログイン",
    signupTab: "新規登録",
    email: "メールアドレス",
    password: "パスワード",
    loginBtn: "ログイン",
    signupBtn: "新規登録",
    processing: "処理中...",
    guest: "ゲストとして続ける",
    signupHint: (n: number) => `登録すると1日${n}回無料で利用できます。`,
    signupDone: "登録完了！メールを確認してログインしてください。",
    noSupabase: "Supabase設定が必要です。",
    envNote: "`.env.local`にSupabase URLとANON KEYを追加してください。",
  },

  account: {
    title: "マイページ",
    email: "メールアドレス",
    joinedAt: "登録日",
    membershipLabel: "プラン",
    member: "メンバー",
    todayUsage: "今日の選択",
    unlimited: "無制限",
    usageOf: (used: number, limit: number) => `${used} / ${limit}回`,
    remaining: (n: number) => `今日あと${n}回選択できます。毎日0時にリセットされます。`,
    proUnlimited: "Proメンバーは毎日無制限で選択できます。",
    needMore: "もっと選択が必要ですか？",
    needMoreDesc: "Plusは1日30回、Proは無制限＋最大5つ同時比較。",
    viewMembership: "プランを見る",
    editNickname: "ニックネームを編集",
    nicknamePlaceholder: "ニックネームを入力",
    save: "保存",
    saving: "保存中...",
    cancel: "キャンセル",
    saveError: "保存できませんでした。",
    loginRequired: "ログインが必要です。",
  },

  membership: {
    badge: "メンバーシップ",
    title: "選択に制限を設けないで",
    sub: "必要な分だけ、手頃な価格で。",
    popular: "人気No.1",
    currentPlan: "現在のプラン",
    included: "含まれます",
    compareTitle: "プラン比較",
    paymentNote: "決済連携は準備中です。いつでもキャンセルできます。",
    startFree: "無料で始める",
    proCurrent: "Proメンバーです。ありがとうございます 🙌",
    waitlistDone: "ウェイトリストに登録しました 🙌",
    upgrade: (plan: string) => `${plan}にアップグレード`,
  },

  share: {
    shareBtn: "結果をシェア",
    sharing: "リンク作成中...",
    copied: "コピーしました ✓",
    buyOn: (product: string) => `${product}の価格を確認`,
    buyStore: "Coupang",
    buyStoreGlobal: "Amazon",
    affiliateNote: "このリンクはアフィリエイトリンクです。Axisの運営に役立てられます。追加費用はかかりません。",
    proClean: "Proメンバーは広告なしのクリーンな体験をご利用いただけます。",
    watermarkText: "でこの比較をしました。",
    watermarkCta: "自分でも試してみる →",
    shareTitle: (product: string) => `Axisの選択: ${product}`,
    shareMessage: (product: string, url: string) => `Axisが「${product}」を選びました → ${url}`,
    sharedFallback: "共有した選択",
  },

  limit: {
    reached: "今日の選択回数をすべて使いました。上位プランでもっと選択できます。",
    upgrade: "もっと選択するにはアップグレード →",
    rateLimit: "リクエストが多すぎます。少し待ってからもう一度お試しください。",
  },

  error: {
    title: "問題が発生しました",
    subtitle: "しばらくしてからもう一度お試しください。",
    retry: "もう一度試す",
    notFound: "ページが見つかりません",
    notFoundSub: "URLが変わったか、削除された可能性があります。",
    backHome: "ホームに戻る",
    loading: "読み込み中...",
  },

  settings: {
    language: "言語",
    theme: "テーマ",
    light: "ライト",
    dark: "ダーク",
  },
};
