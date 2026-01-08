# NCS 능력단위 검색 시스템 - 프로젝트 구조 설명

## 📁 전체 폴더 구조

```
ncssearch2026/
├── src/                    # 프론트엔드 소스 코드 (React + TypeScript)
│   ├── components/         # 재사용 가능한 React 컴포넌트
│   ├── pages/             # 페이지 컴포넌트 (라우트별)
│   ├── services/          # API 통신 및 비즈니스 로직
│   ├── store/             # 전역 상태 관리 (Zustand)
│   ├── types/             # TypeScript 타입 정의
│   ├── hooks/             # 커스텀 React 훅
│   ├── utils/             # 유틸리티 함수
│   ├── App.tsx            # 메인 앱 컴포넌트 (라우팅 설정)
│   ├── main.tsx           # React 앱 진입점
│   └── index.css          # 전역 스타일
│
├── server/                 # 백엔드 서버 (Node.js + Express)
│   ├── routes/            # API 라우트 핸들러
│   ├── db.js              # 데이터베이스 연결 및 쿼리 헬퍼
│   ├── index.js           # Express 서버 진입점
│   └── package.json       # 백엔드 의존성
│
├── database/               # 데이터베이스 스크립트
│   ├── create_tables.sql  # 테이블 생성 스크립트
│   ├── init.sql           # 초기 데이터 삽입
│   └── *.sql              # 유지보수 및 최적화 쿼리
│
├── docs/                   # 문서 모음 (트러블슈팅 가이드)
├── dist/                   # 빌드 결과물 (프로덕션)
├── node_modules/          # 프론트엔드 의존성
│
├── package.json           # 프론트엔드 의존성 및 스크립트
├── vite.config.ts         # Vite 빌드 설정
├── tsconfig.json          # TypeScript 설정
├── tailwind.config.js     # Tailwind CSS 설정
└── vercel.json            # Vercel 배포 설정
```

---

## 🎯 주요 디렉토리 상세 설명

### 1. `src/` - 프론트엔드 소스 코드

#### `src/components/` - 재사용 컴포넌트
- **ErrorBoundary.tsx**: React 에러 바운더리 (예외 처리)
- **ErrorMessage.tsx**: 에러 메시지 표시 컴포넌트
- **Layout.tsx**: 공통 레이아웃 (헤더, 네비게이션)
- **Loading.tsx**: 로딩 스피너 컴포넌트
- **Pagination.tsx**: 페이지네이션 컴포넌트

#### `src/pages/` - 페이지 컴포넌트
- **LoginPage.tsx**: 로그인/회원가입 페이지
- **HomePage.tsx**: 홈 페이지 (검색 시작)
- **SearchInputPage.tsx**: 검색 입력 페이지
- **SearchResultsPage.tsx**: 검색 결과 목록 페이지
- **AbilityDetailPage.tsx**: 능력단위 상세 정보 페이지
- **CartPage.tsx**: 선택목록(장바구니) 관리 페이지
- **RecommendationPage.tsx**: 추천 능력단위 페이지

#### `src/services/` - API 통신 레이어
- **api.ts**: 
  - HTTP 클라이언트 (`fetchApi` 함수)
  - API 응답 표준화 (`{success, data}` 형태)
  - 에러 처리 및 네트워크 오류 처리
  - 모든 API 엔드포인트 함수 정의
  
- **apiService.ts**: 
  - 비즈니스 로직 레이어
  - Mock 데이터 모드 지원
  - API 호출 래퍼 함수들
  - 에러 메시지 개선
  
- **mockData.ts**: 
  - 개발용 Mock 데이터
  - 데이터베이스 없이 프론트엔드 개발 가능

#### `src/store/` - 전역 상태 관리
- **useStore.ts**: 
  - Zustand 스토어 정의
  - 사용자 정보 (`user`)
  - 검색 필터 (`filters`)
  - 선택목록 (`cart`)
  - 선택목록 세트 (`cartSets`)
  - localStorage 연동

