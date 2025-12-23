# 빠른 배포 가이드

이 가이드는 최소한의 설정으로 애플리케이션을 배포하는 방법을 안내합니다.

## 배포 순서 (중요!)

**반드시 다음 순서로 진행하세요:**

1. ✅ **GitHub에 코드 푸시** (먼저!)
2. ✅ **Railway에 백엔드 배포** (GitHub 저장소 연결)
3. ✅ **Vercel에 프론트엔드 배포** (GitHub 저장소 연결)
4. ✅ **데이터베이스 설정**

## 사전 준비

1. **GitHub 저장소 생성 및 코드 푸시**
   ```bash
   # Git 초기화 (아직 안 했다면)
   git init
   git add .
   git commit -m "Initial commit"
   
   # GitHub 저장소 생성 후
   git remote add origin https://github.com/yourusername/ncssearch2026.git
   git push -u origin main
   ```

2. **계정 생성**
   - Vercel: https://vercel.com
   - Railway: https://railway.app

## 5분 배포 (Vercel + Railway)

### 1. Railway에 백엔드 배포 (2분)

⚠️ **먼저 GitHub에 코드를 푸시했는지 확인하세요!**

1. Railway 접속 → "New Project" → "Deploy from GitHub repo"
2. **GitHub 저장소 선택** (이미 푸시된 저장소)
3. "Add PostgreSQL" 클릭 (데이터베이스 자동 생성)
4. 서비스 설정:
   - **Root Directory**: `server`
   - **Start Command**: `npm start`
5. 환경 변수 자동 설정됨 (PostgreSQL 연결 정보)
6. 배포 완료 후 URL 복사 (예: `https://xxx.railway.app`)

### 2. Vercel에 프론트엔드 배포 (2분)

⚠️ **먼저 GitHub에 코드를 푸시했는지 확인하세요!**

1. Vercel 접속 → "Add New Project"
2. **GitHub 저장소 선택** (이미 푸시된 저장소)
3. 프로젝트 설정:
   - **Framework Preset**: Vite (자동 감지)
   - **Root Directory**: `.`
   - **Build Command**: `npm run build` (자동)
   - **Output Directory**: `dist` (자동)
4. 환경 변수 추가:
   - **Key**: `VITE_API_BASE_URL`
   - **Value**: `https://xxx.railway.app/api` (Railway에서 복사한 URL)
5. "Deploy" 클릭

### 3. 데이터베이스 설정 (1분)

Railway PostgreSQL에 접속하여 스키마 생성:

```sql
-- Railway 대시보드에서 제공하는 psql 명령어 사용
-- 또는 Railway CLI: railway connect

-- 스키마 생성
\i database/schema.sql

-- 초기 데이터 (선택사항)
\i database/init.sql
```

## 배포 확인

1. **백엔드 확인**: `https://xxx.railway.app/api`
2. **프론트엔드 확인**: Vercel에서 제공하는 URL
3. **연결 확인**: 프론트엔드에서 검색 기능 테스트

## 문제 해결

### CORS 오류

Railway 백엔드 환경 변수에 추가:
```
ALLOWED_ORIGINS=https://your-vercel-app.vercel.app,http://localhost:5173
```

### 데이터베이스 연결 실패

Railway 대시보드에서 PostgreSQL 서비스의 연결 정보 확인:
- Variables 탭에서 `DATABASE_URL` 또는 개별 변수 확인

## 다음 단계

- [ ] 커스텀 도메인 연결
- [ ] SSL 인증서 확인 (자동 설정됨)
- [ ] 모니터링 설정
- [ ] 백업 전략 수립

## 비용

- **Vercel**: 무료 (개인 프로젝트)
- **Railway**: $5 크레딧/월 (무료 체험)

## 상세 가이드

더 자세한 내용은 `DEPLOYMENT_GUIDE.md`를 참고하세요.

