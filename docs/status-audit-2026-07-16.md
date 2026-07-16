# Axis 상태 감사 — 2026-07-16

> 범위: 문서·코드·삭제 잔재·보안·검증 게이트·운영 방향(KR·노트북·제휴) 정합  
> HEAD: `e71f624` (Sync latest local workspace)  
> Conductor 세션제: **폐지** → FE / BE / SEC / LEAD 스킬로 이관 예정

---

## 판정

**현재 `master`는 빌드·테스트·비교 파이프라인이 깨진 상태.**  
문서상 “베타 정상 / 170 tests 통과”와 실제 트리가 정면으로 충돌한다.  
최우선은 `e71f624`에서 삭제·파손된 코어 모듈 복구다.

---

## P0 — 즉시 (복구 / 위험)

| # | 이슈 | 증거 |
|---|------|------|
| 1 | `lib/specs/dataset/index.ts` 삭제 | `decision-engine`, `/api/price`, `discover`, 다수 테스트 import 실패 |
| 2 | 노트북 분리 파일 미완 | `laptops-samsung.ts`, `laptops-apple-air.ts`, `laptops-apple-pro.ts` 없음. 남은 실데이터는 LG 4개뿐 |
| 3 | 다카테고리 데이터셋 삭제 | `smartphones` / `earphones` / `tablets` / `kr/*` 삭제. 문서의 “122개”와 불일치 |
| 4 | extract 코어 삭제 | `extract/index.ts`, `extract/rules.ts` 없음. `pipeline.ts`가 `./index` import |
| 5 | Cron API 삭제, `vercel.json`은 유지 | `price-check` / `price-snapshot` 404 예정. Track/Alert 중단 |
| 6 | Push / Admin API 삭제 | FE(`watch-button`, `watch-list`, admin reviewer)는 죽은 엔드포인트 호출 |
| 7 | collect-specs 파손 | `danawa.ts` / `gsmarena.ts` / `smartphones.json` 삭제. `kakaku`만 남음 |
| 8 | `/api/watches` 이메일=소유권 | 이메일만 알면 CRUD 가능 (`docs/issues.md`에도 기록) |
| 9 | 하드코딩 fallback 추천 | `lib/decision-engine-fallback.ts` — 이름 길이로 승자 확정. 검증 게이트 규칙과 충돌 |

**원인 커밋:** `e71f624` (+663 / −5234). 직전 정상 트리: `5acb9fc`.

**권장 복구:** `5acb9fc`에서 최소 아래를 되살린 뒤, 노트북 분리 리팩터가 의도였다면 *완전하게* 맞춘다.

- `lib/specs/dataset/{index,smartphones,earphones,tablets,laptops,kr/*}.ts`
- `lib/specs/extract/{index,rules}.ts`
- `app/api/cron/price-{check,snapshot}/route.ts`
- (쓸 경우) `app/api/push/subscribe`, `app/api/admin/extract`
- `scripts/collect-specs/sources/{danawa,gsmarena}.ts` + `models/smartphones.json`

---

## P1 — 문서 ↔ 코드 불일치

| 문서 주장 | 실제 |
|-----------|------|
| 데이터셋 122개 | 디스크상 LG 노트북 일부만 (조립 불가) |
| `CACHE_VERSION` v8 (`CLAUDE`/`DEV_NOTES`/`PROMPT`) | 코드 **v9** |
| README: `partial`도 색인 허용 | `isIndexable` = **verified만** |
| README/PROMPT: naver 활성·cron·알림 완료 | Cron 라우트 삭제; `.env.example` 기본 `seed` |
| `docs/progress.md`: lint❌ 외 test/build/tsc ✅ | 모듈 파손으로 HEAD에서 통과 주장 신뢰 불가 |
| DEV_NOTES: 해자 “seed 미작동” vs README: 네이버 ✅ | 문서끼리 충돌 |
| PROMPT 로컬 경로 `/Users/minseokchae/...` | 에이전트/클라우드 환경과 불일치 |
| CLAUDE: 데이터셋 경로 `{smartphones,earphones,laptops,tablets}.ts` | 현 트리와 불일치 |

문서 날짜도 README 06-17 / DEV_NOTES 06-11 / handoff 06-18로 흩어져 있다.  
**단일 진실 소스**를 `DEV_NOTES.md` 또는 README 상태 표 하나로 고정해야 한다.

---

## P2 — 부족한 것 (방향 대비)

KR · 노트북 · 제휴 · 검증 우선 기준으로:

