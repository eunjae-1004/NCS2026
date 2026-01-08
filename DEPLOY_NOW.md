# 🚀 지금 바로 배포하기

## 빠른 배포 가이드

### 1단계: Railway 백엔드 배포

#### Railway 대시보드에서:

1. **프로젝트 선택** 또는 **새 프로젝트 생성**
2. **서비스 추가** → **GitHub Repo** 선택
3. **저장소 선택** 후 **Deploy**

#### 서비스 설정:
- **Root Directory**: `server`
- **Start Command**: `npm start`
- **Build Command**: (비워두기)

#### 환경 변수 설정 (Variables 탭):
```
DATABASE_URL=<Railway PostgreSQL의 DATABASE_URL>
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

⚠️ **중요**: PostgreSQL 서비스를 먼저 생성하고 `DATABASE_URL`을 복사하세요.

#### PostgreSQL 데이터베이스:
1. **New** → **Database** → **PostgreSQL** 선택
2. 생성된 데이터베이스의 **Variables** 탭에서 `DATABASE_URL` 복사
3. 백엔드 서비스의 환경 변수에 설정

#### 배포 확인:
- 배포가 완료되면 Railway에서 제공하는 URL 확인 (예: `https://your-app.railway.app`)
- 로그에서 "✅ PostgreSQL 데이터베이스 연결 성공" 메시지 확인

---

### 2단계: 데이터베이스 마이그레이션

pgAdmin4에서:
1. Query Tool 열기
2. `database/create_tables.sql` 실행
3. `database/migrate_improvements.sql` 실행

또는 Railway CLI:
```bash
railway connect postgres < database/create_tables.sql
railway connect postgres < database/migrate_improvements.sql
```

---

### 3단계: Vercel 프론트엔드 배포

#### Vercel 대시보드에서:

1. **New Project** 클릭
2. **GitHub 저장소 선택**
3. **프로젝트 설정**:
   - Framework Preset: **Vite** (자동 감지)
   - Root Directory: `.` (루트)
   - Build Command: `npm run build`
   - Output Directory: `dist`

#### 환경 변수 설정 (Settings → Environment Variables):
```
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_USE_MOCK_DATA=false
```

⚠️ **중요**: 1단계에서 확인한 Railway 백엔드 URL을 사용하세요.

#### 배포:
- **Deploy** 버튼 클릭
- 배포 완료 후 Vercel에서 제공하는 URL 확인

---

### 4단계: Railway CORS 업데이트

Vercel URL을 확인한 후, Railway 백엔드의 환경 변수 업데이트:

```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

Railway 서비스를 재배포하면 자동으로 적용됩니다.

---

### 5단계: 테스트

#### 백엔드 테스트:
```bash
# 로컬에서 테스트
node scripts/test-api.js https://your-railway-app.railway.app

# 또는 브라우저에서
https://your-railway-app.railway.app/api
```

#### 프론트엔드 테스트:
1. Vercel URL 접속
2. 개발자 도구 (F12) → Network 탭
3. 추천 기능 테스트
4. API 요청이 정상적으로 전송되는지 확인

---

## 배포 후 확인 사항

### ✅ 백엔드
- [ ] Railway 로그에서 데이터베이스 연결 성공
- [ ] Health Check 성공 (`/api` 엔드포인트)
- [ ] 추천 API 동작 확인

### ✅ 프론트엔드
- [ ] Vercel 빌드 성공
- [ ] 페이지 로드 정상
- [ ] API 호출 성공 (Network 탭 확인)
- [ ] CORS 오류 없음

### ✅ 데이터베이스
- [ ] 테이블 생성 확인
- [ ] 뷰 생성 확인
- [ ] 트리거 생성 확인

---

## 문제 해결

### CORS 오류
Railway 환경 변수 `ALLOWED_ORIGINS`에 Vercel URL이 포함되어 있는지 확인

### 데이터베이스 연결 실패
Railway PostgreSQL 서비스의 `DATABASE_URL`이 올바른지 확인

### 빌드 실패
- Node.js 버전 확인 (18 이상)
- `package.json`의 스크립트 확인
- 로그에서 구체적인 오류 메시지 확인

---

## 빠른 참조

```bash
# Railway 백엔드 URL
https://your-app.railway.app

# Vercel 프론트엔드 URL
https://your-app.vercel.app

# API 테스트
node scripts/test-api.js https://your-app.railway.app
```

