import type { Category } from "@/lib/types";

/**
 * Category schema registry — the heart of Axis's comparison engine.
 *
 * A category schema defines the *axes* on which products in that category are
 * compared. Each field carries enough metadata to:
 *   1. tell the spec resolver / AI what to fill (key, label, unit, hint),
 *   2. render an aligned comparison table (label, unit, type),
 *   3. rank objectively where possible (`better`: higher / lower / none),
 *   4. weight the decision layer (`primary` fields matter most).
 *
 * Adding a new electronics category = adding a CategorySchema here + filling
 * verified data. The engine itself never changes. This is what lets "general
 * electronics comparison" scale without drowning.
 */

export type SpecFieldType = "numeric" | "text" | "enum" | "boolean";

/** Which direction wins when ranking a numeric field. "none" = not rankable. */
export type BetterDirection = "higher" | "lower" | "none";

export type SpecField = {
  /** Stable machine key, e.g. "battery_wh". Never shown to users. */
  key: string;
  /** Display label (Korean primary). */
  label: string;
  /** English label for i18n. */
  labelEn: string;
  type: SpecFieldType;
  /** Unit suffix for UI + parsing, e.g. "Wh", "g", "Hz". */
  unit?: string;
  /** For numeric fields: which direction is "better". */
  better: BetterDirection;
  /** Primary axes drive the default table + decision weighting. */
  primary: boolean;
  /** Guidance for the spec resolver / AI on how to fill this field. */
  hint?: string;
  searchTerms?: string[];
};

export type CategorySchema = {
  category: Category;
  /** Display name of the category (Korean). */
  label: string;
  labelEn: string;
  fields: SpecField[];
};

