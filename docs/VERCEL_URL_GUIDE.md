# Vercel 배포 URL 확인 가이드

## Vercel URL 확인 방법

Vercel에 프로젝트를 배포하면 자동으로 URL이 생성됩니다. 여러 곳에서 확인할 수 있습니다.

---

## 방법 1: 배포 완료 후 즉시 확인 (가장 간단)

### 배포 완료 화면에서:

1. **배포가 완료되면**:
   - Vercel 대시보드에 "Deployment ready" 메시지 표시
   - 배포 카드에 **"Visit"** 버튼이 나타남
   - 이 버튼을 클릭하면 바로 사이트로 이동

2. **배포 카드에서 URL 확인**:
   - 배포 카드 상단에 URL이 표시됨
   - 형식: `https://프로젝트명.vercel.app`
   - 예: `https://ncssearch2026.vercel.app`

---

## 방법 2: 프로젝트 대시보드에서 확인

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **프로젝트 선택**: 배포한 프로젝트 클릭
3. **URL 확인 위치**:
   - 프로젝트 대시보드 상단에 **"Domains"** 섹션
   - 또는 배포 목록에서 최신 배포의 URL 확인

---

## 방법 3: Settings → Domains에서 확인

1. **프로젝트 선택** → **"Settings"** 탭 클릭
2. **"Domains"** 메뉴 클릭
3. **자동 생성된 도메인 확인**:
   - Production Domain: `프로젝트명.vercel.app`
   - Preview Domains: 각 브랜치/PR마다 생성

---

## Vercel URL 종류

Vercel은 여러 종류의 URL을 제공합니다:

### 1. Production URL (프로덕션)
```
https://프로젝트명.vercel.app
```
- **용도**: 메인 프로덕션 사이트
- **특징**: 항상 최신 배포된 버전
- **예시**: `https://ncssearch2026.vercel.app`

### 2. Preview URL (프리뷰)
```
https://프로젝트명-git-브랜치명-사용자명.vercel.app
```
- **용도**: 각 브랜치/PR마다 생성되는 임시 URL
- **특징**: 해당 브랜치의 변경사항 미리보기
- **예시**: 
  - `https://ncssearch2026-git-main-yourusername.vercel.app`
  - `https://ncssearch2026-git-feature-branch.vercel.app`

### 3. 커스텀 도메인 (선택사항)
```
https://your-custom-domain.com
```
- **용도**: 자신의 도메인 연결
- **설정**: Settings → Domains에서 추가

---

## 실제 확인 단계별 가이드

### Step 1: 배포 완료 확인

1. Vercel 대시보드 접속
2. 프로젝트 목록에서 배포한 프로젝트 찾기
3. 배포 상태 확인:
   - ✅ "Ready" - 배포 완료
   - 🔄 "Building" - 배포 중
   - ❌ "Error" - 배포 실패

### Step 2: URL 복사

**방법 A: 배포 카드에서**
- 배포 카드 우측 상단의 URL 클릭
- 또는 "Visit" 버튼 옆의 URL 복사

**방법 B: 프로젝트 대시보드에서**
- 프로젝트 이름 옆의 URL 표시
- 클릭하여 복사

**방법 C: 브라우저 주소창에서**
- "Visit" 버튼 클릭 후 브라우저 주소창에서 URL 복사

### Step 3: URL 형식 확인

생성된 URL 예시:
```
https://ncssearch2026.vercel.app
```

이 URL이 **프로덕션 URL**입니다.

---

## Railway ALLOWED_ORIGINS에 추가하기

Vercel URL을 확인한 후, Railway의 `ALLOWED_ORIGINS`에 추가해야 합니다.

### 1. Vercel URL 확인
```
https://ncssearch2026.vercel.app
```

### 2. Railway 환경 변수 업데이트

1. **Railway 대시보드** 접속
2. **백엔드 서비스** 선택 → **"Variables"** 탭
3. **ALLOWED_ORIGINS** 변수 찾기 (또는 새로 추가)
4. **값 수정**:
   ```
   https://ncssearch2026.vercel.app,http://localhost:5173
   ```
   - 쉼표로 구분
   - 프로덕션 URL + 로컬 개발 URL

### 3. Preview URL도 포함하려면

여러 Preview URL을 포함할 수도 있습니다:
```
https://ncssearch2026.vercel.app,https://ncssearch2026-git-main-yourusername.vercel.app,http://localhost:5173
```

---

## 스크린샷으로 확인하는 방법

### 배포 완료 화면:
```
┌─────────────────────────────────────┐
│  ✅ Deployment ready                │
│                                     │
│  https://ncssearch2026.vercel.app  │
│                                     │
│  [Visit] [Copy URL]                 │
└─────────────────────────────────────┘
```

### 프로젝트 대시보드:
```
┌─────────────────────────────────────┐
│  ncssearch2026                      │
│  https://ncssearch2026.vercel.app  │
│                                     │
│  [Deployments] [Settings] [Domains] │
└─────────────────────────────────────┘
```

---

## 자주 묻는 질문

### Q1: URL이 보이지 않아요
**A**: 배포가 완료될 때까지 기다리세요. "Building" 상태면 아직 배포 중입니다.

### Q2: 여러 URL이 있는데 어떤 것을 사용하나요?
**A**: 
- **프로덕션**: `프로젝트명.vercel.app` (메인 URL)
- **프리뷰**: 각 브랜치별 URL (테스트용)

### Q3: URL을 변경할 수 있나요?
**A**: 
- 기본 URL은 변경 불가 (프로젝트명 기반)
- 커스텀 도메인을 추가할 수 있음 (Settings → Domains)

### Q4: Preview URL도 ALLOWED_ORIGINS에 추가해야 하나요?
**A**: 
- 필수는 아니지만, Preview 환경에서도 테스트하려면 추가하는 것이 좋습니다
- 또는 와일드카드 사용 불가하므로 필요한 Preview URL만 추가

---

## 체크리스트

Vercel 배포 후:

- [ ] 배포 상태가 "Ready"인지 확인
- [ ] Production URL 확인 및 복사
- [ ] 브라우저에서 URL 접속 테스트
- [ ] Railway의 `ALLOWED_ORIGINS`에 URL 추가
- [ ] Railway 서비스 재배포 확인
- [ ] 프론트엔드에서 API 호출 테스트

---

## 다음 단계

1. ✅ Vercel URL 확인
2. ✅ Railway `ALLOWED_ORIGINS` 업데이트
3. ✅ 프론트엔드에서 API 연결 테스트
4. ✅ CORS 오류 없는지 확인

