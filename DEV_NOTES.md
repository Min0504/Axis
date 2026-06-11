# Axis — 개발 노트

> 마지막 업데이트: 2026-06-11
> 테스트: `npm test` 통과 기준 유지 · 캐시 버전: **v8**
> 프로덕션: https://axis-app-beta.vercel.app
>
> 이 문서는 개발 단일 참조점이다. 제품 방향·진행 현황·아키텍처·남은 작업을 모두 담는다.
> 작업 규칙은 [CLAUDE.md](CLAUDE.md), 공개 소개는 [README.md](README.md).

---

## 1. 제품 방향

**한 줄 정의(비전):** 사기 전에 결정해주고, 산 뒤 최적 타이밍까지 알려주는 도구.
= **결정(Decide) → 추적(Track) → 알림(Alert)**

단순 비교/결정만으로는 ChatGPT를 못 이긴다. 해자는 **라이브 가격 + 가격 알림 +
검증 스펙** — 챗봇이 구조적으로 못 하는 것들. **단, 이 해자(가격·알림)는 현재
미작동(seed 데이터)이고 그 경제성이 미검증이다 → 아래 실행 범위로 좁혀 먼저 검증한다.**

### 실행 범위 (사업성 검증 반영, 2026-06-11 — v3 narrow)

이전 "글로벌+한국 동시 / 4개 카테고리 / 푸시·구독 로드맵"은 1인 운영에 범위 과잉.
검증 통과 전까지 다음으로 좁힌다. (이전 방향 전문은 git 이력의 DIRECTION.md 참고.)

- **시장: 한국 단독 먼저.** US/JP 코드 자산은 유지하되 콘텐츠·운영은 KR 집중.
  **1개 시장 검증 전 다국가 운영 금지.**
- **카테고리: 노트북 먼저.** 폰/태블릿/이어폰 데이터셋은 유지하되, 출시·SEO·콘텐츠는 노트북 집중.
- **수익: Phase 1 제휴(쿠팡 파트너스) 단독.** 푸시·구독은 **검증 후로 보류**.
  제휴 링크는 광고가 아니라 유틸 → 절대 숨기지 않음.
- **데이터: seed → 실가격은 "쿠팡 현재가 + 선택 SKU 자체 일별 적재"로 PoC.**
  외부 가격이력 API(Keepa 등) 결제 금지. "역대최저·급락" 알림은 자체 이력이
  수개월 쌓인 뒤에만 약속.
- **검증 우선:** 추가 기능 빌드(푸시·구독·다국가·신규 카테고리)는 §6의 30일 검증
  통과 전까지 중단.

**검증 게이트 (절대 규율):** 스펙 비교는 primary 스펙이 출처 등급 2티어 이상일 때만
`verified`·색인. 출처 티어: 1 제조사 공식 / 2 검증 자료 / 3 AI 추정. 모든 결과에 출처·수집일 표기.

---

## 2. 아키텍처

### 비교 요청 흐름 (`lib/decision-engine.ts`)

```
사용자 쿼리 ("에어팟 프로 vs 버즈")
  ↓
[1] 캐시 확인 (Supabase comparison_cache, v8|query|locale|country)
  ↓ 미스
[2] expandComparisonOptions() — 브랜드명 → 최신 모델 확장
[3] detectCategory() — 카테고리 분류
[4] resolveComparableSource() — product-aliases → registry → URL 확인
[5] extractProductSpecs() — 공식 페이지 HTML 스크래핑 (병렬, apple|samsung|generic 파서)
    + 데이터셋 fallback (enrichWithDatasetFallback, merge 방식)
[6] runAiDecision() — Groq API. 스키마 필드 전체 채우기, 스크래핑 값은 context로 복사
[7] buildFinalComparison() — AI 행 기반 + 스크래핑 값 오버레이 + source URL(검증 배지)
[8] gradeVerification() — verified / partial / unverified
[9] setCachedComparison() — 캐시 저장
```

### 검증 등급

| 등급 | 조건 | SEO |
|------|------|-----|
| `verified` | 모든 primary 필드에 공식 source URL | ✅ 인덱싱 |
| `partial` | 일부 primary 필드만 sourced | 조건부 |
| `unverified` | AI 단독 (source 없음) | ❌ noindex |

### 레이어 구성

```
[결정]  분류기 → 스키마 → 검증 스펙 → AI 결정 → 검증 배지
        lib/category, lib/specs/*, lib/ai/*, lib/decision-engine
[가격]  Product → PriceProvider(region별) → Quote/History → 차트·최저가
        lib/pricing/*  (amazon / coupang / seed)
[추적]  계정 → Watch(관심상품·목표가) → 가격 점검 크론 → 알림(이메일→푸시)
        Supabase(watches) + cron + lib/watch · lib/push
```