// ─────────────────────────────────────────────────────────────────────────
// Lead category: LAPTOP. Highest "confusion-to-stakes" ratio in electronics —
// where buyers are most lost and generic chatbots are least reliable.
// User-specified fields: CPU, GPU, RAM, 저장공간, 화면크기, 해상도, 배터리, 무게, OS, 가격, 출시일
// ─────────────────────────────────────────────────────────────────────────
const laptopSchema: CategorySchema = {
  category: "laptop",
  label: "노트북",
  labelEn: "Laptop",
  fields: [
    { key: "model_name", label: "모델명", labelEn: "Model", type: "text", better: "none", primary: true,
      hint: "공식 제품명과 대표 구성명", searchTerms: ["모델명", "model", "제품명", "product name"] },
    { key: "cpu", label: "CPU", labelEn: "CPU", type: "text", better: "none", primary: true,
      hint: "정확한 모델명 (예: Apple M4, Intel Core Ultra 7 155H, AMD Ryzen 7 8845HS)", searchTerms: ["프로세서", "processor", "cpu", "칩", "chip"] },
    { key: "gpu", label: "GPU", labelEn: "GPU", type: "text", better: "none", primary: true,
      hint: "내장/외장 구분 포함 (예: Apple GPU 10-core, RTX 4060 8GB)", searchTerms: ["그래픽", "gpu", "graphics"] },
    { key: "ram_gb", label: "RAM", labelEn: "RAM", type: "numeric", unit: "GB", better: "higher", primary: true,
      hint: "기본 구성 용량 (GB)", searchTerms: ["메모리", "memory", "ram", "unified memory"] },
    { key: "storage_gb", label: "저장공간", labelEn: "Storage", type: "numeric", unit: "GB", better: "higher", primary: true,
      hint: "기본 SSD 용량 (GB)", searchTerms: ["저장공간", "저장 장치", "storage", "ssd"] },
    { key: "display_inch", label: "화면 크기", labelEn: "Display size", type: "numeric", unit: "인치", better: "none", primary: true,
      hint: "대각선 인치", searchTerms: ["디스플레이", "display", "screen", "화면"] },
    { key: "resolution", label: "해상도", labelEn: "Resolution", type: "text", better: "none", primary: true,
      hint: "예: 2560×1600, 2880×1864", searchTerms: ["해상도", "resolution"] },
    { key: "battery_wh", label: "배터리", labelEn: "Battery", type: "numeric", unit: "Wh", better: "higher", primary: true,
      hint: "배터리 용량 (Wh)", searchTerms: ["배터리", "battery", "Wh", "watt-hour"] },
    { key: "weight_g", label: "무게", labelEn: "Weight", type: "numeric", unit: "g", better: "lower", primary: true,
      hint: "그램 단위. 휴대성의 핵심 축", searchTerms: ["무게", "weight"] },
    { key: "os", label: "OS", labelEn: "OS", type: "text", better: "none", primary: true,
      searchTerms: ["운영체제", "os", "operating system", "macOS", "Windows"] },
    { key: "chipset", label: "칩셋", labelEn: "Chipset", type: "text", better: "none", primary: false,
      hint: "다나와 수집 chip 정보 (cpu 필드와 별도 — Apple Silicon / Intel Core 등)",
      searchTerms: ["칩셋", "chip", "processor", "SoC"] },
    { key: "price_krw", label: "가격", labelEn: "Price", type: "numeric", unit: "원", better: "lower", primary: false,
      hint: "국내 출시가/대표가 (원) — 시세 변동이 커서 검증 게이트에서 제외", searchTerms: ["가격", "price", "출시가", "정가"] },
    { key: "launch_price_krw", label: "출시가격", labelEn: "Launch price", type: "text", better: "none", primary: false,
      hint: "다나와 기준 출시가 (원) — 검증 게이트 제외", searchTerms: ["출시가", "launch price", "MSRP"] },
    { key: "release_date", label: "출시일", labelEn: "Release date", type: "text", better: "none", primary: false,
      hint: "공식 출시 연월 (예: 2025년 3월)", searchTerms: ["출시일", "launch date", "release date", "출시 날짜"] },
    { key: "refresh_hz", label: "주사율", labelEn: "Refresh rate", type: "numeric", unit: "Hz", better: "higher", primary: true,
      searchTerms: ["주사율", "refresh", "refresh rate", "Hz"] },
    { key: "brightness_nits", label: "밝기", labelEn: "Brightness", type: "numeric", unit: "nits", better: "higher", primary: true,
      searchTerms: ["밝기", "brightness", "nit", "nits"] },
    { key: "panel", label: "패널", labelEn: "Panel", type: "enum", better: "none", primary: false,
      hint: "IPS / OLED / Liquid Retina / Mini-LED 등", searchTerms: ["패널", "panel", "OLED", "IPS", "Mini-LED"] },
    { key: "ports", label: "포트", labelEn: "Ports", type: "text", better: "none", primary: false,
      hint: "예: Thunderbolt 4 ×2, USB-A ×1, HDMI", searchTerms: ["포트", "ports", "Thunderbolt", "USB", "HDMI"] }
  ]
};

