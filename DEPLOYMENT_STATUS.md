# 🚀 배포 상태 및 다음 단계

## ✅ Git 푸시 완료

모든 변경사항이 GitHub에 푸시되었습니다:
- 저장소: https://github.com/eunjae-1004/NCS2026.git
- 브랜치: `main`

## 📋 배포 단계

### 1단계: Railway 백엔드 배포

#### Railway 대시보드에서:

1. **접속**: https://railway.app
2. **프로젝트 선택** 또는 **New Project** 생성
3. **GitHub Repo 연결**:
   - **New** → **GitHub Repo** 선택
   - 저장소: `eunjae-1004/NCS2026` 선택
   - **Deploy** 클릭

4. **서비스 설정** (Settings 탭):
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
   - **Build Command**: (비워두기)

5. **PostgreSQL 데이터베이스 생성**:
   - **New** → **Database** → **PostgreSQL** 선택
   - 생성 완료 대기
   - **Variables** 탭에서 `DATABASE_URL` 복사

6. **환경 변수 설정** (백엔드 서비스의 Variables 탭):
   ```
   DATABASE_URL=<PostgreSQL의 DATABASE_URL>
   PORT=3000
   NODE_ENV=production
   ALLOWED_ORIGINS=http://localhost:5173
   ```

7. **배포 확인**:
   - 배포 완료 후 Railway URL 확인 (예: `https://your-app.railway.app`)
   - 로그에서 "✅ PostgreSQL 데이터베이스 연결 성공" 확인

---

### 2단계: 데이터베이스 마이그레이션

pgAdmin4에서 Query Tool 열고:

1. `database/create_tables.sql` 실행 (F5)
2. `database/migrate_improvements.sql` 실행 (F5)

**확인**:
```sql
-- 뷰 확인
SELECT viewname FROM pg_views WHERE schemaname = 'public';

-- 트리거 확인  
SELECT trigger_name FROM information_schema.triggers WHERE trigger_schema = 'public';
```

---

### 3단계: Vercel 프론트엔드 배포

#### Vercel 대시보드에서:

1. **접속**: https://vercel.com
2. **New Project** 클릭
3. **GitHub 저장소 선택**: `eunjae-1004/NCS2026`
4. **Import** 클릭

5. **프로젝트 설정**:
   - Framework Preset: **Vite** (자동 감지)
   - Root Directory: `.` (루트)
   - Build Command: `npm run build`
   - Output Directory: `dist`

6. **환경 변수 설정** (Settings → Environment Variables):
   ```
   VITE_API_BASE_URL=https://your-railway-app.railway.app/api
   VITE_USE_MOCK_DATA=false
   ```
   ⚠️ `your-railway-app.railway.app`을 1단계에서 확인한 Railway URL로 변경

7. **Deploy** 클릭

---

### 4단계: CORS 설정 업데이트

Vercel URL 확인 후, Railway 백엔드의 환경 변수 업데이트:

1. Railway 대시보드 → 백엔드 서비스 → **Variables** 탭
2. `ALLOWED_ORIGINS` 수정:
   ```
   ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
   ```
3. 자동 재배포 확인

---

## 🧪 배포 후 테스트

### 백엔드 API 테스트

```bash
# 로컬에서 테스트
node scripts/test-api.js https://your-railway-app.railway.app

# 또는 브라우저에서
https://your-railway-app.railway.app/api
```

### 프론트엔드 테스트

1. Vercel URL 접속
2. 개발자 도구 (F12) → Network 탭
3. 추천 기능 테스트:
   - 산업분야: "제조업"
   - 부서: "품질관리"
   - 검색 클릭
4. API 요청 확인:
   - `/api/recommendations?industry=...&department=...`
   - 상태: 200 OK
   - CORS 오류 없음

---

## 📊 배포 확인 체크리스트

### Railway 백엔드
- [ ] 배포 완료
- [ ] 데이터베이스 연결 성공 (로그 확인)
- [ ] `/api` 엔드포인트 응답 확인
- [ ] `/api/recommendations` 동작 확인

### 데이터베이스
- [ ] `create_tables.sql` 실행 완료
- [ ] `migrate_improvements.sql` 실행 완료
- [ ] 뷰 생성 확인
- [ ] 트리거 생성 확인

### Vercel 프론트엔드
- [ ] 배포 완료
- [ ] 빌드 성공
- [ ] 페이지 로드 정상
- [ ] API 호출 성공
- [ ] CORS 오류 없음

---

## 🔗 빠른 링크

- **GitHub 저장소**: https://github.com/eunjae-1004/NCS2026
- **Railway 대시보드**: https://railway.app
- **Vercel 대시보드**: https://vercel.com

---

## 📝 참고 문서

- `DEPLOYMENT_STEPS.md` - 상세 배포 가이드
- `DEPLOY_NOW.md` - 빠른 배포 가이드
- `docs/DEPLOY_CHECKLIST.md` - 배포 전 체크리스트
- `docs/PGADMIN4_GUIDE.md` - pgAdmin4 사용 가이드

---

배포가 완료되면 위 체크리스트를 확인하고 테스트하세요! 🎉