---

## 3. 데이터셋 현황

수동 검증 데이터셋 (`lib/specs/dataset/`), **2020+ 모델, 인지도 있는 제품 기준**:

| 카테고리 | 파일 | 개수 |
|---------|------|------|
| 스마트폰 | `smartphones.ts` | 55 |
| 이어폰 | `earphones.ts` | 18 |
| 노트북 | `laptops.ts` | 26 |
| 태블릿 | `tablets.ts` | 23 |
| **합계** | | **122** |

추가로 다나와 자동 수집 데이터(`dataset/kr/`)가 수동 데이터 뒤에 병합됨 (ID 중복 시 수동 우선).

### 제품명 로케일 정규화

- `VerifiedProduct`: `canonicalName`(한국어) + `nameEn` + `nameJa`.
- `localizeDisplayName()` — 제품 해석 후 로케일 표시명 반환. 카탈로그에 없는 제품은
  EN/JA에서 `koToEnTechName()`로 폴백 (아이폰17 → iPhone 17).
- 이 정규화로 "영어 설정 + 한글 입력 → 영어 제품명 + Amazon US 검색어"가 일관되게 동작.

### 카테고리 스키마 (primary 필드)

- **smartphone**: model_name, display_inch, chipset, storage_gb, camera_mp, battery, weight_g
- **laptop**: model_name, cpu, gpu, ram_gb, storage_gb, display_inch, resolution, battery_wh, weight_g, os, refresh_hz, brightness_nits
- **earphones**: model_name, driver, anc, battery_hr, battery_total_hr, charging_type, water_resist, weight_g

---

## 4. 스펙 수집 인프라 (반자동 확장)

```
scripts/collect-specs/
├── index.ts              메인 러너
├── sources/{danawa,gsmarena,kakaku}.ts   KR/US/JP 소스
└── models/*.json         수집 대상 목록
```

```bash
npm run collect:kr   # 다나와 (KR, KRW 가격)
npm run collect:us   # GSMArena (US, tier 2)
npm run collect:jp   # 価格.com (JP, JPY 가격)
```

수집 후: 결과 파일 검토 → `dataset/index.ts` import → `npm test` 무결성 검사.
⚠️ Samsung/Apple JS 렌더링 페이지는 정적 스크래핑 실패 가능 → 수동 보완 필요.

---

## 5. 완료된 핵심 작업

- 브랜드 리네임 (nudge/Optio → Axis), 멤버십/플랜 제거
- 3단계 제품 발견 파이프라인 + 제품 레지스트리/앨리어스
- AI 연동 (Groq Llama 3.1, 프로바이더 추상화)
- 가격 추적(lib/watch, lib/pricing) · 푸시 알림(service worker, VAPID) — 코드 완료
- SEO 비교 페이지(/compare/[slug]), Cron 가격 체크, 비교 결과 캐시, 검색 누락 로깅
- 스펙 정확도 수정: 아이폰16 프로 주사율(60→120Hz), `enrichWithDatasetFallback` merge 방식
- 한/미/일 전체 점검: US/JP 데이터셋 fallback, ja 라벨 중앙화(JA_FIELD_LABELS),
  danawa URL 공식소스 유출 차단
- 제품명 로케일 정규화 + 데이터셋 122개 확장, 태블릿 카테고리 신설
- UI: 결과 카드 화이트 리디자인, fit score 바, 어필리에이트 "공식" 제거 + 다이렉트 링크

---

## 6. 남은 작업 / 미확인 사항

### 즉시 (운영 환경 설정)

