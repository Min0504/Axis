# Axis

> 사기 전에 결정해주고, 산 뒤 최적 타이밍까지 알려주는 전자제품 구매 결정 도구.
>
> **결정(Decide) → 추적(Track) → 알림(Alert)**

"아이폰 16 vs 갤럭시 S25" 같은 자연어 쿼리를 입력하면 공식 스펙을 검증해 AI가 비교 테이블과 결론을 만들고, 가격을 추적해 최적 구매 타이밍을 알려줍니다.

한국(한국어) · 미국(English) · 일본(日本語) 3개 시장을 동시 지원합니다.

> **현재 상태 (2026-06-12):** *검증 스펙 기반 AI 구매 결정* · *내 상황 맞춤 재분석* · *네이버 쇼핑 실시간 최저가* · *이메일 가격 알림(Resend)* 동작 중.
> 사업성 검증 단계로 **한국 · 노트북 · 제휴**부터 좁혀 검증 중. 자세한 방향은 [DEV_NOTES.md](DEV_NOTES.md) 참고.

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 구매 결정** | 자연어 비교 쿼리 → 공식 스펙 검증 → 단일 결론 + 비교 테이블 + 선택지별 분석 |
| **맞춤 재분석** | 용도·예산·상황을 입력하면 그 가중치로 결론을 재계산 (캐시 우회) |
| **검증 배지** | primary 스펙이 공식 소스(제조사/검증 자료)로 확인될 때만 `verified`, AI 추정은 noindex |
| **실시간 최저가** | 네이버 쇼핑 Open API 기반 현재가 + 자체 일별 가격 이력 적재 |
| **구매 타이밍** | 가격 이력 기반 "지금 살까 / 기다릴까" 판정 + 다음 모델 출시 주기 힌트 |
| **가격 알림** | 관심 상품 등록 → 목표가·역대최저·급락 시 이메일/푸시 알림 (일일 크론) |
| **클릭 트래킹** | 제휴 클릭·페이지뷰 이벤트 적재 (`click_events`) |
| **다국어** | KR/US/JP 동시 운영, 제품명 로케일 정규화 (`nameEn` / `nameJa`) |

## 핵심 차별점

| | 약점 | Axis |
|---|---|---|
| ChatGPT / Perplexity | 실시간 가격 없음, 추적·알림 불가 | 라이브 가격 + 알림 |
| 다나와 / Keepa | 결정·가이드 없음 (표·차트만) | AI 결정 + 검증 스펙 |

---

## 아키텍처

```
┌─────────────────────────────────────────────────────┐
│                   사용자 (브라우저)                    │
│  VsInput → /api/compare → ResultsView + ContextCard  │
└──────────────────────┬──────────────────────────────┘
                       │
          ┌────────────▼────────────┐
          │   decision-engine.ts    │  오케스트레이터
          │                         │
          │  ┌──────────────────┐   │
          │  │ Verification Gate│   │  dataset > scraped > AI
          │  │ verified/partial │   │
          │  │ /unverified      │   │
          │  └────────┬─────────┘   │
          │           │             │
          │   ┌───────▼──────────┐  │
          │   │  runAiDecision   │  │  Groq / OpenAI / Gemini / Anthropic
          │   │  axis-prompt.ts  │  │  userContext → 맞춤 재분석 (캐시 우회)
          │   │  429 → fallback  │  │
          │   └──────────────────┘  │
          └────────────┬────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    │                  │                  │
    ▼                  ▼                  ▼
  Supabase          가격 프로바이더       캐시 레이어
 PostgreSQL        naver / coupang      comparison_cache
 Auth · History    /api/price           CACHE_VERSION = 9
 click_events      /api/cron
```

**데이터 흐름 (10단계)**

```
1. 자연어 쿼리 입력
2. query-expansion → 제품명 후보 추출
3. lib/specs/dataset/ 수동 검증 데이터 조회
4. 미등록 → 웹 스크래핑 + Brave Search 폴백
5. enrichWithDatasetFallback → dataset이 scraped 값을 오버라이드
6. AI 프로바이더 호출 (userContext 있으면 캐시 우회)
7. 429 rate limit → buildDeterministicDecision fallback
8. 검증 배지 판정 후 comparison_cache 저장
9. 가격 데이터 별도 조회 → price_history 적재
10. 결과 렌더링 + 제휴 링크 삽입
```

