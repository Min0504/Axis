import { getCategorySchema, type SpecField } from "@/lib/specs/schema";
import { isMeaningful } from "@/lib/specs/source";
import type { ExtractedSpecs } from "@/lib/specs/extract";
import type { Locale } from "@/lib/i18n";
import type { Category, ComparisonRow } from "@/lib/types";

const JA_LABELS: Record<string, string> = {
  model_name: "モデル名",
  os: "OS",
  chipset: "チップセット",
  display_inch: "画面サイズ",
  battery: "バッテリー",
  weight_g: "重量",
  camera_mp: "メインカメラ",
  storage_gb: "ストレージ",
  refresh_hz: "リフレッシュレート",
  price_krw: "価格",
  cpu: "CPU",
  gpu: "GPU",
  ram_gb: "メモリ",
  storage_gb_laptop: "ストレージ",
  panel: "パネル",
  resolution: "解像度",
  battery_wh: "バッテリー",
  ports: "ポート",
  brightness_nits: "明るさ",
  latency: "遅延"
};

const MAX_TABLE_VALUE_LENGTH = 120;

const LOCALIZED_UNITS: Record<string, Partial<Record<Locale, string>>> = {
  "인치": { ko: "인치", en: "in", ja: "インチ" },
  "시간": { ko: "시간", en: "h", ja: "時間" },
  "원": { ko: "원", en: "KRW", ja: "ウォン" }
};

function labelForField(field: SpecField, locale: Locale): string {
  if (locale === "en") return field.labelEn;
  if (locale === "ja") return JA_LABELS[field.key] ?? field.labelEn;
  return field.label;
}

function unitForField(field: SpecField, locale: Locale): string | null {
  if (!field.unit) return null;
  return LOCALIZED_UNITS[field.unit]?.[locale] ?? field.unit;
}

function hasUnit(value: string, unit: string): boolean {
  const normalizedValue = value.toLowerCase().replace(/\s+/g, "");
  const normalizedUnit = unit.toLowerCase().replace(/\s+/g, "");
  return normalizedValue.includes(normalizedUnit);
}

function appendUnit(value: string, field: SpecField, locale: Locale): string {
  if (field.type !== "numeric") return value;
  const unit = unitForField(field, locale);
  if (!unit || hasUnit(value, unit) || hasUnit(value, field.unit ?? "")) return value;
  return `${value}${unit}`;
}

function tableValue(value: string | null, field: SpecField, locale: Locale): string {
  if (!value) return "—";
  const withUnit = appendUnit(value, field, locale);
  if (withUnit.length <= MAX_TABLE_VALUE_LENGTH) return withUnit;
  return `${withUnit.slice(0, MAX_TABLE_VALUE_LENGTH - 1).trimEnd()}…`;
}

function valueForField(product: ExtractedSpecs | null, key: string): string | null {
  const value = product?.specs[key]?.trim();
  return value && isMeaningful(value) ? value : null;
}

export function buildExtractedComparisonTable(
  category: Category,
  products: (ExtractedSpecs | null)[],
  locale: Locale = "ko"
): ComparisonRow[] {
  const schema = getCategorySchema(category);
  if (!schema) return [];
  const requiredValues = products.length <= 2 ? products.length : Math.min(3, products.length);
  const productCountWithSpecs = products.filter(
    (product) => product && Object.keys(product.specs).length > 0
  ).length;
  if (productCountWithSpecs < requiredValues) return [];

  const rows: ComparisonRow[] = [];

  for (const field of schema.fields) {
    const values = products.map((product) => valueForField(product, field.key));
    const meaningfulCount = values.filter(Boolean).length;
    if (meaningfulCount < requiredValues) continue;

    rows.push({
      key: labelForField(field, locale),
      values: values.map((value) => tableValue(value, field, locale)),
      sources: products.map((product, index) => (values[index] ? product?.source : undefined))
    });
  }

  return rows;
}