| 항목 | 내용 |
|------|------|
| `CRON_SECRET` 교체 | 현재 기본값 → `openssl rand -base64 32` → Vercel Production |
| VAPID 키 생성·등록 | `npx web-push generate-vapid-keys` → 3개 키 → WatchButton 노출 확인 |
| Supabase 마이그레이션 | 0014_price_history.sql 로컬 적용 완료. 프로덕션은 Vercel 배포 후 `npx supabase db push` |
| 네이버 쇼핑 API 키 설정 | [https://developers.naver.com/apps/](https://developers.naver.com/apps/) → 앱 등록 → 쇼핑 체크 → `NAVER_CLIENT_ID` / `NAVER_CLIENT_SECRET` → `AXIS_PRICE_SOURCE=naver` |
| Coupang API (대기) | 누적 15만원 매출 달성 후 파트너스 포털 최종승인 → `COUPANG_ACCESS_KEY` / `COUPANG_SECRET_KEY` → `AXIS_PRICE_SOURCE=coupang` 으로 전환 |

### 기능 비활성화 (API 키 없음)

- `BRAVE_SEARCH_API_KEY` 미설정 → 미등록 제품 웹 검색 폴백 안 됨
- `RESEND_API_KEY` 미설정 → 이메일 가격 알림 안 됨
- `VAPID_*` 미설정 → 푸시 알림 안 됨

### 미확인

- Sony 한국 URL(`sony.co.kr`) 실제 동작 여부
- LG gram 14/16/17형 containment match 오매핑 가능성
- WatchButton UI 미노출 (VAPID_SUBJECT 관련 가능성)
- WatchButton UI 미노출 (VAPID_SUBJECT 관련 가능성)
- Sony 한국 URL(`sony.co.kr`) 실제 동작 여부
- LG gram 14/16/17형 containment match 오매핑 가능성

### 다음 — 빌드 아님, 검증 먼저 (30일 사업 검증)

추가 기능 빌드 전에 핵심 가정부터 싸게 검증한다. 통과 시에만 빌드 재개.

**핵심 가정 (먼저 검증):**
- A 실가격·이력을 싸게 확보 가능 — 쿠팡 현재가 + 노트북 26 SKU 자체 일별 적재 PoC
  → **[준비 완료]** `naver-provider.ts` + `coupang-provider.ts` + `price-snapshot` 크론 구현 완료 (2026-06-11).
     ① 네이버 쇼핑 API 즉시 발급 후 `AXIS_PRICE_SOURCE=naver` 로 활성화 (가격=전국최저가, 구매링크=쿠팡 제휴).
     ② Coupang 누적 15만원 매출 달성 → 최종승인 → `AXIS_PRICE_SOURCE=coupang` 으로 전환 (env 변경만으로 완료).
- B SEO/커뮤니티로 유입 가능 — 노트북 추천/비교 콘텐츠 15~20편 색인
- C 방문자가 제휴 클릭·구매 — 쿠팡 링크 클릭률 >8%, 전환 추적
- D 알림이 재방문을 만든다 — 실알림 켜고 M2 재방문 >30%
- E 검증 배지가 선택에 영향 — 배지 유무 A/B

**kill-switch:** A·B·C 모두 통과 → 노트북·KR·제휴로 추진. A 실패 → Track/Alert 폐기·
결정 전용 PIVOT 검토. B 또는 C 실패 → 사업 재고(STOP).

**보류 (검증 전 빌드 금지):** P3-푸시앱 · P3-구독 · US/JP 운영 · 신규 카테고리(모니터 등) ·
외부 가격이력 API 결제.

> 상세 실험·지표·성공/실패 기준은 사업성 검증 보고서 및 메모리
> (`project_business_validation`) 참조. P3-SEO(정적 비교·제품 페이지 색인)는 가정 B
> 검증 수단으로 흡수.

---

## 7. 명령어

```bash
npm run dev          # 개발 서버 (webpack)
npm run dev:turbo    # 개발 서버 (turbopack)
npm test             # 테스트
npm run test:watch   # 테스트 watch
npm run build        # 빌드
npx tsc --noEmit     # 타입 체크

vercel env pull .env.local            # 환경변수 로컬 동기화
vercel env ls                         # 환경변수 상태 확인
supabase db push                      # 마이그레이션 적용
npx web-push generate-vapid-keys      # VAPID 키 생성
openssl rand -base64 32               # CRON_SECRET 생성
```

---

## 8. 환경변수 체크리스트

| 변수 | 상태 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 설정됨 | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 설정됨 | Supabase anon 키 |
| `SUPABASE_SERVICE_ROLE_KEY` | 설정됨 | Supabase 서비스 키 |
| `GROQ_API_KEY` | 설정됨 | AI 결정 엔진 |
| `CRON_SECRET` | ✅ 교체 완료 | 2026-06-11 새 키로 교체 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ✅ 설정됨 | 푸시 알림 |
| `VAPID_PRIVATE_KEY` | ✅ 설정됨 | 푸시 알림 |
| `VAPID_SUBJECT` | ✅ 설정됨 | 푸시 알림 |
| `AXIS_PRICE_SOURCE` | ✅ naver | 네이버 쇼핑 최저가 활성화 |
| `NAVER_CLIENT_ID` | ✅ 설정됨 | 네이버 쇼핑 API |
| `NAVER_CLIENT_SECRET` | ✅ 설정됨 | 네이버 쇼핑 API |
| `BRAVE_SEARCH_API_KEY` | ❌ 미설정 | 웹 검색 폴백 |
| `RESEND_API_KEY` | ❌ 미설정 | 이메일 알림 (D단계) |
| `COUPANG_ACCESS_KEY` | ❌ 대기 중 | 쿠팡 파트너스 API (최종승인 후 발급 — 15만원 매출 필요) |
| `COUPANG_SECRET_KEY` | ❌ 대기 중 | 쿠팡 파트너스 API |