---

## 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| Framework | Next.js 16 (App Router) / React 19 | SSR + SEO 정적 비교 페이지 |
| 호스팅 | Vercel (Cron 포함) | Serverless + Edge, 무료 티어 |
| DB / Auth | Supabase (PostgreSQL, RLS) | 관계형 + 실시간, 무료 티어 |
| AI | Groq (Llama 3.1) — 프로바이더 추상화 | 무료 6,000 TPM, 빠른 응답 |
| 가격 | 네이버 쇼핑 Open API (`AXIS_PRICE_SOURCE`) | 무료·즉시 발급, 국내 최저가 |
| 이메일 | Resend | 무료 100건/일, 간단한 설정 |
| 푸시 | Web Push (VAPID, PWA) | 별도 서비스 없이 브라우저 푸시 |
| 테스트 | Vitest | 데이터셋 무결성 검사 |

---

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local   # 아래 표 참고해 값 채우기

# 3. 개발 서버
npm run dev          # Webpack
npm run dev:turbo    # Turbopack (더 빠름)

# 4. 테스트 (데이터셋 무결성 검사 포함)
npm test
```

### 필수 환경변수

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 측 DB 접근 (크론·어드민) |
| `GROQ_API_KEY` | AI 결정 엔진 (기본 프로바이더) |

### 선택 환경변수 (해당 기능 활성화 시)

| 변수 | 기능 | 비고 |
|------|------|------|
| `AI_PROVIDER` | `groq` / `openai` / `gemini` / `anthropic` | 기본값: `groq` |
| `OPENAI_API_KEY` / `OPENAI_MODEL` | OpenAI 폴백 | |
| `GEMINI_API_KEY` / `GEMINI_MODEL` | Gemini 폴백 | |
| `ANTHROPIC_API_KEY` / `ANTHROPIC_MODEL` | Anthropic 폴백 | |
| `AXIS_PRICE_SOURCE` | `naver` / `coupang` / `seed` | **프로덕션에서 `seed` 금지** |
| `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` | 네이버 쇼핑 실시간 최저가 | 무료·즉시 발급 |
| `COUPANG_ACCESS_KEY` / `COUPANG_SECRET_KEY` | 쿠팡 파트너스 API | 누적 매출 15만원 후 발급 |
| `RESEND_API_KEY` | 이메일 가격 알림 | |
| `RESEND_FROM_EMAIL` | 발신 주소 | 미인증 시 `onboarding@resend.dev` |
| `BRAVE_SEARCH_API_KEY` | 미등록 제품 웹 검색 폴백 | |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | 푸시 알림 (클라이언트) | |
| `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | 푸시 알림 (서버) | |
| `CRON_SECRET` | 가격 점검·스냅샷 크론 보호 | |

### Supabase 설정

```bash
# 마이그레이션 적용
supabase db push
# 또는 SQL Editor에서 supabase/migrations/ 파일 순서대로 실행
```

Dashboard → Authentication → URL Configuration:
- Site URL: `http://localhost:3000`
- Redirect URLs: `http://localhost:3000/auth/callback`

---

## 프로젝트 구조

