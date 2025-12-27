# 데이터베이스 설정 완료 가이드

## 완료된 작업

✅ PostgreSQL 데이터베이스 스키마 설계
✅ 데이터베이스 연결 모듈 생성
✅ API 라우트 생성 (데이터베이스 연동)
✅ Mock 데이터 fallback 기능

## 파일 구조

```
database/
├── schema.sql          # 데이터베이스 스키마
├── init.sql           # 초기 데이터
├── import_data.sql    # 데이터 import 가이드
├── README.md          # 데이터베이스 문서
└── DATABASE_GUIDE.md  # 설정 가이드

server/
├── db.js              # 데이터베이스 연결
├── routes/
│   ├── abilityUnits.js    # 능력단위 API
│   ├── history.js         # 선택 이력 API
│   ├── organizations.js   # 기관 API
│   ├── standardCodes.js   # 표준 코드 API
│   └── alias.js          # 별칭 매핑 API
└── index.js           # 메인 서버 (수정됨)
```

## 다음 단계

### 1. PostgreSQL 설치 및 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE ncs_search;
\c ncs_search
```

### 2. 스키마 생성

```bash
psql -U postgres -d ncs_search -f database/schema.sql
```

### 3. 초기 데이터 삽입 (선택사항)

```bash
psql -U postgres -d ncs_search -f database/init.sql
```

### 4. 실제 NCS 데이터 Import

이미지에서 본 데이터를 CSV로 변환하여 import:

```sql
COPY ncs_main FROM '/path/to/ncs_main.csv' WITH CSV HEADER;
COPY unit_definition FROM '/path/to/unit_definition.csv' WITH CSV HEADER;
COPY performance_criteria FROM '/path/to/performance_criteria.csv' WITH CSV HEADER;
COPY subcategory FROM '/path/to/subcategory.csv' WITH CSV HEADER;
```

### 5. 서버 환경 변수 설정

`server/.env` 파일 생성:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ncs_search
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3000
```

### 6. 서버 의존성 설치

```bash
cd server
npm install
```

### 7. 서버 실행

```bash
node index.js
```

**성공 메시지:**
```
✅ PostgreSQL 데이터베이스 연결 성공
📊 데이터베이스 모드로 API 서버 실행 중
🚀 API 서버가 http://localhost:3000 에서 실행 중입니다.
```

## 데이터베이스 구조 요약

### 핵심 테이블
- `ncs_main` - 메인 NCS 데이터 (13개 컬럼)
- `unit_definition` - 능력단위 정의
- `performance_criteria` - 수행준거
- `subcategory` - 세부분류

### 사용자 관리
- `users` - 사용자
- `organizations` - 기관
- `selection_history` - 선택 이력
- `cart_items` - 장바구니
- `cart_sets` - 장바구니 세트

### 지원 기능
- `alias_mapping` - 별칭 매핑
- `standard_codes` - 표준 코드

## 자동 Fallback

데이터베이스 연결이 실패하면 자동으로 Mock 데이터 모드로 전환됩니다:
- 데이터베이스 연결 실패 시 Mock 데이터 사용
- 연결 성공 시 실제 데이터베이스 사용

## 상세 가이드

- `database/README.md` - 데이터베이스 구조 설명
- `database/DATABASE_GUIDE.md` - 설정 가이드
- `database/import_data.sql` - 데이터 import 방법


