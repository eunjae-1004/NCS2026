# 🚀 빠른 배포 가이드

## ✅ 배포 준비 완료

- 프론트엔드 빌드 성공
- 모든 기능 개선 완료
- 키워드 검색 개선 완료

---

## 📋 배포 방법

### 방법 1: GitHub 푸시로 자동 배포 (권장)

#### 1. 코드 커밋 및 푸시
```bash
git add .
git commit -m "검색 기능 개선 및 키워드 검색 NULL 처리 개선"
git push origin main
```

#### 2. Railway 자동 배포
- Railway는 GitHub에 연결되어 있으면 자동으로 배포됩니다
- Railway 대시보드에서 배포 상태 확인

#### 3. Vercel 자동 배포
- Vercel도 GitHub에 연결되어 있으면 자동으로 배포됩니다
- Vercel 대시보드에서 배포 상태 확인

---

### 방법 2: 수동 배포

#### Railway 백엔드 배포

1. **Railway 대시보드 접속**: https://railway.app
2. 기존 프로젝트 선택 또는 새 프로젝트 생성
3. **서비스 설정 확인**:
   - Root Directory: `server`
   - Start Command: `npm start`
4. **환경 변수 확인**:
   ```
   DATABASE_URL=<PostgreSQL DATABASE_URL>
   PORT=3000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://ncssearch2026.vercel.app,http://localhost:5173
   ```
5. **재배포**: Deploy 버튼 클릭 또는 GitHub에서 새 커밋 푸시

#### Vercel 프론트엔드 배포

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. 프로젝트 선택 (`ncssearch2026`)
3. **환경 변수 확인**:
   ```
   VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app/api
   VITE_USE_MOCK_DATA=false
   ```
4. **재배포**: 
   - Deployments 탭 → 최신 배포의 "..." 메뉴 → "Redeploy"
   - 또는 GitHub에서 새 커밋 푸시

---

## 🔍 배포 확인

### Railway 백엔드 확인
```bash
# Health Check
curl https://ncssearch-backend-production.up.railway.app/api

# 키워드 검색 테스트
curl "https://ncssearch-backend-production.up.railway.app/api/ability-units?keyword=급여"
```

### Vercel 프론트엔드 확인
1. https://ncssearch2026.vercel.app 접속
2. 키워드 검색 테스트: "급여" 입력
3. 개발자 도구 (F12) → Network 탭에서 API 요청 확인

---

## ⚠️ 주의사항

1. **CORS 설정**: Railway의 `ALLOWED_ORIGINS`에 Vercel URL이 포함되어 있는지 확인
2. **환경 변수**: 배포 전 환경 변수가 올바르게 설정되어 있는지 확인
3. **데이터베이스**: Railway PostgreSQL이 실행 중인지 확인

---

## 🐛 문제 해결

### 배포 실패 시
1. Railway/Vercel 로그 확인
2. 환경 변수 재확인
3. 빌드 로그에서 오류 메시지 확인

### API 응답 오류 시
1. Railway 로그에서 데이터베이스 연결 확인
2. CORS 오류인지 확인
3. 환경 변수 `ALLOWED_ORIGINS` 확인

---

## ✅ 배포 완료 체크리스트

- [ ] Railway 백엔드 배포 완료
- [ ] Vercel 프론트엔드 배포 완료
- [ ] Railway Health Check 성공
- [ ] 키워드 검색 테스트 성공
- [ ] CORS 오류 없음

배포가 완료되면 위 체크리스트를 확인하세요! 🎉
