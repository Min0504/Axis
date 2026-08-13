# ADR-0002: 중앙집중 에러 모델 (ApiError 계층 + 안정적 에러 코드)

- 상태: 채택 (2026-08)
- 관련 코드: `lib/server/errors.ts`

## 컨텍스트

에러 응답이 라우트마다 인라인 `NextResponse.json({ error: "..." })`로 생성돼
상태코드·형태·로깅이 일관되지 않았다. 예상치 못한 예외는 프레임워크 기본
500(HTML)으로 새어 나가거나, 내부 메시지가 그대로 노출될 위험이 있었다.

## 결정

1. `ApiError` 추상 베이스 + 서브클래스(BadRequest/Validation/Unauthorized/
   Forbidden/NotFound/Conflict/RateLimit/ServiceUnavailable/Internal)를 던진다.
2. 매퍼 `toHttpError()` 하나가 모든 thrown 값을 HTTP 형태로 변환한다.
3. 에러 바디는 `{ error, code, requestId, details? }`:
   - `error` — 사람이 읽는 메시지. **기존 클라이언트가 그대로 표시하므로 계약**.
   - `code` — 기계가 분기할 안정적 식별자. 메시지 문자열 파싱 금지.
   - `requestId` — 서버 로그와 교차 추적.
4. `ApiError`가 아닌 예외(=버그)는 스택과 함께 로그에만 남기고, 클라이언트에는
   일반 메시지만 반환한다. **내부 정보는 절대 새지 않는다.**

## 결과

- 4xx/5xx의 의미가 코드베이스 전체에서 동일해진다.
- `expected` 플래그로 "정상적인 거절"과 "버그"를 로그 레벨에서 구분한다.
- 트레이드오프: 예외를 제어 흐름으로 쓰는 데 대한 호불호가 있으나, HTTP 경계
  1곳에서만 잡으므로 남용 위험이 낮다.
