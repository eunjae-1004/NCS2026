# 🚀 배포 단계별 가이드

## ✅ 사전 준비 완료

- [x] TypeScript 컴파일 오류 수정 완료
- [x] 프론트엔드 빌드 성공
- [x] 코드 린트 통과

## 📋 배포 순서

### 1단계: Railway 백엔드 배포

#### 1.1 Railway 프로젝트 설정

1. **Railway 대시보드 접속**: https://railway.app
2. **프로젝트 선택** 또는 **New Project** 생성
3. **GitHub Repo** 연결:
   - **New** → **GitHub Repo** 선택
   - 저장소 선택
   - **Deploy** 클릭

#### 1.2 서비스 설정

**서비스 설정** (Settings 탭):
- **Root Directory**: `server`
- **Start Command**: `npm start`
- **Build Command**: (비워두기)

#### 1.3 PostgreSQL 데이터베이스 생성

1. **New** → **Database** → **PostgreSQL** 선택
2. 데이터베이스 생성 완료 대기
3. **Variables** 탭에서 `DATABASE_URL` 복사

#### 1.4 환경 변수 설정

백엔드 서비스의 **Variables** 탭에서:

```
DATABASE_URL=<PostgreSQL의 DATABASE_URL>
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173
```

⚠️ **주의**: Vercel URL은 나중에 추가합니다.

#### 1.5 배포 확인

- 배포 완료 후 Railway에서 제공하는 URL 확인
- 예: `https://your-app.railway.app`
- 로그에서 "✅ PostgreSQL 데이터베이스 연결 성공" 확인

---

### 2단계: 데이터베이스 마이그레이션

pgAdmin4에서:

1. Query Tool 열기
2. `database/create_tables.sql` 실행 (F5)
3. `database/migrate_improvements.sql` 실행 (F5)

**확인 쿼리**:
```sql
-- 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'selection_history';

-- 뷰 확인
SELECT viewname FROM pg_views 
WHERE schemaname = 'public' AND viewname = 'selection_history_detail';

-- 트리거 확인
SELECT trigger_name FROM information_schema.triggers
WHERE trigger_schema = 'public';
```

---

### 3단계: Vercel 프론트엔드 배포

#### 3.1 Vercel 프로젝트 생성

1. **Vercel 대시보드 접속**: https://vercel.com
2. **Add New** → **Project** 클릭
3. **GitHub 저장소** 선택
4. **Import** 클릭

#### 3.2 프로젝트 설정

**Configure Project**:
- **Framework Preset**: Vite (자동 감지)
- **Root Directory**: `.` (루트)
- **Build Command**: `npm run build`
- **Output Directory**: `dist`

#### 3.3 환경 변수 설정

**Environment Variables**:
```
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_USE_MOCK_DATA=false
```

⚠️ **중요**: `your-railway-app.railway.app`을 1단계에서 확인한 Railway URL로 변경하세요.

#### 3.4 배포

- **Deploy** 버튼 클릭
- 배포 완료 후 Vercel URL 확인
- 예: `https://your-app.vercel.app`

---

### 4단계: CORS 설정 업데이트

Railway 백엔드의 환경 변수 업데이트:

1. Railway 대시보드 → 백엔드 서비스 → **Variables** 탭
2. `ALLOWED_ORIGINS` 수정:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
   ```
3. 서비스 자동 재배포됨 (또는 수동 재배포)

---

### 5단계: 테스트

#### 5.1 백엔드 API 테스트

```bash
# 로컬에서 테스트
node scripts/test-api.js https://your-railway-app.railway.app

# 또는 브라우저에서
https://your-railway-app.railway.app/api
```

**예상 결과**:
- Health Check: ✅ 성공
- 능력단위 검색: ✅ 성공
- 추천 API: ✅ 성공

#### 5.2 프론트엔드 테스트

1. Vercel URL 접속
2. 개발자 도구 (F12) → **Network** 탭
3. 추천 기능 테스트:
   - 산업분야: "제조업"
   - 부서: "품질관리"
   - 검색 클릭
4. API 요청 확인:
   - `/api/recommendations?industry=...&department=...`
   - 응답 상태: 200 OK
   - CORS 오류 없음

---

## 🔍 배포 후 확인 사항

### Railway 백엔드
- [ ] 로그에서 데이터베이스 연결 성공
- [ ] `/api` 엔드포인트 응답 확인
- [ ] `/api/recommendations` 엔드포인트 동작 확인

### Vercel 프론트엔드
- [ ] 빌드 성공
- [ ] 페이지 로드 정상
- [ ] API 호출 성공
- [ ] CORS 오류 없음

### 데이터베이스
- [ ] 테이블 생성 확인
- [ ] 뷰 생성 확인
- [ ] 트리거 생성 확인

---

## 🐛 문제 해결

### CORS 오류
- Railway `ALLOWED_ORIGINS`에 Vercel URL 포함 확인
- 환경 변수 업데이트 후 재배포 확인

### 데이터베이스 연결 실패
- Railway PostgreSQL 서비스 실행 중 확인
- `DATABASE_URL` 환경 변수 확인

### 빌드 실패
- Node.js 버전 확인 (18 이상)
- `package.json` 스크립트 확인
- 로그에서 구체적인 오류 확인

---

## 📞 빠른 참조

```bash
# Railway 백엔드 URL
https://your-app.railway.app

# Vercel 프론트엔드 URL  
https://your-app.vercel.app

# API 테스트
node scripts/test-api.js https://your-app.railway.app
```

---

## ✅ 배포 완료 체크리스트

- [ ] Railway 백엔드 배포 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Vercel 프론트엔드 배포 완료
- [ ] CORS 설정 업데이트 완료
- [ ] 백엔드 API 테스트 성공
- [ ] 프론트엔드 테스트 성공
- [ ] 추천 기능 정상 작동

배포가 완료되면 위 체크리스트를 확인하세요!

