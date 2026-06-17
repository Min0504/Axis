# 진행상황

마지막 갱신: 2026-06-11 · 상세는 [../DEV_NOTES.md](../DEV_NOTES.md) 단일 참조점.

## 한 줄 요약

베타 배포 완료(https://axis-app-beta.vercel.app). 제품 비교/추천 파이프라인·가격추적·알림 코드 완료. 현재는 사업성 검증(노트북·한국·제휴) 우선 단계.

## 완료된 핵심 작업

- 브랜드 리네임(nudge/Optio → Axis), 멤버십/플랜 제거
- 3단계 제품 발견 파이프라인 + 제품 레지스트리/앨리어스
- AI 연동(Groq Llama 3.1, 프로바이더 추상화)
- 가격 추적(`lib/watch`, `lib/pricing`) · 푸시 알림(service worker, VAPID) 코드 완료
- SEO 비교 페이지(`/compare/[slug]`), Cron 가격 체크, 비교 결과 캐시
- 스펙 정확도 수정, 한/미/일 데이터셋 fallback, 데이터셋 122개 확장 + 태블릿 카테고리 신설
- UI: 결과 카드 화이트 리디자인, fit score 바, 다이렉트 링크

## 검증

```bash
npm test           # 통과 기준 유지
npx tsc --noEmit
npm run build
```

캐시 버전: v8. 스키마·결과 포맷 변경 시 `lib/comparison-cache.ts`의 `CACHE_VERSION`을 올린다.
