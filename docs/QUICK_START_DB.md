# 데이터베이스 빠른 시작 가이드

## 🚀 5분 안에 데이터베이스 연동하기

### 1단계: PostgreSQL 설치 확인

```bash
psql --version
```

설치되어 있지 않다면: https://www.postgresql.org/download/

### 2단계: 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE ncs_search;

# 접속 확인
\c ncs_search
```

### 3단계: 스키마 생성

```bash
# 프로젝트 루트에서
psql -U postgres -d ncs_search -f database/schema.sql
```

### 4단계: 환경 변수 설정

`server/.env` 파일 생성:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ncs_search
DB_USER=postgres
DB_PASSWORD=your_password
```

### 5단계: 서버 의존성 설치

```bash
cd server
npm install
```

### 6단계: 서버 실행

```bash
node index.js
```

**성공 메시지:**
```
✅ PostgreSQL 데이터베이스 연결 성공
📊 데이터베이스 모드로 API 서버 실행 중
🚀 API 서버가 http://localhost:3000 에서 실행 중입니다.
```

## 📊 데이터 Import

### CSV 파일이 있는 경우

```sql
-- PostgreSQL 접속
psql -U postgres -d ncs_search

-- CSV 파일 import
COPY ncs_main FROM 'D:/path/to/ncs_main.csv' WITH CSV HEADER;
COPY unit_definition FROM 'D:/path/to/unit_definition.csv' WITH CSV HEADER;
COPY performance_criteria FROM 'D:/path/to/performance_criteria.csv' WITH CSV HEADER;
COPY subcategory FROM 'D:/path/to/subcategory.csv' WITH CSV HEADER;
```

### Excel 파일이 있는 경우

1. Excel → CSV 변환
2. UTF-8 인코딩으로 저장
3. 위의 COPY 명령어 사용

## ✅ 확인

```sql
-- 데이터 확인
SELECT COUNT(*) FROM ncs_main;
SELECT * FROM ncs_main LIMIT 5;
```

## 🔄 Fallback 기능

데이터베이스 연결이 실패해도 서버는 정상 작동합니다:
- 연결 실패 시: Mock 데이터 모드
- 연결 성공 시: 실제 데이터베이스 모드

## 📚 상세 가이드

- `database/README.md` - 데이터베이스 구조
- `database/DATABASE_GUIDE.md` - 상세 설정 가이드
- `database/import_data.sql` - 데이터 import 방법


