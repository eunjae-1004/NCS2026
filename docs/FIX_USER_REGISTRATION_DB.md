# 회원가입 DB 저장 문제 해결

## 문제 증상

- ✅ 회원가입 후 로그인하면 이름이 표시됨
- ❌ DB의 `users` 테이블에 데이터가 저장되지 않음

## 원인 분석

회원가입이 DB에 저장되지 않는 주요 원인:

1. **Mock 데이터 모드로 동작**
   - 프론트엔드가 Mock 데이터를 사용하고 있음
   - 실제 API 호출이 안 됨

2. **백엔드 DB 연결 실패**
   - Railway 백엔드가 PostgreSQL에 연결되지 않음
   - `dbConnected`가 false

3. **API 호출 실패**
   - Vercel에서 Railway 백엔드로 요청이 전달되지 않음
   - CORS 오류 또는 네트워크 오류

## 해결 방법

### 1단계: Vercel 환경 변수 확인

**Vercel 대시보드 → 프로젝트 → Settings → Environment Variables**

다음 환경 변수 확인:

```
VITE_USE_MOCK_DATA=false
VITE_API_BASE_URL=https://your-railway-backend.railway.app/api
```

**중요**: 
- `VITE_USE_MOCK_DATA`가 `false`로 설정되어 있어야 합니다
- `VITE_API_BASE_URL`이 올바른 Railway 백엔드 URL로 설정되어 있어야 합니다

**없으면 추가하고 재배포하세요!**

### 2단계: Railway 백엔드 로그 확인

**Railway 대시보드 → 백엔드 서비스 → Deployments → Logs**

다음 메시지 확인:

**정상인 경우:**
```
✅ PostgreSQL 데이터베이스 연결 성공
📊 데이터베이스 모드로 API 서버 실행 중
```

**문제 있는 경우:**
```
⚠️ 데이터베이스 연결 실패. Mock 데이터 모드로 동작합니다.
📝 Mock 데이터 모드로 API 서버 실행 중
```

**문제가 있으면:**
1. Railway Variables에서 DB 연결 정보 확인:
   - `PGHOST`
   - `PGPORT`
   - `PGDATABASE`
   - `PGUSER`
   - `PGPASSWORD`
   - 또는 `DATABASE_URL`

2. PostgreSQL 서비스가 실행 중인지 확인

### 3단계: 회원가입 요청 확인

**Railway 백엔드 로그에서 회원가입 요청 확인:**

회원가입 시도 후 로그에서 다음을 확인:

**정상인 경우:**
```
POST /api/auth/register
회원가입 성공: { id: 'user_...', email: '...', name: '...' }
```

**문제 있는 경우:**
```
회원가입 오류: ...
```

### 4단계: 브라우저에서 확인

**개발자 도구 (F12) → Network 탭:**

1. 회원가입 시도
2. Network 탭에서 `/api/auth/register` 요청 확인
3. 요청 상태 확인:
   - ✅ 200: 성공
   - ❌ 404: API 경로 오류
   - ❌ 500: 서버 오류
   - ❌ CORS 오류: CORS 설정 문제

4. 응답 본문 확인:
   ```json
   {
     "success": true,
     "data": {
       "id": "user_...",
       "email": "...",
       "name": "..."
     }
   }
   ```

### 5단계: DB에서 직접 확인

**Railway 대시보드 → PostgreSQL 서비스 → Data 탭:**

```sql
-- users 테이블 확인
SELECT * FROM users ORDER BY created_at DESC LIMIT 10;

-- 최근 회원가입 확인
SELECT id, email, name, role, created_at 
FROM users 
WHERE created_at > NOW() - INTERVAL '1 hour'
ORDER BY created_at DESC;
```

## 문제 해결 체크리스트

- [ ] Vercel에 `VITE_USE_MOCK_DATA=false` 설정되어 있는가?
- [ ] Vercel에 `VITE_API_BASE_URL`이 올바르게 설정되어 있는가?
- [ ] Railway 백엔드 로그에 "데이터베이스 연결 성공" 메시지가 있는가?
- [ ] Railway 백엔드 로그에 회원가입 요청이 들어오는가?
- [ ] 브라우저 Network 탭에서 API 요청이 전송되는가?
- [ ] API 응답이 성공(200)인가?
- [ ] DB에서 users 테이블에 데이터가 있는가?

## 일반적인 문제와 해결

### 문제 1: Mock 데이터 모드

**증상**: 
- 회원가입은 성공하지만 DB에 저장되지 않음
- 브라우저 콘솔에 Mock 데이터 관련 로그

**해결**:
1. Vercel 환경 변수 확인: `VITE_USE_MOCK_DATA=false`
2. 재배포

### 문제 2: DB 연결 실패

**증상**:
- Railway 백엔드 로그에 "데이터베이스 연결 실패" 메시지

**해결**:
1. Railway Variables에서 DB 연결 정보 확인
2. PostgreSQL 서비스가 실행 중인지 확인
3. DB 연결 정보가 올바른지 확인

### 문제 3: API 호출 실패

**증상**:
- 브라우저 Network 탭에서 404 또는 CORS 오류

**해결**:
1. `VITE_API_BASE_URL` 값 확인
2. Railway CORS 설정 확인 (`ALLOWED_ORIGINS`)

### 문제 4: DB 저장 실패

**증상**:
- API 요청은 성공하지만 DB에 저장되지 않음
- Railway 백엔드 로그에 DB 오류

**해결**:
1. Railway 백엔드 로그에서 오류 메시지 확인
2. users 테이블 구조 확인
3. DB 권한 확인

## 디버깅 방법

### 1. 프론트엔드에서 확인

브라우저 콘솔:
```javascript
// Mock 데이터 모드 확인
console.log('USE_MOCK_DATA:', import.meta.env.VITE_USE_MOCK_DATA)
console.log('API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)

// 회원가입 테스트
fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@example.com',
    password: 'test123',
    name: '테스트'
  })
})
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 2. Railway 백엔드에서 확인

Railway 로그에서 확인:
- DB 연결 메시지
- 회원가입 요청 로그
- 오류 메시지

### 3. DB에서 직접 확인

```sql
-- users 테이블 구조 확인
\d users

-- 최근 데이터 확인
SELECT * FROM users ORDER BY created_at DESC LIMIT 5;

-- 특정 이메일 확인
SELECT * FROM users WHERE email = 'your-email@example.com';
```

## 완료 확인

다음이 모두 확인되면 정상:

- ✅ Vercel 환경 변수 올바르게 설정
- ✅ Railway 백엔드 DB 연결 성공
- ✅ 회원가입 API 요청 성공 (200)
- ✅ DB의 users 테이블에 데이터 저장됨
- ✅ 로그인 시 DB에서 사용자 조회됨

