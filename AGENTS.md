# AGENTS.md — Axis

## 프로젝트

- 이름: Axis
- **범위:** 한국 · 노트북 · 검증 스펙 비교 · 쿠팡 제휴
- **금지:** AI 채팅형 답변, 푸시/이메일 알림, 게스트 공유, 관리자 추출, Conductor
- DB: Supabase (캐시·가격이력·클릭만)
- PM만 배포 승인

## 결정 규칙

- 스펙은 `lib/specs/dataset/` (+ 규칙 스크래핑)만. AI로 스펙/승자 만들지 않음.
- primary 스펙이 tier 1~2일 때만 `verified`.
- 결과 포맷 바꾸면 `CACHE_VERSION` 올리기 (현재 v10).

## 역할 (스킬 예정)

FE / BE / SEC / LEAD — 파일 경계는 기존과 동일. 보고는 `한것/검증/남은것`.
