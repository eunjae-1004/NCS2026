# 🌐 배포된 URL 주소

## 📍 확인된 배포 URL

### Railway 백엔드 (API 서버)
```
https://ncssearch-backend-production.up.railway.app
```

**API 엔드포인트**:
- Health Check: https://ncssearch-backend-production.up.railway.app/api
- 추천 API: https://ncssearch-backend-production.up.railway.app/api/recommendations
- 능력단위 검색: https://ncssearch-backend-production.up.railway.app/api/ability-units

### Vercel 프론트엔드 (웹 애플리케이션)
```
https://ncssearch2026.vercel.app
```
(또는 Vercel 대시보드에서 확인한 실제 URL)

---

## 🔍 URL 확인 방법

### Railway 백엔드 URL 확인

1. **Railway 대시보드 접속**: https://railway.app
2. **프로젝트 선택**
3. **백엔드 서비스** 클릭
4. **Settings** 탭 → **Networking** 섹션
5. **Public Domain** 또는 **Custom Domain** 확인

또는:
- 서비스 카드에서 **"..."** 메뉴 → **"Copy URL"**

### Vercel 프론트엔드 URL 확인

1. **Vercel 대시보드 접속**: https://vercel.com/dashboard
2. **프로젝트 선택** (`ncssearch2026` 또는 배포한 프로젝트명)
3. **프로젝트 대시보드 상단**에서 URL 확인
   - 형식: `https://프로젝트명.vercel.app`
   - 예: `https://ncssearch2026.vercel.app`

또는:
- **Settings** → **Domains** 탭에서 확인

---

## 🧪 테스트 방법

### 백엔드 API 테스트

```bash
# API 테스트 스크립트 실행
node scripts/test-api.js https://ncssearch-backend-production.up.railway.app

# 또는 브라우저에서 직접 확인
https://ncssearch-backend-production.up.railway.app/api
```

### 프론트엔드 테스트

1. Vercel URL 접속
2. 추천 기능 테스트:
   - 산업분야: "제조업"
   - 부서: "품질관리"
   - 검색 클릭
3. 개발자 도구 (F12) → Network 탭에서 API 요청 확인

---

## 📝 환경 변수 확인

### Railway 백엔드 환경 변수
- `DATABASE_URL`: PostgreSQL 연결 정보
- `PORT`: 3000
- `NODE_ENV`: production
- `ALLOWED_ORIGINS`: Vercel URL 포함 확인

### Vercel 프론트엔드 환경 변수
- `VITE_API_BASE_URL`: `https://ncssearch-backend-production.up.railway.app/api`
- `VITE_USE_MOCK_DATA`: false

---

## 🔗 빠른 링크

- **Railway 대시보드**: https://railway.app
- **Vercel 대시보드**: https://vercel.com/dashboard
- **GitHub 저장소**: https://github.com/eunjae-1004/NCS2026

---

## ⚠️ URL이 변경된 경우

만약 URL이 변경되었다면:

1. **Railway에서 새 URL 확인**
2. **Vercel 환경 변수 업데이트**:
   - `VITE_API_BASE_URL`을 새 Railway URL로 변경
3. **Railway CORS 업데이트**:
   - `ALLOWED_ORIGINS`에 Vercel URL 포함 확인

---

## ✅ 배포 상태 확인

### Railway 백엔드
- [ ] 서비스 실행 중
- [ ] 데이터베이스 연결 성공
- [ ] `/api` 엔드포인트 응답 확인

### Vercel 프론트엔드
- [ ] 배포 완료 (Ready 상태)
- [ ] 페이지 로드 정상
- [ ] API 호출 성공

---

위 URL로 접속하여 테스트할 수 있습니다! 🚀

