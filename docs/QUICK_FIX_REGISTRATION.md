# 회원가입 오류 빠른 해결

## 즉시 확인할 2가지

### 1. Vercel 환경 변수 (가장 중요!)

**Vercel → Settings → Environment Variables**

다음 환경 변수가 있는지 확인:

```
VITE_API_BASE_URL=https://your-railway-backend.railway.app/api
VITE_USE_MOCK_DATA=false
```

**없으면 추가하고 재배포!**

### 2. Railway CORS 설정

**Railway → 백엔드 서비스 → Variables**

```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

## Git Push가 필요한가요?

### ❌ 불필요
- 환경 변수만 설정하면 되는 경우
- Vercel 대시보드에서 직접 설정 가능

### ✅ 필요
- 코드 파일을 수정한 경우
- 새로운 기능을 추가한 경우

## 빠른 확인

브라우저 콘솔 (F12):

```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
console.log('Mock 모드:', import.meta.env.VITE_USE_MOCK_DATA)
```

**예상 결과:**
- API URL: `https://your-backend.railway.app/api`
- Mock 모드: `false`

**문제 있으면:**
- `undefined` → 환경 변수 설정 필요
- `true` → `VITE_USE_MOCK_DATA=false` 설정 필요

## 해결 순서

1. ✅ Vercel 환경 변수 설정
2. ✅ Railway CORS 설정
3. ✅ 재배포/재시작
4. ✅ 브라우저에서 확인

