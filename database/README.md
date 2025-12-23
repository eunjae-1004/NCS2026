# 데이터베이스 설계 문서

## 개요

NCS 능력단위 검색 시스템을 위한 PostgreSQL 데이터베이스 스키마입니다.

## 데이터베이스 구조

### 핵심 테이블

1. **ncs_main** - NCS 메인 데이터 테이블
   - 능력단위 및 능력단위 요소의 기본 정보
   - 13개 컬럼으로 구성

2. **unit_definition** - 능력단위 정의
   - 능력단위의 상세 정의 정보

3. **performance_criteria** - 수행준거
   - 능력단위 요소별 수행준거

4. **subcategory** - 세부분류
   - 세부분류 정보 및 정의

### 사용자 및 관리 테이블

5. **users** - 사용자 정보
6. **organizations** - 기관 정보
7. **selection_history** - 선택 이력
8. **cart_items** - 장바구니 아이템
9. **cart_sets** - 장바구니 세트
10. **cart_set_items** - 장바구니 세트 아이템

### 지원 테이블

11. **alias_mapping** - 별칭 매핑
12. **standard_codes** - 표준 코드

## 설치 방법

### 1. PostgreSQL 설치 확인

```bash
psql --version
```

### 2. 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE ncs_search;

# 데이터베이스 선택
\c ncs_search
```

### 3. 스키마 실행

```bash
# 스키마 생성
psql -U postgres -d ncs_search -f database/schema.sql

# 초기 데이터 삽입 (선택사항)
psql -U postgres -d ncs_search -f database/init.sql
```

### 4. 데이터 Import

실제 NCS 데이터를 import하려면:

```bash
# CSV 파일에서 import (예시)
COPY ncs_main FROM '/path/to/ncs_data.csv' WITH CSV HEADER;
```

## 테이블 관계도

```
ncs_main (메인 테이블)
├── unit_definition (능력단위 정의)
├── performance_criteria (수행준거)
└── subcategory (세부분류)

users (사용자)
├── selection_history (선택 이력)
├── cart_items (장바구니)
└── cart_sets (장바구니 세트)
    └── cart_set_items (세트 아이템)
```

## 주요 인덱스

- `unit_code` - 능력단위 코드 검색 최적화
- `sub_category_code` - 분류별 검색 최적화
- `unit_level` - 레벨별 필터링 최적화
- `user_id` - 사용자별 조회 최적화

## 뷰

1. **ability_unit_detail** - 능력단위 상세 정보 뷰
2. **ability_unit_elements** - 능력단위 요소 뷰

## API 서버 연동

데이터베이스 연결을 위해 환경 변수 설정:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ncs_search
DB_USER=postgres
DB_PASSWORD=your_password
```

## 데이터 백업

```bash
# 백업
pg_dump -U postgres ncs_search > backup.sql

# 복원
psql -U postgres ncs_search < backup.sql
```


