# issues.md — Axis

마지막 갱신: 2026-07-16 (restore + fixes)

## ✅ 이번 브랜치에서 해결

- [파손] e71f624 dataset/extract/cron/push/admin/collect 복구
- [보안] `/api/watches` 세션 이메일 소유권
- [보안] 인기 비교 집계 익명화 (`lib/popular-queries.ts`)
- [동작] fallback 가짜 승자 제거
- [lint] vs-input setState-in-effect
- [운영] CI, rate limit, guest share 토큰, seed 프로덕션 가드

## 🟠 남은 것

### [audit] npm audit 취약점
- lockfile 변경은 PM 승인 필수
- **배정: BE**

### [기능] 쿠팡 파트너스 최종승인 대기
- 누적 매출 15만원 후 env 전환