#### `src/types/` - TypeScript 타입 정의
- **index.ts**: 
  - 모든 인터페이스 및 타입 정의
  - `User`, `AbilityUnit`, `CartItem`, `SearchFilters` 등

#### `src/hooks/` - 커스텀 훅
- **useAsync.ts**: 
  - 비동기 함수 실행 훅
  - 로딩, 에러, 데이터 상태 관리
  - `onSuccess`, `onError` 콜백 지원

#### `src/utils/` - 유틸리티
- **constants.ts**: 상수 정의

#### `src/App.tsx` - 메인 앱 컴포넌트
- React Router 설정
- 라우트 정의 (`/login`, `/`, `/search`, `/results` 등)
- ErrorBoundary로 전체 앱 감싸기

#### `src/main.tsx` - React 진입점
- React 앱을 DOM에 마운트
- React.StrictMode 활성화

---

### 2. `server/` - 백엔드 서버

#### `server/index.js` - Express 서버 진입점
- Express 앱 초기화
- CORS 설정 (프론트엔드 도메인 허용)
- 미들웨어 설정 (JSON 파싱)
- 라우트 등록
- 데이터베이스 연결 확인
- Mock 데이터 모드 지원 (DB 연결 실패 시)

#### `server/db.js` - 데이터베이스 연결
- PostgreSQL 연결 풀 생성
- `query()`: 쿼리 실행 헬퍼
- `transaction()`: 트랜잭션 헬퍼
- 연결 에러 처리

#### `server/routes/` - API 라우트 핸들러
- **auth.js**: 
  - `/api/auth/register` - 회원가입
  - `/api/auth/login` - 로그인
  - 비밀번호 해시 (SHA-256)
  
- **organizations.js**: 
  - `/api/organizations` - 기관 목록 조회
  
- **abilityUnits.js**: 
  - `/api/ability-units` - 능력단위 검색
  - 필터링, 페이지네이션 지원
  
- **cart.js**: 
  - `/api/cart` - 선택목록 관리 (추가, 삭제, 조회)
  
- **cartSets.js**: 
  - `/api/cart-sets` - 선택목록 세트 관리 (저장, 불러오기, 삭제)
  
- **history.js**: 
  - `/api/history` - 선택 이력 조회
  
- **recommendations.js**: 
  - `/api/recommendations` - 추천 능력단위 조회
  
- **alias.js**: 
  - `/api/alias` - 별칭 매핑 (검색어 정규화)
  
- **standardCodes.js**: 
  - `/api/standard-codes` - 표준 코드 조회

---

### 3. `database/` - 데이터베이스 스크립트

#### `database/create_tables.sql`
- 모든 테이블 생성 스크립트
- 인덱스 생성
- 트리거 함수 정의
- 뷰 생성

**주요 테이블:**
- `ncs_main`: 능력단위 메인 데이터
- `unit_definition`: 능력단위 정의
- `performance_criteria`: 수행준거
- `ksa`: 지식/기술/태도
- `users`: 사용자 정보
- `organizations`: 기관 정보
- `cart_items`: 선택목록 아이템
- `cart_sets`: 선택목록 세트
- `selection_history`: 선택 이력

#### `database/init.sql`
- 초기 데이터 삽입 (기관, 표준 코드 등)

#### 기타 SQL 파일
- `check_*.sql`: 데이터 분석 쿼리
- `cleanup_*.sql`: 데이터 정리 쿼리
- `optimize_*.sql`: 최적화 쿼리

---

### 4. 루트 파일들

#### `package.json` (프론트엔드)
- **의존성:**
  - `react`, `react-dom`: React 라이브러리
  - `react-router-dom`: 라우팅
  - `zustand`: 상태 관리
  - `lucide-react`: 아이콘
  - `xlsx`: Excel 파일 처리
  
- **스크립트:**
  - `npm run dev`: 개발 서버 실행 (Vite)
  - `npm run build`: 프로덕션 빌드
  - `npm run preview`: 빌드 결과 미리보기

