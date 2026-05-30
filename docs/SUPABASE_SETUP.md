# Supabase 연동 가이드

## 1. 환경변수

`.env.local`에 추가:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Auth URL 설정

Supabase Dashboard → **Authentication** → **URL Configuration**

| 항목 | 값 |
|------|-----|
| Site URL | `http://localhost:3000` |
| Redirect URLs | `http://localhost:3000/auth/callback` |

## 3. DB 마이그레이션

SQL Editor에서 순서대로 실행:

1. `supabase/migrations/0001_axis_mvp.sql`
2. `supabase/migrations/0002_auth_user_trigger.sql`

또는 Supabase CLI:

```bash
supabase db push
```

## 4. 확인

1. `/login`에서 회원가입/로그인
2. 메인에서 VS 비교 실행
3. 하단 **최근 결정 기록**에 저장되는지 확인
4. **다시 보기**로 `/results?historyId=...` 이동
