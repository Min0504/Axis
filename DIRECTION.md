# Axis — 제품 방향 (확정 v2)

> 이 문서는 흔들릴 때 돌아오는 기준점이다. 바꾸려면 명시적으로 이 문서를 고친다.
> v1 확정: 2026-06-02 (검증 스펙 결정 엔진)
> **v2 확정: 2026-06-02 — 결정 → 추적 → 알림으로 재편**

## 한 줄 정의

**사기 전에 결정해주고, 산 뒤 최적 타이밍까지 알려주는 도구.**
= **결정(Decide) → 추적(Track) → 알림(Alert)**

단순 비교/결정만으로는 ChatGPT를 이길 수 없다. 우리의 해자는 **라이브 가격 데이터 + 가격 알림 + 검증 스펙** — 챗봇이 구조적으로 못 하는 것들이다.

| | 약점 | Axis의 무기 |
|---|---|---|
| ChatGPT/Perplexity | **실시간 가격을 모름**, 추적·알림 불가 | 라이브 가격 + 알림 |
| 다나와/Keepa/Camel | 결정·가이드 없음 (표·차트만) | AI 결정 + 검증 스펙 |
| 단순 비교사이트 | 차별화 0 | 위 둘의 결합 |

**포지셔닝: "아직 안 정한 사람을 위한 Keepa."** 결정부터 시작해 추적·타이밍까지.
**증거 모델:** Keepa·CamelCamelCamel(가격추적+알림+제휴+구독, 글로벌, 번창) — 단 결정 레이어가 없음. 우리가 그걸 얹는다.

## 왜 이 구조가 3대 약점을 동시에 푸는가

1. **저빈도의 저주** (노트북 3~5년에 한 번) → **가격 알림이 1회성 결정을 "지켜보다 사는" 주기적 관계로 전환** → 재방문·앱·구독의 존재 이유.
2. **낮은 트래픽** → 검색면이 둘: "X vs Y 뭐 살까"(결정) + **"X 최저가/가격추이/언제 사야"(가격 — 고볼륨·고인텐트·반복, 구매 직전이라 제휴 전환율 ↑)**.
3. **웹→앱→구독 단계와 정합**: 가격 푸시 알림 = 앱의 존재 이유, 프리미엄 알림 = 구독.

## 시장 앵커 — 글로벌 + 한국 동시

- **글로벌**: Amazon (글로벌 제휴 + 가격 이력). 영어 SEO.
- **한국**: Coupang/Danawa/Naver. 네이버 유통(블로그·카페).
- **Region/Retailer를 provider 추상화로** 받아 동시 운용. locale → region 매핑.

## 도메인 / 카테고리

**전자기기 비컨으로 시작** (가격 변동 큼·고가·스펙 비교 적합 → 결정·추적 둘 다 이상적).
진입 순서: **노트북(창) → 스마트폰(확성기) → 모니터(확장) → 이어폰(반복)**.
단 **가격추적 척추는 어떤 제품으로도 확장 가능** → "좁아서 트래픽 없음"을 해소(지금 집중, 미래 확장).

## 수익 모델 (단계별)

- **Phase 1 (웹)**: 제휴 우선, 전 유저 노출. 결정+비교+가격추적. SEO.
- **Phase 2 (앱)**: 가격 하락 **푸시 알림** = 다운로드 동기.
- **Phase 3 (구독)**: 프리미엄 알림(워치 무제한·즉시 알림·가격이력 심층·"지금 살까/기다릴까" 신호).
- 제휴 링크는 광고가 아니라 유틸 → 절대 숨기지 않음.

## 절대 안 어기는 규율 — 검증 게이트

스펙 비교는 **primary 스펙이 출처 등급 2티어 이상**일 때만 `verified`·색인. 그 외 noindex.
출처 티어: **1 제조사 공식 / 2 검증 자료 / 3 AI 추정**. 모든 결과에 출처·수집일 표기.
가격도 동일 원칙: 출처(리테일러)·수집 시각 표기, 추정 금지.

## 아키텍처 (v2)

```
[결정 레이어]  분류기 → 스키마 → 검증 스펙 → AI 결정 → 검증 배지   (v1, 유지)
                lib/category, lib/specs/*, lib/ai/*, lib/decision-engine

[가격 레이어]  Product → PriceProvider(region별) → Quote/History → 차트·최저가  (v2, 신규)
                lib/pricing/*  (provider 추상화: amazon / coupang / seed)

[추적 레이어]  계정 → Watch(관심상품·목표가) → 가격 점검 크론 → 알림(이메일→푸시)  (v2, 신규)
                Supabase(watches) + cron + 알림
```

## 재설계 단계 (v2 공사)

