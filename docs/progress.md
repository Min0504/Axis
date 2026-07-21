# progress.md — Axis

마지막 갱신: 2026-07-16 (restore + fixes)

## 이번 작업 (`cursor/restore-core-and-fixes-646a`)

### P0 복구
- `5acb9fc`에서 dataset/extract/cron/push/admin/collect 복구
- 깨진 laptops 분리 파일 제거 → 단일 `laptops.ts` 복원
- Galaxy Book6 Pro 14/16 추가 (Samsung US 공식 스펙)

### P0 보안
- `/api/watches` 세션 소유권 (클라이언트 email 무시)
- 인기 비교 `aggregatePopularQueries` 필터

### P1
- fallback 가짜 승자 제거 → 결론 보류
- vs-input lint 수정
- README partial 색인 / CACHE v9 / seed 문서 정합
- `.env.example` seed 기본값 제거, 프로덕션 seed 가드

### P2
- GitHub Actions CI
- track/price/watches/share rate limit
- guest share 토큰 강화
- 홈 예시·랭킹 노트북 집중

## 명령 결과

| 명령 | 결과 |
|---|---|
| `npm test` | ✅ 177 tests |
| `npx tsc --noEmit` | ✅ |
| `npm run lint` | ✅ |
| `npm run build` | ✅ |
