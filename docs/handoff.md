# 인수인계

상세 실험·지표·성공/실패 기준은 [../DEV_NOTES.md](../DEV_NOTES.md) §6 및 메모리(`project_business_validation`) 참고.

## 방향: 빌드 아님, 검증 먼저 (30일 사업 검증)

추가 기능 빌드 전에 핵심 가정부터 싸게 검증한다. 통과 시에만 빌드 재개.

**핵심 가정:**
- A 실가격·이력 확보 — `naver-provider.ts` + `coupang-provider.ts` + `price-snapshot` 크론 구현 완료. 네이버 API 발급 후 `AXIS_PRICE_SOURCE=naver`로 활성화, Coupang 누적 15만원 매출 달성 시 `=coupang` 전환.
- B SEO/커뮤니티 유입 — 노트북 추천/비교 콘텐츠 15~20편 색인
- C 제휴 클릭·구매 — 쿠팡 링크 클릭률 >8%
- D 알림 재방문 — 실알림 켜고 M2 재방문 >30%
- E 검증 배지 영향 — 배지 유무 A/B

**kill-switch:** A·B·C 모두 통과 → 노트북·KR·제휴 추진. A 실패 → Track/Alert 폐기. B 또는 C 실패 → 사업 재고(STOP).

## 즉시 (운영 환경 설정)

- `CRON_SECRET` 교체, VAPID 키 생성·등록, 프로덕션 Supabase 마이그레이션, 네이버 쇼핑 API 키 설정. (체크리스트는 [issues.md](issues.md))

## 보류 (검증 전 빌드 금지)

- P3-푸시앱 · P3-구독 · US/JP 운영 · 신규 카테고리(모니터 등) · 외부 가격이력 API 결제