```
app/
├── api/
│   ├── compare/         비교 요청 (userContext 맞춤 재분석 포함)
│   ├── track/           클릭·페이지뷰 트래킹 (CTR 측정)
│   ├── price/           실시간 가격 조회
│   ├── cron/            가격 점검(알림) · 가격 스냅샷(이력 적재)
│   ├── history/         가격 이력 조회
│   ├── watches/         관심 상품 관리
│   └── push/            웹 푸시 구독
├── compare/[slug]/      SEO 정적 비교 페이지
└── results/             동적 결과 페이지

components/
├── results-view.tsx     결과 페이지 레이아웃
│                        (verdict-hero → timing+buy → spec table → analysis)
├── context-card.tsx     맞춤 재분석 입력 카드
├── timing-section.tsx   구매 타이밍 (신호등 + 가격 게이지)
├── share-actions.tsx    구매 링크 + 공유
├── vs-input.tsx         메인 비교 입력창
├── popular-rank-list.tsx 인기 비교 순위
└── watch-button.tsx     가격 알림 등록 버튼

lib/
├── decision-engine.ts   비교 파이프라인 오케스트레이터
├── ai/
│   ├── decide.ts        AI 프로바이더 추상화 (Groq/OpenAI/Gemini/Anthropic)
│   ├── axis-prompt.ts   시스템·유저 프롬프트 (userContext 맞춤 포함)
│   └── types.ts         AiDecisionInput 타입 (userContext 포함)
├── specs/
│   ├── dataset/         수동 검증 스펙 122개
│   │   ├── smartphones.ts   스마트폰 38개
│   │   ├── earphones.ts     이어폰 15개
│   │   ├── laptops.ts       노트북 15개
│   │   ├── tablets.ts       태블릿 12개
│   │   └── kr/ us/ jp/      로케일별 variant
│   └── schema/          카테고리별 스펙 스키마
├── pricing/             가격 프로바이더 추상화 (naver · coupang · seed)
├── comparison-cache.ts  캐시 레이어 (CACHE_VERSION = 9)
├── affiliate.ts         제휴 링크 생성 (Amazon/Coupang/Naver)
├── i18n/                다국어 라벨 (ko / en / ja)
├── email/               Resend 이메일 알림
├── push/                Web Push VAPID 알림
└── watch/               가격 추적 로직

supabase/migrations/
├── 0001~0013            기본 스키마 (users, watches, cache…)
├── 0014_price_history   가격 이력 테이블
└── 0015_click_events    클릭 트래킹 테이블
```

---

## 검증 게이트

스펙 정확도를 보장하는 핵심 메커니즘:

```
tier 1: 제조사 공식 페이지 (apple.com, samsung.com …)
tier 2: 검증된 리뷰/언론 (GSMArena, Notebookcheck …)
tier 3: AI 추정값

verified   = tier 1~2로 primary 스펙 확인됨  → 색인 허용
partial    = 일부 스펙만 검증됨               → 색인 허용 (배지 표시)
unverified = AI 추정값만                       → noindex
```

`enrichWithDatasetFallback` merge 순서: `{ ...scrapedSpecs, ...datasetSpecs }` — dataset 값이 항상 scraped 값을 오버라이드.

---

## 개발 규칙

- **결과/추천 로직은 직접 수정하지 않는다** — `selectedOption`, `reasons`, `oneLineConclusion`, per-option 분석은 프롬프트로 조정
- **스펙은 DB에서 꺼내지 않는다** — `lib/specs/dataset/` 수동 검증 데이터 또는 공식 페이지 AI 검증만
- **코드 수정 후** `npm test` 실행 (특히 데이터셋·파이프라인 변경 시)
- **스키마·결과 포맷 변경 시** `CACHE_VERSION` 올려 구버전 캐시 무효화 (현재 v9)

---

## 로드맵

- [x] AI 구매 결정 엔진 (검증 게이트)
- [x] 맞춤 재분석 (userContext 파이프라인)
- [x] 네이버 쇼핑 실시간 최저가
- [x] 가격 이력 적재 (일별 크론)
- [x] 이메일 가격 알림 (Resend)
- [x] 웹 푸시 알림 (VAPID)
- [x] 클릭 트래킹 (CTR 측정)
- [x] 다국어 KR/US/JP (3개 시장)
- [x] 수동 검증 데이터셋 122개 제품
- [ ] 쿠팡 파트너스 정식 연동 (누적 매출 15만원 후)
- [ ] Groq 폴백 체인 (트래픽 증가 후)
- [ ] 커뮤니티 홍보 (뽐뿌/클리앙/네이버 카페)

---

개발 상세는 [DEV_NOTES.md](DEV_NOTES.md), 작업 규칙은 [CLAUDE.md](CLAUDE.md) 참고.
