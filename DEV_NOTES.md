# 개발 이어받기 노트

> 마지막 업데이트: 2026-06-09  
> 최신 커밋: `df5fedf` — feat: rebrand to Axis with full product discovery pipeline, UI/UX overhaul, and feature expansion  
> 테스트: **168 passed / 24 files** (모두 통과)  
> 프로덕션: https://axis-app-beta.vercel.app

---

## 1. 현재 프로젝트 상태 요약

**Axis** — 공식 스펙 기반 구매 결정 + 가격 추적·알림 서비스.  
Next.js 15 App Router / Supabase / Vercel / Groq(Llama 3.1) 스택.

### 지금까지 완료된 핵심 작업

| 영역 | 상태 |
|------|------|
| 브랜드 리네임 (nudge/Optio → Axis) | ✅ 완료 |
| 멤버십/플랜 제거 | ✅ 완료 |
| 3단계 제품 발견 파이프라인 | ✅ 완료 |
| 제품 레지스트리 40+ / 앨리어스 120+ | ✅ 완료 |
| 사전 검증 스펙 데이터셋 (스마트폰 10종) | ✅ 완료 |
| AI 연동 (Groq Llama 3.1, 프로바이더 추상화) | ✅ 완료 |
| 프리미엄 분석 오버레이 (포털 fullscreen) | ✅ 완료 |
| 단독 입력 자동 파트너 매칭 (AUTO_PAIRS) | ✅ 완료 |
| 결과 페이지 빈 상태 (Empty State) 개선 | ✅ 완료 |
| 가격 추적 (lib/watch, lib/pricing, /api/watches) | ✅ 코드 완료 / 실제 가격 데이터 없음 |
| 푸시 알림 (service worker, VAPID) | ✅ 코드 완료 / 환경변수 미설정 |
| SEO 비교 페이지 (/compare/[slug]) | ✅ 완료 |
| Cron 가격 체크 (매일 09:00) | ✅ 완료 / CRON_SECRET 기본값 |
| 비교 결과 캐시 레이어 | ✅ 완료 |
| 검색 누락 로깅 (search_misses) | ✅ 완료 |

### 현재 개발 진행 단계

코드 구현은 대부분 완료. **운영 환경 설정(API 키)** 이 남아있어 일부 기능이 프로덕션에서 비활성화 상태.

---

## 2. 오늘까지 완료한 작업

### 완료된 기능

- **검색 파이프라인 버그 수정 4건**
  - iPhone 15 Pro가 iPhone 15 페이지로 오매칭되던 문제 (레지스트리 명시 추가)
  - 에어팟 프로 URL 404 (Apple은 세대 번호 없이 `/airpods-pro/` 사용)
  - 삼성 US/JP 사용자 "제품 없음" 오류 (KR 전용 URL → 디스커버리 폴백 추가)
  - iPad M4 URL 404 (칩 이름 제거 후 슬러그 생성)
- **UI/UX**: 프리미엄 로딩 오버레이, 자동 파트너 매칭, 결과 빈 상태
- **대규모 커밋** `df5fedf` — 129 files, +11,496 / -1,754 lines

### 주요 추가/수정 파일

`lib/specs/product-registry-data.ts`, `lib/specs/product-aliases.ts`, `lib/specs/extract/url-patterns.ts`, `lib/specs/dataset/smartphones.ts`, `lib/decision-engine.ts`, `components/vs-input.tsx`, `components/session-results.tsx`, `app/globals.css`

---

## 3. 최근 변경된 주요 파일

- **파일 경로**: `lib/decision-engine.ts`  
  **역할**: 비교 전체 파이프라인 (제품 발견 → 스펙 수집 → AI 결정)  
  **최근 변경**: 삼성 US/JP 폴백 로직 추가 (`resolveProductSource` → `discoverOfficialUrl`)  
  **다음에 확인할 점**: `BRAVE_SEARCH_API_KEY` 없을 때 web search 단계가 조용히 실패하는지 확인

- **파일 경로**: `lib/specs/product-registry-data.ts`  
  **역할**: 제품별 공식 URL 레지스트리 (Apple/Samsung/Sony/LG 40+종)  
  **최근 변경**: iPhone 15/16 Pro·Max·Plus, AirPods Pro, iPad 전 모델, Galaxy S24/Z Fold/Flip 추가  
  **다음에 확인할 점**: Sony 한국 URL(`sony.co.kr`) 실제 동작 여부 미확인

- **파일 경로**: `lib/specs/product-aliases.ts`  
  **역할**: 사용자 입력 → 표준 제품명 매핑 (한국어/영어/일본어 120+개)  
  **최근 변경**: `"에어팟 프로" → "airpods pro"` (기존엔 2 붙어서 404)  
  **다음에 확인할 점**: 갤럭시 버즈·워치 계열 앨리어스 부족

