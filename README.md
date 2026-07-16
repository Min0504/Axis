# Axis

> 사기 전에 결정해주고, 산 뒤 최적 타이밍까지 알려주는 전자제품 구매 결정 도구.
>
> **결정(Decide) → 추적(Track) → 알림(Alert)**

"아이폰 16 vs 갤럭시 S25" 같은 자연어 쿼리를 입력하면 공식 스펙을 검증해 AI가 비교 테이블과 결론을 만들고, 가격을 추적해 최적 구매 타이밍을 알려줍니다.

한국(한국어) · 미국(English) · 일본(日本語) 3개 시장을 동시 지원합니다.

**프로덕션:** https://axis-app-beta.vercel.app · **상태:** 베타, 사업성 검증 단계 (한국 · 노트북 · 제휴)

> SEO: `verified`만 색인 (`partial`/`unverified`는 noindex). 캐시 버전: **v9**.

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

## 현재 상태 (2026-06-17)

| 항목 | 상태 |
|------|------|
| 프로덕션 배포 | ✅ 베타 완료 |
| AI 구매 결정 엔진 | ✅ 검증 게이트 포함 |
| 맞춤 재분석 (userContext) | ✅ 완료 |
| 네이버 쇼핑 실시간 최저가 | ✅ 완료 |
| 가격 이력 적재 (일별 크론) | ✅ 완료 |
| 이메일 가격 알림 (Resend) | ✅ 완료 |
| 웹 푸시 알림 (VAPID) | ✅ 완료 |
| 검증 데이터셋 | ✅ 수동 122+ (+KR 자동수집 병합, 북6 프로 포함) |
| 다국어 KR/US/JP | ✅ 완료 |
| 쿠팡 파트너스 연동 | ⏳ 누적 매출 15만원 후 발급 |
| Groq 폴백 체인 | ⏳ 트래픽 증가 후 |
| 커뮤니티 홍보 | ⏳ 예정 |

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
          │   │  runAiDecision   │  │  Groq (기본) / OpenAI / Gemini / Anthropic
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
 Auth · History    /api/price
 click_events      /api/cron
```

---

## 기술 스택

| 레이어 | 기술 | 선택 이유 |
|--------|------|-----------|
| Framework | Next.js (App Router) / React 19 | SSR + SEO 정적 비교 페이지 |
| 호스팅 | Vercel (Cron 포함) | Serverless + Edge, 무료 티어 |
| DB / Auth | Supabase (PostgreSQL, RLS) | 관계형 + 실시간, 무료 티어 |
| AI | Groq (Llama 3.1) — 프로바이더 추상화 | 무료 6,000 TPM, 빠른 응답 |
| 가격 | 네이버 쇼핑 Open API | 무료·즉시 발급, 국내 최저가 |
| 이메일 | Resend | 무료 100건/일 |
| 푸시 | Web Push (VAPID, PWA) | 별도 서비스 없이 브라우저 푸시 |
| 테스트 | Vitest | 데이터셋 무결성 검사 |

> **비용 원칙:** 최저비용 최대수익. Axis는 워크스페이스 전체에서 Supabase 사용이 승인된 유일한 프로젝트. 모든 레이어 무료 티어 기반, 수익 발생 시 유료 전환.

---

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정
cp .env.example .env.local

# 3. 개발 서버
npm run dev          # Webpack
npm run dev:turbo    # Turbopack (더 빠름)

# 4. 테스트
npm test
```

### 필수 환경변수

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 측 DB 접근 (크론·어드민) |
| `GROQ_API_KEY` | AI 결정 엔진 (기본 프로바이더) |

### 선택 환경변수

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
│   ├── track/           클릭·페이지뷰 트래킹
│   ├── price/           실시간 가격 조회
│   ├── cron/            가격 점검(알림) · 가격 스냅샷(이력 적재)
│   ├── history/         가격 이력 조회
│   ├── watches/         관심 상품 관리
│   └── push/            웹 푸시 구독
├── compare/[slug]/      SEO 정적 비교 페이지
└── results/             동적 결과 페이지

components/
├── results-view.tsx     결과 페이지 레이아웃
├── context-card.tsx     맞춤 재분석 입력 카드
├── timing-section.tsx   구매 타이밍 (신호등 + 가격 게이지)
├── vs-input.tsx         메인 비교 입력창
└── watch-button.tsx     가격 알림 등록 버튼

lib/
├── decision-engine.ts   비교 파이프라인 오케스트레이터
├── ai/                  AI 프로바이더 추상화 + 프롬프트
├── specs/dataset/       수동 검증 스펙 122개
├── pricing/             가격 프로바이더 (naver · coupang · seed)
├── comparison-cache.ts  캐시 레이어
└── affiliate.ts         제휴 링크 생성 (Amazon/Coupang/Naver)
```

---

## 검증 게이트

스펙 정확도를 보장하는 핵심 메커니즘:

```
tier 1: 제조사 공식 페이지 (apple.com, samsung.com …)
tier 2: 검증된 리뷰/언론 (GSMArena, Notebookcheck …)
tier 3: AI 추정값

verified   = tier 1~2로 primary 스펙 확인됨  → 색인 허용
partial    = 일부 스펙만 검증됨               → noindex (배지 표시)
unverified = AI 추정값만                       → noindex
```

`enrichWithDatasetFallback` merge 순서: `{ ...scrapedSpecs, ...datasetSpecs }` — dataset 값이 항상 scraped 값을 오버라이드.

---

개발 상세는 [DEV_NOTES.md](DEV_NOTES.md), 작업 규칙은 [CLAUDE.md](CLAUDE.md) 참고.
