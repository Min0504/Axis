# CLAUDE.md

Axis 코드베이스에서 작업할 때 따라야 할 규칙. 프로젝트 개요·아키텍처는
[README.md](README.md), 상세 개발 노트는 [DEV_NOTES.md](DEV_NOTES.md) 참고.

## 절대 규칙

1. **배포는 문맥상 명확할 때 실행한다.** 사용자가 다음 단계 진행을 요청하면
   `vercel --prod` 등 배포 명령을 직접 실행한다.
2. **결과/추천 로직은 건드리지 않는다.** `selectedOption`, `reasons`,
   `oneLineConclusion`, per-option 분석 등 결정·추천 생성 로직은 사용자가
   프롬프트로 직접 작업한다. 요청 없이 수정 금지.
3. **스펙은 DB에서 꺼내지 않는다.** 비교 스펙은 공식 페이지를 AI로 읽어 검증하거나
   `lib/specs/dataset/`의 수동 검증 데이터에서 가져온다. DB(Supabase)는
   계정/히스토리/가격추적/알림 전용.
4. **검증 게이트를 지킨다.** primary 스펙이 공식 소스(tier 1~2)로 뒷받침될 때만
   `verified`. AI 추정값으로 "verified"를 만들지 않는다. 뻥스펙·하드코딩 fallback
   추천 금지 — 없는 제품은 "찾을 수 없음"으로 떨어뜨린다.

## 작업 흐름

- **코드 수정 후 반드시** `npm test` 실행 (특히 레지스트리/데이터셋/파이프라인 변경 시).
- 타입 체크: `npx tsc --noEmit`.
- 데이터셋 변경 시 `dataset.test.ts` 무결성 검사 통과 확인.
- 스키마·결과 포맷을 바꾸면 `lib/comparison-cache.ts`의 `CACHE_VERSION`을 올려
  구버전 캐시를 무효화한다 (현재 v8).

## 데이터셋 작업

- 수동 검증 데이터: `lib/specs/dataset/{smartphones,earphones,laptops,tablets}.ts`
- 제품명은 로케일 정규화됨 — `canonicalName`(한국어) + `nameEn` + `nameJa`.
  EN/JA 로케일에서 어필리에이트 검색어·표시명이 이 필드로 결정된다.
- 새 제품 추가 시: `id`는 lowercase-kebab, spec 키는 카테고리 스키마에 존재해야 함.

## 비밀번호·보안

- `CRON_SECRET` 등 시크릿을 코드/문서에 하드코딩하지 않는다.

## 응답 언어

- 사용자와는 한국어로 소통한다.
