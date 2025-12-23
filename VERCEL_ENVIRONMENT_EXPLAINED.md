# Vercel Environment(환경) 상세 설명

이 문서는 Vercel의 Environment 설정이 무엇인지, 어떻게 사용하는지 자세히 설명합니다.

## Environment란?

Vercel의 **Environment(환경)**는 배포되는 환경에 따라 다른 환경 변수를 사용할 수 있게 해주는 기능입니다.

## 세 가지 Environment

### 1. Production (프로덕션) 🌐

**정의:**
- 실제 사용자가 접속하는 **최종 배포 환경**
- 안정적이고 검증된 코드만 배포

**언제 사용되나요?**
- 메인 브랜치(`main` 또는 `master`)에 코드를 푸시하면
- 자동으로 Production 환경으로 배포됩니다

**예시:**
```bash
# 메인 브랜치에 푸시
git checkout main
git push origin main

# → Production 환경으로 배포
# → URL: https://ncssearch2026.vercel.app
```

**특징:**
- ✅ 가장 안정적인 환경
- ✅ 실제 사용자가 접속
- ✅ 도메인은 프로젝트 이름 기반 (예: `프로젝트명.vercel.app`)
- ✅ SEO에 노출됨

### 2. Preview (프리뷰) 🔍

**정의:**
- 코드 변경 사항을 **배포 전에 미리 확인**하는 환경
- Pull Request나 다른 브랜치에 푸시하면 자동 생성

**언제 사용되나요?**
- Pull Request(PR)를 생성하면
- 다른 브랜치에 푸시하면
- 자동으로 Preview 환경으로 배포됩니다

**예시:**
```bash
# 새 브랜치 생성
git checkout -b feature/new-search
git push origin feature/new-search

# → Preview 환경으로 배포
# → URL: https://ncssearch2026-git-feature-new-search.vercel.app
```

**특징:**
- ✅ 코드 변경 사항을 배포 전에 확인 가능
- ✅ 팀원들과 공유하여 리뷰 가능
- ✅ Production과 독립적으로 테스트 가능
- ✅ 도메인은 브랜치 이름 포함 (예: `프로젝트명-git-브랜치명.vercel.app`)
- ✅ PR이 머지되면 자동 삭제

### 3. Development (개발) 💻

**정의:**
- **로컬 개발 환경**
- Vercel CLI를 사용하여 로컬에서 실행할 때 사용

**언제 사용되나요?**
- `vercel dev` 명령어로 로컬 개발 서버 실행 시
- 일반적으로는 사용하지 않음 (로컬 `.env` 파일 사용)

**예시:**
```bash
# Vercel CLI로 로컬 개발
vercel dev

# → Development 환경 변수 사용
# → URL: http://localhost:3000
```

## 환경 변수 적용 방식

### 시나리오 1: Production과 Preview 모두 선택 ✅ (권장)

```
Key: VITE_API_BASE_URL
Value: https://your-backend.railway.app/api
Environment: ✅ Production, ✅ Preview
```

**결과:**
- 메인 브랜치 배포 → Production 환경 변수 사용
- PR/다른 브랜치 배포 → Preview 환경 변수 사용
- **둘 다 같은 백엔드 URL 사용**

**장점:**
- Preview에서도 실제 백엔드와 통신하여 테스트 가능
- 설정이 간단함

### 시나리오 2: Production만 선택

```
Key: VITE_API_BASE_URL
Value: https://your-backend.railway.app/api
Environment: ✅ Production, ❌ Preview
```

**결과:**
- 메인 브랜치 배포 → Production 환경 변수 사용
- PR/다른 브랜치 배포 → 환경 변수 없음 (기본값 사용)

**사용 시기:**
- Preview에서는 Mock 데이터를 사용하고 싶을 때
- Preview 환경 변수를 별도로 설정하고 싶을 때

### 시나리오 3: 환경별로 다른 값 설정

**Production:**
```
Key: VITE_API_BASE_URL
Value: https://prod-backend.railway.app/api
Environment: ✅ Production
```

**Preview:**
```
Key: VITE_API_BASE_URL
Value: https://test-backend.railway.app/api
Environment: ✅ Preview
```

**결과:**
- 메인 브랜치 배포 → 프로덕션 백엔드 사용
- PR/다른 브랜치 배포 → 테스트 백엔드 사용

**사용 시기:**
- 프로덕션과 테스트 백엔드를 분리하고 싶을 때
- Preview에서 테스트 데이터베이스 사용하고 싶을 때

