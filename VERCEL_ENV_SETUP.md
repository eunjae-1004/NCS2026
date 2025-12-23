# Vercel 환경 변수 설정 가이드

이 문서는 Railway 백엔드 URL을 Vercel 프론트엔드 환경 변수로 설정하는 방법을 상세히 안내합니다.

## 왜 환경 변수를 설정해야 하나요?

프론트엔드(React)는 빌드 시점에 환경 변수를 읽어서 코드에 포함시킵니다. 
따라서 배포된 백엔드 URL을 프론트엔드가 알 수 있도록 환경 변수로 설정해야 합니다.

## 전체 흐름

1. **Railway에서 백엔드 배포** → 백엔드 URL 생성 (예: `https://ncssearch-backend.railway.app`)
2. **Vercel에서 환경 변수 설정** → `VITE_API_BASE_URL`에 Railway URL 입력
3. **프론트엔드 빌드** → 환경 변수가 코드에 포함됨
4. **프론트엔드 배포** → 백엔드와 통신 가능

## 단계별 설정 방법

### 1단계: Railway에서 백엔드 URL 확인

1. **Railway 대시보드 접속**
   - https://railway.app 접속
   - 로그인 후 프로젝트 선택

2. **서비스(Service) 선택**
   - 배포한 백엔드 서비스 클릭 (예: `ncssearch-backend`)

3. **Settings 탭 클릭**
   - 왼쪽 메뉴에서 "Settings" 선택

4. **도메인(Domain) 확인**
   - "Domains" 섹션에서 생성된 URL 확인
   - 예시: `https://ncssearch-backend-production.up.railway.app`
   - 또는 커스텀 도메인: `https://api.yourdomain.com`

5. **URL 복사**
   - 전체 URL을 복사하세요
   - ⚠️ **주의**: `/api`는 포함하지 않습니다 (프론트엔드 코드에서 자동 추가)

### 2단계: Vercel에서 환경 변수 설정

#### 방법 1: 프로젝트 생성 시 설정 (권장)

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 로그인

2. **새 프로젝트 추가**
   - "Add New..." → "Project" 클릭
   - 또는 대시보드에서 "Add New Project" 버튼 클릭

3. **GitHub 저장소 선택**
   - GitHub 저장소 목록에서 프로젝트 선택
   - "Import" 클릭

4. **프로젝트 설정 화면**
   - Framework Preset: **Vite** (자동 감지됨)
   - Root Directory: `.` (기본값)
   - Build Command: `npm run build` (자동)
   - Output Directory: `dist` (자동)

5. **환경 변수 추가**
   - "Environment Variables" 섹션 찾기
   - 또는 스크롤 다운하여 "Environment Variables" 섹션 확인

6. **환경 변수 입력**
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://ncssearch-backend-production.up.railway.app/api`
     - ⚠️ **중요**: Railway URL 끝에 `/api`를 추가해야 합니다!
   - **Environment**: 
     - ✅ Production (프로덕션)
     - ✅ Preview (프리뷰)
     - ✅ Development (개발) - 선택사항

7. **추가 환경 변수 (선택사항)**
   - **Key**: `VITE_USE_MOCK_DATA`
   - **Value**: `false`
   - **Environment**: Production, Preview

8. **Deploy 클릭**
   - 설정 완료 후 "Deploy" 버튼 클릭

#### 방법 2: 배포 후 설정 (이미 배포한 경우)

1. **Vercel 대시보드 접속**
   - https://vercel.com 접속
   - 프로젝트 선택

2. **Settings 메뉴**
   - 상단 메뉴에서 "Settings" 클릭

3. **Environment Variables 섹션**
   - 왼쪽 사이드바에서 "Environment Variables" 클릭
   - 또는 스크롤하여 "Environment Variables" 섹션 찾기

4. **환경 변수 추가**
   - "Add New" 또는 "+" 버튼 클릭

5. **환경 변수 입력**
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://your-railway-backend.railway.app/api`
   - **Environment**: 
     - Production, Preview, Development 중 선택
     - 또는 "All Environments" 선택

6. **저장**
   - "Save" 또는 "Add" 버튼 클릭

