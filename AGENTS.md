# AGENTS.md — Axis

## 프로젝트

- 이름: Axis
- 현재 repo 루트만 작업한다.
- DB: Supabase.
- PM만 최종 승인과 배포를 한다.

## Conductor 역할 흐름

1. PM이 Codex FE/BE에게 작업 지시.
2. Codex FE와 Codex BE가 각자 영역에서 구현, todo 관리, lint/typecheck/test/build 실행.
3. FE/BE는 각자 작업 결과를 종합해 수정 파일, 실행 명령, 실패/남은 이슈를 역할 노트에 기록한다.
4. PM이 "검증 단계로 넘겨" 또는 "검증" 지시 전까지 Codex Security는 개입하지 않는다.
5. Security가 1차 검증을 수행한다: 전체 diff, FE/BE 연결, 보안, 권한, 타입, 테스트, 런타임 위험.
6. Security는 발견한 문제를 Security 선에서 전부 수정하고, 수정 내용과 남은 리스크를 `security-report.md`에 기록한다.
7. Security 완료 후 Claude Lead가 2차 검증과 최종 종합을 수행한다: security-report, diff, test 결과, 구조 리스크, 남은 이슈, 다음 작업, merge 가능 여부.

## 파일 경계

### Codex FE

담당:
- UI/UX, 컴포넌트, 화면, 스타일, 반응형, 클라이언트 상태, API 연결부, 프론트 테스트

금지:
- `api/`, `server/`, `src/server/`, `supabase/`, `data/`, `engine/`, `config/`, `lib/specs/`, `lib/pricing/`, `lib/ai/` 직접 수정
- API 스펙 임의 변경
- DB schema/migration/auth 임의 변경

### Codex BE

담당:
- API, 서버 로직, `lib/specs/`, `lib/pricing/`, `lib/ai/`, DB 연결, migration, auth, permission, validation, backend security, backend test

금지:
- `components/`, `pages/`, `screens/`, `ui/`, `styles/`, 프론트 화면 파일 직접 수정
- 응답 형식 임의 변경
- package/lockfile 임의 변경

### Codex Security

- PM 검증 지시 후에만 실행.
- 검증: FE/BE API 불일치, request/response 타입, auth/session, permission 우회, DB/migration, secret/env 노출, webhook/결제/파일업로드, lint/typecheck/test/build, 런타임 에러, 파일 범위 침범.
- 발견한 보안/타입/설정/구조 문제는 Security 선에서 전부 수정한다.
- 수정한 내용, 수정하지 못한 리스크, 검증 결과를 `.context/security-report.md`에 기록한다.

### Claude Lead

- Security 통과 뒤 마지막에만 실행.
- 담당: 2차 검증, 최종 종합, 큰 구조 리뷰, 변경 요약, 남은 이슈, 다음 task 설계, merge 가능 여부 판단.
- 2차 검증에서는 `security-report.md`, FE/BE 노트, 전체 diff, lint/typecheck/test/build 결과, 파일 범위 침범 여부를 다시 확인한다.
- 코드 대량 수정 금지.

## 기록 위치

- `.context/handoff.md`
- `.context/fe-notes.md`
- `.context/be-notes.md`
- `.context/security-report.md`
- 필요 시 `docs/inbox/frontend.md`, `docs/inbox/backend.md`, `docs/inbox/security.md`, `docs/inbox/lead.md`

## 보고 형식

토큰 절약을 위해 모든 역할은 기본 보고를 아래 형식으로 끝낸다.

```text
한것: file1, file2
검증: lint ✅ type ✅ test ✅ build ✅
남은것: 없음
```

문제 있을 때만 짧게 이유를 붙인다.

```text
한것: file1
검증: test ❌ — 핵심 이유
남은것: 해야 할 일
```

Lead 최종 보고는 아래 형식을 쓴다.

```text
판정: merge 가능/불가
한것: 핵심 3줄 이하
검증: Security ✅ Lead ✅
남은것: 없음/항목
```

긴 설명, 전체 파일 출력, 장문 로그 붙여넣기는 금지한다. 상세 판단은 Conductor diff/test 결과로 한다.

## 공통 규칙

- 기본은 자율 수행이다. 역할 범위 안 코드 수정, 검증 명령 실행, 문서/.context 기록, 작은 설정 수정은 PM 승인 없이 진행한다.
- 단, 아래 항목은 반드시 PM 승인 후 진행한다:
  - 개인정보/시크릿/env 값 생성·수정·노출
  - DB schema/rules/migration 실제 적용
  - 인증 방식 변경
  - 결제/웹훅/권한 구조 변경
  - package.json/lockfile 변경
  - 새 유료 서비스/API 도입
  - 배포 실행
  - git push/merge/delete branch
  - 대량 삭제
  - 프로젝트 밖 파일 수정
- package.json/lockfile 변경은 PM 승인 후.
- DB schema/migration 변경은 PM 승인 후.
- 인증 방식 변경은 PM 승인 후.
- 배포 실행은 PM만.
- 시크릿/앱키를 클라이언트 번들에 넣지 않는다.
- 실패한 명령은 숨기지 않고 역할 노트에 기록한다.
- 긴 전체 파일 출력 금지. diff, 테스트 결과, 수정 파일 목록 중심으로 보고한다.

## Cursor Cloud specific instructions

- Runtime: Node 22 (`.nvmrc` = 22, `engines` = `>=20 <23`). Package manager는 npm (`package-lock.json`). 의존성 갱신은 `npm install`.
- 표준 명령은 `package.json` scripts 참고: `npm run dev`(webpack) / `npm run dev:turbo`, `npm test`(vitest), `npm run lint`(eslint), `npm run build`, 타입 체크는 `npx tsc --noEmit`.
- 로컬 env: `.env.local` 없어도 홈/공개 UI는 뜬다. Supabase/AI 키 미설정 시 클라이언트는 graceful하게 null로 폴백(`lib/supabase*.ts`의 `hasSupabaseEnv`/`hasServiceEnv`), 홈페이지 인기목록은 큐레이션 fallback으로 렌더된다. 비교(결정) 흐름을 실제로 돌리려면 `GROQ_API_KEY`(또는 다른 AI provider 키)와 Supabase 키가 필요하다.
- 알려진 blocker (2026-07 기준): 최근 커밋 `e71f624`가 불완전 sync라서 다음 파일이 git에 없다 → build/`/api/compare`/`/compare/[slug]`/`/api/price` 및 일부 테스트가 `Module not found`로 실패한다:
  - `lib/specs/dataset/index.ts`, `lib/specs/dataset/laptops-samsung.ts`, `lib/specs/dataset/laptops-apple-air.ts`, `lib/specs/dataset/laptops-apple-pro.ts`, `lib/specs/dataset/{smartphones,earphones,tablets}.ts`
  - `lib/specs/extract/index.ts`, `lib/specs/extract/rules.ts`
  - `scripts/collect-specs/sources/*`, `scripts/collect-specs/models/*.json`
  이 파일들은 원저작자 로컬에만 존재한다(일부는 어떤 커밋에도 없음). 스펙 데이터는 날조 금지(검증 게이트)이므로 재작성하지 말고, 원본을 커밋/푸시해서 복구해야 정상 build/test가 된다.