#### `vite.config.ts`
- Vite 빌드 설정
- React 플러그인
- 개발 서버 프록시 설정 (`/api` → `http://localhost:3000`)

#### `tsconfig.json`
- TypeScript 컴파일러 설정
- 경로 별칭 설정

#### `tailwind.config.js`
- Tailwind CSS 설정
- 커스텀 색상, 폰트 등

#### `vercel.json`
- Vercel 배포 설정
- 리다이렉트 규칙

#### `env.example`
- 환경 변수 예시 파일
- `VITE_API_BASE_URL`: 백엔드 API URL
- `VITE_USE_MOCK_DATA`: Mock 데이터 사용 여부

---

## 🔄 데이터 흐름

### 1. 사용자 인증 흐름
```
LoginPage → apiService.register() → api.register() 
→ fetchApi('/auth/register') → server/routes/auth.js 
→ PostgreSQL (users 테이블) → 응답 → useStore.setUser()
```

### 2. 검색 흐름
```
SearchInputPage → useStore.setFilters() → SearchResultsPage 
→ apiService.searchAbilityUnits() → api.searchAbilityUnits() 
→ fetchApi('/ability-units?keyword=...') → server/routes/abilityUnits.js 
→ PostgreSQL (ncs_main, unit_definition 조인) → 응답 → 결과 표시
```

### 3. 선택목록 추가 흐름
```
AbilityDetailPage → useStore.addToCart() → apiService.addCartItem() 
→ api.addCartItem() → fetchApi('/cart') → server/routes/cart.js 
→ PostgreSQL (cart_items 테이블) → 응답 → useStore.cart 업데이트
```

---

## 🛠 기술 스택 요약

### 프론트엔드
- **React 18**: UI 라이브러리
- **TypeScript**: 타입 안정성
- **Vite**: 빌드 도구 (빠른 개발 서버)
- **Zustand**: 경량 상태 관리
- **React Router**: 클라이언트 사이드 라우팅
- **Tailwind CSS**: 유틸리티 기반 CSS
- **Lucide React**: 아이콘 라이브러리

### 백엔드
- **Node.js**: JavaScript 런타임
- **Express**: 웹 프레임워크
- **PostgreSQL**: 관계형 데이터베이스
- **pg (node-postgres)**: PostgreSQL 클라이언트

### 배포
- **Vercel**: 프론트엔드 배포 (자동 CI/CD)
- **Railway**: 백엔드 및 데이터베이스 배포

---

## 📝 주요 설계 패턴

### 1. **계층화 아키텍처**
- **Presentation Layer**: `pages/`, `components/`
- **Business Logic Layer**: `services/apiService.ts`
- **Data Access Layer**: `services/api.ts`, `server/routes/`
- **Database Layer**: `server/db.js`, PostgreSQL

### 2. **관심사 분리**
- API 통신 로직은 `services/`에 분리
- 상태 관리는 `store/`에 중앙화
- 타입 정의는 `types/`에 통합

### 3. **에러 처리**
- `ErrorBoundary`로 React 에러 캐치
- `fetchApi`에서 네트워크 에러 처리
- API 응답 표준화 (`{success, data}`)

### 4. **개발 편의성**
- Mock 데이터 모드 지원 (DB 없이 개발 가능)
- 환경 변수로 API URL 관리
- TypeScript로 타입 안정성 보장

---

## 🚀 실행 순서

### 개발 환경
1. 프론트엔드: `npm install` → `npm run dev` (포트 5173)
2. 백엔드: `cd server` → `npm install` → `npm start` (포트 3000)
3. 데이터베이스: PostgreSQL 실행 → `database/create_tables.sql` 실행

### 프로덕션 배포
1. **Vercel**: GitHub 연결 → 환경 변수 설정 → 자동 배포
2. **Railway**: PostgreSQL 서비스 추가 → Express 서비스 추가 → 환경 변수 설정 → 배포

---

이 문서는 프로젝트의 전체 구조와 각 파일의 역할을 설명합니다. 
특정 파일이나 기능에 대해 더 자세한 설명이 필요하면 알려주세요!

