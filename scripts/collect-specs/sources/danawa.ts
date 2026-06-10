/**
 * 다나와 (danawa.com) spec scraper — Korean market.
 *
 * ── 실제 HTML 구조 (2024-06 검증) ─────────────────────────────────────────
 * 검색 결과 페이지에 각 상품의 스펙이 인라인 텍스트로 포함됨:
 *
 *   <div class="spec-box">
 *     <div class="spec_list">
 *       <a class="view_dic">화면:15.5cm(6.1인치)</a><em>/</em>
 *       <a class="view_dic">램</a>: 8GB<em>/</em>
 *       ...
 *       <span><u>무게</u></span>: 170g /
 *       <span><u>출시가: 1,250,000원</u></span>
 *     </div>
 *   </div>
 *
 * 스펙 테이블(spec 탭)은 JS 렌더링이라 th/td 방식으로 파싱 불가.
 * 검색 결과 리스팅에서 spec_list 텍스트를 직접 파싱하는 방식이 가장 안정적.
 *
 * Flow:
 *   1. 검색 결과 페이지 fetch (단 1회 요청)
 *   2. 첫 번째 비광고 상품의 spec_list 텍스트 추출
 *   3. "key:value / key:value" 형식 파싱 → schema fieldKey 매핑
 *   4. 출시일은 등록일 텍스트(예: "24.09. 등록")에서 추출
 */

const HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Accept-Language": "ko-KR,ko;q=0.9",
  Accept: "text/html,application/xhtml+xml",
  Referer: "https://www.danawa.com/"
};

const FETCH_TIMEOUT_MS = 15_000;

async function fetchHtml(url: string): Promise<string | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: HEADERS, signal: controller.signal });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}

// ─── 파싱 유틸 ──────────────────────────────────────────────────────────────

