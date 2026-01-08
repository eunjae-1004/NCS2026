# 프로젝트 개발 요청 시 제시해야 할 정보 (템플릿)

동일한 개발 환경에서 다른 프로젝트를 개발할 때, 다음 정보를 제공하면 더 빠르고 정확한 개발이 가능합니다.

---

## 1. 프로젝트 기본 정보

### 프로젝트 구조
```
프로젝트명/
├── [백엔드 폴더]/     # 예: server/, backend/, api/
├── [프론트엔드 폴더]/  # 예: src/, frontend/, client/
├── [데이터베이스 폴더]/ # 예: database/, db/, migrations/
└── [기타 설정 파일]
```

**제시할 내용:**
- [ ] 프로젝트 루트 디렉토리 구조
- [ ] 백엔드 코드 위치
- [ ] 프론트엔드 코드 위치
- [ ] 데이터베이스 스키마 파일 위치
- [ ] 설정 파일 위치 (package.json, vite.config.ts 등)

---

## 2. 기술 스택 정보

### 백엔드
- [ ] **런타임**: Node.js 버전 (예: 18.x, 20.x)
- [ ] **모듈 시스템**: CommonJS 또는 ES Modules
- [ ] **프레임워크**: Express.js, Fastify, NestJS 등
- [ ] **데이터베이스**: PostgreSQL, MySQL, MongoDB 등
- [ ] **ORM/쿼리 빌더**: pg, Sequelize, Prisma, TypeORM 등
- [ ] **인증 방식**: JWT, Session, OAuth 등

### 프론트엔드
- [ ] **프레임워크**: React, Vue, Angular 등
- [ ] **빌드 도구**: Vite, Webpack, Create React App 등
- [ ] **언어**: JavaScript 또는 TypeScript
- [ ] **스타일링**: Tailwind CSS, CSS Modules, Styled Components 등
- [ ] **상태 관리**: Redux, Zustand, Context API 등

---

## 3. 배포 환경 정보

### Railway (백엔드)
- [ ] **Root Directory**: 백엔드 코드가 있는 폴더 (예: `server`)
- [ ] **Build Command**: 빌드가 필요한지, 필요하다면 명령어
- [ ] **Start Command**: 서버 시작 명령어 (예: `npm start`, `node index.js`)
- [ ] **Node.js 버전**: package.json의 engines 필드 또는 .nvmrc 파일

### Vercel (프론트엔드)
- [ ] **Framework Preset**: Vite, Next.js, Create React App 등
- [ ] **Build Command**: 기본값 사용 여부
- [ ] **Output Directory**: 빌드 결과물 폴더 (예: `dist`, `build`)
- [ ] **환경 변수**: 프론트엔드에서 필요한 환경 변수 목록

---

## 4. 환경 변수 정보

### 백엔드 환경 변수
```
필수 변수:
- DATABASE_URL 또는 (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD)
- PORT
- NODE_ENV

선택 변수:
- ALLOWED_ORIGINS
- JWT_SECRET
- 기타...
```

**제시할 내용:**
- [ ] 필수 환경 변수 목록
- [ ] 각 변수의 타입 (string, number, boolean)
- [ ] 기본값이 있는지
- [ ] 환경별로 다른 값이 필요한지

### 프론트엔드 환경 변수
```
필수 변수:
- VITE_API_BASE_URL (또는 REACT_APP_API_BASE_URL 등)

선택 변수:
- VITE_USE_MOCK_DATA
- 기타...
```

**제시할 내용:**
- [ ] Vite 사용 시: `VITE_` 접두사 필요
- [ ] Create React App 사용 시: `REACT_APP_` 접두사 필요
- [ ] Next.js 사용 시: `NEXT_PUBLIC_` 접두사 필요

---

## 5. 데이터베이스 정보

### 데이터베이스 타입
- [ ] PostgreSQL
- [ ] MySQL
- [ ] MongoDB
- [ ] 기타

### 스키마 정보
- [ ] **스키마 파일 위치**: `database/create_tables.sql` 등
- [ ] **마이그레이션 방법**: SQL 파일 직접 실행, 마이그레이션 도구 사용 등
- [ ] **주요 테이블**: 테이블 목록 및 용도
- [ ] **데이터 타입**: VARCHAR, TEXT, INTEGER 등 주로 사용하는 타입

### 연결 정보
- [ ] **연결 문자열 형식**: `postgresql://...` 또는 개별 변수
- [ ] **SSL 필요 여부**: Railway 내부 네트워크는 SSL 불필요
- [ ] **연결 풀 설정**: 최대 연결 수, 타임아웃 등

