# Axis

> 사기 전에 결정해주고, 산 뒤 최적 타이밍까지 알려주는 전자제품 구매 결정 도구.
> **결정(Decide) → 추적(Track) → 알림(Alert)**

"아이폰 16 vs 갤럭시 S25" 같은 자연어 쿼리를 입력하면, 공식 스펙을 검증해
AI가 비교 테이블과 결론을 만들고, 가격을 추적해 살 타이밍을 알려줍니다.

한국(한국어) · 미국(English) · 일본(日本語) 다국어 구조를 지원합니다.

> **현재 상태 (2026-06-11):** 라이브 제품은 *검증 스펙 기반 AI 구매 결정*까지 동작합니다.
> *가격 추적·알림*과 *다국가 동시 운영*은 사업성 검증 단계로, **한국 · 노트북 · 제휴부터
> 좁혀 검증 중**입니다. 자세한 방향은 [DEV_NOTES.md](DEV_NOTES.md) §1·§6 참고.

## 핵심 차별점

| | 약점 | Axis |
|---|---|---|
| ChatGPT / Perplexity | 실시간 가격을 모름, 추적·알림 불가 | 라이브 가격 + 알림 |
| 다나와 / Keepa / Camel | 결정·가이드 없음 (표·차트만) | AI 결정 + 검증 스펙 |

**검증 게이트**: 스펙 비교는 primary 스펙이 공식 소스(제조사/검증 자료)로 뒷받침될
때만 `verified` 배지를 받고 색인됩니다. AI 추정값은 noindex 처리됩니다.

## 기술 스택

| 레이어 | 기술 |
|--------|------|
| Framework | Next.js 16 (App Router) / React 19 |
| 호스팅 | Vercel |
| DB / Auth | Supabase (PostgreSQL) |
| AI | Groq (Llama 3.1) — 프로바이더 추상화 |
| 이메일 | Resend |
| 푸시 | Web Push (VAPID, PWA) |
| 테스트 | Vitest |

## 시작하기

```bash
# 1. 의존성 설치
npm install

# 2. 환경변수 설정 (.env.local)
cp .env.example .env.local   # 없으면 아래 표 참고해 직접 생성

# 3. 개발 서버
npm run dev          # webpack
npm run dev:turbo    # turbopack (더 빠름)

# 4. 테스트
npm test
```

### 필수 환경변수

| 변수 | 용도 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 연결 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 측 DB 접근 |
| `GROQ_API_KEY` | AI 결정 엔진 |

### 선택 환경변수 (해당 기능 활성화 시)

| 변수 | 기능 |
|------|------|
| `BRAVE_SEARCH_API_KEY` | 미등록 제품 웹 검색 폴백 |
| `RESEND_API_KEY` | 이메일 가격 알림 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` | 푸시 알림 |
| `CRON_SECRET` | 가격 점검 크론 보호 |

### Supabase 설정

1. Dashboard → **Authentication → URL Configuration**
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/auth/callback`
2. 마이그레이션 적용: `supabase db push` (또는 SQL Editor에서 `supabase/migrations/` 순서대로 실행)

## 프로젝트 구조

```
app/            Next.js App Router (페이지 · API 라우트)
components/     React 컴포넌트
lib/
├── decision-engine.ts   비교 요청 메인 오케스트레이터
├── specs/               스키마 · 데이터셋 · 스펙 추출
├── ai/                  AI 프로바이더 추상화 + 프롬프트
├── pricing/             가격 프로바이더 추상화
└── watch/ · push/       가격 추적 · 알림
supabase/migrations/     DB 스키마
```

개발 상세는 [DEV_NOTES.md](DEV_NOTES.md), 작업 규칙은 [CLAUDE.md](CLAUDE.md) 참고.