7. **재배포 필요**
   - 환경 변수 변경 후 자동 재배포가 시작됩니다
   - 또는 수동으로 "Redeploy" 클릭

## 환경 변수 값 예시

### 올바른 예시 ✅

```
VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app/api
```

```
VITE_API_BASE_URL=https://api.yourdomain.com/api
```

### 잘못된 예시 ❌

```
# /api가 빠짐
VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app
```

```
# http 사용 (보안 문제)
VITE_API_BASE_URL=http://ncssearch-backend-production.up.railway.app/api
```

```
# 끝에 슬래시 있음 (문제는 없지만 불필요)
VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app/api/
```

## 환경 변수가 코드에서 사용되는 방식

프론트엔드 코드 (`src/services/api.ts`)에서 다음과 같이 사용됩니다:

```typescript
// 환경 변수 읽기
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// API 요청 시 사용
fetch(`${API_BASE_URL}/ability-units`)
```

## 확인 방법

### 1. 빌드 로그 확인

Vercel 배포 로그에서 환경 변수가 제대로 읽혔는지 확인:

```bash
# 빌드 로그에서 확인
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### 2. 브라우저에서 확인

1. 배포된 프론트엔드 접속
2. 개발자 도구 (F12) 열기
3. Console 탭에서 확인:
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```

4. Network 탭에서 확인:
   - 검색 기능 사용 시
   - API 요청이 설정한 백엔드 URL로 전송되는지 확인
   - 예: `https://your-backend.railway.app/api/ability-units?keyword=품질`

### 3. API 연결 테스트

프론트엔드에서 검색 기능을 사용하여:
- ✅ 정상 작동: API 요청이 성공하고 데이터가 표시됨
- ❌ 오류 발생: CORS 오류 또는 404 오류 확인

## 문제 해결

### 문제 1: 환경 변수가 적용되지 않음

**원인**: 
- 환경 변수 이름이 잘못됨 (`VITE_` 접두사 필요)
- 빌드 후 환경 변수 변경 (재배포 필요)

**해결**:
1. 환경 변수 이름 확인: `VITE_API_BASE_URL` (대소문자 정확히)
2. Vercel에서 "Redeploy" 클릭하여 재배포

### 문제 2: CORS 오류

**원인**: Railway 백엔드에서 Vercel 도메인을 허용하지 않음

**해결**:
1. Railway 대시보드 → 백엔드 서비스 → Variables
2. 환경 변수 추가:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,https://your-vercel-app-git-main.vercel.app
   ```
3. Railway 서비스 재시작

### 문제 3: 404 오류

**원인**: 
- URL에 `/api`가 빠짐
- 백엔드 경로가 잘못됨

**해결**:
1. `VITE_API_BASE_URL` 값 확인: 끝에 `/api` 포함되어 있는지
2. Railway 백엔드 URL이 정확한지 확인

### 문제 4: 빌드 실패

**원인**: 
- 환경 변수에 특수 문자 포함
- 값에 따옴표 포함

**해결**:
1. 환경 변수 값에 따옴표 없이 입력
2. URL 형식 확인 (https://로 시작)

## Vercel Environment(환경) 설명

Vercel은 세 가지 배포 환경을 제공합니다. 환경 변수를 각 환경에 맞게 다르게 설정할 수 있습니다.

### 1. Production (프로덕션) 🌐

**의미:**
- 실제 사용자가 접속하는 최종 배포 환경
- 메인 브랜치(`main` 또는 `master`)에 푸시하면 자동 배포
- 안정적이고 검증된 코드만 배포

**언제 사용:**
- 메인 브랜치에 코드 푸시 시
- 실제 서비스 운영 환경

**예시:**
```
브랜치: main
URL: https://ncssearch2026.vercel.app
환경 변수: Production 환경의 값 사용
```

**설정 예시:**
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_USE_MOCK_DATA=false
```

### 2. Preview (프리뷰/스테이징) 🔍

**의미:**
- 코드 변경 사항을 배포 전에 미리 확인하는 환경
- Pull Request(PR) 생성 시 자동으로 생성
- 다른 브랜치에 푸시해도 Preview 환경으로 배포
- Production과 다른 URL로 배포됨

**언제 사용:**
- 기능 개발 후 테스트
- Pull Request 리뷰 전 확인
- 스테이징 환경에서 검증

