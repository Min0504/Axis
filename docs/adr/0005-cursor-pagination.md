# ADR-0005: 히스토리 커서(keyset) 페이지네이션

- 상태: 채택 (2026-08)
- 관련 코드: `lib/server/pagination.ts`, `lib/comparisons/repository.ts`,
  `app/api/history/route.ts`

## 컨텍스트

`GET /api/history`가 최근 10건 고정이었다. 페이지네이션을 붙일 때 선택지는
OFFSET 방식과 커서(keyset) 방식 두 가지다.

## 결정

커서 방식을 쓴다: `created_at < (이전 페이지 마지막 행의 created_at)`.

- OFFSET의 문제: `OFFSET n`은 n행을 스캔한 뒤 버린다(깊을수록 선형 비용).
  또 페이지 사이에 새 행이 삽입되면 항목이 밀려 중복/누락이 생긴다.
- keyset은 인덱스 시크 한 번 — 깊이와 무관하게 O(페이지 크기), 동시 삽입에도
  안정적이다.

구현 세부:

1. 커서는 `{ createdAt, id }`를 base64url로 감싼 **불투명 토큰**. 클라이언트가
   내부 구조에 의존하지 못하게 해서 서버가 인코딩을 자유롭게 바꿀 수 있다.
2. `limit+1` 오버페치로 다음 페이지 존재 여부를 판단한다 (COUNT 쿼리 불필요).
3. 잘못된 커서는 HTTP 경계에서 400으로 거절한다. 검증은 경계에서, 리포지토리는
   이미 검증된 값만 받는다.
4. 응답은 `{ history, nextCursor }` — 기존 `history` 필드는 유지하고
   `nextCursor`만 추가(non-breaking). 기본 limit 10도 기존과 동일.

## 알려진 한계

- 타이브레이커로 `id`를 커서에 담아 두었지만 조건절은 `created_at` 단독 비교다.
  timestamptz는 마이크로초 정밀도라 동일 사용자의 충돌 확률이 사실상 0이고,
  Supabase `.or()` 복합 조건의 복잡도가 이득보다 크다고 판단했다. 필요해지면
  `(created_at, id)` 복합 keyset으로 확장한다 (커서에 이미 id가 있어 하위호환).
