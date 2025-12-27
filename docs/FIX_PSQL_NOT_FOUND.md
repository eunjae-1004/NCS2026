# psql 명령어를 찾을 수 없을 때 해결 방법

## 문제: 'psql'은(는) 내부 또는 외부 명령, 실행할 수 있는 프로그램, 또는 배치 파일이 아닙니다.

이 오류는 PostgreSQL 클라이언트 도구(`psql`)가 설치되어 있지 않거나 PATH에 없다는 의미입니다.

## 해결 방법 1: Railway CLI 사용 (가장 간단) ⭐

로컬에 `psql`이 없어도 Railway CLI를 사용하면 됩니다!

### Railway CLI로 SQL 파일 실행

```powershell
# 프로젝트 디렉토리로 이동
cd D:\Website\cursor\ncssearch2026

# Railway CLI 확인
railway --version

# 로그인 (필요한 경우)
railway login

# 프로젝트 연결 (필요한 경우)
railway link

# SQL 파일 실행 (psql 설치 불필요!)
railway run psql -f database/cleanup_disk_space.sql
```

**중요**: `railway run psql`은 Railway 서버에서 실행되므로 로컬에 `psql`이 없어도 됩니다!

### Railway CLI로 직접 SQL 실행

```powershell
# 한 줄 SQL 실행
railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway'));"

# 여러 SQL 실행
railway run psql -c "DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days'; VACUUM;"
```

---

## 해결 방법 2: Railway 대시보드에서 직접 실행 (가장 간단!) ⭐⭐

`psql`이나 Railway CLI 없이도 가능합니다!

### 1단계: Railway 대시보드 접속

1. **https://railway.app 접속**
2. **프로젝트 선택**
3. **PostgreSQL 서비스 클릭**

### 2단계: Data 탭에서 SQL 실행

1. **"Data" 탭 클릭**
2. **SQL 입력창에 아래 SQL 복사하여 붙여넣기:**

```sql
-- 현재 디스크 사용량 확인
SELECT pg_size_pretty(pg_database_size('railway')) AS database_size;

-- 테이블별 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

3. **"Run" 버튼 클릭**

### 3단계: 데이터 정리 SQL 실행

```sql
-- 오래된 데이터 삭제
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 디스크 공간 회수
CHECKPOINT;
VACUUM;
```

4. **"Run" 버튼 클릭**

### 4단계: 결과 확인

```sql
-- 정리 후 크기 확인
SELECT pg_size_pretty(pg_database_size('railway')) AS database_size_after;
```

---

## 해결 방법 3: PostgreSQL 클라이언트 설치 (선택사항)

로컬에서 `psql`을 직접 사용하고 싶다면:

### Windows에 PostgreSQL 설치

1. **PostgreSQL 다운로드**
   - https://www.postgresql.org/download/windows/
   - 또는 https://www.enterprisedb.com/downloads/postgres-postgresql-downloads

2. **설치 시 옵션**
   - "Command Line Tools" 포함 설치
   - 설치 경로를 PATH에 자동 추가

3. **설치 확인**
   ```powershell
   psql --version
   ```

### 또는 Chocolatey 사용

```powershell
# Chocolatey가 설치되어 있다면
choco install postgresql
```

---

## 추천 방법 순서

1. **Railway 대시보드 Data 탭** (가장 간단, 별도 도구 불필요) ⭐⭐⭐
2. **Railway CLI 사용** (`railway run psql`) ⭐⭐
3. **PostgreSQL 클라이언트 설치** (로컬에서 직접 사용하고 싶을 때)

---

## Railway CLI 사용 예시

### 현재 상태 확인

```powershell
railway run psql -c "SELECT pg_size_pretty(pg_database_size('railway'));"
```

### 테이블 크기 확인

```powershell
railway run psql -c "SELECT tablename, pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size FROM pg_tables WHERE schemaname = 'public' ORDER BY pg_total_relation_size('public.'||tablename) DESC;"
```

### 데이터 삭제

```powershell
railway run psql -c "DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days'; DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';"
```

### VACUUM 실행

```powershell
railway run psql -c "CHECKPOINT; VACUUM;"
```

### SQL 파일 실행

```powershell
railway run psql -f database/cleanup_disk_space.sql
```

---

## 문제 해결

### "railway: command not found"

Railway CLI가 설치되어 있지 않습니다:

```powershell
npm i -g @railway/cli
```

### "not logged in"

Railway에 로그인하세요:

```powershell
railway login
```

### "no project linked"

프로젝트를 연결하세요:

```powershell
railway link
```

---

## 빠른 시작: Railway 대시보드 사용

가장 간단한 방법:

1. **Railway 대시보드 → PostgreSQL 서비스 → Data 탭**
2. **아래 SQL 복사하여 붙여넣기:**

```sql
-- 오래된 데이터 삭제
DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days';
DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';

-- 디스크 공간 회수
CHECKPOINT;
VACUUM;
```

3. **"Run" 버튼 클릭**

끝! 별도 도구 설치 불필요!

