# NCS API 서버

NCS 능력단위 검색 시스템의 백엔드 API 서버입니다.

## 설치 및 실행

```bash
# 의존성 설치
npm install

# 개발 모드 실행 (자동 재시작)
npm run dev

# 프로덕션 모드 실행
npm start
```

서버는 기본적으로 `http://localhost:3000`에서 실행됩니다.

## 환경 변수

`.env` 파일을 생성하여 설정할 수 있습니다:

```env
PORT=3000
```

## API 엔드포인트

모든 API는 `/api` 경로로 시작합니다.

### 주요 엔드포인트

- `GET /api/ability-units` - 능력단위 검색
- `GET /api/ability-units/:id` - 능력단위 상세 조회
- `POST /api/alias/map` - 별칭 매핑
- `GET /api/recommendations` - 추천 능력단위 조회
- `GET /api/ability-units/:id/similar` - 유사 능력단위 조회
- `POST /api/history/selections` - 선택 이력 저장
- `GET /api/history/selections/:userId` - 사용자별 선택 이력 조회
- `GET /api/organizations` - 기관 목록 조회
- `GET /api/standard-codes/:type` - 표준 코드 조회

자세한 내용은 프로젝트 루트의 `API_DOCUMENTATION.md`를 참고하세요.

## 데이터베이스 연동

현재는 메모리 기반으로 동작합니다. 실제 데이터베이스를 연동하려면:

1. PostgreSQL, MySQL 등 데이터베이스 선택
2. 데이터베이스 연결 설정
3. `abilityUnits`, `organizations` 등의 데이터를 DB에서 조회하도록 변경
4. `selectionHistory`를 DB에 저장하도록 변경

## 프론트엔드 연동

프론트엔드에서 실제 API를 사용하려면:

1. `.env` 파일 생성:
```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

2. 프론트엔드 재시작



