# Vercel-Railway 연결 빠른 해결 가이드

## 즉시 확인할 3가지

### 1. Vercel 환경 변수 설정

**Vercel 대시보드 → 프로젝트 → Settings → Environment Variables**

다음 환경 변수가 있는지 확인:
```
VITE_API_BASE_URL=https://your-railway-backend.railway.app/api
```

**없으면 추가:**
- Key: `VITE_API_BASE_URL`
- Value: `https://your-railway-backend.railway.app/api` (Railway URL + `/api`)
- Environment: ✅ Production, ✅ Preview

**재배포 필수!**

### 2. Railway CORS 설정

**Railway 대시보드 → 백엔드 서비스 → Variables**

다음 환경 변수가 있는지 확인:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

**없으면 추가:**
- Key: `ALLOWED_ORIGINS`
- Value: Vercel 도메인들 (쉼표로 구분)
- 예: `https://ncssearch2026.vercel.app,https://ncssearch2026-git-main.vercel.app`

**서비스 재시작 필수!**

### 3. 브라우저에서 확인

**개발자 도구 (F12) → Console 탭:**

```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
```

**예상 결과:**
- ✅ `https://your-backend.railway.app/api`
- ❌ `undefined` 또는 `http://localhost:3000/api` → 환경 변수 설정 필요

## 빠른 테스트

브라우저 콘솔에서 실행:

```javascript
// API 연결 테스트
fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/organizations`)
  .then(r => r.json())
  .then(data => console.log('✅ API 연결 성공:', data))
  .catch(err => console.error('❌ API 연결 실패:', err))
```

## 문제 해결 순서

1. ✅ Vercel 환경 변수 설정 확인
2. ✅ Railway CORS 설정 확인
3. ✅ 재배포/재시작
4. ✅ 브라우저에서 테스트

## 상세 가이드

더 자세한 내용은 `FIX_VERCEL_BACKEND_CONNECTION.md` 파일을 참고하세요.

