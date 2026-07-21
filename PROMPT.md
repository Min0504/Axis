# Axis — AI 작업 프롬프트

> 배포 목표: 2026-08-15 (베타 → 정식) | 현재: 프로덕션 베타 배포 완료, 사업성 검증 단계
> 문서 기준일: 2026-07-21 · 로컬 브랜치 `local-fix` · 프로덕션 HEAD 재배포 필요

---

## 프로젝트 컨텍스트

너는 **Axis** (전자제품 구매 결정 도구)를 베타에서 정식 배포로 끌어올리는 시니어 엔지니어다.

**프로젝트 위치:** `/Users/minseokchae/Dev/deployed/Axis/`

**프로덕션 URL:** https://axis-app-beta.vercel.app
**상태:** 베타 · 사업성 검증 단계 (한국 · 노트북 · 제휴 집중)

**제품 설명:**
"아이폰 16 vs 갤럭시 S25" 같은 자연어 쿼리를 입력하면 공식 스펙을 검증해 AI가 비교 테이블과 단일 결론을 만들고, 가격을 추적해 최적 구매 타이밍과 알림을 제공한다. 한 줄 정의: **결정(Decide) → 추적(Track) → 알림(Alert)**. 챗봇이 구조적으로 못 하는 라이브 가격 + 가격 알림 + 검증 스펙이 해자다.

**기술 스택:**
- Next.js (App Router) + React 19 + TypeScript (SSR + SEO)
- Vercel (Serverless + Cron, 무료 티어)
- Supabase (PostgreSQL, RLS) — 워크스페이스에서 Supabase가 승인된 **유일한** 프로젝트
- Groq (Llama 3.1) — 프로바이더 추상화 (OpenAI/Gemini/Anthropic 폴백, 429 시 자동 전환)
- 네이버 쇼핑 Open API(실시간 최저가), Resend(이메일), Web Push(VAPID), Vitest

---

## 현재 완료 상태 (2026-07-21 기준)

### 기능 (완료)
- AI 구매 결정 엔진 + 검증 게이트 (verified / partial / unverified)
- 맞춤 재분석 (userContext — 용도·예산·상황 가중치로 결론 재계산, 캐시 우회)
- 네이버 쇼핑 실시간 최저가 + 자체 일별 가격 이력 적재 (크론)
- 이메일 가격 알림 (Resend) + 웹 푸시 알림 (VAPID, PWA) — **코드 완료**
- 검증 데이터셋 수동 124개 (스마트폰 55 · 이어폰 18 · 노트북 28 · 태블릿 23)
- 다국어 KR/US/JP (제품명 로케일 정규화: canonicalName / nameEn / nameJa)
- SEO 정적 비교 페이지 (`/compare/[slug]`), 비교 결과 캐시 (v9), 클릭 트래킹
- ResultsView `PriceComparison`/`WatchButton` 재마운트 (2026-07-21, `hidePrices`일 때만 숨김)
- `lib/site-url.ts` 공용 사이트 URL 헬퍼 (공개 fallback = beta 호스트)

### 운영 환경 (로컬 기준 설정 완료)
- `CRON_SECRET` 교체 완료, VAPID 3종 설정, `AXIS_PRICE_SOURCE=naver` 활성
- `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` 설정 완료
- `RESEND_API_KEY` 로컬 SET (프로덕션 패리티는 PM 확인 필요)

### 대기 중 / 프로덕션 갭
- 쿠팡 파트너스 API: 누적 매출 15만원 달성 후 발급 (`AXIS_PRICE_SOURCE=coupang` env 전환만으로 완료)
- `BRAVE_SEARCH_API_KEY`(웹 검색 폴백) 미설정 — **보류** (30일 검증 범위 밖)
- 프로덕션 배포가 seed-only SHA `3b54e0a`에 고정 → **로컬 HEAD 재배포 필요 (PM)**

---

## 남은 작업 (이 세션에서 진행할 것)

> **원칙:** 추가 기능 빌드(푸시앱·구독·다국가 운영·신규 카테고리·외부 가격이력 API 결제)는 아래 30일 검증 통과 전까지 **중단**. 검증 먼저, 빌드는 그 다음.

### Phase 1: 노트북·한국 집중 콘텐츠 (검증 가정 B)

- 노트북 추천/비교 콘텐츠 15~20편 색인 (SEO/커뮤니티 유입 검증)
- `/compare/[slug]` 정적 페이지가 verified 등급으로 색인되는지 확인
- 데이터셋: 노트북 28 SKU 우선 정확도 점검 (LG gram 14/16/17형 containment match 오매핑 가능성 확인)

### Phase 2: 제휴 전환 추적 (검증 가정 C)

