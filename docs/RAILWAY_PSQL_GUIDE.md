# Railway PostgreSQL 접속 가이드

Railway에 설치된 PostgreSQL 데이터베이스에 `psql`로 접속하는 방법입니다.

## 방법 1: Railway CLI 사용 (가장 간단) ⭐ 권장

### 1. Railway CLI 설치

```bash
# npm으로 설치
npm install -g @railway/cli

# 또는 Homebrew (macOS)
brew install railway

# 또는 직접 다운로드
# https://github.com/railwayapp/cli/releases
```

### 2. Railway 로그인

```bash
railway login
```

브라우저가 열리면 Railway 계정으로 로그인합니다.

### 3. 프로젝트 선택

```bash
# 프로젝트 목록 확인
railway status

# 특정 프로젝트 선택 (프로젝트 디렉토리에서 실행)
railway link
```

### 4. PostgreSQL 데이터베이스 접속

```bash
# PostgreSQL 서비스에 직접 접속
railway connect postgres

# 또는 특정 서비스 이름 지정
railway connect <서비스-이름>
```

이 명령어를 실행하면 자동으로 `psql`이 열리고 데이터베이스에 연결됩니다.

## 방법 2: DATABASE_URL 환경 변수 사용

### 1. Railway 대시보드에서 DATABASE_URL 확인

1. Railway 대시보드 접속: https://railway.app
2. 프로젝트 선택
3. PostgreSQL 서비스 선택
4. **Variables** 탭 클릭
5. `DATABASE_URL` 변수 확인 (또는 `PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`)

### 2. 로컬에서 DATABASE_URL 설정

```bash
# Windows PowerShell
$env:DATABASE_URL="postgresql://user:password@host:port/database"

# Windows CMD
set DATABASE_URL=postgresql://user:password@host:port/database

# macOS/Linux
export DATABASE_URL="postgresql://user:password@host:port/database"
```

### 3. psql로 접속

```bash
# DATABASE_URL 사용
psql $DATABASE_URL

# Windows PowerShell
psql $env:DATABASE_URL

# Windows CMD
psql %DATABASE_URL%
```

## 방법 3: 개별 연결 정보 사용

### 1. Railway 대시보드에서 연결 정보 확인

Railway 대시보드 → PostgreSQL 서비스 → **Variables** 탭에서:
- `PGHOST` (또는 `DB_HOST`)
- `PGPORT` (또는 `DB_PORT`, 기본값: 5432)
- `PGDATABASE` (또는 `DB_NAME`, 보통 `railway`)
- `PGUSER` (또는 `DB_USER`, 보통 `postgres`)
- `PGPASSWORD` (또는 `DB_PASSWORD`)

### 2. psql로 직접 접속

```bash
# 기본 형식
psql -h <호스트> -p <포트> -U <사용자명> -d <데이터베이스명>

# 예시
psql -h containers-us-xxx.railway.app -p 5432 -U postgres -d railway

# 비밀번호 입력 프롬프트가 나타나면 Railway에서 확인한 비밀번호 입력
```

### 3. 환경 변수로 설정 (비밀번호 자동 입력)

```bash
# Windows PowerShell
$env:PGPASSWORD="your_password"
psql -h containers-us-xxx.railway.app -p 5432 -U postgres -d railway

# Windows CMD
set PGPASSWORD=your_password
psql -h containers-us-xxx.railway.app -p 5432 -U postgres -d railway

# macOS/Linux
export PGPASSWORD="your_password"
psql -h containers-us-xxx.railway.app -p 5432 -U postgres -d railway
```

## 방법 4: Railway 대시보드에서 직접 실행

Railway 대시보드에서도 SQL 쿼리를 실행할 수 있습니다:

1. Railway 대시보드 접속
2. PostgreSQL 서비스 선택
3. **Data** 탭 클릭
4. SQL 쿼리 입력 및 실행

