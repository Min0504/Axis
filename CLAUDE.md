# CLAUDE.md

Axis 코드베이스 규칙. 개요는 [README.md](README.md), 상세는 [DEV_NOTES.md](DEV_NOTES.md).

## 절대 규칙

1. **범위:** 한국 · 노트북 · 검증 스펙 비교 · 쿠팡 제휴. 잡다한 기능 추가 금지.
2. **AI 채팅형 답변 금지.** 승자·근거는 검증 스펙표 점수(`buildDeterministicDecision`)만.
3. **스펙은 DB에서 꺼내지 않는다.** `lib/specs/dataset/` + 규칙 스크래핑만.
4. **검증 게이트.** primary가 tier 1~2일 때만 `verified`. 없는 제품은 "찾을 수 없음".
5. 배포는 문맥상 명확할 때 / PM 승인 하에.

## 작업 흐름

- 수정 후 `npm test` + `npx tsc --noEmit`.
- 스키마·결과 포맷 변경 시 `CACHE_VERSION` 올리기 (현재 **v10**).

## 응답 언어

- 사용자와는 한국어로 소통한다.
