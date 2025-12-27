# 회원가입 "failed to fetch" 오류 해결

## 문제 증상

- ❌ 회원가입 페이지에서 기관 선택 목록이 뜨지 않음
- ❌ 회원가입 버튼 클릭 시 "failed to fetch" 메시지 출력

## 원인 분석

"failed to fetch" 오류는 **프론트엔드가 백엔드 API에 연결하지 못할 때** 발생합니다.

주요 원인:
1. **Vercel 환경 변수 미설정**
   - `VITE_API_BASE_URL`이 설정되지 않음
   - `VITE_USE_MOCK_DATA`가 `false`로 설정되지 않음

2. **API URL 오류**
   - 잘못된 백엔드 URL
   - `/api` 경로 누락

3. **CORS 오류**
   - Railway 백엔드에서 Vercel 도메인을 허용하지 않음

## 해결 방법

### 1단계: Vercel 환경 변수 설정 (가장 중요!) ⭐

**Git push 없이 Vercel 대시보드에서 직접 설정 가능합니다!**

1. **Vercel 대시보드 접속**
   - https://vercel.com → 프로젝트 선택

2. **Settings → Environment Variables**

3. **다음 환경 변수 확인/추가:**

   ```
   Key: VITE_API_BASE_URL
   Value: https://your-railway-backend.railway.app/api
   Environment: ✅ Production, ✅ Preview
   ```

   ```
   Key: VITE_USE_MOCK_DATA
   Value: false
   Environment: ✅ Production, ✅ Preview
   ```

4. **저장 후 재배포**
   - 환경 변수 저장 후 자동 재배포 시작
   - 또는 수동으로 "Redeploy" 클릭

### 2단계: Railway 백엔드 URL 확인

1. **Railway 대시보드 → 백엔드 서비스 → Settings → Domains**
2. **생성된 URL 확인**
   - 예: `https://ncssearch-backend-production.up.railway.app`
3. **URL 끝에 `/api` 추가**
   - 예: `https://ncssearch-backend-production.up.railway.app/api`

### 3단계: Railway CORS 설정

1. **Railway 대시보드 → 백엔드 서비스 → Variables**

2. **`ALLOWED_ORIGINS` 환경 변수 확인/추가:**
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
   ```

3. **서비스 재시작**

### 4단계: 브라우저에서 확인

**개발자 도구 (F12) → Console 탭:**

```javascript
// 환경 변수 확인
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
console.log('Mock 모드:', import.meta.env.VITE_USE_MOCK_DATA)
```

**예상 결과:**
- API URL: `https://your-backend.railway.app/api`
- Mock 모드: `false`

**문제 있는 경우:**
- API URL: `undefined` → 환경 변수 설정 필요
- Mock 모드: `true` → `VITE_USE_MOCK_DATA=false` 설정 필요

### 5단계: Network 탭에서 확인

**개발자 도구 → Network 탭:**

1. 회원가입 페이지 새로고침
2. `/api/organizations` 요청 확인
3. 상태 코드 확인:
   - ✅ 200: 성공
   - ❌ Failed: API URL 오류 또는 CORS 오류
   - ❌ 404: API 경로 오류
   - ❌ CORS error: CORS 설정 필요

## Git Push가 필요한가요?

### ❌ Git Push 불필요한 경우

**환경 변수만 설정하면 되는 경우:**
- Vercel 대시보드에서 환경 변수 설정
- 코드 변경 없음
- 재배포만 하면 됨

### ✅ Git Push 필요한 경우

**코드 변경이 있는 경우:**
- `src/` 폴더의 파일 수정
- `server/` 폴더의 파일 수정
- 새로운 기능 추가

## 빠른 해결 체크리스트

- [ ] Vercel에 `VITE_API_BASE_URL` 환경 변수 설정
- [ ] Vercel에 `VITE_USE_MOCK_DATA=false` 환경 변수 설정
- [ ] Railway 백엔드 URL이 올바른지 확인
- [ ] Railway에 `ALLOWED_ORIGINS` 환경 변수 설정
- [ ] 환경 변수 변경 후 재배포/재시작
- [ ] 브라우저에서 환경 변수 확인
- [ ] Network 탭에서 API 요청 확인

## 문제 해결 순서

1. ✅ **Vercel 환경 변수 설정** (가장 중요!)
   - `VITE_API_BASE_URL` 설정
   - `VITE_USE_MOCK_DATA=false` 설정
   - 재배포

2. ✅ **Railway CORS 설정**
   - `ALLOWED_ORIGINS` 설정
   - 서비스 재시작

3. ✅ **브라우저에서 확인**
   - Console에서 환경 변수 확인
   - Network 탭에서 API 요청 확인

4. ✅ **테스트**
   - 기관 목록이 표시되는지 확인
   - 회원가입이 정상 작동하는지 확인

## 일반적인 오류와 해결

### 오류 1: "failed to fetch"

**원인**: API URL이 잘못되었거나 연결 실패

**해결**:
1. `VITE_API_BASE_URL` 값 확인
2. Railway 백엔드가 실행 중인지 확인
3. URL에 `/api` 포함 여부 확인

### 오류 2: 기관 목록이 비어있음

**원인**: 
- API 호출 실패
- DB에 organizations 데이터 없음

**해결**:
1. Network 탭에서 `/api/organizations` 요청 확인
2. Railway 백엔드 로그 확인
3. DB에 organizations 데이터 확인:
   ```sql
   SELECT * FROM organizations;
   ```

### 오류 3: CORS 오류

**원인**: Railway 백엔드에서 Vercel 도메인을 허용하지 않음

**해결**:
1. Railway Variables에 `ALLOWED_ORIGINS` 추가
2. Vercel 도메인 포함
3. 서비스 재시작

## 확인 방법

### 1. 환경 변수 확인

브라우저 콘솔:
```javascript
console.log('API URL:', import.meta.env.VITE_API_BASE_URL)
console.log('Mock 모드:', import.meta.env.VITE_USE_MOCK_DATA)
```

### 2. API 테스트

브라우저 콘솔:
```javascript
// 기관 목록 테스트
fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/organizations`)
  .then(r => r.json())
  .then(data => console.log('✅ 기관 목록:', data))
  .catch(err => console.error('❌ 오류:', err))

// 회원가입 테스트
fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'test@test.com',
    password: 'test123',
    name: '테스트'
  })
})
  .then(r => r.json())
  .then(data => console.log('✅ 회원가입:', data))
  .catch(err => console.error('❌ 오류:', err))
```

## 완료 확인

다음이 모두 정상 작동하면 성공:

- ✅ 기관 선택 목록이 표시됨
- ✅ 회원가입 버튼 클릭 시 "failed to fetch" 오류 없음
- ✅ 회원가입이 정상적으로 완료됨
- ✅ DB에 사용자 데이터 저장됨