- 쿠팡 링크 클릭률 측정 (목표 >8%), `click_events` 적재 검증
- 제휴 링크는 광고가 아니라 유틸 → **절대 숨기지 않음**
- 누적 15만원 매출 달성 시 쿠팡 파트너스 최종승인 → env 전환

### Phase 3: 알림 재방문 검증 (검증 가정 D)

- 로컬 `RESEND_API_KEY` SET 확인됨 → 프로덕션 패리티 확인 후 실알림 활성화
- M2 재방문 >30% 측정
- WatchButton: 과거 "VAPID_SUBJECT" 가설 폐기. 실제 원인은 ResultsView에서 `PriceComparison` 미마운트였고, 2026-07-21 재마운트로 로컬 수정 완료. 프로덕션 반영은 HEAD 재배포 후 확인.

### Phase 4: 검증 배지 A/B (검증 가정 E)

- 검증 배지 유무가 선택에 미치는 영향 A/B 테스트
- AI 추정값으로 `verified`를 만들지 않는지 게이트 재확인

### Phase 5: 미확인 항목 해소

- Sony 한국 URL(`sony.co.kr`) 실제 동작 여부 확인
- 스펙 수집 인프라(`scripts/collect-specs/`) 반자동 확장 점검

**kill-switch:** 가정 A·B·C 모두 통과 → 노트북·KR·제휴로 추진. A 실패 → Track/Alert 폐기·결정 전용 PIVOT. B 또는 C 실패 → 사업 재고(STOP).

---

## 코딩 원칙 (반드시 준수)

- **결과/추천 로직은 요청 없이 건드리지 않음.** `selectedOption`, `reasons`, `oneLineConclusion`, per-option 분석은 사용자가 프롬프트로 직접 작업.
- **스펙은 DB에서 꺼내지 않음.** 공식 페이지 AI 검증 또는 `lib/specs/dataset/` 수동 데이터에서만. Supabase는 계정·히스토리·가격추적·알림 전용.
- **검증 게이트 준수.** primary 스펙이 공식 소스(tier 1~2)로 뒷받침될 때만 `verified`. 뻥스펙·하드코딩 fallback 추천 금지. 없는 제품은 "찾을 수 없음"으로 떨어뜨림.
- 스키마·결과 포맷 변경 시 `lib/comparison-cache.ts`의 `CACHE_VERSION`을 올려 구버전 캐시 무효화 (현재 v9).
- `CRON_SECRET` 등 시크릿을 코드·문서에 하드코딩하지 않음.
- 변경 후 반드시 `npm test` (특히 레지스트리·데이터셋·파이프라인 변경 시) + `npx tsc --noEmit`.

---

## 주요 파일 구조

```
app/
  api/
    compare/        비교 요청 (userContext 맞춤 재분석)
    track/          클릭·페이지뷰 트래킹
    price/          실시간 가격 조회
    cron/           가격 점검(알림) · 가격 스냅샷(이력 적재)
    history/        가격 이력 조회
    watches/        관심 상품 관리
    push/           웹 푸시 구독
  compare/[slug]/   SEO 정적 비교 페이지
  results/          동적 결과 페이지
components/
  results-view.tsx · context-card.tsx · timing-section.tsx
  vs-input.tsx · watch-button.tsx
lib/
  decision-engine.ts   비교 파이프라인 오케스트레이터
  ai/                  AI 프로바이더 추상화 + 프롬프트
  specs/dataset/       수동 검증 스펙 124개
  pricing/             가격 프로바이더 (naver · coupang · seed)
  comparison-cache.ts  캐시 레이어 (v9)
  affiliate.ts         제휴 링크 생성 (Amazon/Coupang/Naver)
scripts/collect-specs/ 반자동 스펙 수집 (danawa/gsmarena/kakaku)
```

---

## 명령어

```bash
npm run dev          # 개발 서버 (webpack)
npm run dev:turbo    # 개발 서버 (turbopack)
npm test             # 테스트
npm run build        # 빌드
npx tsc --noEmit     # 타입 체크

vercel env pull .env.local       # 환경변수 로컬 동기화
supabase db push                 # 마이그레이션 적용
npx web-push generate-vapid-keys # VAPID 키 생성
openssl rand -base64 32          # CRON_SECRET 생성
```

> 비용 원칙: **최저비용 최대수익.** 모든 레이어 무료 티어 기반, 수익 발생 시 유료 전환. 상세 개발 노트는 [DEV_NOTES.md](DEV_NOTES.md), 작업 규칙은 [CLAUDE.md](CLAUDE.md), 공개 소개는 [README.md](README.md) 참고.
