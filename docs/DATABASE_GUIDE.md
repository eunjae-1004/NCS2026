# 데이터베이스 연동 가이드

## 1. PostgreSQL 설치

### Windows
1. PostgreSQL 공식 사이트에서 다운로드: https://www.postgresql.org/download/windows/
2. 설치 시 비밀번호 설정 (기억해두세요!)

### 설치 확인
```bash
psql --version
```

## 2. 데이터베이스 생성

```bash
# PostgreSQL 접속
psql -U postgres

# 데이터베이스 생성
CREATE DATABASE ncs_search;

# 접속 확인
\c ncs_search
```

## 3. 스키마 생성

```bash
# 프로젝트 루트에서
psql -U postgres -d ncs_search -f database/schema.sql
```

## 4. 초기 데이터 삽입 (선택사항)

```bash
psql -U postgres -d ncs_search -f database/init.sql
```

## 5. 실제 NCS 데이터 Import

### CSV 파일에서 Import

```sql
-- PostgreSQL 접속
psql -U postgres -d ncs_search

-- CSV 파일 import (경로는 실제 파일 위치로 변경)
COPY ncs_main FROM 'D:/path/to/ncs_main.csv' WITH CSV HEADER;
COPY unit_definition FROM 'D:/path/to/unit_definition.csv' WITH CSV HEADER;
COPY performance_criteria FROM 'D:/path/to/performance_criteria.csv' WITH CSV HEADER;
COPY subcategory FROM 'D:/path/to/subcategory.csv' WITH CSV HEADER;
```

### Excel 파일이 있는 경우

1. Excel을 CSV로 변환
2. 위의 COPY 명령어 사용

## 6. 서버 환경 변수 설정

`server/.env` 파일 생성:

```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=ncs_search
DB_USER=postgres
DB_PASSWORD=your_password

PORT=3000
```

## 7. 서버 의존성 설치

```bash
cd server
npm install
```

## 8. 서버 실행

```bash
node index.js
```

성공 메시지:
```
✅ PostgreSQL 데이터베이스 연결 성공
🚀 API 서버가 http://localhost:3000 에서 실행 중입니다.
```

## 9. 데이터 확인

```sql
-- 데이터 개수 확인
SELECT COUNT(*) FROM ncs_main;
SELECT COUNT(*) FROM unit_definition;
SELECT COUNT(*) FROM performance_criteria;

-- 샘플 데이터 확인
SELECT * FROM ncs_main LIMIT 5;
```

## 문제 해결

### 연결 오류
- PostgreSQL 서비스가 실행 중인지 확인
- 비밀번호가 올바른지 확인
- 포트가 5432인지 확인

### 권한 오류
- 사용자에게 데이터베이스 접근 권한 부여:
```sql
GRANT ALL PRIVILEGES ON DATABASE ncs_search TO postgres;
```

### 테이블이 없는 경우
- 스키마 파일을 다시 실행

## 데이터 백업 및 복원

### 백업
```bash
pg_dump -U postgres ncs_search > backup_$(date +%Y%m%d).sql
```

### 복원
```bash
psql -U postgres ncs_search < backup_20231222.sql
```


