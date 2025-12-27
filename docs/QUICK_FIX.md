# 빠른 문제 해결 가이드

## 🔍 현재 상태 확인

### 서버 실행 상태
- ✅ API 서버: 포트 3000 실행 중
- ✅ 프론트엔드 서버: 포트 5173 실행 중

## 🚨 일반적인 문제들

### 문제 1: 브라우저에서 접속이 안 됨

**해결 방법:**
1. 브라우저에서 `http://localhost:5173` 접속 시도
2. `http://127.0.0.1:5173` 으로도 시도
3. 방화벽 확인

### 문제 2: 페이지는 열리지만 빈 화면

**해결 방법:**
1. 브라우저 개발자 도구 열기 (F12)
2. Console 탭에서 에러 확인
3. Network 탭에서 실패한 요청 확인

### 문제 3: "Cannot GET /" 에러

**해결 방법:**
- 프론트엔드 서버 재시작:
```bash
# 현재 서버 중지 (Ctrl+C)
npm run dev
```

### 문제 4: API 요청 실패

**해결 방법:**
1. API 서버가 실행 중인지 확인:
```bash
# 새 터미널에서
cd server
node index.js
```

2. 브라우저에서 직접 테스트:
```
http://localhost:3000/api/organizations
```

### 문제 5: CORS 에러

**증상:**
```
Access to fetch at 'http://localhost:3000/api/...' has been blocked by CORS policy
```

**해결 방법:**
- `server/index.js`에 `app.use(cors())`가 있는지 확인
- 서버 재시작

## 🔧 단계별 해결

### Step 1: 모든 서버 재시작

```bash
# 1. 모든 Node 프로세스 종료
Get-Process -Name node | Stop-Process -Force

# 2. API 서버 실행 (터미널 1)
cd D:\Website\cursor\ncssearch2026\server
node index.js

# 3. 프론트엔드 서버 실행 (터미널 2)
cd D:\Website\cursor\ncssearch2026
npm run dev
```

### Step 2: 브라우저 확인

1. `http://localhost:5173` 접속
2. F12로 개발자 도구 열기
3. Console 탭에서 에러 확인
4. Network 탭에서 요청 상태 확인

### Step 3: 환경 변수 확인

프로젝트 루트에 `.env` 파일이 있는지 확인:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

## 📋 에러 메시지 확인 방법

### 브라우저 콘솔
1. F12 누르기
2. Console 탭 확인
3. 빨간색 에러 메시지 복사

### 터미널
- 프론트엔드 서버 실행 중인 터미널 확인
- API 서버 실행 중인 터미널 확인
- 에러 메시지 확인

## 💡 빠른 테스트

### API 서버 테스트
```powershell
Invoke-RestMethod -Uri http://localhost:3000
```

### 프론트엔드 테스트
```powershell
Invoke-WebRequest -Uri http://localhost:5173 -UseBasicParsing
```

## 🆘 여전히 안 되면

다음 정보를 알려주세요:
1. 브라우저 콘솔의 에러 메시지 (F12 → Console)
2. 어떤 작업을 하다가 문제가 발생했는지
3. 화면에 무엇이 표시되는지 (빈 화면, 에러 메시지 등)