// ─────────────────────────────────────────────────────────────────────────
// Smartphone. User-specified fields (in order):
// 출시일, 출시가격, 디스플레이, 칩셋, 램, 저장공간, 카메라, 배터리, 충전, 무게
// ─────────────────────────────────────────────────────────────────────────
const smartphoneSchema: CategorySchema = {
  category: "smartphone",
  label: "스마트폰",
  labelEn: "Smartphone",
  fields: [
    { key: "model_name", label: "모델명", labelEn: "Model", type: "text", better: "none", primary: true,
      searchTerms: ["모델명", "model", "제품명", "product name"] },
    { key: "release_date", label: "출시일", labelEn: "Release date", type: "text", better: "none", primary: false,
      hint: "공식 출시 연월 (예: 2024년 9월) — 데이터셋 미보유, 검증 게이트 제외", searchTerms: ["출시일", "launch date", "release date", "출시 날짜"] },
    { key: "launch_price_krw", label: "출시가격", labelEn: "Launch price", type: "text", better: "none", primary: false,
      hint: "공식 출시가 — 기본 모델 기준 (예: 125만원부터) — 시세 변동이 커서 검증 게이트 제외", searchTerms: ["출시가격", "launch price", "starting price", "출시가", "MSRP", "starts at"] },
    { key: "display_inch", label: "디스플레이", labelEn: "Display", type: "numeric", unit: "인치", better: "none", primary: true,
      searchTerms: ["디스플레이", "display", "screen", "화면"] },
    { key: "chipset", label: "칩셋", labelEn: "Chipset", type: "text", better: "none", primary: true,
      hint: "정확한 SoC명 (예: A18 Pro, Snapdragon 8 Elite, Exynos 2500)", searchTerms: ["칩셋", "프로세서", "processor", "chipset", "chip", "SoC"] },
    { key: "ram_gb", label: "램", labelEn: "RAM", type: "numeric", unit: "GB", better: "higher", primary: false,
      hint: "기본 구성 RAM (GB) — 데이터셋 미보유, 검증 게이트 제외", searchTerms: ["램", "메모리", "RAM", "memory"] },
    { key: "storage_gb", label: "저장공간", labelEn: "Storage", type: "numeric", unit: "GB", better: "higher", primary: true,
      hint: "기본 구성 용량 (GB)", searchTerms: ["저장공간", "저장 용량", "storage", "capacity", "GB"] },
    { key: "camera_mp", label: "카메라", labelEn: "Camera", type: "numeric", unit: "MP", better: "higher", primary: true,
      hint: "메인(광각) 센서 화소",
      searchTerms: ["카메라", "camera", "main camera", "wide camera", "MP"] },
    { key: "battery", label: "배터리", labelEn: "Battery", type: "text", better: "none", primary: true,
      hint: "제조사 공식 표기 그대로 (예: 동영상 재생 최대 22시간, 4000mAh)",
      searchTerms: ["배터리", "battery", "power and battery", "video playback", "mAh"] },
    { key: "charging", label: "충전", labelEn: "Charging", type: "text", better: "none", primary: false,
      hint: "유선 충전 속도 + 무선 지원 여부 — 데이터셋 미보유, 검증 게이트 제외",
      searchTerms: ["충전", "charging", "fast charging", "wireless charging", "유선 충전", "무선 충전", "watt", "MagSafe"] },
    { key: "water_resist", label: "방수", labelEn: "Water resistance", type: "text", better: "none", primary: false,
      hint: "예: IP68, IP67 — 검증 게이트 제외 (다나와 수집)",
      searchTerms: ["방수", "water resistance", "IP", "방수등급", "dust resistance"] },
    { key: "weight_g", label: "무게", labelEn: "Weight", type: "numeric", unit: "g", better: "lower", primary: true,
      searchTerms: ["무게", "weight"] },
    { key: "os", label: "운영체제", labelEn: "OS", type: "text", better: "none", primary: false,
      searchTerms: ["운영체제", "os", "iOS", "Android", "One UI"] },
    { key: "refresh_hz", label: "주사율", labelEn: "Refresh rate", type: "numeric", unit: "Hz", better: "higher", primary: false,
      searchTerms: ["주사율", "refresh", "refresh rate", "ProMotion", "Hz"] },
    { key: "brightness_nits", label: "밝기", labelEn: "Brightness", type: "numeric", unit: "nits", better: "higher", primary: false,
      searchTerms: ["밝기", "brightness", "nit", "nits"] }
  ]
};

// ─────────────────────────────────────────────────────────────────────────
// Monitor (expansion — most underserved, high confusion: panel/refresh/HDR).
// ─────────────────────────────────────────────────────────────────────────
const monitorSchema: CategorySchema = {
  category: "monitor",
  label: "모니터",
  labelEn: "Monitor",
  fields: [
    { key: "size_inch", label: "화면 크기", labelEn: "Size", type: "numeric", unit: "인치", better: "none", primary: true },
    { key: "resolution", label: "해상도", labelEn: "Resolution", type: "text", better: "none", primary: true,
      hint: "예: 2560×1440(QHD), 3840×2160(4K)" },
    { key: "panel", label: "패널", labelEn: "Panel", type: "enum", better: "none", primary: true,
      hint: "IPS / VA / TN / OLED" },
    { key: "refresh_hz", label: "주사율", labelEn: "Refresh rate", type: "numeric", unit: "Hz", better: "higher", primary: true },
    { key: "response_ms", label: "응답속도", labelEn: "Response time", type: "numeric", unit: "ms", better: "lower", primary: true,
      hint: "GtG 기준 ms" },
    { key: "brightness_nits", label: "밝기", labelEn: "Brightness", type: "numeric", unit: "nits", better: "higher", primary: false },
    { key: "hdr", label: "HDR", labelEn: "HDR", type: "text", better: "none", primary: false,
      hint: "예: DisplayHDR 400, HDR10" },
    { key: "ports", label: "포트", labelEn: "Ports", type: "text", better: "none", primary: false,
      hint: "예: HDMI 2.1 ×2, DP 1.4, USB-C(PD)" },
    { key: "price_krw", label: "가격", labelEn: "Price", type: "numeric", unit: "원", better: "lower", primary: false }
  ]
};