---

## 6. API 구조 정보

### 엔드포인트 패턴
```
예시:
- /api/users
- /api/auth/login
- /api/products/:id
```

**제시할 내용:**
- [ ] API 기본 경로 (예: `/api`)
- [ ] 주요 엔드포인트 목록
- [ ] 인증이 필요한 엔드포인트
- [ ] RESTful API인지, GraphQL인지

### 인증 방식
- [ ] JWT 토큰
- [ ] 세션 기반
- [ ] API 키
- [ ] OAuth
- [ ] 인증 없음

---

## 7. 특별 고려사항

### PostgreSQL 사용 시
- [ ] **타입 캐스팅 필요 여부**: VARCHAR 파라미터에 `::VARCHAR` 필요
- [ ] **타입 변환**: JavaScript에서 `String()` 변환 필요할 수 있음
- [ ] **COALESCE 함수**: 타입 캐스팅 필요할 수 있음

### CORS 설정
- [ ] **허용할 도메인**: 프로덕션 URL, 개발 URL
- [ ] **null origin 허용**: 로컬 파일 테스트 필요 여부
- [ ] **Credentials**: 쿠키/인증 정보 포함 여부

### 로깅 전략
- [ ] **프로덕션 로깅**: 상세 로그 비활성화 필요 여부
- [ ] **Rate Limit**: Railway 500 logs/sec 제한 고려
- [ ] **에러 로깅**: 에러만 로깅할지, 모든 요청 로깅할지

---

## 8. 현재 상태 정보

### 배포 상태
- [ ] **이미 배포되어 있는지**: Railway, Vercel 등
- [ ] **현재 작동하는 기능**: 정상 작동하는 부분
- [ ] **현재 문제점**: 해결이 필요한 부분

### 코드 상태
- [ ] **완성도**: 완성된 기능, 미완성 기능
- [ ] **테스트 상태**: 테스트 완료 여부
- [ ] **문서화 상태**: README, API 문서 등

---

## 9. 요청할 작업 내용

### 구체적인 작업
- [ ] **배포 설정**: Railway, Vercel 배포 설정
- [ ] **버그 수정**: 특정 에러 해결
- [ ] **기능 추가**: 새로운 기능 구현
- [ ] **최적화**: 성능 개선, 로깅 최적화 등

### 우선순위
- [ ] **긴급**: 즉시 해결 필요
- [ ] **중요**: 빠른 시일 내 해결
- [ ] **일반**: 여유 있게 해결

---

## 10. 참고 자료

### 문서
- [ ] README.md
- [ ] API 문서
- [ ] 배포 가이드
- [ ] 데이터베이스 스키마 문서

### 코드
- [ ] 주요 파일 경로
- [ ] 설정 파일 위치
- [ ] 테스트 파일 위치

---

## 템플릿 사용 예시

```
프로젝트명: MyProject

1. 프로젝트 구조:
   - backend/ (Express.js)
   - frontend/ (React + Vite)
   - database/ (PostgreSQL 스키마)

2. 기술 스택:
   - 백엔드: Node.js 18, Express.js, PostgreSQL, pg
   - 프론트엔드: React 18, Vite, TypeScript, Tailwind CSS

3. 배포 환경:
   - Railway: Root Directory = backend, Start Command = npm start
   - Vercel: Framework = Vite, Output = dist

4. 환경 변수:
   - DATABASE_URL (필수)
   - PORT=3000
   - VITE_API_BASE_URL (필수)

5. 데이터베이스:
   - PostgreSQL
   - 스키마: database/schema.sql
   - 주요 테이블: users, products

6. API:
   - 기본 경로: /api
   - 인증: JWT

7. 특별 사항:
   - PostgreSQL 타입 캐스팅 필요
   - CORS 설정 필요

8. 현재 상태:
   - 로컬에서는 작동
   - 배포 시 에러 발생

9. 요청 작업:
   - Railway 배포 설정
   - 배포 에러 해결
```

---

## 체크리스트 요약

다음 프로젝트 개발 요청 시 이 체크리스트를 사용하세요:

- [ ] 프로젝트 구조 설명
- [ ] 기술 스택 명시
- [ ] 배포 환경 정보
- [ ] 환경 변수 목록
- [ ] 데이터베이스 정보
- [ ] API 구조
- [ ] 특별 고려사항
- [ ] 현재 상태
- [ ] 요청 작업 내용
- [ ] 참고 자료 제공

