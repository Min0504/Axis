export const ja = {
  siteName: "axis",
  siteTagline: "公式スペック基準の購入判断",
  siteDescription: "公式スペックと利用シーンをもとに、買う前の迷いを短くする選択ガイド",

  home: {
    badge: "検証済みスペック · 即決",
    hero1: "何を買うか決められないなら、",
    hero2: "Axisが今すぐ選びます。",
    sub: "メーカー公式スペックと実際の用途を組み合わせ、今すぐ買うべき一つを選びます。",
    proof: [
      { value: "公式", label: "スペック検証" },
      { value: "最適", label: "状況分析" },
      { value: "即決", label: "ひとつの結論" }
    ],
    examplesTitle: "この比較から始めてみましょう",
    examplesSub: "クリックすると入力欄にそのまま入ります。Axisは高関与の電子機器から深く比較します。",
    tryThis: "比較する →",
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
    methodSubEm: "広告文ではなく、",
    methodSub: "確認できる情報とあなたの状況を先に見ます。",
    features: [
      { title: "公式スペック検証", body: "メーカー公式データに基づく" },
      { title: "AIによる結論", body: "即時の推薦と理由を提供" },
      { title: "最大5製品の同時比較", body: "N-way比較に対応" },
      { title: "価格追跡・通知", body: "価格下落時に即時通知" },
      { title: "結果をシェア", body: "リンク1つで結果を共有" },
      { title: "多言語対応", body: "韓国語・英語・日本語" },
    ],
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
    compareTitle: "人気の比較",
    compareSub: "公式スペックをもとに事前に分析した人気比較です。",
    compareRealData: "ユーザーが最も多く検索した比較です。",
    compareViewAll: (n: number) => `比較をすべて見る (${n}件) →`,
    categoryLabels: {
      laptop: "ノートPC",
      smartphone: "スマートフォン",
      earphones: "イヤホン・ヘッドホン",
      tablet: "タブレット",
    },
  },

  input: {
    ordinals: ["1番目", "2番目", "3番目", "4番目", "5番目"],
    placeholders: ["例: iPhone 16", "例: Galaxy S25", "例: Pixel 9", "例: Xiaomi 15", "例: OnePlus 13"],
    addOption: "＋ 選択肢を追加",
    submit: "Axisに決めてもらう →",
    submitting: "分析中...",
    optionSlot: (n: number) => `選択肢 ${n}`,
    proUpsell: "3つ以上を一度に比較するには",
    pro: "Pro",
    upgradePrompt: "もっと選択するにはアップグレード →",
    errorEmpty: "2つ以上の選択肢を入力してください。",
    errorLength: (n: number) => `各選択肢は${n}文字以内にしてください。`,
    errorDuplicate: "選択肢は重複できません。",
    errorGeneral: "エラーが発生しました。もう一度お試しください。",
  },

  results: {
    back: "← もう一度選択する",
    axisChoice: "Axisのおすすめ",
    defaultConclusion: "公式スペックと実用基準で、こちらがより適切な選択です。",
    basisTitle: "判断基準",
    basis: [
      { title: "公式スペック", body: "確認できる公式情報を優先して比較します。" },
      { title: "状況適合度", body: "価格、用途、携帯性、長期利用を合わせて見ます。" },
      { title: "購入の透明性", body: "購入リンクは推薦理由と分けて表示します。" }
    ],
    fitScoreLabel: "スペック優位比率",
    fitScoreNote: "数値比較可能な公式スペック項目を基準",
    whyChosen: "おすすめの理由",
    specComparison: "公式スペック比較",
    specComparisonPending: "スペック比較",
    specEmptyNote: "公式スペックデータ収集中です。下記の公式ページで直接ご確認ください。",
    winner: "おすすめ",
    officialLink: (name: string) => `${name} 公式`,
    perItemAnalysis: "選択肢の分析",
    officialShort: "公式 ↗",
    sourceManufacturer: "メーカー公式",
    sourceImporter: "正規輸入代理店",
    summary: "まとめ",
    purchaseTitle: "購入前の最終確認",
    purchaseSub: "根拠を確認したあと、価格と在庫を比べてください。アフィリエイトリンクはAxisの運営に役立つ場合がありますが、推薦基準には影響しません。",
    notFound: "結果が見つかりません。もう一度比較してください。",
    productNotFoundTitle: "製品が見つかりません",
    productNotFoundConclusion: (items: string[]) => `${items.join(", ")} は公式製品ページで確認できませんでした。`,
    productNotFoundReason: "未発売の製品名、入力ミス、または地域未発売の製品である可能性があるため、推薦は生成しませんでした。",
    productNotFoundDetail: "Axisはメーカー公式ページで確認できる製品だけを比較します。製品名を確認するか、現在発売されているモデル名で比較してください。",
    verificationPendingTitle: "公式スペック検証待ち",
    verificationPendingConclusion: "公式製品は確認できましたが、検証済みの表を作るのに十分な公式項目をまだ収集できませんでした。",
    verificationPendingReason: "不確かなスペックで推薦しないため、結果生成を停止しました。",
    verificationPendingDetail: "公式ページの対応または抽出ルールを追加すると、検証済みの表として表示できます。",
  },

  // Price
  price: {
    title: "現在の価格",
    lowest: "最安値",
    average: "平均",
    deal: "今が安い",
    cheapest: "最安",
    viewDeal: "価格を見る ↗",
    demo: "デモ価格",
  },

  // Watch / Track
  watch: {
    track: "価格を追跡",
    tracking: "追跡中",
    title: "ウォッチリスト",
    empty: "追跡中の製品はありません。比較結果から価格を追跡しましょう。",
    alertNote: "値下がりしたら通知でお知らせします。",
    remove: "削除",
    pushPrompt: "値下がり通知をすぐに受け取る",
    pushSub: "タブを閉じていても通知が届きます。いつでもキャンセルできます。",
    pushAllow: "通知を許可する",
    pushSkip: "通知なしで追跡",
    pushDenied: "通知がブロックされています。ブラウザ設定から許可できます。",
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
    recentHistory: "最近の履歴",
  },

  auth: {
    tagline: "最も合理的な選択をサポートします。",
    guestContinue: "ログインせずに続ける →",
    welcome: "Axisへようこそ",
    subtitle: "選択に迷うあなたの静かなパートナー",
    loginTab: "ログイン",
    signupTab: "新規登録",
    email: "メールアドレス",
    password: "パスワード",
    passwordConfirm: "パスワード確認",
    passwordMinHint: "6文字以上",
    passwordConfirmPlaceholder: "パスワードを再入力",
    forgotPassword: "パスワードを忘れた",
    noAccount: "アカウントをお持ちでないですか？",
    hasAccount: "すでにアカウントをお持ちですか？",
    signupLink: "新規登録 →",
    loginLink: "ログイン →",
    orSeparator: "または",
    googleBtn: "Googleで続ける",
    emailVerifyTitle: "メールを確認してください",
    emailVerifyBody: (e: string) => `${e}に認証リンクを送りました。`,
    resetTitle: "リセットリンクを送りました",
    resetBody: (e: string) => `${e}にパスワードリセットリンクを送りました。`,
    back: "戻る",
    invalidCredentials: "メールアドレスまたはパスワードが正しくありません。",
    passwordMismatch: "パスワードが一致しません。",
    passwordTooShort: "パスワードは6文字以上にしてください。",
    emailRequired: "先にメールアドレスを入力してください。",
    loginBtn: "ログイン",
    signupBtn: "新規登録",
    processing: "処理中...",
    guest: "ゲストとして続ける",
    signupHint: (n: number) => `登録すると1日${n}回無料で利用できます。`,
    signupDone: "登録完了！メールを確認してログインしてください。",
    noSupabase: "Supabase設定が必要です。",
    envNote: "`.env.local`にSupabase URLとANON KEYを追加してください。",
  },


  share: {
    shareBtn: "結果をシェア",
    sharing: "リンク作成中...",
    copied: "コピーしました ✓",
    buyOn: (product: string) => `${product}の価格を確認`,
    buyStore: "Coupang",
    buyStoreGlobal: "Amazon",
    affiliateNote: "このリンクはアフィリエイトリンクです。Axisの運営に役立てられます。追加費用はかかりません。",
    watermarkText: "でこの比較をしました。",
    watermarkCta: "自分でも試してみる →",
    shareTitle: (product: string) => `Axisのおすすめ: ${product}`,
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
    switchToDark: "ダークモードに切り替え",
    switchToLight: "ライトモードに切り替え",
  },
};
