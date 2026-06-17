# 이슈

상세는 [../DEV_NOTES.md](../DEV_NOTES.md) §6 참고.

## 기능 비활성화 (API 키 없음)

- `BRAVE_SEARCH_API_KEY` 미설정 → 미등록 제품 웹 검색 폴백 안 됨
- `RESEND_API_KEY` 미설정 → 이메일 가격 알림 안 됨
- `VAPID_*` 미설정 → 푸시 알림 안 됨

## 미확인

- Sony 한국 URL(`sony.co.kr`) 실제 동작 여부
- LG gram 14/16/17형 containment match 오매핑 가능성
- WatchButton UI 미노출 (`VAPID_SUBJECT` 관련 가능성)

## 운영 환경 설정 대기

- `CRON_SECRET` 기본값 → `openssl rand -base64 32`로 교체 후 Vercel Production 등록
- VAPID 키 생성·등록 (`npx web-push generate-vapid-keys`)
- Supabase 프로덕션 마이그레이션 (`npx supabase db push`)
- 네이버 쇼핑 API 키 설정 → `AXIS_PRICE_SOURCE=naver`
