#!/usr/bin/env tsx
/**
 * Axis Spec Collector — batch runner
 *
 * 사용법:
 *   npx tsx scripts/collect-specs/index.ts [category] [country]
 *
 * 예시:
 *   npx tsx scripts/collect-specs/index.ts smartphone KR
 *   npx tsx scripts/collect-specs/index.ts laptop US
 *   npx tsx scripts/collect-specs/index.ts earphone JP
 *   npx tsx scripts/collect-specs/index.ts all KR
 *
 * 출력:
 *   lib/specs/dataset/kr/smartphones.ts  (KR 수집 시)
 *   lib/specs/dataset/us/smartphones.ts  (US 수집 시)
 *   lib/specs/dataset/jp/smartphones.ts  (JP 수집 시)
 *
 * ── 수집 전략 ────────────────────────────────────────────────────────────────
 *   KR: 다나와 (danawa.com) — 한국 시장 스펙 + KRW 가격
 *   US: GSMArena — 글로벌 하드웨어 스펙 (USD 가격은 제조사 페이지 별도)
 *   JP: 価格.com (kakaku.com) — 일본 시장 스펙 + JPY 가격
 *
 * 수집된 데이터는 TypeScript 소스 파일로 출력됩니다.
 * 데이터 검토 후 수동으로 lib/specs/dataset/index.ts에 import 추가.
 */

import { fetchDanawaSpecs } from "./sources/danawa";
import { fetchGsmarenaSpecs } from "./sources/gsmarena";
import { fetchKakakuSpecs } from "./sources/kakaku";
import smartphonesJson from "./models/smartphones.json";
import laptopsJson from "./models/laptops.json";
import earphonesJson from "./models/earphones.json";
import { writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "../..");

type Country = "KR" | "US" | "JP";
// 앱의 Category 타입과 일치 ("earphones" 복수형)
type CategoryType = "smartphone" | "laptop" | "earphones";

interface ModelEntry {
  id: string;
  canonicalName: Record<string, string>;
  aliases: Record<string, string[]>;
  searchQuery: Record<string, string>;
}

interface CollectedSpec {
  id: string;
  canonicalName: string;
  aliases: string[];
  category: CategoryType;
  country: Country;
  source: string;
  fetchedAt: string;
  tier: 1 | 2;
  specs: Record<string, string>;
}

/** Delay between requests to avoid rate limiting */
async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Fetch specs for a single model from the appropriate source */
async function fetchForCountry(
  model: ModelEntry,
  country: Country
): Promise<{ source: string; specs: Record<string, string> } | null> {
  const query = model.searchQuery[country];
  if (!query) return null;

  switch (country) {
    case "KR":
      return fetchDanawaSpecs(query);
    case "US":
      return fetchGsmarenaSpecs(query);
    case "JP":
      return fetchKakakuSpecs(query);
  }
}

/** Collect all models for a category and country */
async function collectCategory(
  models: ModelEntry[],
  category: CategoryType,
  country: Country,
  delayMs = 2000
): Promise<CollectedSpec[]> {
  const results: CollectedSpec[] = [];
  const fetchedAt = new Date().toISOString().slice(0, 7); // "YYYY-MM"

  for (const model of models) {
    const canonicalName = model.canonicalName[country] ?? model.canonicalName["KR"];
    const aliases = model.aliases[country] ?? [];

    console.log(`\n[${country}/${category}] Fetching: ${canonicalName}`);

    const result = await fetchForCountry(model, country);
    if (!result) {
      console.warn(`  → 수집 실패: ${canonicalName}`);
      continue;
    }

    results.push({
      id: model.id,
      canonicalName,
      aliases,
      category,
      country,
      source: result.source,
      fetchedAt,
      tier: country === "US" ? 2 : 1, // GSMArena = tier 2, 다나와/Kakaku = tier 1
      specs: result.specs
    });

    console.log(`  → 성공: ${Object.keys(result.specs).length}개 필드 수집`);
    console.log(`  → 필드: ${Object.keys(result.specs).join(", ")}`);

    // Rate limit protection
    await delay(delayMs);
  }

  return results;
}

