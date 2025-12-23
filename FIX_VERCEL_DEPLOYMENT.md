# Vercel 배포 오류 해결: 오래된 로그 문제

## 문제 상황

- Vercel에서 Error 상태
- 최신 배포 로그가 아닌 2시간 전 로그만 보임
- 새로운 배포가 트리거되지 않음

## 해결 방법

### 방법 1: 수동 재배포 (가장 빠름) ⚡

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **Deployments 탭으로 이동**
   - 상단 메뉴에서 "Deployments" 클릭

3. **최신 배포 확인**
   - 가장 위에 있는 배포 확인
   - 상태가 "Error"인지 확인

4. **재배포 실행**
   - Error 상태인 배포 클릭
   - 우측 상단의 "..." (더보기) 메뉴 클릭
   - "Redeploy" 선택
   - 또는 배포 상세 페이지에서 "Redeploy" 버튼 클릭

5. **배포 상태 확인**
   - 새 배포가 생성되고 "Building" 상태로 시작
   - 완료될 때까지 대기 (1-3분)

### 방법 2: GitHub에 새 커밋 푸시 (권장) ✅

이 방법은 자동으로 최신 코드로 재배포합니다.

1. **로컬에서 작은 변경사항 추가**
   ```bash
   # 예: README 파일에 공백 추가 또는 주석 추가
   # 또는 package.json의 버전 업데이트
   ```

2. **커밋 및 푸시**
   ```bash
   git add .
   git commit -m "Trigger redeploy"
   git push origin main
   ```

3. **Vercel 자동 배포 확인**
   - Vercel 대시보드에서 새 배포가 자동으로 시작됨
   - "Deployments" 탭에서 새 배포 확인

### 방법 3: 빈 커밋으로 재배포

GitHub에 실제 변경 없이 재배포만 트리거:

```bash
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

## 배포 로그 확인 방법

### 최신 배포 로그 보기

1. **Vercel 대시보드**
   - 프로젝트 → Deployments
   - 가장 위에 있는 배포 클릭 (최신 배포)

2. **로그 확인**
   - "Build Logs" 탭: 빌드 과정 로그
   - "Function Logs" 탭: 런타임 로그 (서버리스 함수인 경우)

3. **오류 메시지 확인**
   - 빨간색으로 표시된 오류 메시지 확인
   - 스크롤하여 전체 오류 내용 확인

## 일반적인 배포 오류와 해결

### 오류 1: Build Failed

**원인:**
- TypeScript 컴파일 오류
- 의존성 설치 실패
- 환경 변수 누락

**해결:**
1. 로컬에서 빌드 테스트:
   ```bash
   npm run build
   ```
2. 오류 수정
3. 재배포

### 오류 2: Module not found

**원인:**
- 패키지가 설치되지 않음
- import 경로 오류

**해결:**
1. `package.json` 확인
2. 모든 의존성이 포함되어 있는지 확인
3. import 경로 확인

### 오류 3: Environment variable missing

**원인:**
- 필수 환경 변수가 설정되지 않음

**해결:**
1. Settings → Environment Variables 확인
2. 필요한 환경 변수 추가:
   - `VITE_API_BASE_URL`
   - `VITE_USE_MOCK_DATA`
3. 재배포

### 오류 4: Build timeout

**원인:**
- 빌드 시간이 너무 김
- 무한 루프 또는 무거운 작업

**해결:**
1. 빌드 스크립트 최적화
2. 불필요한 파일 제외 (`.vercelignore` 사용)

## 배포 상태 확인 체크리스트

배포 전:
- [ ] 로컬에서 `npm run build` 성공
- [ ] TypeScript 오류 없음
- [ ] 환경 변수 설정 완료
- [ ] GitHub에 최신 코드 푸시됨

배포 중:
- [ ] Vercel에서 새 배포가 시작됨
- [ ] "Building" 상태 확인
- [ ] 빌드 로그에서 오류 없음

배포 후:
- [ ] 배포 상태가 "Ready"
- [ ] 올바른 URL로 접속 가능
- [ ] 애플리케이션이 정상 작동

## 빠른 진단 명령어

### 로컬 빌드 테스트
```bash
# 프론트엔드 빌드 테스트
npm run build

# 빌드 결과 확인
npm run preview
```

### Git 상태 확인
```bash
# 최신 커밋 확인
git log --oneline -5

# 원격 저장소와 동기화 확인
git status
```

## Vercel CLI 사용 (선택사항)

Vercel CLI를 사용하여 로컬에서 배포할 수도 있습니다:

```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 배포
vercel --prod
```

## 문제가 계속되면

1. **배포 로그 전체 복사**
   - Build Logs 전체 내용
   - 오류 메시지 전체

2. **환경 변수 확인**
   - Settings → Environment Variables 스크린샷

3. **프로젝트 설정 확인**
   - Settings → General
   - Build & Development Settings

4. **Vercel 지원팀에 문의**
   - https://vercel.com/support

## 예방 방법

### 1. 자동 배포 확인

Vercel은 GitHub에 푸시할 때마다 자동 배포됩니다:
- 메인 브랜치 → Production 배포
- 다른 브랜치 → Preview 배포

### 2. 배포 알림 설정

Vercel에서 배포 알림을 설정하여:
- 배포 성공/실패 시 이메일 알림
- Slack/Discord 연동

### 3. 배포 전 로컬 테스트

배포 전에 항상 로컬에서 테스트:
```bash
npm run build
npm run preview
```

## 요약

**즉시 해결:**
1. Vercel 대시보드 → Deployments
2. 최신 배포 클릭 → "Redeploy"
3. 또는 GitHub에 새 커밋 푸시

**근본 해결:**
1. 로컬에서 빌드 테스트
2. 오류 수정
3. 재배포