// ─────────────────────────────────────────────────────────────────────────
// Earphones / headphones. User-specified fields (in order):
// 드라이버, 노이즈캔슬링, 배터리용량/배터리시간, 충전방식, 방수, 무게, 출시가격
// ─────────────────────────────────────────────────────────────────────────
const earphonesSchema: CategorySchema = {
  category: "earphones",
  label: "이어폰·헤드폰",
  labelEn: "Earphones / Headphones",
  fields: [
    { key: "model_name", label: "모델명", labelEn: "Model", type: "text", better: "none", primary: true,
      searchTerms: ["모델명", "model", "제품명", "product name"] },
    { key: "driver", label: "드라이버", labelEn: "Driver", type: "text", better: "none", primary: true,
      hint: "드라이버 유닛 크기·종류 (예: 11mm 동적 드라이버, 평면 자기식, Balanced Armature)",
      searchTerms: ["드라이버", "driver", "driver unit", "speaker unit", "transducer"] },
    { key: "anc", label: "노이즈캔슬링", labelEn: "ANC", type: "text", better: "none", primary: true,
      hint: "ANC 지원 여부·성능 등급 (예: ANC 지원, Adaptive Transparency, 최대 -40dB)",
      searchTerms: ["노이즈캔슬링", "ANC", "active noise cancellation", "noise cancelling"] },
    { key: "battery_hr", label: "배터리 재생시간", labelEn: "Battery life", type: "numeric", unit: "시간", better: "higher", primary: true,
      hint: "본체(이어버드/헤드폰) 단독 기준, ANC 켬 또는 끔 중 공식 표기",
      searchTerms: ["배터리", "battery life", "playback time", "재생시간", "사용시간"] },
    { key: "battery_total_hr", label: "총 재생시간(케이스 포함)", labelEn: "Total battery (w/ case)", type: "numeric", unit: "시간", better: "higher", primary: true,
      hint: "충전 케이스 포함 총 재생 시간",
      searchTerms: ["케이스 포함", "total battery", "with case", "충전 케이스"] },
    { key: "charging_type", label: "충전방식", labelEn: "Charging", type: "text", better: "none", primary: true,
      hint: "예: USB-C, MagSafe 무선, Qi 무선, Lightning",
      searchTerms: ["충전", "charging", "USB-C", "Qi", "무선 충전", "wireless charging"] },
    { key: "water_resist", label: "방수", labelEn: "Water resistance", type: "text", better: "none", primary: true,
      hint: "예: IPX4, IP54, IP57",
      searchTerms: ["방수", "water resistance", "IP", "IPX"] },
    { key: "weight_g", label: "무게", labelEn: "Weight", type: "numeric", unit: "g", better: "lower", primary: true,
      hint: "이어버드 한쪽 또는 헤드폰 본체 무게",
      searchTerms: ["무게", "weight"] },
    { key: "launch_price_krw", label: "출시가격", labelEn: "Launch price", type: "text", better: "none", primary: false,
      hint: "공식 출시가 (원) — 시세 변동이 커서 검증 게이트 제외",
      searchTerms: ["출시가격", "launch price", "starting price", "출시가", "MSRP"] },
    { key: "form", label: "형태", labelEn: "Form factor", type: "enum", better: "none", primary: false,
      hint: "커널형 / 오픈형 / 오버이어 / 온이어" },
    { key: "codec", label: "코덱", labelEn: "Codec", type: "text", better: "none", primary: false,
      hint: "예: SBC, AAC, LDAC, aptX Lossless",
      searchTerms: ["코덱", "codec", "LDAC", "aptX", "AAC"] },
    { key: "release_date", label: "출시일", labelEn: "Release date", type: "text", better: "none", primary: false,
      hint: "공식 출시 연월 (예: 2024년 9월) — 검증 게이트 제외",
      searchTerms: ["출시일", "launch date", "release date"] }
  ]
};