## 실제 배포 흐름 예시

### 예시 1: 일반적인 개발 흐름

```bash
# 1. 기능 개발 (새 브랜치)
git checkout -b feature/add-filter
# 코드 작성...

# 2. GitHub에 푸시
git push origin feature/add-filter

# → Preview 환경으로 자동 배포
# → URL: https://ncssearch2026-git-feature-add-filter.vercel.app
# → Preview 환경 변수 사용

# 3. Pull Request 생성
# → PR에 Preview URL 자동 연결

# 4. 리뷰 후 머지
git checkout main
git merge feature/add-filter
git push origin main

# → Production 환경으로 자동 배포
# → URL: https://ncssearch2026.vercel.app
# → Production 환경 변수 사용
```

### 예시 2: 환경 변수 설정

**Vercel 대시보드에서:**

1. **첫 번째 환경 변수 (Production + Preview)**
   ```
   Key: VITE_API_BASE_URL
   Value: https://your-backend.railway.app/api
   Environment: ✅ Production, ✅ Preview
   ```

2. **두 번째 환경 변수 (Preview만)**
   ```
   Key: VITE_USE_MOCK_DATA
   Value: false
   Environment: ❌ Production, ✅ Preview
   ```

**결과:**
- Production: 실제 백엔드 사용, Mock 데이터 사용 안 함
- Preview: 실제 백엔드 사용, Mock 데이터 사용 안 함

## 권장 설정

### 대부분의 경우 (권장) ⭐

```
VITE_API_BASE_URL
Value: https://your-backend.railway.app/api
Environment: ✅ Production, ✅ Preview
```

**이유:**
- Preview에서도 실제 백엔드와 통신하여 테스트
- 설정이 간단하고 관리하기 쉬움
- 대부분의 프로젝트에 적합

### 특수한 경우

**1. Preview에서 테스트 백엔드 사용:**
```
Production:
  VITE_API_BASE_URL=https://prod-backend.railway.app/api
  Environment: ✅ Production

Preview:
  VITE_API_BASE_URL=https://test-backend.railway.app/api
  Environment: ✅ Preview
```

**2. Preview에서 Mock 데이터 사용:**
```
Production:
  VITE_API_BASE_URL=https://your-backend.railway.app/api
  VITE_USE_MOCK_DATA=false
  Environment: ✅ Production

Preview:
  VITE_USE_MOCK_DATA=true
  Environment: ✅ Preview
```

## 확인 방법

### 1. 배포 URL 확인

**Production:**
- URL: `https://프로젝트명.vercel.app`
- 브랜치: `main` 또는 `master`

**Preview:**
- URL: `https://프로젝트명-git-브랜치명.vercel.app`
- 브랜치: `main`이 아닌 다른 브랜치

### 2. 환경 변수 확인

**브라우저 개발자 도구:**
```javascript
// Console 탭에서
console.log(import.meta.env.VITE_API_BASE_URL)
```

**Vercel 대시보드:**
- 프로젝트 → Settings → Environment Variables
- 각 환경별로 설정된 값 확인

## 자주 묻는 질문 (FAQ)

### Q1: Production과 Preview를 모두 선택해야 하나요?

**A:** 대부분의 경우 **예**입니다. Preview에서도 실제 백엔드와 통신하여 테스트하는 것이 좋습니다.

### Q2: Preview 환경 변수를 설정하지 않으면?

**A:** 환경 변수가 없으면 코드의 기본값을 사용합니다:
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
```

### Q3: 환경 변수를 변경하면 자동 재배포되나요?

**A:** 
- **Production**: 자동 재배포됨
- **Preview**: 새 브랜치 푸시 시 재배포됨

### Q4: Development 환경은 언제 사용하나요?

**A:** 일반적으로 사용하지 않습니다. 로컬 개발은 `.env` 파일을 사용하는 것이 더 편리합니다.

## 요약

| Environment | 사용 시기 | URL 형식 | 환경 변수 |
|------------|----------|---------|----------|
| **Production** | 메인 브랜치 푸시 | `프로젝트명.vercel.app` | Production 설정 |
| **Preview** | PR/다른 브랜치 푸시 | `프로젝트명-git-브랜치명.vercel.app` | Preview 설정 |
| **Development** | `vercel dev` 실행 | `localhost:3000` | Development 설정 |

**권장 설정:**
- ✅ Production과 Preview 모두 선택
- ✅ 같은 백엔드 URL 사용
- ✅ 간단하고 관리하기 쉬움

