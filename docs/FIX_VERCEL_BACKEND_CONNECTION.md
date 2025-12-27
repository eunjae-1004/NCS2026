# Vercel 프론트엔드와 Railway 백엔드 연결 문제 해결

## 문제 증상

- ✅ Vercel에서 앱 첫 화면이 정상적으로 출력됨
- ✅ 검색 버튼 등 화면 이동은 잘 됨
- ❌ 회원가입 시 "사용자"라고 뜨지만 DB에 저장되지 않음
- ❌ 키워드 검색 기능이 작동하지 않음

## 원인 분석

이 문제는 **Vercel 프론트엔드가 Railway 백엔드 API를 찾지 못해서** 발생합니다.

## 해결 방법

### 1단계: Vercel 환경 변수 확인 및 설정

#### 현재 설정 확인

1. **Vercel 대시보드 접속**
   - https://vercel.com → 프로젝트 선택

2. **Settings → Environment Variables**
   - `VITE_API_BASE_URL` 환경 변수가 있는지 확인

#### 환경 변수 설정 (없는 경우)

1. **Environment Variables 섹션에서 "Add New" 클릭**

2. **환경 변수 입력:**
   ```
   Key: VITE_API_BASE_URL
   Value: https://your-railway-backend.railway.app/api
   ```
   ⚠️ **중요**: 
   - Railway 백엔드 URL 끝에 `/api`를 반드시 포함하세요!
   - `https://`로 시작해야 합니다
   - 예시: `https://ncssearch-backend-production.up.railway.app/api`

3. **Environment 선택:**
   - ✅ Production
   - ✅ Preview
   - (Development는 선택사항)

4. **Save 클릭**

5. **재배포**
   - 환경 변수 추가 후 자동으로 재배포가 시작됩니다
   - 또는 수동으로 "Redeploy" 클릭

### 2단계: Railway 백엔드 URL 확인

1. **Railway 대시보드 접속**
   - https://railway.app → 프로젝트 선택

2. **백엔드 서비스 선택**
   - Express 서버 서비스 클릭

3. **Settings → Domains**
   - 생성된 도메인 확인
   - 예시: `https://ncssearch-backend-production.up.railway.app`

4. **URL 복사**
   - 전체 URL을 복사하고 끝에 `/api` 추가
   - 예: `https://ncssearch-backend-production.up.railway.app/api`

### 3단계: Railway 백엔드 CORS 설정 확인

Railway 백엔드가 Vercel 도메인을 허용하도록 설정해야 합니다.

1. **Railway 대시보드 → 백엔드 서비스 → Variables**

2. **`ALLOWED_ORIGINS` 환경 변수 확인/추가:**
   ```
   ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
   ```
   
   **예시:**
   ```
   ALLOWED_ORIGINS=https://ncssearch2026.vercel.app,https://ncssearch2026-git-main.vercel.app
   ```

3. **서비스 재시작**
   - Variables 저장 후 자동으로 재시작됩니다
   - 또는 수동으로 "Restart" 클릭

### 4단계: 브라우저에서 확인

1. **Vercel 앱 접속**
   - 배포된 URL로 접속

2. **개발자 도구 열기**
   - `F12` 또는 `Ctrl+Shift+I` (Windows)
   - `Cmd+Option+I` (Mac)

3. **Console 탭 확인**
   - API 호출 오류 메시지 확인
   - 예: `Failed to fetch`, `CORS error`, `404 Not Found`

4. **Network 탭 확인**
   - API 요청이 전송되는지 확인
   - 요청 URL이 올바른지 확인
   - 응답 상태 코드 확인 (200, 404, 500 등)

### 5단계: API URL 확인 (브라우저 콘솔)

브라우저 콘솔에서 다음 명령어 실행:

```javascript
console.log('API Base URL:', import.meta.env.VITE_API_BASE_URL)
```

