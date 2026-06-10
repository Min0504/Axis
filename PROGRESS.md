# Axis — 개발 진행 현황

> 마지막 업데이트: 2026-06-09  
> 테스트: **168/168 통과**

---

## 목차

1. [프로젝트 개요](#1-프로젝트-개요)
2. [기술 스택](#2-기술-스택)
3. [아키텍처](#3-아키텍처)
4. [완료된 작업](#4-완료된-작업)
5. [데이터셋 현황](#5-데이터셋-현황)
6. [스펙 수집 인프라](#6-스펙-수집-인프라)
7. [남은 작업](#7-남은-작업)
8. [배포 주의사항](#8-배포-주의사항)

---

## 1. 프로젝트 개요

**Axis**는 전자제품 비교 서비스다. 사용자가 "아이폰 16 vs 갤럭시 S25" 같은 자연어 쿼리를 입력하면:

1. 공식 스펙 페이지를 스크래핑
2. AI가 전체 비교 테이블 생성 (Groq / Llama 3.1)
3. 스크래핑 값으로 AI 값 보정
4. 카테고리별 스키마 필드 10개 내외로 구조화된 결과 반환

**지원 카테고리**: 스마트폰, 노트북, 무선이어폰, 모니터, 태블릿  
**지원 국가/언어**: KR (한국어), US (English), JP (日本語)

---

## 2. 기술 스택

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js 15 (App Router) |
| 호스팅 | Vercel |
| DB | Supabase (PostgreSQL) |
| AI | Groq (Llama 3.1 70B) |
| 인증 | Supabase Auth |
| 이메일 | Resend |
| 푸시 | Web Push (VAPID) |
| 테스트 | Vitest (168개) |

---

## 3. 아키텍처

### 비교 요청 흐름

```
사용자 쿼리 ("에어팟 프로 vs 버즈")
        ↓
[1] 24h 캐시 확인 (Supabase comparison_cache, v3|query|locale|country)
        ↓ 미스
[2] expandComparisonOptions() — 브랜드명 → 최신 모델 확장
        예: "에어팟" → "에어팟 4 ANC"
        예: "갤럭시" → ["갤럭시 S25", "갤럭시 S24"]
        ↓
[3] detectCategory() — 스마트폰 / 노트북 / 이어폰 분류
        ↓
[4] resolveComparableSource() — product-aliases → registry → URL 확인
        ↓
[5] extractProductSpecs() — 공식 페이지 HTML 스크래핑 (병렬)
        parser: apple | samsung | generic
        ↓
[6] runAiDecision() — Groq API 호출
        · 스키마 필드 전체 채우기 (10개)
        · 스크래핑된 값은 context로 전달 → 그대로 복사
        · 없는 필드는 AI 학습 지식으로 채움 ("정보 없음" 금지)
        ↓
[7] buildFinalComparison() — AI 행 기반 + 스크래핑 값 오버레이
        · 스크래핑 값 있는 셀 → source URL 첨부 (검증 배지)
        ↓
[8] gradeVerification() — verified / partial / unverified
        · primary 필드가 모두 source URL 있으면 "verified"
        · verified만 SEO 인덱싱 대상
        ↓
[9] setCachedComparison() — 24h 캐시 저장
        ↓
결과 반환 (JSON)
```

### 검증 등급 (verification)

| 등급 | 조건 | SEO |
|------|------|-----|
| `verified` | 모든 primary 필드에 공식 source URL | ✅ 인덱싱 |
| `partial` | 일부 primary 필드만 sourced | 조건부 |
| `unverified` | AI 단독 (source 없음) | ❌ noindex |

---

## 4. 완료된 작업

### 4-1. 비교 테이블 — 전 필드 표시 수정

**문제**: 아이폰 16 vs 갤럭시 S25 검색 시 5개 필드만 표시  
**원인**: `comparison: officialComparison` — AI 결과가 무시되고 스크래핑 결과만 반환  
**해결**: `buildFinalComparison()` 도입

```typescript
// AI rows = 스키마 전체 필드 (10개) 기준
// 스크래핑 값이 있으면 해당 셀 오버레이 + source URL 첨부
function buildFinalComparison(
  aiRows: ComparisonRow[],
  extractedSpecs: (ExtractedSpecs | null)[],
  category: Category,
  locale: Locale
): ComparisonRow[]
```

**스마트폰 표시 필드** (10개): 모델명, 출시일, 출시가격, 디스플레이, 칩셋, 램, 저장공간, 카메라, 배터리, 충전, 무게

---

### 4-2. 모델명 공식 제품명으로 수정

**문제**: 모델명 셀에 "아이폰 16" (한국어 별칭) 대신 "iPhone 16" (공식명) 표시 필요  
**해결**: AI 프롬프트 하드룰 추가

```
For the model name field (모델명 / Model): use the EXACT official product name
from spec context (e.g. "iPhone 16", "Galaxy S25"). Never use a generic or modified name.
```

---

### 4-3. "에어팟 프로 vs 버즈" 검색 결과 없음 수정

**원인** 3개 동시 발생:
1. 쿼리 확장 결과 ("에어팟 프로 2세대", "갤럭시 버즈4 프로")가 product-aliases에 없음
2. registry에 해당 URL이 없음
3. decision engine이 "일부만 missing"이어도 전부 not_found 반환

**해결**:
```typescript
// product-aliases.ts — 확장 결과 alias 추가
"에어팟 프로 2세대": "airpods pro 2",
"갤럭시 버즈4 프로": "galaxy buds4 pro",

// product-registry-data.ts — 신규 URL 추가
"airpods pro 2": { officialUrl: "https://www.apple.com/kr/airpods-pro/specs/", ... },
"galaxy buds4 pro": { officialUrl: "https://www.samsung.com/sec/mobile-accessories/galaxy-buds4-pro/", ... },

// decision-engine.ts — allMissing 체크
const allMissing = missingOptions.length === options.length;
if (allMissing || !getCategorySchema(category)) {
  return buildProductNotFoundDecision(...);
}
// SOME missing + schema 있음 → AI 지식으로 계속 진행
```

---

### 4-4. 24h 캐시 스테일 결과 수정

**원인**: 캐시 키에 버전 없음 → 스키마 변경해도 구버전 결과 계속 서빙  
**해결**: `CACHE_VERSION = 3` 프리픽스

```typescript
// comparison-cache.ts
const CACHE_VERSION = 3;
function cacheKey(query, locale, country) {
  return `v${CACHE_VERSION}|${query.trim().toLowerCase()}|${locale}|${country}`;
}
```

---

### 4-5. AI 프롬프트 "정보 없음" 버그 수정

**원인**: 프롬프트에 모순 지시문 존재

```
// 버그 — 하드룰을 덮어씌움
"but mark inferred values as '정보 없음' if not in context"
```

이어폰처럼 Samsung 공식 페이지가 JS 렌더링이라 context = null인 경우 모든 필드가 "정보 없음"으로 채워짐.

**해결**: 해당 줄 제거 + 지시 강화

```
// 수정 후
When spec context is sparse or missing, ALWAYS draw on your training knowledge
of official specs. Never default to "정보 없음" just because the context is empty.
```

---

### 4-6. 국가별 데이터셋 구조 설계

`VerifiedProduct` 타입에 `country` 필드 추가:

```typescript
export type DatasetCountry = "KR" | "US" | "JP" | "GLOBAL";

export type VerifiedProduct = {
  id: string;
  canonicalName: string;
  aliases: string[];
  category: Category;
  country: DatasetCountry;   // 추가됨
  source: string;
  fetchedAt: string;
  tier: SpecSourceTier;
  specs: Record<string, string>;
};
```

`resolveVerifiedProduct()` 국가 우선순위 매칭 추가:
- KR 쿼리 → KR 엔트리 우선, GLOBAL 폴백
- US 쿼리 → US 엔트리 우선, GLOBAL 폴백

---

### 4-7. 스키마 primary 필드 조정

검증 게이트에서 제외된 필드 (데이터셋 미보유 / 시세 변동):

| 카테고리 | 필드 | 이유 |
|---------|------|------|
| smartphone | `release_date` | 데이터셋 미보유 |
| smartphone | `launch_price_krw` | 시세 변동 큼 |
| smartphone | `ram_gb` | Apple 공식 페이지 미공개 |
| smartphone | `charging` | 데이터셋 미보유 |
| earphones | `launch_price_krw` | 시세 변동 큼 |

---

### 4-8. 쿼리 확장 업데이트

최신 모델 반영:

| 브랜드 | 이전 | 현재 |
|--------|------|------|
| 갤럭시 버즈 | 버즈3 프로 | **버즈4 프로** |
| 에어팟 | 에어팟 프로 | **에어팟 4 ANC** |
| iPhone | 17 | **16** (실제 최신) |
| Galaxy S | S25, S24, S23 | **S25, S24** (2개로 축소) |

---

## 5. 데이터셋 현황

### 스마트폰 (`lib/specs/dataset/smartphones.ts`) — 10개 모델

| 모델 | country | tier |
|------|---------|------|
| 아이폰 16 | KR | 1 |
| 아이폰 16 플러스 | KR | 1 |
| 아이폰 16 프로 | KR | 1 |
| 아이폰 16 프로 맥스 | KR | 1 |
| 아이폰 15 프로 | KR | 1 |
| 아이폰 15 프로 맥스 | KR | 1 |
| 갤럭시 S25 | KR | 1 |
| 갤럭시 S25+ | KR | 1 |
| 갤럭시 S25 울트라 | KR | 1 |
| 갤럭시 S24 | KR | 1 |
| 갤럭시 S24 울트라 | KR | 1 |

**스마트폰 스펙 필드** (primary만): model_name, display_inch, chipset, storage_gb, camera_mp, battery, weight_g

---

### 노트북 (`lib/specs/dataset/laptops.ts`) — 4개 모델

| 모델 | country | tier |
|------|---------|------|
| 맥북 에어 13 M3 | KR | 1 |
| 맥북 에어 15 M3 | KR | 1 |
| LG 그램 16 | KR | 1 |
| 갤럭시 북4 프로 14 | KR | 1 |

**노트북 스펙 필드** (primary): model_name, cpu, gpu, ram_gb, storage_gb, display_inch, resolution, battery_wh, weight_g, os, refresh_hz, brightness_nits

---

### 이어폰 (`lib/specs/dataset/earphones.ts`) — 6개 모델 (신규)

| 모델 | country | tier |
|------|---------|------|
| 에어팟 프로 2세대 | KR | 1 |
| 에어팟 4 ANC | KR | 1 |
| 에어팟 맥스 | KR | 1 |
| 갤럭시 버즈3 프로 | KR | 1 |
| 갤럭시 버즈4 프로 | KR | 1 |
| 소니 WF-1000XM5 | KR | 2 |

**이어폰 스펙 필드** (primary): model_name, driver, anc, battery_hr, battery_total_hr, charging_type, water_resist, weight_g

---

## 6. 스펙 수집 인프라

하드코딩 데이터셋을 **반자동으로 확장**하기 위한 배치 수집 스크립트.

### 디렉토리 구조

```
scripts/collect-specs/
├── index.ts                  # 메인 러너
├── sources/
│   ├── danawa.ts             # KR: 다나와 (danawa.com)
│   ├── gsmarena.ts           # US: GSMArena
│   └── kakaku.ts             # JP: 価格.com
└── models/
    ├── smartphones.json      # 수집 대상 스마트폰 21개
    ├── laptops.json          # 수집 대상 노트북 14개
    └── earphones.json        # 수집 대상 이어폰 12개
```

### 수집 전략

| 국가 | 소스 | 특징 |
|------|------|------|
| KR | 다나와 (danawa.com) | 한국 출시가 + KRW 가격, pcode 기반 스펙 테이블 |
| US | GSMArena | 글로벌 하드웨어 스펙 (tier 2) |
| JP | 価格.com | 일본 시장 스펙 + JPY 가격 |

### 실행 명령어

```bash
npm run collect:kr    # 한국 전체 카테고리
npm run collect:us    # 미국 전체 카테고리
npm run collect:jp    # 일본 전체 카테고리

# 개별 카테고리
npx tsx scripts/collect-specs/index.ts smartphone KR
npx tsx scripts/collect-specs/index.ts laptop US
npx tsx scripts/collect-specs/index.ts earphone JP
```

### 수집 후 절차

1. `lib/specs/dataset/kr/smartphones.ts` 파일 검토 (파싱 결과 확인)
2. `lib/specs/dataset/index.ts`에 import 추가
3. `npm test` — `dataset.test.ts` 무결성 검사 통과 확인

> ⚠️ Samsung, Apple JS 렌더링 페이지는 정적 HTML 스크래핑 실패할 수 있음.  
> 실패 시 결과 파일에 제외되므로 수동 보완 필요.

---

## 7. 남은 작업

### 즉시 필요 (배포 전)

| 항목 | 내용 |
|------|------|
| **Resend API 키** | 이메일 가격 알림 기능 활성화 필요 |
| **CRON_SECRET 교체** | 현재 기본값 (보안 취약) |
| **Vercel 환경변수 등록** | `GROQ_API_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT` 등 |

### 데이터셋 확장

| 항목 | 우선순위 |
|------|---------|
| 노트북 추가 (맥북 M4, 갤럭시북5 프로 등) | 높음 |
| 스마트폰 추가 (아이폰 14, 갤럭시 Z 시리즈) | 중간 |
| batch 수집 스크립트 실제 실행 후 파일 검토 | 중간 |
| US/JP 데이터셋 구축 | 낮음 |

### 기능 개선

| 항목 | 내용 |
|------|------|
| 이어폰 스펙 검증 | 데이터셋 추가로 "verified" 등급 달성 |
| 스마트폰 RAM/충전 필드 | 다나와 수집 후 primary: true 격상 검토 |
| 검색 미스 로그 분석 | `search_miss_log` 테이블 → 인기 검색어 파악 → 데이터셋 우선순위 결정 |

---

## 8. 배포 주의사항

> **⛔ 배포는 사용자가 명시적으로 지시하기 전까지 절대 하지 않는다.**
> 기능 점검 완료 후 배포 지시 예정.

### 환경변수 체크리스트 (Vercel)

```
GROQ_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_SUBJECT=mailto:...
RESEND_API_KEY=...
CRON_SECRET=...  ← 반드시 교체
```

### 배포 전 최종 확인

- [ ] `npm test` → 168/168 통과
- [ ] `npx tsc --noEmit` → 에러 0
- [ ] Vercel 환경변수 전부 등록 확인
- [ ] CRON_SECRET 기본값 아님 확인
- [ ] Resend API 키 유효 확인
- [ ] 아이폰 16 vs 갤럭시 S25 — 10개 필드 정상 표시
- [ ] 에어팟 프로 vs 버즈 — 정보 없음 없이 표시
- [ ] 맥북 에어 vs 그램 — 비교 정상

---

## 부록: 주요 파일 맵

```
lib/
├── decision-engine.ts          # 비교 요청 메인 오케스트레이터 (477줄)
├── comparison-cache.ts         # 24h Supabase 캐시 (v3)
├── query-expansion.ts          # 브랜드명 → 최신 모델 확장
├── category.ts                 # 카테고리 감지 (NLP)
├── ai/
│   ├── axis-prompt.ts          # AI 프롬프트 빌더
│   ├── decide.ts               # Groq API 호출
│   └── types.ts                # AI I/O 타입
├── specs/
│   ├── schema.ts               # 카테고리별 스펙 필드 정의
│   ├── product-aliases.ts      # 한글명 → registry 키 매핑
│   ├── product-registry-data.ts # registry 키 → 공식 URL
│   ├── dataset/
│   │   ├── index.ts            # 국가별 product 조회
│   │   ├── smartphones.ts      # KR 스마트폰 11개
│   │   ├── laptops.ts          # KR 노트북 4개
│   │   ├── earphones.ts        # KR 이어폰 6개 (신규)
│   │   └── types.ts            # VerifiedProduct 타입
│   ├── extract/
│   │   ├── pipeline.ts         # 스크래핑 파이프라인
│   │   ├── discover.ts         # URL 자동 발견
│   │   └── url-patterns.ts     # 브랜드별 URL 패턴
│   └── parsers/
│       ├── apple.ts            # Apple 스펙 페이지 파서
│       ├── samsung.ts          # Samsung 스펙 페이지 파서
│       └── generic.ts          # 범용 파서
scripts/
└── collect-specs/
    ├── index.ts                # 배치 수집 러너
    ├── sources/
    │   ├── danawa.ts           # KR 다나와 스크래퍼
    │   ├── gsmarena.ts         # US GSMArena 스크래퍼
    │   └── kakaku.ts           # JP 価格.com 스크래퍼
    └── models/
        ├── smartphones.json    # 수집 대상 21개
        ├── laptops.json        # 수집 대상 14개
        └── earphones.json      # 수집 대상 12개
tests/
└── (24개 테스트 파일, 168개 테스트)
```
