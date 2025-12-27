# 포트 충돌 해결 가이드

## 문제: "EADDRINUSE: address already in use :::3000"

포트 3000이 이미 사용 중일 때 발생하는 에러입니다.

## 해결 방법

### 방법 1: 사용 중인 프로세스 종료 (권장)

```powershell
# 1. 포트 3000 사용 중인 프로세스 찾기
netstat -ano | findstr :3000

# 2. PID 확인 (예: 24080)
# 3. 프로세스 종료
Stop-Process -Id [PID번호] -Force

# 또는 모든 Node 프로세스 종료
Get-Process -Name node | Stop-Process -Force
```

### 방법 2: 다른 포트 사용

**서버 폴더에 `.env` 파일 생성:**
```env
PORT=3001
```

**프론트엔드 `.env` 파일도 수정:**
```env
VITE_API_BASE_URL=http://localhost:3001/api
VITE_USE_MOCK_DATA=false
```

### 방법 3: 자동 스크립트

```powershell
# 모든 Node 프로세스 종료 후 서버 시작
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
cd server
node index.js
```

## 예방 방법

1. 서버 종료 시 `Ctrl+C` 사용
2. 서버 실행 전 포트 확인
3. 여러 터미널에서 같은 서버를 중복 실행하지 않기

## 확인 방법

서버가 정상 실행되었는지 확인:
```powershell
# 포트 확인
netstat -ano | findstr :3000

# API 테스트
Invoke-RestMethod -Uri http://localhost:3000
```