1. **CI 없음** — `.github/workflows` 부재. `e71f624`급 파괴 sync가 게이트 없이 들어옴.
2. **watches 인증** — Supabase auth / signed token 중 하나로 소유권 고정.
3. **인기 비교 집계 익명화** — `app/page.tsx`가 service_role로 원문 query 공개.
4. **제휴 전환 계측** — 클릭률 >8% 검증 루프가 제품 로드맵에만 있고 대시보드/리포트 없음.
5. **노트북 SEO 집중** — `comparisons.ts`에 폰/이어폰/태블릿 슬러그 다수; `vs-input` 예시도 폰 유도.
6. **rate limit** — compare만. track/price/watches/share/guest 무제한 + in-memory라 서버리스에서 약함.
7. **API/보안 테스트** — watches 소유권, cron Bearer, guest share 남용 테스트 없음.
8. **프로덕션 seed 가드** — `.env.example`/`launch.json`이 seed 기본. 프로덕션 seed 거부 또는 강제 demo 라벨 필요.
9. **RESEND / BRAVE** — 문서상 미설정. 알림·웹검색 폴백 비활성(의도일 수 있음).

---

## P3 — 지워야 할 것 / 정리 후보

### 이번 감사에서 처리

| 대상 | 조치 |
|------|------|
| `.conductor/` | **삭제** (Conductor 세션제 폐지) |
| `AGENTS.md` Conductor 오케스트레이션 | **제거**, FE/BE/SEC/LEAD는 스킬 이관 전까지 경계만 유지 |
| docs의 “conductor 종합/배정” 문구 | 역할명으로 정리 |

### 이후 삭제·축소 후보 (복구 후 판단)

| 후보 | 이유 |
|------|------|
| 원격 브랜치 `conductor-repo-role-check` | Conductor 실험 잔재 |
| 원격 `axis-fe` / `axis-be` / `axis-lead` | 세션제 브랜치 — 스킬 운영으로 대체 시 정리 |
| monitor 카테고리 (`lib/category`, schema, types) | DEV_NOTES: 신규 카테고리 보류 |
| `lib/specs/collect.ts` | import 0 |
| 쿼터 마이그레이션 잔재 (`0004`/`0005`, `AXIS_DEV_PLAN`) | 앱에서 미사용 |
| DB `products`/`specs` 테이블 스키마 | “스펙은 DB에서 안 꺼냄”과 잔존 스키마 |
| Amazon/Keepa 타입 잔상 (`lib/pricing/types.ts`) | 외부 가격이력 API 결제 금지 방향 |
| 비-노트북 SEO 슬러그·홈 예시 칩 | KR·노트북 집중과 충돌 (콘텐츠 전략 확정 후) |
| 푸시/이메일 스택 (검증 후 보류 시) | API 삭제된 채 FE·lib만 남음 — 복구 vs 완전 제거 선택 필요 |

---

## 보안 요약

| 심각도 | 항목 |
|--------|------|
| 높음 | `/api/watches` 이메일 소유권 |
| 중 | guest share public insert + 짧은 토큰, 인기쿼리 원문 노출, rate limit 공백, CSP 없음 |
| 낮~중 | Admin=`AXIS_ADMIN=1` only (API는 현재 삭제됨) |
| — | 코드/문서에서 실시크릿 하드코딩 **미발견** |

---

## 운영 모델 (Conductor → 스킬)

- Conductor 세션제 **폐지**.
- FE / BE / SEC / LEAD는 **별도 스킬**로 운영 예정 (이 레포에 스킬 정의는 아직 없음).
- 당분간 `AGENTS.md`에는 파일 경계·승인 항목·짧은 보고 형식만 유지.
- `.context/*` Conductor 노트 경로는 더 이상 표준이 아님. 필요 시 스킬 쪽에서 정의.

---

## 권장 다음 작업 순서

1. **`e71f624` 코어 복구** (dataset + extract + cron) → `npm test` / `tsc` / `build` 녹색.
2. 문서 정합: 제품 수, CACHE_VERSION=v9, 가격 소스, partial 색인 정책.
3. `/api/watches` 인증 + 인기 집계 익명화.
4. GitHub Actions: `lint` + `tsc` + `vitest` + `build`.
5. FE/BE/SEC/LEAD 스킬 추가 후 `AGENTS.md` 경계를 스킬과 맞춰 최종 정리.
6. 검증 가정 B/C(노트북 SEO·제휴 클릭)만 제품 작업으로 진행 — 새 기능 빌드 금지 유지.
