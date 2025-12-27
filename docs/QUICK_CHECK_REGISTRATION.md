# 회원가입 DB 저장 빠른 확인

## 즉시 확인할 3가지

### 1. Vercel 환경 변수

**Vercel → Settings → Environment Variables**

확인:
```
VITE_USE_MOCK_DATA=false  ← 반드시 false!
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

**없으면 추가하고 재배포!**

### 2. Railway 백엔드 로그

**Railway → 백엔드 서비스 → Logs**

확인:
```
✅ PostgreSQL 데이터베이스 연결 성공
📊 데이터베이스 모드로 API 서버 실행 중
```

**"Mock 데이터 모드"가 보이면 DB 연결 실패!**

### 3. 브라우저 Network 탭

**F12 → Network → 회원가입 시도**

확인:
- `/api/auth/register` 요청이 있는가?
- 상태 코드가 200인가?
- 응답에 `success: true`가 있는가?

## 빠른 테스트

브라우저 콘솔에서:

```javascript
// Mock 데이터 모드 확인
console.log('Mock 모드:', import.meta.env.VITE_USE_MOCK_DATA)
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)

// API 테스트
fetch(`${import.meta.env.VITE_API_BASE_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'test123',
    name: '테스트'
  })
})
  .then(r => r.json())
  .then(d => console.log('✅ 성공:', d))
  .catch(e => console.error('❌ 실패:', e))
```

## DB 확인

Railway → PostgreSQL → Data 탭:

```sql
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;
```

## 문제 해결 순서

1. ✅ Vercel `VITE_USE_MOCK_DATA=false` 확인
2. ✅ Railway 백엔드 DB 연결 확인
3. ✅ 브라우저 Network 탭 확인
4. ✅ DB에서 직접 확인