// ─────────────────────────────────────────────────────────────────────────
// Tablet — high search volume, strong overlap with smartphone comparisons.
// ─────────────────────────────────────────────────────────────────────────
const tabletSchema: CategorySchema = {
  category: "tablet",
  label: "태블릿",
  labelEn: "Tablet",
  fields: [
    { key: "model_name", label: "모델명", labelEn: "Model", type: "text", better: "none", primary: true,
      searchTerms: ["모델명", "model", "제품명"] },
    { key: "os", label: "운영체제", labelEn: "OS", type: "text", better: "none", primary: true,
      searchTerms: ["운영체제", "os", "iPadOS", "Android"] },
    { key: "chipset", label: "칩셋", labelEn: "Chipset", type: "text", better: "none", primary: true,
      hint: "예: M4, Snapdragon 8 Gen 3",
      searchTerms: ["칩셋", "processor", "chip", "SoC"] },
    { key: "display_inch", label: "화면 크기", labelEn: "Display", type: "numeric", unit: "인치", better: "none", primary: true,
      searchTerms: ["디스플레이", "화면", "display", "screen"] },
    { key: "resolution", label: "해상도", labelEn: "Resolution", type: "text", better: "none", primary: false,
      hint: "예: 2732×2048" },
    { key: "refresh_hz", label: "주사율", labelEn: "Refresh rate", type: "numeric", unit: "Hz", better: "higher", primary: false,
      searchTerms: ["주사율", "refresh", "ProMotion", "Hz"] },
    { key: "storage_gb", label: "저장공간", labelEn: "Storage", type: "numeric", unit: "GB", better: "higher", primary: false,
      hint: "기본 구성 용량" },
    { key: "ram_gb", label: "메모리", labelEn: "RAM", type: "numeric", unit: "GB", better: "higher", primary: false,
      searchTerms: ["메모리", "RAM", "memory"] },
    { key: "battery_wh", label: "배터리", labelEn: "Battery", type: "text", better: "none", primary: true,
      hint: "제조사 공식 표기 (예: 최대 10시간, 28.65Wh)",
      searchTerms: ["배터리", "battery", "video playback", "Wh"] },
    { key: "stylus", label: "스타일러스", labelEn: "Stylus", type: "text", better: "none", primary: true,
      hint: "Apple Pencil 지원 세대, S Pen 포함 여부 등",
      searchTerms: ["pencil", "s pen", "스타일러스", "stylus"] },
    { key: "weight_g", label: "무게", labelEn: "Weight", type: "numeric", unit: "g", better: "lower", primary: false,
      searchTerms: ["무게", "weight"] },
    { key: "cellular", label: "셀룰러", labelEn: "Cellular", type: "text", better: "none", primary: false,
      hint: "Wi-Fi 전용 / Wi-Fi + Cellular" },
    { key: "launch_price_krw", label: "출시가격", labelEn: "Launch price", type: "text", better: "none", primary: false,
      hint: "공식 출시가 — 기본 모델 기준. 시세 변동이 커서 검증 게이트 제외",
      searchTerms: ["출시가격", "launch price", "출시가", "MSRP"] },
    { key: "price_krw", label: "가격", labelEn: "Price", type: "numeric", unit: "원", better: "lower", primary: false }
  ]
};

/**
 * Japanese display labels by field key. Fields without an entry fall back to
 * labelEn. Centralized here so the comparison builder, extracted-table, and
 * resolveFieldByLabel all agree — a row labeled in Japanese must always map
 * back to its schema field (drives verification grading).
 */