/** Generate TypeScript source file content from collected specs */
function generateTypeScriptFile(
  specs: CollectedSpec[],
  category: CategoryType,
  country: Country
): string {
  const varName =
    category === "smartphone" ? "smartphones"
    : category === "laptop" ? "laptops"
    : "earphones";

  const importType =
    category === "earphones"
      ? 'import type { VerifiedProduct } from "@/lib/specs/dataset/types";'
      : 'import type { VerifiedProduct } from "@/lib/specs/dataset/types";';

  const entries = specs
    .map((s) => {
      const specsStr = Object.entries(s.specs)
        .map(([k, v]) => `      ${k}: ${JSON.stringify(v)}`)
        .join(",\n");

      const aliasesStr = s.aliases.map((a) => JSON.stringify(a)).join(", ");

      return `  {
    id: ${JSON.stringify(s.id)},
    canonicalName: ${JSON.stringify(s.canonicalName)},
    aliases: [${aliasesStr}],
    category: ${JSON.stringify(s.category)},
    country: ${JSON.stringify(s.country)},
    source: ${JSON.stringify(s.source)},
    fetchedAt: ${JSON.stringify(s.fetchedAt)},
    tier: ${s.tier},
    specs: {
${specsStr}
    }
  }`;
    })
    .join(",\n");

  const countryLabel = country === "KR" ? "한국" : country === "US" ? "미국" : "일본";
  const sourceLabel =
    country === "KR" ? "다나와 (danawa.com)" :
    country === "US" ? "GSMArena" :
    "価格.com (kakaku.com)";

  return `/**
 * ${countryLabel} 시장 ${category} 스펙 데이터셋.
 *
 * 자동 수집: ${sourceLabel}
 * 수집일: ${new Date().toISOString().slice(0, 10)}
 *
 * ⚠️ 자동 생성 파일입니다. 수동 편집 시 재수집 시 덮어씌워집니다.
 *    수집 명령: npx tsx scripts/collect-specs/index.ts ${category} ${country}
 */

${importType}

export const ${varName}: VerifiedProduct[] = [
${entries}
];
`;
}

/** Write output to lib/specs/dataset/{country}/{category}.ts */
function writeOutput(specs: CollectedSpec[], category: CategoryType, country: Country): void {
  if (specs.length === 0) {
    console.warn(`[출력] ${country}/${category}: 수집된 데이터 없음 — 파일 생성 건너뜀`);
    return;
  }

  const countryDir = country.toLowerCase();
  const fileName =
    category === "smartphone" ? "smartphones.ts"
    : category === "laptop" ? "laptops.ts"
    : "earphones.ts";

  const outDir = join(PROJECT_ROOT, "lib/specs/dataset", countryDir);
  if (!existsSync(outDir)) {
    mkdirSync(outDir, { recursive: true });
    console.log(`[출력] 디렉토리 생성: ${outDir}`);
  }

  const outPath = join(outDir, fileName);
  const content = generateTypeScriptFile(specs, category, country);

  writeFileSync(outPath, content, "utf-8");
  console.log(`\n✅ ${specs.length}개 제품 → ${outPath}`);
}

/** Main entry point */
async function main() {
  const args = process.argv.slice(2);
  const categoryArg = (args[0] ?? "all").toLowerCase();
  const countryArg = (args[1] ?? "KR").toUpperCase() as Country;

  if (!["KR", "US", "JP"].includes(countryArg)) {
    console.error("❌ 지원 국가: KR, US, JP");
    process.exit(1);
  }

  const categoryMap: Record<string, { models: ModelEntry[]; type: CategoryType }> = {
    smartphone: { models: smartphonesJson.models as ModelEntry[], type: "smartphone" },
    laptop: { models: laptopsJson.models as ModelEntry[], type: "laptop" },
    earphone: { models: earphonesJson.models as ModelEntry[], type: "earphones" },
  };

  const toRun =
    categoryArg === "all"
      ? Object.values(categoryMap)
      : categoryArg in categoryMap
      ? [categoryMap[categoryArg]]
      : null;

  if (!toRun) {
    console.error(`❌ 지원 카테고리: smartphone, laptop, earphone, all`);
    process.exit(1);
  }

  console.log(`\n🚀 Axis Spec Collector`);
  console.log(`   국가: ${countryArg}`);
  console.log(`   카테고리: ${categoryArg}`);
  console.log(`   소스: ${countryArg === "KR" ? "다나와" : countryArg === "US" ? "GSMArena" : "価格.com"}\n`);

  for (const { models, type } of toRun) {
    console.log(`\n${"─".repeat(60)}`);
    console.log(`📦 ${type.toUpperCase()} (${models.length}개 모델)`);
    console.log("─".repeat(60));

    const specs = await collectCategory(models, type, countryArg, 2500);
    writeOutput(specs, type, countryArg);
  }

  console.log(`\n\n${"═".repeat(60)}`);
  console.log(`✅ 수집 완료`);
  console.log(`\n다음 단계:`);
  console.log(`  1. lib/specs/dataset/${countryArg.toLowerCase()}/ 폴더 파일 검토`);
  console.log(`  2. lib/specs/dataset/index.ts 에 새 import 추가`);
  console.log(`  3. npx vitest run tests/dataset.test.ts 로 무결성 검사`);
}

main().catch((err) => {
  console.error("❌ 오류 발생:", err);
  process.exit(1);
});
