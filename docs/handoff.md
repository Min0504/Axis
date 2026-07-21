# handoff.md — Axis

마지막 갱신: 2026-07-16 (restore + fixes)

## 현재 상태

`e71f624` 코어 파손 복구 + P0~P2 수정 진행 브랜치: `cursor/restore-core-and-fixes-646a`

- dataset/extract/cron/push/admin/collect 복구
- Galaxy Book6 Pro 14/16 데이터셋 추가
- watches 세션 소유권, 인기쿼리 익명화, fallback 가짜 승자 제거
- CI · rate limit · guest share 토큰 강화 · 홈 노트북 집중

## 주요 제약

- 결과/추천 로직 수정 금지 (프롬프트로만) — fallback은 “결론 보류”만 허용
- 스펙은 `lib/specs/dataset/`에서만
- `CACHE_VERSION` = **v9**
- 시크릿 하드코딩 절대 금지
- 프로덕션 `AXIS_PRICE_SOURCE=seed` 금지

## 역할별 다음

- FE: 쿠팡 제휴 CTA 실연동 확인
- BE: npm audit 취약점 (lockfile은 PM 승인)
- SEC: 배포 전 watches/cron/share 재검수
- LEAD: merge 판정
