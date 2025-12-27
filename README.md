# NCS 능력단위 검색 시스템

NCS(National Competency Standards) 능력단위를 검색하고 관리하는 웹 애플리케이션입니다.

## 주요 기능

- 🔍 능력단위 검색 (키워드, 필터 기반)
- 👤 사용자 인증 (회원가입, 로그인, Guest 모드)
- 📋 선택목록 관리
- 💾 선택목록 세트 저장/불러오기
- 📊 추천 능력단위 조회

## 기술 스택

### Frontend
- React + TypeScript
- Vite
- Zustand (상태 관리)
- React Router DOM
- Tailwind CSS
- Lucide React (아이콘)

### Backend
- Node.js + Express
- PostgreSQL
- Railway (배포)

### 배포
- Vercel (프론트엔드)
- Railway (백엔드, 데이터베이스)

## 빠른 시작

### 1. 저장소 클론

```bash
git clone https://github.com/your-username/ncssearch2026.git
cd ncssearch2026
```

### 2. 프론트엔드 설정

```bash
# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env
# .env 파일에서 VITE_API_BASE_URL 설정

# 개발 서버 실행
npm run dev
```

### 3. 백엔드 설정

```bash
cd server

# 의존성 설치
npm install

# 환경 변수 설정
cp env.example .env
# .env 파일에서 데이터베이스 연결 정보 설정

# 서버 실행
npm start
```

### 4. 데이터베이스 설정

```bash
# PostgreSQL 접속 후
psql -U postgres -d railway

# 테이블 생성
\i database/create_tables.sql

# 초기 데이터 삽입 (선택사항)
\i database/init.sql
```

## 환경 변수

### 프론트엔드 (.env)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

### 백엔드 (server/.env)

```env
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=railway
DB_USER=postgres
DB_PASSWORD=your_password
ALLOWED_ORIGINS=http://localhost:5173
```

## 배포

자세한 배포 가이드는 `DEPLOYMENT_GUIDE.md`를 참고하세요.

### Vercel (프론트엔드)

1. GitHub 저장소 연결
2. 환경 변수 설정:
   - `VITE_API_BASE_URL`: Railway 백엔드 URL
   - `VITE_USE_MOCK_DATA`: `false`
3. 배포

### Railway (백엔드)

1. PostgreSQL 서비스 추가
2. Express 서비스 추가
3. 환경 변수 설정
4. 배포

## 프로젝트 구조

```
ncssearch2026/
├── src/                 # 프론트엔드 소스 코드
│   ├── components/      # React 컴포넌트
│   ├── pages/          # 페이지 컴포넌트
│   ├── services/       # API 서비스
│   ├── store/          # 상태 관리 (Zustand)
│   └── types/          # TypeScript 타입 정의
├── server/              # 백엔드 서버
│   ├── routes/         # API 라우트
│   └── db.js           # 데이터베이스 연결
├── database/            # 데이터베이스 스크립트
│   ├── create_tables.sql  # 테이블 생성
│   └── init.sql        # 초기 데이터
└── docs/               # 문서 모음
```

## 문서

- `DEPLOYMENT_GUIDE.md` - 배포 가이드
- `QUICK_START.md` - 빠른 시작 가이드
- `API_DOCUMENTATION.md` - API 문서
- `database/README.md` - 데이터베이스 가이드
- `docs/` - 트러블슈팅 및 문제 해결 가이드

## 라이선스

MIT
