// 3개 시장(KR/US/JP) × 4개 카테고리 비교 파이프라인 E2E 점검 스크립트.
//   npx tsx scripts/e2e-check.mts
import { readFileSync } from "fs";
for (const line of readFileSync(".env.local", "utf-8").split("\n")) {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] ??= m[2].replace(/^["']|["']$/g, "");
}
const { buildDecision } = await import("../lib/decision-engine.ts");

async function run(query: string, locale: any, country: any) {
  const r = await buildDecision(query, 2, locale, country);
  const hz = r.comparison.find((row: any) => /주사율|Refresh|リフレッシュ/.test(row.key));
  const price = r.comparison.find((row: any) => /출시가|Launch price|発売価格/.test(row.key));
  console.log(`[${locale}/${country}] "${query}"`);
  console.log(`   → ${r.status} | 추천: ${r.selectedOption} | 검증: ${r.verification} | rows: ${r.comparison.length}`);
  console.log(`   옵션(표시명): ${r.options.join("  vs  ")}`);
  if (hz) console.log(`   주사율: ${hz.values.join(" / ")}`);
  if (price) console.log(`   출시가: ${price.values.join(" / ")}`);
  console.log("");
}

// 한글 입력을 각 로케일에서 — 표시명이 로케일로 정규화되는지 핵심 확인
await run("아이폰 16 프로 vs 갤럭시 S25 울트라", "ko", "KR");
await run("아이폰 16 프로 vs 갤럭시 S25 울트라", "en", "US");   // ← 한글 입력, 영어 로케일
await run("iPhone 16 Pro vs Galaxy S25 Ultra", "ja", "JP");
await run("에어팟 프로 vs 갤럭시 버즈4 프로", "en", "US");        // ← 한글 입력, 영어 로케일
await run("아이패드 프로 vs 갤럭시 탭 S9", "ko", "KR");          // ← 태블릿 (신규)
await run("아이패드 에어 vs 갤럭시 탭 S10 울트라", "en", "US");   // ← 태블릿 + 영어 정규화
await run("맥북 에어 vs 갤럭시북", "ja", "JP");
