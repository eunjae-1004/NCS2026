# 🚀 배포 체크리스트

## ✅ 배포 전 확인 사항

### 코드 상태
- [x] 프론트엔드 빌드 성공 ✅
- [x] TypeScript 컴파일 오류 없음 ✅
- [x] 린터 오류 없음 ✅
- [x] 검색 기능 개선 완료 ✅
- [x] 직무 검색 기능 개선 완료 ✅
- [x] 추천 검색 기능 개선 완료 ✅
- [x] 선택목록 담기 기능 개선 완료 ✅
- [x] 키워드 검색 NULL 처리 개선 완료 ✅

### 배포 준비
- [ ] Railway 계정 준비
- [ ] Vercel 계정 준비
- [ ] GitHub 저장소 연결 준비

---

## 📋 배포 단계

### 1단계: Railway 백엔드 배포

#### 1.1 Railway 프로젝트 생성
1. https://railway.app 접속
2. **New Project** 클릭
3. **Deploy from GitHub repo** 선택
4. 저장소 선택 후 **Deploy**

#### 1.2 서비스 설정
**Settings** 탭에서:
- **Root Directory**: `server`
- **Start Command**: `npm start`
- **Build Command**: (비워두기)

#### 1.3 PostgreSQL 데이터베이스 생성
1. **New** → **Database** → **PostgreSQL** 선택
2. 데이터베이스 생성 완료 대기
3. **Variables** 탭에서 `DATABASE_URL` 복사

#### 1.4 환경 변수 설정
백엔드 서비스의 **Variables** 탭에서 추가:

```
DATABASE_URL=<PostgreSQL의 DATABASE_URL>
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=http://localhost:5173
```

⚠️ **주의**: Vercel URL은 3단계 후에 추가합니다.

#### 1.5 배포 확인
- 배포 완료 후 Railway URL 확인 (예: `https://your-app.railway.app`)
- 로그에서 "✅ PostgreSQL 데이터베이스 연결 성공" 확인

---

### 2단계: 데이터베이스 마이그레이션

#### 방법 1: pgAdmin4 사용
1. Railway PostgreSQL의 연결 정보 확인
2. pgAdmin4에서 연결
3. Query Tool 열기
4. `database/create_tables.sql` 실행
5. `database/migrate_improvements.sql` 실행

#### 방법 2: Railway CLI 사용
```bash
railway connect postgres < database/create_tables.sql
railway connect postgres < database/migrate_improvements.sql
```

#### 확인 쿼리
```sql
-- 테이블 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 뷰 확인
SELECT viewname FROM pg_views 
WHERE schemaname = 'public';
```

---

### 3단계: Vercel 프론트엔드 배포

#### 3.1 Vercel 프로젝트 생성
1. https://vercel.com 접속
2. **Add New** → **Project** 클릭
3. GitHub 저장소 선택
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
- 배포 완료 후 Vercel URL 확인 (예: `https://your-app.vercel.app`)

---

### 4단계: CORS 설정 업데이트

Railway 백엔드의 환경 변수 업데이트:

1. Railway 대시보드 → 백엔드 서비스 → **Variables** 탭
2. `ALLOWED_ORIGINS` 수정:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
   ```
3. 서비스 자동 재배포됨

---

### 5단계: 테스트

#### 백엔드 API 테스트
```bash
# Health Check
curl https://your-railway-app.railway.app/api

# 추천 API 테스트
curl "https://your-railway-app.railway.app/api/recommendations?industry=제조업&department=품질관리"
```

#### 프론트엔드 테스트
1. Vercel URL 접속
2. 개발자 도구 (F12) → Network 탭
3. 기능 테스트:
   - 검색 기능
   - 추천 기능
   - 선택목록 담기
4. API 요청 확인:
   - 응답 상태: 200 OK
   - CORS 오류 없음

---

## 🔍 배포 후 확인 사항

### Railway 백엔드
- [ ] 로그에서 데이터베이스 연결 성공
- [ ] `/api` 엔드포인트 응답 확인
- [ ] `/api/recommendations` 동작 확인
- [ ] `/api/ability-units` 동작 확인

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
- 로그에서 구체적인 오류 메시지 확인

### 빌드 실패
- Node.js 버전 확인 (18 이상)
- `package.json` 스크립트 확인
- 로그에서 구체적인 오류 확인

### API 응답 오류
- Railway 로그 확인
- 데이터베이스 연결 상태 확인
- 환경 변수 설정 확인

---

## 📞 빠른 참조

### Railway 백엔드
- URL: `https://your-app.railway.app`
- API 엔드포인트: `https://your-app.railway.app/api`

### Vercel 프론트엔드
- URL: `https://your-app.vercel.app`

### 환경 변수 템플릿

**Railway (백엔드)**:
```
DATABASE_URL=<PostgreSQL DATABASE_URL>
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

**Vercel (프론트엔드)**:
```
VITE_API_BASE_URL=https://your-railway-app.railway.app/api
VITE_USE_MOCK_DATA=false
```

---

## ✅ 최종 체크리스트

- [ ] Railway 백엔드 배포 완료
- [ ] 데이터베이스 마이그레이션 완료
- [ ] Vercel 프론트엔드 배포 완료
- [ ] CORS 설정 업데이트 완료
- [ ] 백엔드 API 테스트 성공
- [ ] 프론트엔드 테스트 성공
- [ ] 검색 기능 정상 작동
- [ ] 추천 기능 정상 작동
- [ ] 선택목록 기능 정상 작동

배포가 완료되면 위 체크리스트를 확인하세요! 🎉
