# 웹 배포 가이드

이 문서는 NCS 능력단위 검색 시스템을 웹에 배포하는 방법을 안내합니다.

## 배포 아키텍처

이 애플리케이션은 다음과 같이 구성됩니다:
- **프론트엔드**: React + Vite (정적 사이트)
- **백엔드**: Express.js API 서버
- **데이터베이스**: PostgreSQL

## 배포 옵션

### 옵션 1: Vercel (프론트엔드) + Railway (백엔드 + DB) - 추천 ⭐

**장점:**
- 무료 플랜 제공
- 자동 배포 (Git 연동)
- 간단한 설정
- 빠른 배포 속도

**단점:**
- Vercel은 서버리스 함수만 지원 (Express 서버는 별도 호스팅 필요)

### 옵션 2: Render (풀스택)

**장점:**
- 프론트엔드와 백엔드를 한 곳에서 관리
- PostgreSQL 데이터베이스 제공
- 무료 플랜 제공

**단점:**
- 무료 플랜은 15분 비활성 시 슬립 모드

### 옵션 3: Netlify (프론트엔드) + Railway (백엔드 + DB)

**장점:**
- Netlify는 정적 사이트 배포에 최적화
- 무료 플랜 제공

## 배포 방법 (옵션 1: Vercel + Railway)

## ⚠️ 중요: 배포 순서

**반드시 다음 순서로 진행해야 합니다:**

1. ✅ **1단계: GitHub에 코드 업로드** (먼저!)
2. ✅ **2단계: Railway에 백엔드 배포** (GitHub 저장소 연결)
3. ✅ **3단계: 데이터베이스 마이그레이션**
4. ✅ **4단계: Vercel에 프론트엔드 배포** (GitHub 저장소 연결)

### 1단계: GitHub에 코드 업로드 (필수!)

⚠️ **이 단계를 먼저 완료해야 Vercel과 Railway에서 저장소를 선택할 수 있습니다.**

```bash
# Git 초기화 (아직 안 했다면)
git init
git add .
git commit -m "Initial commit"

# GitHub 저장소 생성 후
git remote add origin https://github.com/yourusername/ncssearch2026.git
git push -u origin main
```

### 2단계: Railway에 백엔드 배포

⚠️ **1단계를 완료한 후 진행하세요.**

1. **Railway 계정 생성**: https://railway.app
2. **새 프로젝트 생성**: "New Project" → "Deploy from GitHub repo"
3. **저장소 선택**: GitHub 저장소 선택
4. **서비스 설정**:
   - Root Directory: `server`
   - Build Command: (없음, Node.js 프로젝트)
   - Start Command: `npm start`
5. **환경 변수 설정** (Railway 대시보드 → Variables):
   ```
   DB_HOST=your-railway-db-host
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=your-railway-db-password
   PORT=3000
   NODE_ENV=production
   ```
6. **PostgreSQL 데이터베이스 추가**:
   - Railway 대시보드 → "New" → "Database" → "PostgreSQL"
   - 생성된 데이터베이스의 연결 정보를 환경 변수에 설정

### 3단계: 데이터베이스 마이그레이션

Railway PostgreSQL에 접속하여 스키마 생성:

```bash
# Railway CLI 설치 (선택사항)
npm i -g @railway/cli

# Railway CLI로 데이터베이스 접속
railway connect

# 또는 psql로 직접 접속
psql $DATABASE_URL

# 스키마 생성
\i database/schema.sql

# 데이터 import (필요시)
\i database/import_data.sql
```

### 4단계: Vercel에 프론트엔드 배포

⚠️ **1단계(GitHub 푸시)와 2단계(Railway 배포)를 완료한 후 진행하세요.**

1. **Vercel 계정 생성**: https://vercel.com
2. **프로젝트 Import**: **GitHub 저장소 선택** (1단계에서 푸시한 저장소)
3. **프로젝트 설정**:
   - Framework Preset: Vite
   - Root Directory: `.` (루트)
   - Build Command: `npm run build`
   - Output Directory: `dist`
4. **환경 변수 설정** (Vercel 대시보드 → Settings → Environment Variables):
   ```
   VITE_API_BASE_URL=https://your-railway-app.railway.app/api
   VITE_USE_MOCK_DATA=false
   ```
   ⚠️ **중요**: 2단계에서 Railway에서 생성된 백엔드 URL을 `VITE_API_BASE_URL`에 설정하세요.

### 5단계: CORS 설정 확인

Railway 백엔드에서 Vercel 도메인을 허용하도록 CORS 설정:

`server/index.js`에서:
```javascript
app.use(cors({
  origin: [
    'https://your-vercel-app.vercel.app',
    'http://localhost:5173' // 개발용
  ]
}))
```

