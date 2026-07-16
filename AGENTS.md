# AGENTS.md — Axis

## 프로젝트

- 이름: Axis
- 현재 repo 루트만 작업한다.
- DB: Supabase.
- PM만 최종 승인과 배포를 한다.

## 운영 모델

**Conductor 세션제는 폐지했다.**  
FE / BE / SEC / LEAD는 별도 **스킬**로 운영할 예정이다 (스킬 정의는 스킬 쪽에서 관리).

이 파일에는 스킬이 오기 전까지 쓸 **파일 경계·승인·짧은 보고 형식**만 둔다.  
제품 규칙·검증 게이트는 [CLAUDE.md](CLAUDE.md), 상태 감사는 [docs/status-audit-2026-07-16.md](docs/status-audit-2026-07-16.md).

## 역할 경계 (스킬 이관 전까지)

### FE

담당: UI/UX, 컴포넌트, 화면, 스타일, 반응형, 클라이언트 상태, API 연결부, 프론트 테스트

금지:
- `app/api/`, `supabase/`, `lib/specs/`, `lib/pricing/`, `lib/ai/` 직접 수정
- API 스펙·DB schema/migration/auth 임의 변경

### BE

담당: API, 서버 로직, `lib/specs/`, `lib/pricing/`, `lib/ai/`, DB 연결, migration, auth, permission, validation, backend test

금지:
- `components/`, 프론트 화면 파일 직접 수정
- 응답 형식·package/lockfile 임의 변경

### SEC

- 검증 단계에서만 실행 (PM 지시 또는 스킬 트리거).
- FE/BE API 불일치, auth/session, permission, secret/env, lint/typecheck/test/build, 파일 범위 침범을 본다.
- 발견한 보안/타입/설정 문제는 SEC 선에서 고치고, 남은 리스크를 짧게 보고한다.

### LEAD

- SEC 이후 최종 종합만.
- merge 가능 여부, 구조 리스크, 남은 이슈. 코드 대량 수정 금지.

## 보고 형식

```text
한것: file1, file2
검증: lint ✅ type ✅ test ✅ build ✅
남은것: 없음
```

LEAD:

```text
판정: merge 가능/불가
한것: 핵심 3줄 이하
검증: SEC ✅ LEAD ✅
남은것: 없음/항목
```

긴 설명·전체 파일 출력·장문 로그 붙여넣기 금지.

## 공통 규칙

- 역할 범위 안 수정·검증 명령·작은 설정은 PM 승인 없이 진행.
- 아래는 **PM 승인 후**:
  - 시크릿/env 생성·수정·노출
  - DB schema/migration 실제 적용
  - 인증·결제/웹훅/권한 구조 변경
  - package.json/lockfile 변경
  - 새 유료 서비스/API 도입
  - 배포 실행
  - git push/merge/delete branch (에이전트 클라우드 지시가 있으면 그 지시를 따름)
  - 대량 삭제
  - 프로젝트 밖 파일 수정
- 시크릿/앱키를 클라이언트 번들에 넣지 않는다.
- 실패한 명령은 숨기지 않는다.
