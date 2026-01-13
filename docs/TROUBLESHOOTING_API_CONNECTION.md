# 🔧 API 서버 연결 문제 해결 가이드

## ❌ 문제: "API 서버에 연결할 수 없습니다"

에러 메시지: `API 서버에 연결할 수 없습니다. (https://ncssearch-backend-production.up.railway.app/api)`

---

## 🔍 1단계: Railway 서버 상태 확인

### 방법 1: 브라우저에서 직접 확인

1. **Health Check 엔드포인트 접속**:
   ```
   https://ncssearch-backend-production.up.railway.app/api
   ```

2. **예상 응답** (정상인 경우):
   ```json
   {
     "message": "NCS 능력단위 검색 시스템 API 서버",
     "version": "1.0.0",
     "endpoints": {...},
     "status": "running"
   }
   ```

3. **오류 발생 시**:
   - "This site can't be reached" → 서버가 다운되었거나 URL이 잘못됨
   - "404 Not Found" → 엔드포인트 경로 문제
   - "CORS error" → CORS 설정 문제

### 방법 2: Railway 대시보드 확인

1. **Railway 대시보드 접속**: https://railway.app
2. **프로젝트 선택** → **백엔드 서비스** 클릭
3. **확인 사항**:
   - ✅ 서비스가 **"Active"** 상태인지 확인
   - ✅ **Logs** 탭에서 최근 로그 확인
   - ✅ **Metrics** 탭에서 CPU/메모리 사용량 확인
   - ✅ **Settings** → **Networking**에서 Public Domain 확인

---

## 🔍 2단계: CORS 설정 확인

### Railway 환경 변수 확인

1. **Railway 대시보드** → **백엔드 서비스** → **Variables** 탭
2. **`ALLOWED_ORIGINS` 환경 변수 확인**:
   ```
   ALLOWED_ORIGINS=https://ncssearch2026.vercel.app,http://localhost:5173,http://localhost:3000
   ```
3. **프론트엔드 URL이 포함되어 있는지 확인**
   - Vercel URL: `https://ncssearch2026.vercel.app` (또는 실제 배포 URL)
   - 로컬 개발: `http://localhost:5173`

### CORS 설정 업데이트

1. **Variables** 탭에서 `ALLOWED_ORIGINS` 수정
2. **저장** 후 서비스 자동 재배포 확인
3. **또는 수동 재배포**: **Deployments** 탭 → **Redeploy**

---

## 🔍 3단계: API 엔드포인트 테스트

### 브라우저 콘솔에서 테스트

```javascript
// 개발자 도구 (F12) → Console 탭에서 실행

// 1. Health Check
fetch('https://ncssearch-backend-production.up.railway.app/api')
  .then(res => res.json())
  .then(data => console.log('✅ 서버 응답:', data))
  .catch(err => console.error('❌ 오류:', err))

// 2. Standard Codes API 테스트
fetch('https://ncssearch-backend-production.up.railway.app/api/standard-codes/industries')
  .then(res => res.json())
  .then(data => console.log('✅ Industries:', data))
  .catch(err => console.error('❌ 오류:', err))

fetch('https://ncssearch-backend-production.up.railway.app/api/standard-codes/departments')
  .then(res => res.json())
  .then(data => console.log('✅ Departments:', data))
  .catch(err => console.error('❌ 오류:', err))
```

---

## 🔍 4단계: 프론트엔드 환경 변수 확인

### Vercel 환경 변수 확인

1. **Vercel 대시보드** → **프로젝트** → **Settings** → **Environment Variables**
2. **확인 사항**:
   ```
   VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app/api
   VITE_USE_MOCK_DATA=false
   ```
3. **환경 변수 수정 후 재배포 필요**

### 로컬 개발 환경 확인

프로젝트 루트에 `.env` 파일 확인:
```env
VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app/api
VITE_USE_MOCK_DATA=false
```

---

## 🛠️ 해결 방법

### 방법 1: Railway 서버 재시작

1. **Railway 대시보드** → **백엔드 서비스**
2. **Deployments** 탭 → **최신 배포** → **"..."** 메뉴 → **Redeploy**
3. 재배포 완료 대기 (2-3분)

### 방법 2: 환경 변수 업데이트 후 재배포

1. **Railway**: `ALLOWED_ORIGINS` 확인 및 업데이트
2. **Vercel**: `VITE_API_BASE_URL` 확인 및 업데이트
3. **재배포**: 두 서비스 모두 재배포

### 방법 3: 데이터베이스 연결 확인

1. **Railway 로그**에서 데이터베이스 연결 오류 확인
2. **PostgreSQL 서비스**가 실행 중인지 확인
3. **`DATABASE_URL`** 환경 변수가 올바른지 확인

---

## 📋 체크리스트

- [ ] Railway 서버가 "Active" 상태인가?
- [ ] Health Check 엔드포인트 (`/api`)가 응답하는가?
- [ ] `ALLOWED_ORIGINS`에 프론트엔드 URL이 포함되어 있는가?
- [ ] Vercel 환경 변수 `VITE_API_BASE_URL`이 올바른가?
- [ ] 데이터베이스 연결이 정상인가? (Railway 로그 확인)
- [ ] 최근 배포가 성공했는가?

---

## 🆘 여전히 문제가 있는 경우

1. **Railway 로그 확인**: 최근 오류 메시지 확인
2. **브라우저 Network 탭**: 실제 요청 URL과 응답 확인
3. **콘솔 로그**: 상세한 오류 메시지 확인
4. **서버 재시작**: Railway 서비스 완전 재시작

---

## 📞 빠른 테스트

브라우저에서 다음 URL들을 직접 접속해보세요:

1. **Health Check**: https://ncssearch-backend-production.up.railway.app/api
2. **Industries API**: https://ncssearch-backend-production.up.railway.app/api/standard-codes/industries
3. **Departments API**: https://ncssearch-backend-production.up.railway.app/api/standard-codes/departments

모든 URL이 정상 응답하면 서버는 정상 작동 중입니다.
