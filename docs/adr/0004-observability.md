# ADR-0004: 관측성 — 구조화 로그 + requestId + 헬스체크 + cron 감사

- 상태: 채택 (2026-08)
- 관련 코드: `lib/server/logger.ts`, `lib/server/cron.ts`, `app/api/health/route.ts`,
  `supabase/migrations/0016_cron_runs.sql`

## 컨텍스트

로깅이 자유 형식 `console.error` 뿐이라 "특정 요청의 전체 흐름", "라우트별
p95 지연", "어젯밤 크론이 실제로 돌았는지"에 답할 수 없었다.

## 결정

1. **구조화 JSON 로그** (`lib/server/logger.ts`): 한 줄 = JSON 객체 하나.
   레벨 필터(LOG_LEVEL), `child()`로 요청 컨텍스트 상속. Vercel 로그 검색과
   외부 수집기 어디서든 필드 단위 필터링이 된다.
2. **requestId 전파**: 파이프라인이 UUID를 발급해 모든 로그 라인과
   `x-request-id` 응답 헤더, 에러 바디에 싣는다. 사용자 문의 → 로그 역추적이
   ID 하나로 끝난다.
3. **지연 측정**: 모든 요청 완료 시 `durationMs` 포함 로그 1줄.
4. **헬스체크** `GET /api/health`: DB 실왕복 프로브(+latency) + 기능별 설정
   여부. 완전 가동 200 / 저하 503 — 업타임 모니터가 바로 물 수 있다.
   환경변수는 이름만 노출, 값은 절대 노출하지 않는다.
5. **cron 감사 테이블** `cron_runs`: 잡 이름·상태·요약·소요시간을 실행마다
   1행 기록. 기록 실패는 잡을 깨지 않는다(best-effort).

## 결과

- 장애 조사: 증상(요청ID) → 로그 → 원인 순의 체계적 추적이 가능해진다.
- 트레이드오프: 로그 부피 증가. LOG_LEVEL로 프로덕션에서 info 이상만 남긴다.
