# handoff.md — Axis

마지막 갱신: 2026-06-18 (conductor 종합)

## 현재 상태

베타 배포 완료. 공유 카드 UI + 갤럭시 북6 데이터셋 완료. lint 블로커(`vs-input.tsx:63`)로 현재 배포 불가. 보안 이슈 2건(watches 소유권, 집계 익명화) 미수정.

## 주요 제약

- 결과/추천 로직 수정 금지 (프롬프트로만)
- 스펙은 `lib/specs/dataset/`에서만
- `CACHE_VERSION` 변경 시 `lib/comparison-cache.ts` 버전 올리기
- 시크릿 하드코딩 절대 금지

## 역할별 다음 과제

- frontend (Task #26): `vs-input.tsx:63` lint 수정 (배포 블로커); 쿠팡 파트너스 제휴 링크 버튼 실연동
- backend (Task #27): `/api/watches` 소유권 검증 (signed token); 인기 집계 익명화; Groq 폴백 체인
- security (Task #28): frontend/backend 완료 후 재검수 → 배포 가능/불가 최종 판정
