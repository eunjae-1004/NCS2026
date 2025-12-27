# Railway 빌드 실패 해결 가이드

## 문제
```
sh: 1: cd: can't cd to server
ERROR: failed to build: failed to solve: process "sh -c cd server && npm install" did not complete successfully
```

## 원인
Railway가 `server` 디렉토리를 찾지 못하고 있습니다.

## 해결 방법

### 방법 1: Railway 대시보드에서 설정 변경 (권장)

1. **Railway 대시보드 접속**
   - https://railway.app → 프로젝트 선택 → 백엔드 서비스 클릭

2. **Settings → Source 탭**
   - **Root Directory** 설정:
     - `server` 입력
     - 또는 빈 값으로 두고 아래 방법 사용

3. **Settings → Deploy 탭**
   - **Build Command** 설정:
     ```
     npm install
     ```
     (cd server는 제거 - Root Directory가 server로 설정되면 불필요)

   - **Start Command** 설정:
     ```
     npm start
     ```
     (cd server는 제거)

### 방법 2: railway.json 파일 사용

프로젝트 루트에 `railway.json` 파일을 생성했습니다.

Railway가 자동으로 이 파일을 인식합니다.

### 방법 3: Railway CLI 사용

```bash
# Railway CLI 설치 (선택사항)
npm install -g @railway/cli

# 프로젝트 연결
railway link

# Root Directory 설정
railway variables set RAILWAY_ROOT_DIRECTORY=server
```

## 확인 사항

### 1. Root Directory 확인
- Railway 대시보드 → Settings → Source
- Root Directory가 `server`로 설정되어 있는지 확인

### 2. Build Command 확인
- Railway 대시보드 → Settings → Deploy
- Build Command가 `npm install`인지 확인 (cd server 없이)

### 3. Start Command 확인
- Railway 대시보드 → Settings → Deploy
- Start Command가 `npm start`인지 확인 (cd server 없이)

## 재배포

설정 변경 후:
1. Railway 대시보드 → Deployments 탭
2. "Redeploy" 버튼 클릭
3. 배포 완료 대기 (1-2분)

## 예상 결과

배포 성공 시:
```
✅ Build successful
✅ Server started on port 3000
```

## 추가 문제 해결

### 문제: 여전히 "can't cd to server" 에러
**해결:**
1. Railway 대시보드 → Settings → Source
2. Root Directory를 명시적으로 `server`로 설정
3. Build Command와 Start Command에서 `cd server` 제거

### 문제: "package.json not found" 에러
**해결:**
1. Root Directory가 `server`로 올바르게 설정되었는지 확인
2. GitHub 저장소에 `server/package.json`이 있는지 확인

### 문제: 배포는 성공했지만 서버가 응답하지 않음
**해결:**
1. Railway 대시보드 → Logs 탭에서 에러 확인
2. 환경 변수 확인 (DB_HOST, DB_NAME 등)
3. 서비스 재시작

