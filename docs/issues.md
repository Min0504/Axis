# issues.md — Axis

마지막 갱신: 2026-07-16 (상태 감사)

## 🔴 P0 — 트리 파손 / 배포 블로커

### [파손] e71f624 sync로 코어 모듈 삭제·미완
- `lib/specs/dataset/index.ts` 및 smartphones/earphones/tablets/kr 삭제
- 노트북 분리 파일(`laptops-samsung`, `laptops-apple-air/pro`) 미존재
- `lib/specs/extract/{index,rules}.ts` 삭제
- cron/push/admin API 삭제 (vercel.json·FE는 잔존)
- **배정: BE** — `5acb9fc` 기준 복구 후 테스트 녹색

### [lint] components/vs-input.tsx — react-hooks/set-state-in-effect
- **배정: FE** → 수정 후 SEC 재검수

### [audit] npm audit 취약점 (이전 기록: critical 1, high 2, moderate 6)
- lockfile 변경은 PM 승인 필수
- **배정: BE** (복구 이후)

## 🟠 보안 (배포 전)

### [보안-중] /api/watches 소유권 미검증
- 이메일만 알면 타인 watch CRUD 가능
- **배정: BE** — signed token / Supabase auth

### [보안-검토] 인기 비교 집계 개인정보 노출 가능성
- 홈 집계가 service_role로 `comparisons.query` 원문 공개
- **배정: BE** — normalized query만 저장/집계 또는 민감어 필터

## ✅ 해결됨 (이전)

- tsc fetch mock 튜플 타입 오류 (06-18)
- CRON_SECRET 미설정 위험 (06-18 확인 기록) — **단, cron 라우트 자체는 현재 삭제됨 → 복구 시 재검증 필요**
