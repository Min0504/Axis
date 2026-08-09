# Axis

**전자제품, 사기 전에 결론을 내려주는 AI 구매 결정 도구**

[![Live Demo](https://img.shields.io/badge/Live-axis--app--beta.vercel.app-3454e8?style=flat-square)](https://axis-app-beta.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square)](https://nextjs.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?style=flat-square)](https://supabase.com/)
[![AI](https://img.shields.io/badge/AI-Groq%20Llama-f55036?style=flat-square)](https://groq.com/)
[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-2088FF?style=flat-square)](https://github.com/Min0504/Axis/actions)

> “아이폰 16 vs 갤럭시 S25”처럼 입력하면, 공식 스펙을 검증한 뒤 **한 가지 추천**과 비교표를 만들고, 가격 추적으로 살 타이밍까지 알려줍니다.

**Live:** https://axis-app-beta.vercel.app · KR 우선 · ko / en / ja

---

## 문제

전자제품 구매는 스펙·가격·타이밍이 한꺼번에 얽혀 있습니다.  
ChatGPT류는 실시간 가격·추적이 없고, 다나와·Keepa류는 표와 차트만 있어 **무엇을 살지**를 대신 결정해 주지 않습니다.

## 해결

Axis는 **Decide → Track → Alert** 한 줄로 이어집니다.

| 단계 | 하는 일 |
|------|---------|
| **Decide** | 자연어 비교 → 공식 스펙 검증 → 단일 결론 + 표 + 선택지별 분석 |
| **Track** | 네이버 쇼핑 기반 현재가 · 일별 가격 이력 |
| **Alert** | 목표가·급락 시 이메일 / 웹 푸시 (크론) |

---

## 직접 만든 핵심

- **Verification Gate** — primary 스펙이 제조사·공인 소스(tier 1–2)로 뒷받침될 때만 `verified`. AI 추정만으로는 verified를 만들지 않음
- **스펙 파이프라인** — 수동 검증 데이터셋 + 공식 페이지 추출 + AI 보완을 계층적으로 합성
- **로케일 락** — UI 언어(ko/en/ja)가 결과 문장·스펙 표기·캐시 키를 결정
- **맞춤 재분석** — 용도·예산 컨텍스트로 캐시를 우회해 결론 재계산
- **구매 타이밍** — 가격 이력으로 “지금 / 대기” 판정

---

## 기술 스택

| 영역 | 선택 |
|------|------|
| App | Next.js 16 (App Router), React 19, TypeScript |
| Hosting | Vercel (Cron 포함) |
| Data / Auth | Supabase (PostgreSQL, RLS) |
| AI | Groq (Llama) — OpenAI / Gemini / Anthropic 폴백 추상화 |
| Price | 네이버 쇼핑 Open API |
| Notify | Resend, Web Push (VAPID) |
| Test / CI | Vitest, GitHub Actions |

---

## 아키텍처

```text
Browser
  VsInput ──► POST /api/compare ──► ResultsView
                    │
            decision-engine
           ┌────────┴────────┐
           │ Verification Gate│  dataset > scraped > AI
           │ runAiDecision    │  Groq / fallbacks
           └────────┬────────┘
      ┌─────────────┼─────────────┐
      ▼             ▼             ▼
  Supabase     Price providers   comparison_cache
 (auth/hist)   (naver / …)       (locale-aware)
```

---

## 빠른 시작

```bash
npm install
cp .env.example .env.local   # Supabase + GROQ_API_KEY 최소 설정
npm run dev
npm test
```

| 필수 환경변수 | 용도 |
|---------------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 공개 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 DB |
| `GROQ_API_KEY` | AI 결정 |

나머지는 `.env.example` 참고. DB 스키마는 `supabase/migrations/`.

---

## 저장소 구조

```text
app/            App Router (pages + API)
components/     UI (결과·입력·가격·공유)
lib/
  ai/           프롬프트 · 프로바이더
  specs/        스키마 · 데이터셋 · 추출 · 검증
  pricing/      가격 프로바이더
  decision-engine.ts
supabase/       migrations
tests/          Vitest
```

---

## 검증 상태

| 배지 | 의미 | 검색 색인 |
|------|------|-----------|
| `verified` | 공식 소스로 primary 스펙 확인 | 허용 |
| `partial` | 일부만 확인 | noindex |
| `unverified` | AI 추정 위주 | noindex |

---

Built as a solo product experiment — feedback welcome via issues.
