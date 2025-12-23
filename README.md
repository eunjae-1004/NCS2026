# NCS 능력단위 검색 시스템

NCS(국가직무능력표준) 능력단위를 검색하고 관리하는 웹 애플리케이션입니다.

## 주요 기능

### 1. 로그인/기관 선택 (선택사항)
- 사용자 이름 입력
- 기관 선택 (공공/기업 구분)
- 게스트 모드 지원

### 2. 홈 대시보드
- **직무로 찾기**: 직무, 산업, 부서 기반 검색
- **키워드로 찾기**: 키워드 기반 검색
- **추천으로 시작하기**: 산업/부서별 추천 능력단위

### 3. 직무/산업/부서 입력 (챗봇형 UX)
- 자유 입력 방식
- 드롭다운 선택 방식 (표준코드 기반)
- 별칭 매핑 기능
- 불확실한 경우 후보 선택 UI

### 4. 검색 결과 리스트
- 좌측 필터: 산업분야, 부서, 직무군/직무, 레벨
- 우측 결과 리스트: 능력단위명, 코드, 요약, 수행준거 하이라이트
- 상세보기 및 장바구니 추가 기능

### 5. 능력단위 상세 페이지
- 능력단위 정의
- 능력단위 요소
- 수행준거 (전체)
- 지식/기술/태도 (K/S/A)
- 관련 키워드/태그
- 유사 능력단위 보기

### 6. 장바구니
- 선택한 능력단위 리스트
- 사용자 메모 기능
- 세트 저장 기능
- 엑셀 다운로드 기능

### 7. 추천 페이지
- 산업/부서별 Top-N 추천
- 추천 이유 표시 (매핑 기반/인기 기반)
- 바로 담기 기능

## 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **React Router** (라우팅)
- **Zustand** (상태 관리)
- **Tailwind CSS** (스타일링)
- **Lucide React** (아이콘)
- **XLSX** (엑셀 다운로드)

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 프로젝트 구조

```
ncssearch2026/
├── src/
│   ├── components/      # 공통 컴포넌트
│   │   └── Layout.tsx
│   ├── pages/          # 페이지 컴포넌트
│   │   ├── LoginPage.tsx
│   │   ├── HomePage.tsx
│   │   ├── SearchInputPage.tsx
│   │   ├── SearchResultsPage.tsx
│   │   ├── AbilityDetailPage.tsx
│   │   ├── CartPage.tsx
│   │   └── RecommendationPage.tsx
│   ├── store/          # 상태 관리
│   │   └── useStore.ts
│   ├── types/          # TypeScript 타입 정의
│   │   └── index.ts
│   ├── App.tsx         # 메인 앱 컴포넌트
│   ├── main.tsx        # 진입점
│   └── index.css       # 글로벌 스타일
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## 주요 기능 설명

### 상태 관리
- Zustand를 사용한 전역 상태 관리
- 사용자 정보, 검색 필터, 장바구니, 선택 이력 관리

### 데이터 흐름
1. 사용자가 검색 입력 → 필터 설정
2. 필터 기반 결과 조회
3. 능력단위 선택 → 장바구니 추가
4. 장바구니에서 엑셀 다운로드 또는 세트 저장

### 다음 단계 구현 완료 ✅

### 1. API 서비스 레이어 구성
- `src/services/api.ts`: 실제 API 호출 함수 정의
- `src/services/apiService.ts`: API 서비스 래퍼 (Mock/실제 API 전환 가능)
- `src/services/mockData.ts`: 개발용 Mock 데이터

### 2. 에러 처리 및 로딩 상태
- `src/components/Loading.tsx`: 로딩 컴포넌트
- `src/components/ErrorMessage.tsx`: 에러 메시지 컴포넌트
- `src/components/ErrorBoundary.tsx`: 전역 에러 바운더리
- `src/hooks/useAsync.ts`: 비동기 작업을 위한 커스텀 훅

### 3. 데이터베이스 연동 준비
- 선택 이력 저장 API 엔드포인트 정의
- 사용자별 선택 이력 조회 API 정의
- Mock 모드에서는 로컬 스토리지에 저장

### 4. 별칭 매핑 알고리즘 개선
- 더 정교한 매핑 로직 구현
- 신뢰도(confidence) 기반 매핑
- 불확실한 경우 후보 제시

### 5. 실제 API 연동 방법

#### 환경 변수 설정
`.env` 파일을 생성하고 다음을 설정:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

#### Mock 데이터 사용 중지
`VITE_USE_MOCK_DATA=false`로 설정하면 실제 API를 호출합니다.

## 향후 개선 사항
- 실제 백엔드 API 서버 구축
- 데이터베이스 연동 (선택 이력 DB 저장)
- 더 정교한 별칭 매핑 알고리즘 (머신러닝 기반)
- 능력단위 구조도, 직무기술서, 경력개발경로모형 연동
- 검색 성능 최적화 (인덱싱, 캐싱)
- 사용자 인증 시스템 강화

## 라이선스

이 프로젝트는 내부 사용을 위한 것입니다.

