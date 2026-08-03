# Axis

> 사기 전에 결정해주고, 산 뒤 최적 타이밍까지 알려주는 전자제품 구매 결정 도구.

![Deploy](https://img.shields.io/badge/deploy-Vercel-black) ![Stack](https://img.shields.io/badge/Next.js%2019-React%2019-white) ![DB](https://img.shields.io/badge/Supabase-PostgreSQL-green) ![AI](https://img.shields.io/badge/AI-Groq%20Llama%203.1-orange)

**프로덕션:** https://axis-app-beta.vercel.app · **상태:** 베타 (사업성 검증 단계)

"아이폰 16 vs 갤럭시 S25" 같은 자연어 쿼리를 입력하면 공식 스펙을 검증해 AI가 비교 테이블과 결론을 만들고, 가격을 추적해 최적 구매 타이밍을 알려준다. 한국(한국어) 우선 운영.

**결정(Decide) → 추적(Track) → 알림(Alert)**

---

## 주요 기능

| 기능 | 설명 |
|------|------|
| **AI 구매 결정** | 자연어 비교 쿼리 → 공식 스펙 검증 → 단일 결론 + 비교 테이블 + 선택지별 분석 |
| **맞춤 재분석** | 용도·예산·상황을 입력하면 그 가중치로 결론을 재계산 (캐시 우회) |
| **검증 배지** | primary 스펙이 공식 소스로 확인될 때만 `verified`, AI 추정은 noindex |
| **실시간 최저가** | 네이버 쇼핑 Open API 기반 현재가 + 일별 가격 이력 적재 |
| **구매 타이밍** | 가격 이력 기반 "지금 살까 / 기다릴까" 판정 + 다음 모델 출시 주기 힌트 |
| **가격 알림** | 관심 상품 등록 → 목표가·역대최저·급락 시 이메일/푸시 알림 (일일 크론) |
| **다국어** | KR/US/JP 코드 지원 · 운영은 KR 우선 |

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
          │  ┌──────────────────┐   │
          │  │ Verification Gate│   │  dataset > scraped > AI
          │  └────────┬─────────┘   │
          │  ┌────────▼──────────┐  │
          │  │  runAiDecision    │  │  Groq (기본) / OpenAI / Gemini / Anthropic
          │  └───────────────────┘  │
          └────────────┬────────────┘
                       │
    ┌──────────────────┼──────────────────┐
    ▼                  ▼                  ▼
  Supabase        가격 프로바이더       캐시 레이어
 PostgreSQL       naver / coupang     comparison_cache
```

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js (App Router) / React 19 |
| 호스팅 | Vercel (Cron 포함) |
| DB / Auth | Supabase (PostgreSQL, RLS) |
| AI | Groq (Llama 3.1) — 프로바이더 추상화 |
| 가격 | 네이버 쇼핑 Open API |
| 이메일 | Resend |
| 푸시 | Web Push (VAPID, PWA) |

> 모든 레이어 무료 티어 기반. 수익 발생 시 유료 전환.

---

## 시작하기

```bash
npm install
cp .env.example .env.local
npm run dev          # Webpack
npm run dev:turbo    # Turbopack (더 빠름)
npm test
```

### 필수 환경변수

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 측 DB 접근 |
| `GROQ_API_KEY` | AI 결정 엔진 |

선택 환경변수(OpenAI/Gemini/Anthropic 폴백, 네이버/쿠팡 API, Resend, VAPID 등)는 `.env.example` 참고.

### Supabase 설정

```bash
supabase db push
```

---

## 프로젝트 구조

```
app/
├── api/compare/       비교 요청 (맞춤 재분석 포함)
├── api/price/         실시간 가격 조회
├── api/cron/          가격 점검 · 스냅샷
├── api/watches/       관심 상품 관리
├── compare/[slug]/    SEO 정적 비교 페이지
└── results/           동적 결과 페이지

components/            results-view · context-card · timing-section · vs-input
lib/                   decision-engine · ai/ · pricing/ · specs/dataset/ · affiliate.ts
```

## 검증 게이트

```
verified   = tier 1~2 (제조사·검증 리뷰)로 확인됨  → 색인 허용
partial    = 일부만 검증됨                          → noindex
unverified = AI 추정값만                            → noindex
```

---

개발 상세는 [DEV_NOTES.md](DEV_NOTES.md), 작업 규칙은 [CLAUDE.md](CLAUDE.md) 참고.