**예시:**
```
브랜치: feature/new-search
URL: https://ncssearch2026-git-feature-new-search.vercel.app
환경 변수: Preview 환경의 값 사용
```

**설정 예시:**
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_USE_MOCK_DATA=false
```

### 3. Development (개발) 💻

**의미:**
- 로컬 개발 환경
- Vercel CLI로 로컬에서 실행할 때 사용
- 일반적으로 사용하지 않음

**언제 사용:**
- Vercel CLI로 로컬 개발 서버 실행 시
- `vercel dev` 명령어 사용 시

**설정 예시:**
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

## 환경 변수 적용 우선순위

같은 환경 변수를 여러 환경에 설정한 경우:
1. **Production**: 메인 브랜치 배포 시 사용
2. **Preview**: 다른 브랜치/PR 배포 시 사용
3. **Development**: 로컬 개발 시 사용

## 실제 사용 예시

### 시나리오 1: 모든 환경에 동일한 백엔드 사용

```
Production: ✅
Preview: ✅
Development: ❌ (로컬 개발은 localhost 사용)

VITE_API_BASE_URL=https://your-backend.railway.app/api
```

### 시나리오 2: Preview는 테스트 백엔드 사용

```
Production:
  VITE_API_BASE_URL=https://prod-backend.railway.app/api

Preview:
  VITE_API_BASE_URL=https://test-backend.railway.app/api

Development:
  VITE_API_BASE_URL=http://localhost:3000/api
```

### 시나리오 3: Preview에서 Mock 데이터 사용

```
Production:
  VITE_API_BASE_URL=https://your-backend.railway.app/api
  VITE_USE_MOCK_DATA=false

Preview:
  VITE_USE_MOCK_DATA=true  (실제 백엔드 없이 테스트)

Development:
  VITE_API_BASE_URL=http://localhost:3000/api
  VITE_USE_MOCK_DATA=false
```

## 권장 설정

### 일반적인 경우 (대부분의 프로젝트)

✅ **Production과 Preview 모두 선택**
- 이유: Preview에서도 실제 백엔드와 통신하여 테스트
- 백엔드 URL이 같아도 문제없음

```
Key: VITE_API_BASE_URL
Value: https://your-backend.railway.app/api
Environment: ✅ Production, ✅ Preview
```

### 특별한 경우

**Preview에서만 다른 백엔드 사용:**
- Production: 프로덕션 백엔드
- Preview: 스테이징/테스트 백엔드

**Preview에서 Mock 데이터 사용:**
- Production: 실제 백엔드
- Preview: Mock 데이터 (백엔드 없이 프론트엔드만 테스트)

## 환경별 설정

### Production (프로덕션)
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_USE_MOCK_DATA=false
```

### Preview (프리뷰/스테이징)
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
VITE_USE_MOCK_DATA=false
```

### Development (로컬 개발)
로컬 개발 시에는 `.env` 파일 사용:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

## 추가 팁

### 1. 여러 환경 변수 한 번에 설정

Vercel CLI 사용:
```bash
# Vercel CLI 설치
npm i -g vercel

# 로그인
vercel login

# 환경 변수 설정
vercel env add VITE_API_BASE_URL production
# 값 입력: https://your-backend.railway.app/api
```

### 2. 환경 변수 확인

Vercel CLI로 확인:
```bash
vercel env ls
```

### 3. 자동 재배포

환경 변수 변경 시:
- Production: 자동 재배포됨
- Preview: 새 브랜치 푸시 시 재배포

## 요약 체크리스트

배포 전 확인:
- [ ] Railway 백엔드 배포 완료
- [ ] Railway 백엔드 URL 확인 및 복사
- [ ] Vercel에서 `VITE_API_BASE_URL` 환경 변수 설정
- [ ] 값에 `/api` 포함 확인
- [ ] Production 환경에 설정 확인
- [ ] 배포 후 Network 탭에서 API 요청 확인

## 다음 단계

환경 변수 설정 완료 후:
1. 프론트엔드 재배포 (자동 또는 수동)
2. 배포된 사이트에서 기능 테스트
3. CORS 오류 발생 시 Railway 백엔드 설정 확인

