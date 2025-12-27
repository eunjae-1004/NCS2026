# Railway 설정 단계별 가이드

## 현재 문제
```
cd server && npm install
sh: 1: cd: can't cd to server
```

## 해결 방법: Railway 대시보드에서 직접 설정

### 1단계: Railway 대시보드 접속
1. https://railway.app 접속
2. 로그인
3. 프로젝트 선택
4. **백엔드 서비스** 클릭 (Express 서버)

### 2단계: Root Directory 설정 ⭐ (가장 중요!)

1. 왼쪽 메뉴에서 **Settings** 클릭
2. **Source** 탭 클릭
3. **Root Directory** 섹션 찾기
4. **Root Directory** 입력란에 다음 입력:
   ```
   server
   ```
5. **Save** 버튼 클릭

⚠️ **중요**: Root Directory를 설정하면 Railway가 `server` 디렉토리에서 빌드를 시작합니다.

### 3단계: Build Command 설정

1. **Settings** → **Deploy** 탭 클릭
2. **Build Command** 섹션 찾기
3. 기존 내용 삭제하고 다음 입력:
   ```
   npm install
   ```
   (⚠️ `cd server`는 **제거** - Root Directory가 이미 `server`로 설정되어 있으므로 불필요)

4. **Save** 버튼 클릭

### 4단계: Start Command 설정

1. 같은 **Deploy** 탭에서
2. **Start Command** 섹션 찾기
3. 기존 내용 삭제하고 다음 입력:
   ```
   npm start
   ```
   (⚠️ `cd server`는 **제거**)

4. **Save** 버튼 클릭

### 5단계: 재배포

1. 왼쪽 메뉴에서 **Deployments** 탭 클릭
2. 최신 배포 항목에서 **"..." (점 3개)** 메뉴 클릭
3. **"Redeploy"** 선택
4. 배포 완료 대기 (1-2분)

## 설정 확인 체크리스트

배포 전 확인:
- [ ] Root Directory = `server`
- [ ] Build Command = `npm install` (cd server 없음)
- [ ] Start Command = `npm start` (cd server 없음)

## 예상 결과

성공 시 로그:
```
✅ Installing dependencies...
✅ Build completed
✅ Starting server...
✅ PostgreSQL 데이터베이스 연결 성공
✅ API 서버가 http://localhost:3000 에서 실행 중입니다
```

## 문제 해결

### 문제 1: Root Directory 설정이 보이지 않음
**해결:**
- Railway 대시보드 → Settings → Source
- "Root Directory" 또는 "Working Directory" 찾기
- 일부 Railway 버전에서는 "Base Directory"로 표시될 수 있음

### 문제 2: 여전히 "can't cd to server" 에러
**해결:**
1. Root Directory가 정확히 `server`로 설정되었는지 확인 (공백 없이)
2. Build Command에서 `cd server`가 완전히 제거되었는지 확인
3. 설정 저장 후 재배포

### 문제 3: "package.json not found" 에러
**해결:**
1. GitHub 저장소에 `server/package.json` 파일이 있는지 확인
2. Root Directory가 `server`로 올바르게 설정되었는지 확인

## 스크린샷 가이드

### Settings → Source 탭
```
Root Directory: [server        ]  ← 여기에 "server" 입력
```

### Settings → Deploy 탭
```
Build Command:  [npm install   ]  ← "cd server" 제거
Start Command:  [npm start     ]  ← "cd server" 제거
```

## 추가 팁

- 설정 변경 후 자동으로 재배포가 시작될 수 있습니다
- 배포가 실패하면 Logs 탭에서 상세한 에러 메시지 확인
- 설정이 제대로 저장되었는지 확인하려면 Settings 탭을 다시 열어보세요