## 배포 방법 (옵션 2: Render)

### 1단계: Render에 프로젝트 배포

1. **Render 계정 생성**: https://render.com
2. **새 Web Service 생성**:
   - GitHub 저장소 연결
   - Name: `ncssearch-backend`
   - Environment: Node
   - Build Command: `cd server && npm install`
   - Start Command: `cd server && npm start`
   - Root Directory: `server`

3. **환경 변수 설정**:
   ```
   DB_HOST=your-db-host
   DB_PORT=5432
   DB_NAME=your-db-name
   DB_USER=your-db-user
   DB_PASSWORD=your-db-password
   PORT=3000
   NODE_ENV=production
   ```

4. **PostgreSQL 데이터베이스 생성**:
   - Render 대시보드 → "New" → "PostgreSQL"
   - 생성된 데이터베이스의 연결 정보를 환경 변수에 설정

5. **Static Site 생성** (프론트엔드):
   - Render 대시보드 → "New" → "Static Site"
   - Build Command: `npm install && npm run build`
   - Publish Directory: `dist`
   - 환경 변수:
     ```
     VITE_API_BASE_URL=https://your-backend.onrender.com/api
     VITE_USE_MOCK_DATA=false
     ```

### 2단계: 데이터베이스 마이그레이션

Render PostgreSQL에 접속하여 스키마 생성 (Render 대시보드에서 제공하는 psql 명령어 사용).

## 배포 후 확인 사항

### 1. 백엔드 API 확인

```bash
# Health check
curl https://your-backend-url/api

# API 테스트
curl https://your-backend-url/api/ability-units?keyword=품질
```

### 2. 프론트엔드 확인

- 브라우저에서 프론트엔드 URL 접속
- 개발자 도구 (F12) → Network 탭에서 API 요청 확인
- API 요청이 백엔드 URL로 전송되는지 확인

### 3. 데이터베이스 연결 확인

백엔드 로그에서 다음 메시지 확인:
```
✅ PostgreSQL 데이터베이스 연결 성공
📊 데이터베이스 모드로 API 서버 실행 중
```

## 환경 변수 요약

### 프론트엔드 (.env 또는 Vercel/Netlify 환경 변수)
```
VITE_API_BASE_URL=https://your-backend-url/api
VITE_USE_MOCK_DATA=false
```

### 백엔드 (Railway/Render 환경 변수)
```
DB_HOST=your-db-host
DB_PORT=5432
DB_NAME=your-db-name
DB_USER=postgres
DB_PASSWORD=your-password
PORT=3000
NODE_ENV=production
```

## 문제 해결

### CORS 오류

백엔드에서 프론트엔드 도메인을 CORS에 추가:
```javascript
app.use(cors({
  origin: ['https://your-frontend-domain.com']
}))
```

### 데이터베이스 연결 실패

1. 환경 변수 확인 (대소문자 주의)
2. 데이터베이스가 공개 접속 허용되어 있는지 확인
3. 방화벽 설정 확인

### 빌드 실패

1. `package.json`의 빌드 스크립트 확인
2. Node.js 버전 확인 (18 이상 권장)
3. 의존성 설치 확인 (`npm install`)

## 추가 최적화

### 1. 프로덕션 빌드 최적화

`vite.config.ts`에 프로덕션 최적화 설정 추가:
```typescript
export default defineConfig({
  plugins: [react()],
  build: {
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
  },
})
```

### 2. 환경별 설정

개발/프로덕션 환경에 따라 다른 API URL 사용:
```typescript
const API_BASE_URL = import.meta.env.PROD
  ? import.meta.env.VITE_API_BASE_URL
  : 'http://localhost:3000/api'
```

## 보안 고려사항

1. **환경 변수 보호**: `.env` 파일을 Git에 커밋하지 않기
2. **비밀번호 해싱**: 운영 환경에서는 bcrypt 사용 권장
3. **HTTPS 사용**: 모든 통신은 HTTPS로
4. **CORS 설정**: 필요한 도메인만 허용
5. **Rate Limiting**: API 요청 제한 설정 고려

## 비용 예상

### 무료 플랜
- **Vercel**: 무제한 (개인 프로젝트)
- **Railway**: $5 크레딧/월 (제한적)
- **Render**: 무료 (15분 비활성 시 슬립)

### 유료 플랜 (필요시)
- **Railway**: $5/월부터
- **Render**: $7/월부터

## 다음 단계

배포 완료 후:
1. 도메인 연결 (선택사항)
2. SSL 인증서 자동 설정 확인
3. 모니터링 설정
4. 백업 전략 수립

