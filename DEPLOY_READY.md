# 🚀 배포 준비 완료

## ✅ 배포 전 최종 확인

- [x] 프론트엔드 빌드 성공 ✅
- [x] 키워드 검색 기능 개선 완료 ✅
- [x] 기본 배포 URL 설정 완료 ✅
- [x] 모든 기능 개선 완료 ✅

---

## 📋 배포 방법

### 방법 1: GitHub 푸시로 자동 배포 (권장)

Railway와 Vercel이 GitHub와 연결되어 있으면 자동으로 배포됩니다.

```bash
# 변경사항 커밋 및 푸시
git add .
git commit -m "검색 기능 개선: 키워드 검색 NULL 처리 및 디버깅 로그 추가"
git push origin main
```

**자동 배포 확인:**
- Railway: https://railway.app → 프로젝트 → 배포 상태 확인
- Vercel: https://vercel.com/dashboard → 프로젝트 → 배포 상태 확인

---

### 방법 2: 수동 배포

#### Railway 백엔드 재배포

1. **Railway 대시보드**: https://railway.app
2. 프로젝트 선택
3. 백엔드 서비스 → **"Redeploy"** 클릭
4. 또는 **Settings** → **Deploy** → **Redeploy**

**환경 변수 확인:**
```
DATABASE_URL=<PostgreSQL DATABASE_URL>
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://ncssearch2026.vercel.app,http://localhost:5173
```

#### Vercel 프론트엔드 재배포

1. **Vercel 대시보드**: https://vercel.com/dashboard
2. 프로젝트 선택 (`ncssearch2026`)
3. **Deployments** 탭
4. 최신 배포의 **"..."** 메뉴 → **"Redeploy"**

**환경 변수 확인:**
```
VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app/api
VITE_USE_MOCK_DATA=false
```

---

## 🔍 배포 확인

### Railway 백엔드 테스트

```bash
# Health Check
curl https://ncssearch-backend-production.up.railway.app/api

# 키워드 검색 테스트
curl "https://ncssearch-backend-production.up.railway.app/api/ability-units?keyword=급여"
```

### Vercel 프론트엔드 테스트

1. https://ncssearch2026.vercel.app 접속
2. 키워드 검색 테스트: "급여" 입력
3. 개발자 도구 (F12) → Network 탭에서 API 요청 확인

---

## 📍 배포 URL

- **Railway 백엔드**: `https://ncssearch-backend-production.up.railway.app`
- **Vercel 프론트엔드**: `https://ncssearch2026.vercel.app`

---

## ✅ 배포 완료 체크리스트

- [ ] Railway 백엔드 배포 완료
- [ ] Vercel 프론트엔드 배포 완료
- [ ] Railway Health Check 성공
- [ ] 키워드 검색 테스트 성공 ("급여" 검색)
- [ ] CORS 오류 없음
- [ ] 검색 결과 정상 표시

---

배포 준비가 완료되었습니다! 🎉
