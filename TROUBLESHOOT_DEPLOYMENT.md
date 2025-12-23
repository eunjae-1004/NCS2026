# 배포 오류 해결 가이드

## 404: NOT_FOUND / DEPLOYMENT_NOT_FOUND 오류

이 오류는 배포된 애플리케이션을 찾을 수 없을 때 발생합니다.

## 가능한 원인 및 해결 방법

### 1. 배포가 아직 완료되지 않음

**증상:**
- 배포를 시작했지만 아직 진행 중
- 배포 URL에 접속했지만 404 오류

**해결 방법:**
1. **Vercel/Railway 대시보드 확인**
   - 배포 상태 확인 (Building, Deploying, Ready)
   - 배포가 완료될 때까지 대기 (보통 1-3분)

2. **배포 로그 확인**
   - Vercel: 프로젝트 → Deployments → 최신 배포 클릭 → Logs
   - Railway: 서비스 → Deployments → 최신 배포 클릭 → Logs
   - 빌드 오류가 있는지 확인

### 2. 잘못된 URL 접속

**증상:**
- 존재하지 않는 배포 ID로 접속
- 오래된 배포 URL 사용

**해결 방법:**
1. **올바른 URL 확인**
   - Vercel: 프로젝트 → Settings → Domains에서 확인
   - Railway: 서비스 → Settings → Domains에서 확인

2. **최신 배포 URL 사용**
   - Vercel: 프로젝트 → Deployments → 최신 배포의 URL 사용
   - Railway: 서비스 → Settings → Domains에서 제공하는 URL 사용

### 3. 배포가 실패했거나 삭제됨

**증상:**
- 배포가 실패 상태
- 배포가 삭제됨

**해결 방법:**
1. **배포 상태 확인**
   - Vercel: 프로젝트 → Deployments에서 실패한 배포 확인
   - Railway: 서비스 → Deployments에서 실패한 배포 확인

2. **재배포**
   - Vercel: 실패한 배포 클릭 → "Redeploy" 버튼
   - Railway: 서비스 → "Redeploy" 버튼
   - 또는 GitHub에 새 커밋 푸시

### 4. 프로젝트/서비스가 삭제됨

**증상:**
- 프로젝트가 존재하지 않음
- 서비스가 삭제됨

**해결 방법:**
1. **프로젝트 목록 확인**
   - Vercel: 대시보드에서 프로젝트 목록 확인
   - Railway: 프로젝트 목록 확인

2. **프로젝트 재생성**
   - 필요시 프로젝트를 다시 생성하고 배포

## 단계별 문제 해결

### Step 1: 배포 상태 확인

#### Vercel
1. https://vercel.com 접속
2. 프로젝트 선택
3. "Deployments" 탭 확인
4. 최신 배포의 상태 확인:
   - ✅ **Ready**: 정상 배포됨
   - ⏳ **Building/Deploying**: 배포 진행 중
   - ❌ **Error**: 배포 실패

#### Railway
1. https://railway.app 접속
2. 프로젝트 선택
3. 서비스 선택
4. "Deployments" 탭 확인
5. 최신 배포의 상태 확인

### Step 2: 배포 로그 확인

#### Vercel
1. 프로젝트 → Deployments
2. 최신 배포 클릭
3. "Build Logs" 또는 "Function Logs" 확인
4. 오류 메시지 확인

**일반적인 오류:**
- `Build failed`: 빌드 스크립트 오류
- `Module not found`: 의존성 문제
- `Environment variable missing`: 환경 변수 누락

#### Railway
1. 서비스 → Deployments
2. 최신 배포 클릭
3. 로그 확인
4. 오류 메시지 확인

### Step 3: 올바른 URL 확인

#### Vercel
1. 프로젝트 → Settings → Domains
2. 제공된 도메인 확인:
   - 프로덕션: `프로젝트명.vercel.app`
   - 프리뷰: `프로젝트명-git-브랜치명.vercel.app`

#### Railway
1. 서비스 → Settings → Domains
2. 제공된 도메인 확인:
   - 예: `서비스명.railway.app`

### Step 4: 재배포

#### Vercel
1. 프로젝트 → Deployments
2. 최신 배포 클릭
3. "Redeploy" 버튼 클릭
4. 또는 GitHub에 새 커밋 푸시

#### Railway
1. 서비스 → "Redeploy" 버튼 클릭
2. 또는 GitHub에 새 커밋 푸시

## 일반적인 배포 오류

### 1. 빌드 실패

**증상:**
- 배포 로그에 "Build failed" 메시지

**원인:**
- TypeScript 오류
- 의존성 설치 실패
- 환경 변수 누락

**해결:**
1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```
2. 오류 수정
3. 다시 배포

### 2. 환경 변수 누락

**증상:**
- 빌드는 성공하지만 런타임 오류
- API 연결 실패

**해결:**
1. Vercel/Railway 대시보드에서 환경 변수 확인
2. 필요한 환경 변수 추가
3. 재배포

### 3. 포트 설정 오류 (Railway)

**증상:**
- Railway에서 서비스가 시작되지 않음

**해결:**
1. `server/index.js`에서 포트 설정 확인:
   ```javascript
   const PORT = process.env.PORT || 3000
   ```
2. Railway 환경 변수에 `PORT` 설정 (자동 설정됨)

### 4. CORS 오류

**증상:**
- 프론트엔드에서 API 요청 실패
- 브라우저 콘솔에 CORS 오류

**해결:**
1. Railway 백엔드 환경 변수에 추가:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app
   ```
2. 백엔드 재시작

## 빠른 체크리스트

배포 전 확인:
- [ ] GitHub에 코드 푸시 완료
- [ ] 로컬에서 `npm run build` 성공
- [ ] 환경 변수 설정 완료
- [ ] Vercel/Railway 프로젝트 생성 완료
- [ ] 올바른 저장소 연결됨

배포 후 확인:
- [ ] 배포 상태가 "Ready" 또는 "Success"
- [ ] 올바른 URL로 접속
- [ ] 브라우저 개발자 도구에서 오류 없음
- [ ] API 요청이 정상 작동

## 추가 도움말

### Vercel 문서
- https://vercel.com/docs
- https://vercel.com/docs/concepts/deployments

### Railway 문서
- https://docs.railway.app
- https://docs.railway.app/deploy/deployments

### 디버깅 팁

1. **로컬에서 먼저 테스트**
   ```bash
   # 프론트엔드
   npm run build
   npm run preview
   
   # 백엔드
   cd server
   npm start
   ```

2. **환경 변수 확인**
   - 로컬 `.env` 파일과 배포 환경 변수 비교
   - 모든 필요한 변수가 설정되었는지 확인

3. **빌드 로그 자세히 확인**
   - 경고도 확인 (경고가 오류로 이어질 수 있음)
   - 타임스탬프 확인 (언제 오류가 발생했는지)

## 문제가 계속되면

1. **배포 로그 전체 복사**
2. **환경 변수 설정 스크린샷**
3. **프로젝트 구조 확인**
4. **Vercel/Railway 지원팀에 문의**

