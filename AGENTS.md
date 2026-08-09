# AGENTS.md — Axis

## 프로젝트

- 이름: Axis
- 현재 repo 루트만 작업한다.
- DB: Supabase.
- PM만 최종 승인과 배포를 한다.

## 공통 규칙

- 시크릿/앱키를 클라이언트 번들에 넣지 않는다.
- 아래 항목은 PM 승인 후 진행한다:
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
- 배포 실행은 PM만.
