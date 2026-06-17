# Axis — AI 작업 프롬프트

> 배포 목표: 2026-08-15 (베타 → 정식) | 현재: 베타 배포 완료

---

## 프로젝트 컨텍스트

너는 **Axis** (전자제품 구매 결정 + 가격 추적 도구)를 베타에서 정식 서비스로 완성하는 시니어 엔지니어다.

**프로젝트 위치:** `/Users/minseokchae/Documents/Personal_Project/Axis/`

**프로덕션 URL:** https://axis-app-beta.vercel.app

**제품 설명:**
자연어 비교 쿼리 → AI 구매 결정(검증 스펙 기반) + 네이버 쇼핑 실시간 최저가 + 가격 알림(Resend). 한국 노트북 시장 집중. 쿠팡 파트너스 제휴 수익.

**기술 스택:**
- Next.js + TypeScript
- Supabase (comparison_cache, watches, click_events, price_history)
- Groq API (AI 결정 엔진, 429 → deterministic fallback)
- Resend (이메일 알림)
- 네이버 쇼핑 Open API (실시간 최저가)
- Vercel (배포, cron jobs)

---

## 현재 완료 상태 (2026-06-12 기준)

### 작동 중인 기능
- AI 구매 결정 (자연어 쿼리 → 스펙 검증 → 결론 + 비교 테이블)
- 맞춤 재분석 (용도/예산/상황 입력 → 재계산, 캐시 우회)
- 검증 배지: verified(공식 출처) / partial / unverified(AI 추정)
- 네이버 쇼핑 실시간 최저가 (`/api/price`)
- 이메일 가격 알림 (Resend)
- 클릭 트래킹 (`click_events` 테이블)
- 캐시: Supabase `comparison_cache` (CACHE_VERSION=9)
- 다국어 구조 (KR/US/JP) — 운영은 KR 집중
- 데이터셋: 스마트폰 55개, 이어폰 18개, 노트북 26개, 태블릿 23개

### 검증 등급 시스템
- `verified`: 모든 primary 필드에 공식 source URL → SEO 인덱싱
- `partial`: 일부 sourced → 조건부
- `unverified`: AI 단독 → noindex

### 실행 범위 (집중 전략)
- 시장: 한국 단독
- 카테고리: 노트북 우선 (폰/태블릿/이어폰 자산 유지, 출시는 노트북만)
- 수익: 쿠팡 파트너스 Phase 1
- 가격: 쿠팡 현재가 + 자체 일별 적재 PoC (외부 가격이력 API 결제 금지)
- 추가 기능(푸시/구독/다국가): §6 검증 게이트 통과 전까지 보류

---

## 남은 작업 (이 세션에서 완료할 것)

### Phase 1: 노트북 데이터셋 확장 (7/19-7/26)

**1-1. 현재 노트북 데이터 현황 확인**
```bash
cat /Users/minseokchae/Documents/Personal_Project/Axis/lib/specs/dataset/laptops.ts | head -50
# 현재 26개 → 목표 60개 이상
```

**1-2. 추가할 노트북 모델 (2024-2026, 한국 인지도 높은 제품)**

MacBook 계열:
- MacBook Air 15" M3 (2024)
- MacBook Pro 14" M4 Pro (2025)
- MacBook Pro 16" M4 Max (2025)

삼성:
- 갤럭시북 5 Pro 360 (2025)
- 갤럭시북 5 Ultra (2025)
- 갤럭시북 5 360 (2025)

LG:
- LG 그램 17" (2025)
- LG 그램 360 (2025)
- LG 그램 Pro (2025)

ASUS:
- ASUS Zenbook 14 OLED (2025)
- ASUS ROG Zephyrus G14 (2025)
- ASUS VivoBook S 15 (2025)

Lenovo:
- ThinkPad X1 Carbon Gen 13 (2025)
- Lenovo Yoga 9i (2025)
- IdeaPad 5 Pro (2025)

각 모델 필드:
```typescript
{
  id: "macbook-air-15-m3-2024",
  canonicalName: "MacBook Air 15형 M3",
  nameEn: "MacBook Air 15-inch M3",
  brand: "Apple",
  category: "laptop",
  year: 2024,
  specs: {
    cpu: "Apple M3",
    ram: "8GB / 16GB / 24GB",
    storage: "256GB / 512GB / 1TB / 2TB SSD",
    display: "15.3형 Liquid Retina (2880x1864, 224ppi)",
    battery: "최대 18시간",
    weight: "1.51kg",
    os: "macOS",
    price_kr: "1,990,000원~"
  },
  sources: {
    official: "https://www.apple.com/kr/macbook-air/",
  }
}
```

모든 스펙은 공식 사이트 확인 후 입력 (AI 추정 금지).

### Phase 2: 쿠팡 라이브 가격 연동 PoC (7/26-8/2)

`lib/pricing/coupang.ts` 구현:

**2-1. 쿠팡 파트너스 API 설정**
```
COUPANG_ACCESS_KEY=<파트너스 콘솔 발급>
COUPANG_SECRET_KEY=<파트너스 콘솔 발급>
```

