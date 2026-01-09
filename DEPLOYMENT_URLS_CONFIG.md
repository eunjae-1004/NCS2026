# 🌐 배포 URL 설정 완료

## ✅ 기본 배포 URL 설정 완료

다음 파일들에 기본 배포 URL이 설정되었습니다:

### 1. 프론트엔드 환경 변수 예제 (`env.example`)
```env
VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app/api
```

### 2. 백엔드 환경 변수 예제 (`server/env.example`)
```env
ALLOWED_ORIGINS=https://ncssearch2026.vercel.app,http://localhost:5173,http://localhost:3000
```

### 3. API 서비스 기본값 (`src/services/api.ts`)
```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://ncssearch-backend-production.up.railway.app/api'
```

### 4. Vercel 설정 (`vercel.json`)
```json
{
  "env": {
    "VITE_API_BASE_URL": "https://ncssearch-backend-production.up.railway.app/api",
    "VITE_USE_MOCK_DATA": "false"
  }
}
```

---

## 📍 배포 URL

### Railway 백엔드
- **URL**: `https://ncssearch-backend-production.up.railway.app`
- **API 엔드포인트**: `https://ncssearch-backend-production.up.railway.app/api`

### Vercel 프론트엔드
- **URL**: `https://ncssearch2026.vercel.app`

---

## 🔧 환경 변수 설정

### 로컬 개발 환경

프로젝트 루트에 `.env` 파일 생성:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

### 프로덕션 환경

Vercel 대시보드에서 환경 변수 설정:
```env
VITE_API_BASE_URL=https://ncssearch-backend-production.up.railway.app/api
VITE_USE_MOCK_DATA=false
```

Railway 대시보드에서 환경 변수 설정:
```env
DATABASE_URL=<PostgreSQL DATABASE_URL>
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://ncssearch2026.vercel.app,http://localhost:5173
```

---

## ✅ 설정 완료 확인

- [x] `env.example`에 기본 배포 URL 설정
- [x] `server/env.example`에 CORS 설정
- [x] `src/services/api.ts`에 기본값 설정
- [x] `vercel.json`에 환경 변수 설정

---

## 🚀 배포 시

이제 GitHub에 푸시하면 자동으로 배포되며, 기본 배포 URL이 사용됩니다!