- **파일 경로**: `lib/specs/extract/url-patterns.ts`  
  **역할**: 브랜드별 공식 URL 후보 생성 (`appleSlug`, `buildSamsungCandidates` 등)  
  **최근 변경**: `appleSlug()` 추가 — iPad 칩 접미사(`m4`) 및 AirPods 세대 번호 제거  
  **다음에 확인할 점**: LG gram 14/16/17 사이즈 variant 구분이 여전히 containment match 의존

- **파일 경로**: `components/vs-input.tsx`  
  **역할**: 홈 비교 입력 폼 + 로딩 오버레이 + 자동 파트너 매칭  
  **최근 변경**: `AUTO_PAIRS` 맵, `createPortal` 오버레이, `isMounted` SSR 가드  
  **다음에 확인할 점**: 3개 이상 옵션 제출 시 오버레이 Pill 레이아웃 모바일 확인 필요

- **파일 경로**: `lib/pricing/index.ts` + `lib/pricing/seed-provider.ts`  
  **역할**: 가격 프로바이더 추상화 (실제 API 키 없이 seed 데이터로 데모 동작)  
  **최근 변경**: 신규 생성  
  **다음에 확인할 점**: `AXIS_PRICE_SOURCE=seed`는 **절대 프로덕션에 추가 금지** (데모 전용)

- **파일 경로**: `lib/push/send.ts` + `public/sw.js`  
  **역할**: Web Push 알림 발송 + 서비스 워커  
  **최근 변경**: 신규 생성  
  **다음에 확인할 점**: VAPID 키 미설정 시 WatchButton UI가 노출되지 않는 문제 (이전 세션에서 미해결)

- **파일 경로**: `supabase/migrations/` (0009~0013)  
  **역할**: watches, push_subscriptions, comparisons(SEO), search_misses, comparison_cache 테이블  
  **최근 변경**: 신규 추가  
  **다음에 확인할 점**: 프로덕션 Supabase에 마이그레이션 실제 적용 여부 확인 필요

---

## 4. 현재 남은 문제

### 보안 위험 (즉시 해결)

- **`CRON_SECRET`** 기본값 사용 중 → `openssl rand -base64 32` 로 교체 후 Vercel Production 환경변수 업데이트 필요

### 기능 비활성화 (API 키 없음)

- **웹 검색 폴백 작동 안 함**: `BRAVE_SEARCH_API_KEY` 미설정 → 레지스트리/데이터셋에 없는 제품은 "찾을 수 없음"으로 떨어짐
- **이메일 가격 알림 작동 안 함**: `RESEND_API_KEY` 미설정
- **푸시 알림 작동 안 함**: `NEXT_PUBLIC_VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` / `VAPID_SUBJECT` 미설정

### 미확인 사항

- Sony 한국 URL 구조 (`sony.co.kr/ko/products/...`) 실제 동작 확인 필요
- LG gram 14형 vs 16형 vs 17형 구분 — containment match로 오매핑 가능성 있음
- Galaxy Buds/Watch 시리즈 공식 URL 패턴 미등록 (URL 패턴 생성 실패 시 web search로만 처리)
- Supabase 프로덕션 마이그레이션 0009~0013 실제 적용 여부 확인 필요
- WatchButton UI 미노출 문제 (VAPID_SUBJECT 관련 가능성, 확인 필요)

### 배포 도메인

- 현재 alias: `axis-app-beta.vercel.app` — "nudge" 잔재 포함된 이름
- 커스텀 도메인 미연결

---

## 5. 다음에 바로 할 일

### 가장 먼저 할 일 (보안 + 기능 활성화)

1. **CRON_SECRET 교체**: `openssl rand -base64 32` → Vercel Production 환경변수 교체
2. **VAPID 키 생성·등록**: `npx web-push generate-vapid-keys` → Vercel Production 3개 키 등록 → WatchButton 노출 확인
3. **Supabase 마이그레이션 확인**: Supabase 대시보드에서 0009~0013 테이블 존재 여부 확인 및 미적용 시 `supabase db push`

### 그다음 할 일

