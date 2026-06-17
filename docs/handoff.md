# handoff.md — Axis

마지막 갱신: 2026-06-18

## 현재 상태

베타 배포 완료 (https://axis-app-beta.vercel.app). 사업성 검증 단계 — 한국·노트북·제휴 우선. 핵심 파이프라인(AI 결정·가격추적·알림) 완료. 쿠팡 파트너스 연동·커뮤니티 홍보 미완.

## 주요 제약

- 결과/추천 로직 직접 수정 금지 — 프롬프트로만 조정
- 스펙은 `lib/specs/dataset/`에서만 (DB에서 꺼내지 않음)
- `CACHE_VERSION` 변경 시 `lib/comparison-cache.ts` 버전 올리기
- `CRON_SECRET` 등 시크릿 하드코딩 절대 금지

## 역할별 다음 과제

- frontend: 커뮤니티 홍보용 공유 카드 UI 개선; 쿠팡 파트너스 연동 후 제휴 링크 버튼 업데이트
- backend: 노트북 데이터셋 확장 (`lib/specs/dataset/laptops.ts`); Groq 폴백 체인 구현 (트래픽 증가 대비); 쿠팡 파트너스 API 연동 준비
- security: `CRON_SECRET` 환경변수 설정 확인; AI 프로바이더 키 서버 전용 유지 확인; Supabase RLS 권한 범위 검토 → "배포 가능/불가" 판정
