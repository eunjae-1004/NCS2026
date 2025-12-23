# 에러 해결 가이드

## 🔍 에러 진단 방법

### 1. 브라우저 콘솔 확인
1. 브라우저에서 `F12` 또는 `Ctrl+Shift+I` 눌러서 개발자 도구 열기
2. **Console** 탭 확인
3. 빨간색 에러 메시지 확인

### 2. 터미널 에러 확인
- 프론트엔드 서버 실행 중인 터미널 확인
- API 서버 실행 중인 터미널 확인
- 빨간색 에러 메시지 확인

### 3. Network 탭 확인
1. 개발자 도구 → **Network** 탭
2. 페이지 새로고침
3. 실패한 요청(빨간색) 확인
4. 에러 상태 코드 확인 (404, 500 등)

## 🚨 일반적인 에러 및 해결 방법

### 에러 1: "Cannot find module" 또는 "Module not found"

**증상:**
```
Error: Cannot find module 'xxx'
```

**해결 방법:**
```bash
# 의존성 재설치
npm install

# 또는 node_modules 삭제 후 재설치
rm -rf node_modules
npm install
```

### 에러 2: 포트가 이미 사용 중

**증상:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**해결 방법:**

**방법 1: 사용 중인 프로세스 종료**
```powershell
# 포트 3000 사용 중인 프로세스 찾기
netstat -ano | findstr :3000

# PID 확인 후 프로세스 종료 (PID는 위 명령어 결과에서 확인)
taskkill /PID [PID번호] /F
```

**방법 2: 다른 포트 사용**
- `server/.env` 파일 생성:
```env
PORT=3001
```
- 프론트엔드 `.env` 파일도 수정:
```env
VITE_API_BASE_URL=http://localhost:3001/api
```

### 에러 3: CORS 에러

**증상:**
```
Access to fetch at 'http://localhost:3000/api/...' from origin 'http://localhost:5173' has been blocked by CORS policy
```

**해결 방법:**
- `server/index.js`에 CORS 설정이 있는지 확인:
```javascript
app.use(cors())
```
- 서버 재시작

### 에러 4: "Failed to fetch" 또는 네트워크 에러

**증상:**
```
Failed to fetch
NetworkError when attempting to fetch resource
```

**해결 방법:**
1. API 서버가 실행 중인지 확인:
```bash
cd server
node index.js
```

2. 브라우저에서 직접 접속 테스트:
```
http://localhost:3000/api/organizations
```

3. `.env` 파일 확인:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

### 에러 5: TypeScript 타입 에러

**증상:**
```
Type error: Property 'xxx' does not exist on type 'yyy'
```

**해결 방법:**
```bash
# 타입 체크
npm run build

# 또는 린터 실행
npm run lint
```

### 에러 6: "Cannot read property 'xxx' of undefined"

**증상:**
```
TypeError: Cannot read property 'xxx' of undefined
```

**해결 방법:**
- 데이터가 로드되기 전에 접근하려고 할 때 발생
- `useAsync` 훅의 `loading` 상태 확인
- 옵셔널 체이닝 사용: `data?.property`

### 에러 7: React 컴포넌트 에러

**증상:**
```
Error: Element type is invalid
```

**해결 방법:**
- import 경로 확인
- 컴포넌트 export/import 확인
- 브라우저 콘솔에서 정확한 에러 메시지 확인

### 에러 8: "useAsync is not a function" 또는 훅 에러

**증상:**
```
useAsync is not a function
```

**해결 방법:**
- `src/hooks/useAsync.ts` 파일이 존재하는지 확인
- import 경로 확인:
```typescript
import { useAsync } from '../hooks/useAsync'
```

## 🔧 단계별 문제 해결

### Step 1: 기본 확인
```bash
# 1. Node.js 버전 확인
node --version
# v18 이상 권장

# 2. npm 버전 확인
npm --version

# 3. 의존성 설치 확인
npm install
```

### Step 2: 서버 실행 확인
```bash
# API 서버
cd server
node index.js

# 새 터미널에서 프론트엔드
cd D:\Website\cursor\ncssearch2026
npm run dev
```

### Step 3: 포트 확인
```powershell
# 포트 3000 확인
netstat -ano | findstr :3000

# 포트 5173 확인
netstat -ano | findstr :5173
```

### Step 4: 환경 변수 확인
- 프로젝트 루트에 `.env` 파일이 있는지 확인
- 내용 확인:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

### Step 5: 브라우저 캐시 클리어
- `Ctrl+Shift+R` (강력 새로고침)
- 또는 개발자 도구 → Network 탭 → "Disable cache" 체크

## 📋 에러 보고 시 포함할 정보

에러를 보고할 때 다음 정보를 포함해주세요:

1. **에러 메시지 전체** (터미널 또는 브라우저 콘솔)
2. **어떤 작업을 하다가 발생했는지**
   - 예: "검색 버튼 클릭 시", "페이지 로드 시"
3. **브라우저 정보**
   - Chrome, Firefox, Edge 등
4. **Node.js 버전**
   - `node --version`
5. **서버 실행 상태**
   - API 서버 실행 중인지
   - 프론트엔드 서버 실행 중인지

## 🆘 빠른 복구 방법

### 모든 것을 처음부터 다시 시작

```bash
# 1. 모든 Node 프로세스 종료
Get-Process -Name node | Stop-Process -Force

# 2. 프로젝트 루트로 이동
cd D:\Website\cursor\ncssearch2026

# 3. 의존성 재설치 (필요시)
npm install

# 4. 서버 폴더 의존성 재설치
cd server
npm install
cd ..

# 5. API 서버 실행 (새 터미널)
cd server
node index.js

# 6. 프론트엔드 실행 (새 터미널)
npm run dev
```

## 💡 예방 방법

1. **정기적으로 의존성 업데이트**
2. **에러 발생 시 즉시 확인**
3. **브라우저 콘솔 정기적으로 확인**
4. **코드 변경 후 서버 재시작**

## 📞 추가 도움

에러 메시지를 복사해서 알려주시면 더 정확한 해결 방법을 제시할 수 있습니다.