**2-2. 상품 검색 + 현재가 조회**
```typescript
// 쿠팡 파트너스 API: 상품 검색
async function searchCoupangPrice(query: string): Promise<PriceQuote | null> {
  const response = await fetch(
    `https://api.coupang.com/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(query)}&limit=5`,
    { headers: buildCoupangHeaders('GET', '/...') }
  );
  // 최저가 상품 선택 + 제휴 링크 생성
}
```

**2-3. 가격 이력 적재**
일별 크론 (`/api/cron/price-check`):
```typescript
// 노트북 주요 모델 20개 → 쿠팡 현재가 조회 → price_history 적재
// 스케줄: 매일 09:00 KST
```

Vercel cron 설정 (`vercel.json`):
```json
{
  "crons": [
    { "path": "/api/cron/price-check", "schedule": "0 0 * * *" }
  ]
}
```

**2-4. 제휴 링크 노출**
결과 페이지 하단에 "쿠팡에서 최저가 확인" 버튼 (제휴 링크 명시).

### Phase 3: SEO 최적화 (8/2-8/8)

**3-1. 노트북 비교 페이지 SEO**
- URL: `/compare/laptop/[slug]`
- 메타: `"맥북 에어 M3 vs 갤럭시북5 Pro 비교 | Axis"`
- `verified` 결과만 인덱싱 (`noindex` 로직 현재 확인)

**3-2. 구조화 데이터**
```json
{
  "@type": "Product",
  "name": "MacBook Air 15형 M3",
  "brand": { "@type": "Brand", "name": "Apple" },
  "offers": { "price": "1990000", "priceCurrency": "KRW" }
}
```

**3-3. 인기 비교 쿼리 페이지 생성**
정적 생성(`generateStaticParams`)으로 자주 검색되는 비교 조합 20개 미리 생성:
- "맥북 에어 M3 vs 갤럭시북5 Pro"
- "LG 그램 vs 삼성 갤럭시북"
- "ASUS Zenbook vs LG 그램"
등

**3-4. 사이트맵 업데이트**
새 비교 페이지 URL 포함.

### Phase 4: 가격 알림 완성 (8/8-8/12)

현재 Resend 기반 이메일 알림 → 완전 동작 검증:

```typescript
// lib/watch.ts
// 관심 상품 등록 → 목표가 설정 → 크론 실행 → 알림 발송
```

확인 항목:
- [ ] watches 테이블 CRUD
- [ ] 크론에서 목표가 도달 시 이메일 발송
- [ ] "역대최저·급락" 알림은 3개월 이상 이력 쌓인 후에만 활성화

### Phase 5: 베타 → 정식 전환 (8/12-8/15)

**5-1. URL 변경**
`axis-app-beta.vercel.app` → 커스텀 도메인 연결 (미확정 시 유지)

**5-2. 베타 라벨 제거**
모든 UI에서 "베타" 문구 제거.

**5-3. 30일 검증 게이트 확인**
DEV_NOTES.md §6 검증 게이트:
- 비교 완료 수, 이메일 알림 등록 수, 쿠팡 제휴 클릭 수 목표치 달성 여부 확인
- 미달성 시: 추가 기능 빌드 보류, 콘텐츠/SEO 집중

**5-4. 최종 빌드 + 배포**
```bash
npm test
npx tsc --noEmit
npm run build
vercel --prod
```

---

## 코딩 원칙 (반드시 준수)

- 스펙 비교는 primary 스펙이 출처 등급 2티어 이상일 때만 `verified`
  - 1티어: 제조사 공식
  - 2티어: 검증 자료 (언론 리뷰, 공인 벤치마크)
  - 3티어: AI 추정 → `unverified`, noindex
- 모든 결과에 출처 + 수집일 표기
- 외부 가격이력 API(Keepa 등) 결제 금지
- 쿠팡 제휴 링크는 숨기지 않음 (광고 표시)
- 추가 기능(푸시·구독·다국가·신규 카테고리)은 검증 게이트 통과 전 중단
- CACHE_VERSION 변경 시 캐시 무효화 필수

---

## 주요 파일 구조

```
app/
  api/
    compare/           # 비교 요청 엔드포인트
    price/             # 네이버/쿠팡 실시간 가격
    cron/
      price-check/     # 일별 가격 적재
  compare/[...slug]/   # 비교 결과 페이지
lib/
  decision-engine.ts   # 핵심 오케스트레이터
  specs/
    dataset/
      laptops.ts       # 26개 → 60개+ 확장 대상
      smartphones.ts
      earphones.ts
      tablets.ts
  pricing/
    naver.ts           # 네이버 쇼핑 API
    coupang.ts         # (신규) 쿠팡 파트너스
    seed.ts            # 시드 데이터 폴백
  ai/
    groq.ts            # Groq API, 429 fallback
  watch.ts             # 관심 상품, 가격 알림
supabase/
  # comparison_cache, watches, click_events, price_history
```

---

## 검증 게이트 (DEV_NOTES §6 — 확장 전 필수)

| 지표 | 목표 |
|-----|-----|
| 노트북 비교 완료 수 | 30일 내 100회+ |
| 가격 알림 등록 | 30일 내 20개+ |
| 쿠팡 제휴 클릭 | 30일 내 50회+ |

**미달성 시:** 신규 기능 빌드 중단, SEO/콘텐츠 집중.
**달성 시:** 다음 단계 (푸시 알림, US 시장, 신규 카테고리) 진행.
