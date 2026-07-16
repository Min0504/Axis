# issues.md — Axis

마지막 갱신: 2026-06-19 (conductor 종합)

## 🔴 배포 블로커

### [audit] npm audit 9 취약점 — critical 1, high 2, moderate 6
- `undici`(high), `esbuild`/`vite`/`vitest`, `postcss`/`next`, `js-yaml` 관련
- **배정: conductor** — 의존성 업데이트 범위 결정 후 backend 실행. lockfile 변경은 conductor 승인 필수.

### [lint] components/vs-input.tsx:63 — react-hooks/set-state-in-effect
- 기존 오류, 이번 스프린트에서 미수정
- 해결 전 배포 불가 (security 판정)
- **배정: frontend (Task #26)** → 수정 후 security 재검수

## 🟠 보안 이슈 (배포 전 해결 권장)

### [보안-중] /api/watches 소유권 미검증
- 이메일만 알면 타인의 watch 목록 조회 가능 — 개인정보성 데이터 노출 위험
- **배정: backend (Task #27)** — magic token / Supabase auth / signed token 중 하나로 전환

### [보안-검토] 인기 비교 집계 개인정보 노출 가능성
- 홈 화면 집계가 service_role로 `comparisons.query` 읽어 공개 노출
- 쿼리에 개인/민감 정보 포함 가능성
- **배정: backend (Task #27)** — normalized query만 저장/집계 또는 민감어 필터

## ✅ 해결됨

- tsc fetch mock 튜플 타입 오류 (backend 06-18 수정)
- CRON_SECRET 미설정 위험 (security 06-18 확인, 설정됨)