export const JA_FIELD_LABELS: Record<string, string> = {
  model_name: "モデル名",
  os: "OS",
  cpu: "CPU",
  gpu: "GPU",
  chipset: "チップセット",
  display_inch: "画面サイズ",
  size_inch: "画面サイズ",
  resolution: "解像度",
  refresh_hz: "リフレッシュレート",
  brightness_nits: "明るさ",
  panel: "パネル",
  ram_gb: "メモリ",
  storage_gb: "ストレージ",
  camera_mp: "メインカメラ",
  battery: "バッテリー",
  battery_wh: "バッテリー",
  battery_hr: "再生時間",
  battery_total_hr: "総再生時間（ケース込み）",
  charging: "充電",
  charging_type: "充電方式",
  water_resist: "防水",
  weight_g: "重量",
  release_date: "発売日",
  launch_price_krw: "発売価格",
  price_krw: "価格",
  driver: "ドライバー",
  anc: "ノイズキャンセリング",
  form: "形状",
  codec: "コーデック",
  ports: "ポート",
  response_ms: "応答速度",
  hdr: "HDR",
  stylus: "スタイラス",
  cellular: "セルラー"
};

/** Locale-aware display label for a single field (ko → label, ja → JA map, else EN). */
export function fieldLabelForLocale(field: SpecField, locale: string): string {
  if (locale === "en") return field.labelEn;
  if (locale === "ja") return JA_FIELD_LABELS[field.key] ?? field.labelEn;
  return field.label;
}

const SCHEMAS: Partial<Record<Category, CategorySchema>> = {
  laptop: laptopSchema,
  smartphone: smartphoneSchema,
  monitor: monitorSchema,
  earphones: earphonesSchema,
  tablet: tabletSchema
};

/** Returns the structured schema for a category, or null if it has none yet. */
export function getCategorySchema(category: Category): CategorySchema | null {
  return SCHEMAS[category] ?? null;
}

/** True if the category is backed by a structured schema (verified-comparable). */
export function hasSchema(category: Category): boolean {
  return Boolean(SCHEMAS[category]);
}

/** Ordered machine keys for a category's fields. */
export function schemaFieldKeys(category: Category): string[] {
  return getCategorySchema(category)?.fields.map((f) => f.key) ?? [];
}

/** Ordered display labels — used as comparison-table row keys / AI templateKeys. */
export function schemaFieldLabels(category: Category): string[] {
  return getCategorySchema(category)?.fields.map((f) => f.label) ?? [];
}

/**
 * Locale-aware ordered display labels.
 * English and Japanese use the English label so the AI gets consistent keys
 * and the comparison table header matches the AI output language.
 */
export function schemaFieldLabelsForLocale(category: Category, locale: string): string[] {
  const schema = getCategorySchema(category);
  if (!schema) return schemaFieldLabels(category);
  if (locale === "en" || locale === "ja") {
    return schema.fields.map((f) => f.labelEn);
  }
  return schema.fields.map((f) => f.label);
}

/** Primary field keys — drive the default view and decision weighting. */
export function primaryFieldKeys(category: Category): string[] {
  return getCategorySchema(category)?.fields.filter((f) => f.primary).map((f) => f.key) ?? [];
}

/** Look up a single field definition by key. */
export function getField(category: Category, key: string): SpecField | null {
  return getCategorySchema(category)?.fields.find((f) => f.key === key) ?? null;
}

function normalizeLabel(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "");
}

/**
 * Resolve a comparison-table row key (a display label like "CPU" / "무게") back
 * to its schema field. Comparison rows are keyed by label, but verification and
 * ranking work on field keys — this bridges the two.
 */
export function resolveFieldByLabel(category: Category, label: string): SpecField | null {
  const schema = getCategorySchema(category);
  if (!schema) return null;
  const target = normalizeLabel(label);
  return (
    schema.fields.find(
      (f) =>
        f.key === target ||
        normalizeLabel(f.label) === target ||
        normalizeLabel(f.labelEn) === target ||
        normalizeLabel(JA_FIELD_LABELS[f.key] ?? "") === target
    ) ?? null
  );
}

/** All categories that currently have a structured schema. */
export function schematizedCategories(): Category[] {
  return Object.keys(SCHEMAS) as Category[];
}
