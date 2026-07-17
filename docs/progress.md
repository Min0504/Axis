# progress.md — Axis

마지막 갱신: 2026-07-17 (strip essentials)

## 한것

- AI 채팅 결정 제거 → 검증 스펙표 deterministic만
- 푸시/이메일/공유/admin/history/watches API/collect-specs/Conductor 삭제
- 비노트북 데이터셋·SEO 슬러그 제거
- 관심상품 localStorage only
- compare noindex unless verified, CSP 추가, CACHE v10
- deps: web-push/resend/@google/generative-ai 제거

## 검증

| 명령 | 결과 |
|---|---|
| npm test | ✅ 115 |
| tsc | ✅ |
| lint | ✅ |
| build | ✅ |