1. **Brave Search API 키 등록**: [brave.com/search/api](https://brave.com/search/api/) 발급 → `BRAVE_SEARCH_API_KEY` Vercel Production 추가 → 미등록 제품 자동 발견 활성화
2. **Resend API 키 발급**: [resend.com](https://resend.com) → `RESEND_API_KEY`, `RESEND_FROM_EMAIL` 등록 → 이메일 가격 알림 활성화
3. **Sony 한국 URL 수동 검증**: `sony.co.kr` WH-1000XM5 페이지 실제 접근 → product-registry-data.ts KR URL 확인·수정

### 나중에 개선할 일

1. **커스텀 도메인 연결**: Vercel 도메인 설정에서 `axis-app-beta` → 실제 도메인으로 교체
2. **LG gram 사이즈 variant 명확화**: `lib/specs/product-registry-data.ts`에 14/16/17형 별도 엔트리 추가
3. **`search_misses` 테이블 정기 분석**: 어떤 제품이 자주 누락되는지 파악 → 레지스트리·앨리어스 보강
4. **Galaxy Buds/Watch 데이터셋 추가**: `lib/specs/dataset/` 에 이어폰·워치 카테고리 신규 파일

---

## 6. 다음 개발 시작 방법

1. **먼저 확인할 파일**:
   - `lib/specs/product-registry-data.ts` — 제품 추가·수정 작업
   - `lib/specs/product-aliases.ts` — 검색어 매핑 추가
   - `lib/decision-engine.ts` — 파이프라인 로직 수정
   - `components/vs-input.tsx` — 입력 UI 수정

2. **먼저 실행할 테스트**:
   ```bash
   npm test
   ```
   현재 168/168 통과 상태. 레지스트리나 파이프라인 수정 후 반드시 재실행.

3. **먼저 확인할 문제**:
   - Vercel 환경변수 설정 상태 (`vercel env ls`)
   - Supabase 테이블 0009~0013 존재 여부

4. **이어서 할 작업**:
   - 환경변수 등록 (VAPID, CRON_SECRET, Brave Search, Resend)
   - 등록 후 `vercel --prod` 배포
   - WatchButton·PriceComparison 실제 동작 확인

---

## 7. 실행 / 테스트 / 빌드 명령어

```bash
# 개발 서버 (webpack 모드)
npm run dev

# 개발 서버 (turbopack 모드, 더 빠름)
npm run dev:turbo

# 테스트 실행
npm test

# 테스트 watch 모드
npm run test:watch

# 빌드
npm run build

# Vercel 환경변수 로컬 동기화
vercel env pull .env.local

# Vercel 배포 (프로덕션)
vercel --prod

# Supabase 마이그레이션 적용
supabase db push

# VAPID 키 생성
npx web-push generate-vapid-keys

# CRON_SECRET 생성
openssl rand -base64 32
```

---

## 8. 다음에 Claude에게 시킬 프롬프트

### 환경변수·배포 후 검증
```
VAPID 키를 등록하고 프로덕션 배포했어. WatchButton이 UI에 정상 노출되는지 확인하고,
푸시 알림 구독 플로우를 처음부터 테스트해줘.
문제가 있으면 lib/push/, components/watch-button.tsx, public/sw.js 를 확인해.
```

### 미등록 제품 검색 개선
```
다음 제품명으로 비교를 테스트해봐: "갤럭시 버즈3 프로 vs 소니 WF-1000XM5".
검색 파이프라인이 어디서 실패하는지 추적하고, product-registry-data.ts 와
product-aliases.ts 에 필요한 엔트리를 추가해줘.
BRAVE_SEARCH_API_KEY는 아직 없다고 가정하고, URL 패턴으로 처리 가능한 범위까지만 해결해.
```

### LG gram 사이즈 variant 수정
```
"lg gram 14" 검색 시 lg gram 16 스펙이 나오는 버그가 있어.
lib/specs/product-registry-data.ts 에서 LG gram 14/16/17형을 별도 엔트리로 분리하고,
lib/specs/product-aliases.ts 에 한국어 앨리어스(엘지 그램 14형 등)도 추가해줘.
수정 후 npm test 통과 확인.
```

---

## 부록: 주요 환경변수 체크리스트

| 변수 | 상태 | 설명 |
|------|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | 설정됨 | Supabase 프로젝트 URL |
| `SUPABASE_SERVICE_ROLE_KEY` | 설정됨 | Supabase 서비스 키 |
| `GROQ_API_KEY` | 설정됨 | AI 결정 엔진 (주 프로바이더) |
| `CRON_SECRET` | ⚠️ 기본값 | **즉시 교체 필요** |
| `BRAVE_SEARCH_API_KEY` | ❌ 미설정 | 웹 검색 폴백 비활성화 |
| `RESEND_API_KEY` | ❌ 미설정 | 이메일 알림 비활성화 |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | ❌ 미설정 | 푸시 알림 비활성화 |
| `VAPID_PRIVATE_KEY` | ❌ 미설정 | 푸시 알림 비활성화 |
| `VAPID_SUBJECT` | ❌ 미설정 | 푸시 알림 비활성화 |
| `AXIS_PRICE_SOURCE` | 미설정 (정상) | `seed` 값은 **프로덕션 절대 금지** |