⚠️ **주의**: 복잡한 마이그레이션 스크립트는 `psql`로 실행하는 것이 좋습니다.

## 마이그레이션 스크립트 실행

접속 후 마이그레이션 스크립트를 실행하는 방법:

### Railway CLI 사용 시

```bash
# 1. Railway CLI로 접속
railway connect postgres

# 2. psql 프롬프트에서 실행
\i database/migrate_improvements.sql

# 또는 직접 SQL 실행
\i database/create_tables.sql
```

### DATABASE_URL 사용 시

```bash
# Windows PowerShell
psql $env:DATABASE_URL -f database/migrate_improvements.sql

# Windows CMD
psql %DATABASE_URL% -f database/migrate_improvements.sql

# macOS/Linux
psql $DATABASE_URL -f database/migrate_improvements.sql
```

### 개별 연결 정보 사용 시

```bash
# Windows PowerShell
$env:PGPASSWORD="your_password"
psql -h containers-us-xxx.railway.app -p 5432 -U postgres -d railway -f database/migrate_improvements.sql

# macOS/Linux
export PGPASSWORD="your_password"
psql -h containers-us-xxx.railway.app -p 5432 -U postgres -d railway -f database/migrate_improvements.sql
```

## 유용한 psql 명령어

접속 후 사용할 수 있는 명령어:

```sql
-- 데이터베이스 목록 확인
\l

-- 현재 데이터베이스의 테이블 목록
\dt

-- 특정 테이블 구조 확인
\d selection_history

-- 뷰 목록 확인
\dv

-- 함수 목록 확인
\df

-- SQL 파일 실행
\i database/migrate_improvements.sql

-- 쿼리 결과를 파일로 저장
\o output.txt
SELECT * FROM selection_history LIMIT 10;
\o

-- 종료
\q
```

## 문제 해결

### 1. "psql: command not found" 오류

PostgreSQL 클라이언트가 설치되지 않았습니다.

**해결 방법**:
- **Windows**: https://www.postgresql.org/download/windows/ 에서 PostgreSQL 설치
- **macOS**: `brew install postgresql`
- **Linux**: `sudo apt-get install postgresql-client` (Ubuntu/Debian)

### 2. "connection refused" 오류

Railway 데이터베이스가 실행되지 않았거나 연결 정보가 잘못되었습니다.

**확인 사항**:
- Railway 대시보드에서 PostgreSQL 서비스가 실행 중인지 확인
- 연결 정보(호스트, 포트, 데이터베이스명, 사용자명, 비밀번호) 확인

### 3. "password authentication failed" 오류

비밀번호가 잘못되었습니다.

**해결 방법**:
- Railway 대시보드에서 `PGPASSWORD` 또는 `DB_PASSWORD` 변수 확인
- 비밀번호에 특수문자가 있으면 따옴표로 감싸기

### 4. SSL 연결 오류

Railway는 SSL 연결을 요구할 수 있습니다.

**해결 방법**:
```bash
# SSL 모드로 연결
psql "postgresql://user:password@host:port/database?sslmode=require"

# 또는 Railway CLI 사용 (자동으로 SSL 처리)
railway connect postgres
```

## 보안 주의사항

⚠️ **중요**: 
- 비밀번호를 명령어에 직접 입력하지 마세요 (히스토리에 남을 수 있음)
- 환경 변수 사용 또는 Railway CLI 사용 권장
- `.env` 파일은 `.gitignore`에 포함되어 있는지 확인

## 빠른 참조

```bash
# ⭐ 가장 간단한 방법 (Railway CLI)
railway login
railway connect postgres

# DATABASE_URL이 있는 경우
psql $DATABASE_URL

# 개별 정보 사용
psql -h <host> -p 5432 -U postgres -d railway
```

## 추가 리소스

- Railway 공식 문서: https://docs.railway.app
- PostgreSQL 공식 문서: https://www.postgresql.org/docs/
- Railway CLI GitHub: https://github.com/railwayapp/cli