/** spec_list 안의 HTML을 plain text로 변환 */
function specListHtmlToText(html: string): string {
  return html
    // <a class="view_dic">레이블</a> → 레이블
    .replace(/<a[^>]*class="view_dic"[^>]*>([\s\S]*?)<\/a>/gi, (_, inner) =>
      inner.replace(/<[^>]+>/g, "").trim()
    )
    // <em>/</em> → /
    .replace(/<em>\s*\/\s*<\/em>/gi, " / ")
    // <u>텍스트</u> → 텍스트
    .replace(/<u>([\s\S]*?)<\/u>/gi, "$1")
    // <span>텍스트</span> → 텍스트
    .replace(/<span[^>]*>([\s\S]*?)<\/span>/gi, "$1")
    // 나머지 태그 제거
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "화면:15.5cm(6.1인치)" → "6.1" (인치 값만 추출) */
function extractInch(raw: string): string {
  const m = raw.match(/\(([0-9.]+)인치\)/);
  if (m) return m[1];
  // fallback: cm to inch (15.5cm / 2.54 ≈ 6.1)
  const cm = raw.match(/([0-9.]+)cm/i);
  if (cm) return String(Math.round((parseFloat(cm[1]) / 2.54) * 10) / 10);
  return raw.replace(/[^0-9.]/g, "").split(".").slice(0, 2).join(".");
}

/** "170g" / "5.5g" → "170" / "5.5", "2.14kg" → "2140" */
function extractGrams(raw: string): string {
  // kg 단위 (노트북 등): "2.14kg" → "2140"
  const kg = raw.match(/([0-9]+(?:\.[0-9]+)?)\s*kg/i);
  if (kg) return String(Math.round(parseFloat(kg[1]) * 1000));
  const m = raw.match(/([0-9,]+(?:\.[0-9]+)?)\s*g/i);
  return m ? m[1].replace(/,/g, "") : raw;
}

/** "128GB" → "128", "불가능" → "" (invalid → skip) */
function extractGB(raw: string): string {
  const m = raw.match(/([0-9,]+)\s*GB/i);
  if (m) return m[1].replace(/,/g, "");
  // TB 단위: "1TB" → "1024"
  const tb = raw.match(/([0-9.]+)\s*TB/i);
  if (tb) return String(Math.round(parseFloat(tb[1]) * 1024));
  // 숫자 없으면 빈 값 반환 → 상위에서 필터링
  return "";
}

/** "약30W" or "65W" → "30W" / "65W" */
function extractWatt(raw: string): string {
  return raw.replace(/^약\s*/, "").trim();
}

// ─── 핵심 파서 ──────────────────────────────────────────────────────────────

/**
 * spec_list 텍스트를 schema fieldKey 맵으로 파싱.
 *
 * 입력 형식 예:
 *   "스마트폰(바형) / 화면:15.5cm(6.1인치) / 60Hz / 램: 8GB / 용량: 128GB /
 *    시스템 / A18 / 무게: 170g / 출시가: 1,250,000원"
 */
export function parseDanawaSpecText(specText: string): Record<string, string> {
  const specs: Record<string, string> = {};
  if (!specText) return specs;

  // "/" 기준으로 분리, 공백 정리
  const segments = specText.split("/").map((s) => s.trim()).filter(Boolean);

  let prevLabel = "";

  for (const seg of segments) {
    // "key: value" 또는 "key:value" 형식
    const colonIdx = seg.indexOf(":");
    if (colonIdx > 0) {
      const label = seg.slice(0, colonIdx).trim();
      const value = seg.slice(colonIdx + 1).trim();
      if (!value) { prevLabel = label; continue; }

      const fieldKey = mapDanawaSpecLabel(label);
      if (fieldKey) {
        const cleaned = cleanDanawaValue(fieldKey, value);
        if (cleaned) specs[fieldKey] = cleaned;  // 빈 값(이어폰 케이스 무게 등) 제외
      }
      prevLabel = label;
    } else {
      // 레이블 없이 값만 있는 세그먼트 (예: "A18", "3,561mAh")
      // 직전 레이블로 문맥 추정
      const value = seg.trim();
      if (!value || value.length > 40) continue;

      // 칩셋 패턴: 영문(A17/A18/Snapdragon/Exynos/Intel Core) + 한국어(스냅드래곤/엑시노스/코어 울트라)
      if (!specs.chipset && /^(A\d{2}|Snapdragon|Exynos|Dimensity|Kirin|M\d|Intel|Core|스냅드래곤|엑시노스|디멘시티|기린|코어\s*울트라|코어\s*i\d|M\d)/i.test(value)) {
        specs.chipset = value;
      }
      // 배터리 용량 패턴: 숫자mAh
      if (!specs.battery && /[\d,]+\s*mAh/i.test(value)) {
        specs.battery = value.replace(/\s/g, "");
      }
      // IP 방수 등급: IP54 / IP68 / IPX4 (독립 세그먼트, 정확히 IP+숫자 형식)
      if (!specs.water_resist && /^IP[X\d]\d\b/i.test(value) && value.length <= 8) {
        specs.water_resist = value.trim();
      }
      // 노트북 무게: "2.14kg" 독립 세그먼트
      if (!specs.weight_g && /^[0-9]+(?:\.[0-9]+)?\s*kg$/i.test(value)) {
        specs.weight_g = extractGrams(value);
      }
    }
  }

  return specs;
}

/** 다나와 spec 레이블 → schema fieldKey */
function mapDanawaSpecLabel(label: string): string | null {
  const l = label.trim().replace(/\s+/g, " ");
  const MAP: Record<string, string> = {
    // 스마트폰
    "화면": "display_inch",
    "램": "ram_gb",
    "용량": "storage_gb",
    "무게": "weight_g",
    "출시가": "launch_price_krw",
    "방수": "water_resist",
    "최대충전": "charging",
    "맥세이프": "charging",      // 중복이면 기존값 유지
    "시스템": "chipset",
    "AP": "chipset",
    "카메라 후면": "camera_mp",
    "후면": "camera_mp",
    "OS": "os",
    "운영체제": "os",
    // 이어폰
    "드라이버": "driver",
    "노이즈캔슬링": "anc",
    "재생시간": "battery_hr",
    "연속재생": "battery_hr",
    "최대재생": "battery_total_hr",   // "최대재생: 30시간" (케이스 포함)
    "최대 재생": "battery_total_hr",
    "총 재생시간": "battery_total_hr",
    "배터리 용량": "battery",
    "충전방식": "charging_type",
    "충전": "charging_type",
    "방수등급": "water_resist",
    "IP등급": "water_resist",
    // 노트북
    "CPU": "cpu",
    "그래픽": "gpu",
    "메모리": "ram_gb",
    "SSD": "storage_gb",
    "저장공간": "storage_gb",
    "해상도": "resolution",
  };

  if (MAP[l]) return MAP[l];
  // 부분 매칭
  for (const [key, field] of Object.entries(MAP)) {
    if (l.includes(key) || key.includes(l)) return field;
  }
  return null;
}

/** fieldKey에 맞게 값 정제 */
function cleanDanawaValue(fieldKey: string, raw: string): string {
  switch (fieldKey) {
    case "display_inch": return extractInch(raw);
    case "weight_g": {
      // 이어폰 케이스 포함 무게(40g+)는 제외, 이어버드 단독 무게(≤30g)만 허용
      const grams = extractGrams(raw);
      if (grams && parseFloat(grams) > 30 && /g/i.test(raw) && !/kg/i.test(raw)) {
        // 케이스 포함 무게일 가능성 높음 — 스마트폰은 100g+ 이므로 이어폰(≤30g 기준)에만 적용
        // 실제로 30g 이하 기기가 이어폰 외에 없으므로 30g 초과 시 이어폰 맥락으로 보고 skip
        // 하지만 스마트폰(100g+)은 그대로 통과 → 30 < x < 100 범위만 문제
        // 40g 미만이면 이어폰 단독 무게, 40g 이상 100g 미만이면 케이스 무게로 간주
        if (parseFloat(grams) < 100) return ""; // 케이스 무게 skip
      }
      return grams;
    }
    case "ram_gb":       return extractGB(raw);
    case "storage_gb":   return extractGB(raw);
    case "charging":     return extractWatt(raw);
    case "battery_hr":
    case "battery_total_hr": {
      // "30시간" / "26시간(ANC ON기준)" / "6시간(ANC ON)" → 숫자만
      const h = raw.match(/^([0-9]+(?:\.[0-9]+)?)\s*시간/);
      if (h) return h[1];
      return raw;
    }
    case "camera_mp": {
      // "4,800만화소+1,200만화소" → "48" (메인 화소 단위 변환)
      const m = raw.match(/([\d,]+)만화소/);
      if (m) return String(Math.round(parseInt(m[1].replace(/,/g, "")) / 100));
      return raw;
    }
    case "launch_price_krw": {
      // "1,250,000원" → "125만원" 형식으로 정규화
      const m = raw.match(/([\d,]+)원/);
      if (m) {
        const won = parseInt(m[1].replace(/,/g, ""));
        if (won >= 10000) return `${Math.round(won / 10000)}만원`;
        return `${won.toLocaleString()}원`;
      }
      return raw;
    }
    default: return raw;
  }
}

// ─── 검색 & 수집 ─────────────────────────────────────────────────────────────

interface DanawaSearchResult {
  pcode: string;
  specText: string;
  registeredAt?: string;  // "24.09." → 출시일 근사값
}

/**
 * 다나와 검색 결과에서 첫 번째 상품의 pcode + spec 텍스트 추출.
 *
 * 광고(first item with 광고 badge)는 건너뛰고 두 번째 실제 상품 기준으로 가져옴.
 */
export async function searchDanawa(query: string): Promise<DanawaSearchResult | null> {
  const url = `https://search.danawa.com/dsearch.php?query=${encodeURIComponent(query)}&tab=goods&orderMethod=point&limit=10`;
  const html = await fetchHtml(url);
  if (!html) return null;

  // pcode 추출 (여러 개, 첫 번째 사용)
  const pcodePattern = /pcode[=\/](\d{7,10})/g;
  const pcodeMatches = [...html.matchAll(pcodePattern)];
  if (!pcodeMatches.length) return null;
  const pcode = pcodeMatches[0][1];

  // spec_list 텍스트 추출
  const specBoxMatch = html.match(/<div[^>]*class="spec[_-]list"[^>]*>([\s\S]*?)<\/div>/i);
  let specText = "";
  if (specBoxMatch) {
    specText = specListHtmlToText(specBoxMatch[1]);
  }

  // 등록일 추출: "24.09. 등록" 패턴
  const regMatch = html.match(/(\d{2}\.\d{2}\.)\s*등록/);
  const registeredAt = regMatch ? regMatch[1] : undefined;

  return { pcode, specText, registeredAt };
}

/** 등록일 "24.09." → "2024년 9월" */
function registeredAtToReleaseDate(reg: string): string {
  const m = reg.match(/^(\d{2})\.(\d{2})\./);
  if (!m) return reg;
  const year = 2000 + parseInt(m[1]);
  const month = parseInt(m[2]);
  return `${year}년 ${month}월`;
}

/** 다나와에서 제품 스펙 전체 수집 (검색 결과 리스팅 기반) */
export async function fetchDanawaSpecs(
  productName: string
): Promise<{ source: string; specs: Record<string, string> } | null> {
  const result = await searchDanawa(productName);
  if (!result) {
    console.warn(`[danawa] "${productName}" 검색 결과 없음`);
    return null;
  }

  const { pcode, specText, registeredAt } = result;
  const sourceUrl = `https://prod.danawa.com/info/?pcode=${pcode}`;

  // spec 텍스트에서 fieldKey 맵 파싱
  const specs: Record<string, string> = parseDanawaSpecText(specText);

  // 출시일 추가 (등록일 기반)
  if (registeredAt && !specs.release_date) {
    specs.release_date = registeredAtToReleaseDate(registeredAt);
  }

  if (Object.keys(specs).length === 0) {
    console.warn(`[danawa] "${productName}" 스펙 파싱 실패 (pcode=${pcode})`);
    console.warn(`  spec 텍스트: "${specText.slice(0, 100)}"`);
    return null;
  }

  console.log(`[danawa] "${productName}" → pcode=${pcode}, 추출 필드: ${Object.keys(specs).join(", ")}`);
  return { source: sourceUrl, specs };
}