- **P0 — 가격 도메인 기반**: `lib/pricing/` 타입 + `PriceProvider` 추상화 + **seed provider**(외부 API 없이 전 UX 가동) + region 라우팅 + 제품 `id`. *(테스트로 보증, 외부 의존 0)*
- **P1 — 웹 가격 UI**: 제품 페이지(스펙+가격+가격이력 스파크라인+"추적") / 비교에 현재가·"지금 더 싼 쪽" / 홈 서사 재중심화.
- **P2 — 계정·워치·알림(이메일)**: Supabase `watches`, 워치리스트, 가격 점검 크론 → 드롭 시 이메일.
- **P3 — 앱·푸시·구독**: 모바일 + 가격 푸시 + 프리미엄 알림 구독.
- **데이터 교체**: seed provider → 실데이터(Keepa API / Amazon PA-API / Coupang·Naver). provider만 교체.

## v1에서 그대로 가져가는 것 (안 버림)

- 카테고리 스키마 · 출처 등급 · 검증 게이트 · 검증 스펙 데이터셋 · AI 결정 엔진 · 결과/홈 UI 셸.
- 즉 v2 공사는 **버리는 게 아니라 가격·추적·알림을 더하고 서사를 재중심화**하는 것.

### v1 구현 현황 (완료)
- [x] 스키마/출처/검증게이트/데이터셋/결정파이프라인/검증배지/noindex

### AI 스펙 추출기 (네 핵심 비전 — "AI가 공식 페이지에서 스펙 추출")
- [x] 추출 코어 — `lib/specs/extract/` (htmlToText · 스키마 프롬프트 · 스키마검증 파서 · tier-2)
- [x] 범용 LLM 호출부 — `lib/ai/complete.ts` (Groq/OpenAI/Gemini/Anthropic)
- [x] fetch + 파이프라인 — `fetch.ts`(SSRF-safe) · `pipeline.ts`(extractProductSpecs)
- [x] 트리거 라우트/화면 — `/admin/sources`, `/api/admin/extract` (AXIS_ADMIN 게이트, AI 추출 점검용)
- [x] URL 자동 발견 — `discover.ts` + `web-search.ts` (registry → 검색 후보 → 공식 도메인 allowlist → AI 공식성 판별)
- [x] 국가별 소스 — `axis-country` 쿠키로 KR/US/JP 공식 페이지 분리. 언어(`axis-locale`)와 독립.
- [x] 최신형은 제조사 공식만, 오래된 모델은 명시 등록된 공식 수입처까지 허용.
- [x] 없는 제품 방어 — registry/검색/AI 공식성 판별이 실패하면 추천·뻥스펙 생성 없이 "제품을 찾을 수 없습니다".
- [x] AI 실패 방어 — 공식 스펙 표가 있으면 deterministic scorer, 표가 없으면 검증 대기. 하드코딩 fallback 추천 금지.
- **켜는 법**: `.env.local`에 `GROQ_API_KEY`(또는 다른 LLM 키) + `BRAVE_SEARCH_API_KEY`(또는 Google CSE) + `AXIS_ADMIN=1` →
  `/admin/sources`에서 제품명/국가 입력 → 공식 후보 검색 → AI 공식성 판별 → 공식 페이지 fetch → AI 스펙 추출.
- **중요 원칙**: 스펙은 DB에서 꺼내지 않는다. DB는 계정/히스토리/가격추적/알림 용도이며, 비교 스펙은 공식 페이지를 AI로 읽어 검증한다.
- [ ] 남음: 검색 provider 운영키 연결 · 공식 후보 점수/로그 UI · 실제 결과 화면에서 발견 실패 원인 표시

### 카테고리 (스키마)
- [x] laptop · smartphone · **monitor · earphones** (가격은 전부 검증 게이트 제외)
- [ ] 각 카테고리 검증 시드 확장

### v2 진행
- [x] P0 가격 도메인 + seed provider + region 라우팅 + 제품 id
- [x] P1 결과 현재가 + 90일 이력 + 딜/최저가 (`/api/price`, `PriceComparison`)
- [x] **P2-추적(Track)** — 가격 행 추적 토글 + 홈 관심목록 (`lib/watch/*`, localStorage, **Supabase 0**)
- [x] 알림 평가 로직 — `evaluateAlert`(목표가/역대최저/급락/재알림억제, 순수·테스트됨)
- [x] **P2-알림(Alert)** — watches 테이블 + 크론 + 이메일(Resend) + **Web Push(PWA)** (1시간 크론, VAPID, push_watches)
- [x] P3-PWA — Service Worker + manifest + 알림 허용 UI. Android 폰 알림 동작.
- [ ] **P3-데이터** ← **지금 여기**: seed → 실가격. Keepa API(Amazon) or Coupang.
- [ ] **P3-SEO** — 정적 비교·제품 페이지 색인. 가격 검색 트래픽 유입.
- [ ] P3-구독 — 프리미엄 알림 (결제 연동 후)
