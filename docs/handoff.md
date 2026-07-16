# handoff.md — Axis

마지막 갱신: 2026-07-16 (상태 감사)

## 현재 상태

**HEAD(`e71f624`)는 코어 파손.** 상세: [status-audit-2026-07-16.md](./status-audit-2026-07-16.md)

- 데이터셋 `index`·다카테고리·extract 코어·cron/push API 삭제/미완
- 문서상 “베타 정상 / 테스트 통과”는 현재 트리와 불일치
- Conductor 세션제 폐지 → FE/BE/SEC/LEAD 스킬로 이관 예정

## 주요 제약

- 결과/추천 로직 수정 금지 (프롬프트로만)
- 스펙은 `lib/specs/dataset/`에서만
- `CACHE_VERSION` 변경 시 `lib/comparison-cache.ts` 버전 올리기 (현재 코드 v9)
- 시크릿 하드코딩 절대 금지

## 역할별 다음 과제

- **FE:** `vs-input.tsx` lint(`react-hooks/set-state-in-effect`); 쿠팡 제휴 CTA 실연동; 홈/예시 칩을 노트북 중심으로
- **BE:** `e71f624` 코어 복구(dataset/extract/cron); `/api/watches` 소유권; 인기 집계 익명화
- **SEC:** 복구·소유권 수정 후 재검수 → 배포 가능/불가
- **LEAD:** SEC 후 merge 판정 + 문서 정합(제품 수·v9·가격 소스)