**예상 결과:**
- ✅ 올바른 경우: `https://your-backend.railway.app/api`
- ❌ 문제 있는 경우: `undefined` 또는 `http://localhost:3000/api`

## 문제 해결 체크리스트

- [ ] Vercel에 `VITE_API_BASE_URL` 환경 변수가 설정되어 있는가?
- [ ] 환경 변수 값이 Railway 백엔드 URL로 올바르게 설정되어 있는가?
- [ ] URL 끝에 `/api`가 포함되어 있는가?
- [ ] Railway 백엔드에 `ALLOWED_ORIGINS` 환경 변수가 설정되어 있는가?
- [ ] `ALLOWED_ORIGINS`에 Vercel 도메인이 포함되어 있는가?
- [ ] 환경 변수 변경 후 재배포했는가?
- [ ] Railway 서비스가 정상 실행 중인가?

## 빠른 해결 방법

### 방법 1: Vercel 환경 변수 설정

```bash
# Vercel CLI 사용 (선택사항)
vercel env add VITE_API_BASE_URL
# 값 입력: https://your-railway-backend.railway.app/api
# Environment: production, preview
```

### 방법 2: Railway CORS 설정

Railway Variables에 추가:
```
ALLOWED_ORIGINS=https://your-app.vercel.app,https://your-app-git-main.vercel.app
```

## 일반적인 오류와 해결

### 오류 1: "Failed to fetch" 또는 "Network error"

**원인**: API URL이 잘못되었거나 백엔드가 응답하지 않음

**해결**:
1. `VITE_API_BASE_URL` 값 확인
2. Railway 백엔드가 실행 중인지 확인
3. URL에 `/api` 포함 여부 확인

### 오류 2: "CORS policy" 오류

**원인**: Railway 백엔드에서 Vercel 도메인을 허용하지 않음

**해결**:
1. Railway Variables에 `ALLOWED_ORIGINS` 추가
2. Vercel 도메인을 포함
3. 서비스 재시작

### 오류 3: "404 Not Found"

**원인**: API 경로가 잘못됨

**해결**:
1. `VITE_API_BASE_URL` 값 확인
2. URL 끝에 `/api` 포함 여부 확인
3. Railway 백엔드 라우트 확인

### 오류 4: "500 Internal Server Error"

**원인**: 백엔드 서버 오류 또는 데이터베이스 연결 문제

**해결**:
1. Railway 백엔드 로그 확인
2. 데이터베이스 연결 확인
3. 환경 변수 확인 (DB_HOST, DB_NAME 등)

## 확인 방법

### 1. API URL 확인

브라우저 콘솔:
```javascript
console.log(import.meta.env.VITE_API_BASE_URL)
```

### 2. API 테스트

브라우저 콘솔:
```javascript
fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'}/organizations`)
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

### 3. Railway 백엔드 테스트

브라우저에서 직접 접속:
```
https://your-railway-backend.railway.app/
```

정상 응답 예시:
```json
{
  "message": "NCS 능력단위 검색 시스템 API 서버",
  "version": "1.0.0",
  "status": "running"
}
```

## 완료 확인

다음이 모두 정상 작동하면 성공:

- ✅ 회원가입 시 DB에 사용자 저장됨
- ✅ 키워드 검색이 정상 작동
- ✅ 선택목록 기능 정상 작동
- ✅ 브라우저 콘솔에 API 오류 없음

## 추가 디버깅

### Network 탭에서 확인할 사항

1. **요청 URL**
   - 올바른 백엔드 URL인지 확인
   - `/api` 경로가 포함되어 있는지 확인

2. **요청 헤더**
   - `Content-Type: application/json` 확인
   - CORS 관련 헤더 확인

3. **응답 상태**
   - 200: 성공
   - 404: 경로 오류
   - 500: 서버 오류
   - CORS 오류: CORS 설정 문제

4. **응답 본문**
   - 오류 메시지 확인
   - 데이터 구조 확인

