# Windows에서 Railway PostgreSQL 접속하기 (pgAdmin4 없이)

pgAdmin4 접속이 안 될 때 사용할 수 있는 방법들입니다.

## 방법 1: Railway 대시보드에서 직접 SQL 실행 ⭐ (가장 간단)

Railway 대시보드에서 직접 SQL을 실행할 수 있습니다!

### 1단계: Railway 대시보드 접속

1. **https://railway.app 접속**
2. **프로젝트 선택**
3. **PostgreSQL 서비스 클릭**

### 2단계: Data 탭에서 SQL 실행

1. **"Data" 탭 클릭**
2. **SQL 쿼리 입력창에 SQL 입력**
3. **"Run" 버튼 클릭**

### 예시: 데이터 정리 SQL

```sql
-- 1. 테이블 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- 2. 오래된 데이터 삭제
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 3. VACUUM 실행 (디스크 공간 회수)
VACUUM FULL;
```

**장점:**
- 별도 도구 설치 불필요
- pgAdmin4 연결 불필요
- Railway 대시보드에서 바로 실행

**단점:**
- 복잡한 작업은 제한적
- 여러 쿼리를 한 번에 실행하기 어려움

---

## 방법 2: Windows PowerShell에서 Railway CLI 사용

### 1단계: PowerShell 열기

1. **`Win + X` 키 누르기**
2. **"Windows PowerShell" 또는 "터미널" 선택**
   - 또는 시작 메뉴에서 "PowerShell" 검색

### 2단계: Railway CLI 설치 확인

```powershell
railway --version
```

설치되어 있지 않으면:
```powershell
npm i -g @railway/cli
```

### 3단계: 로그인 및 연결

```powershell
# 로그인 (브라우저가 열림)
railway login

# 프로젝트 연결
railway link
# 프로젝트 목록에서 선택

# PostgreSQL에 직접 접속 (psql 세션 시작)
railway connect postgres
```

### 4단계: SQL 실행

psql 프롬프트(`railway=#`)에서 SQL 실행:

```sql
-- 테이블 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- 오래된 데이터 삭제
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- VACUUM 실행
VACUUM FULL;
```

### 5단계: 종료

```sql
\q
```

---

## 방법 3: SQL 파일을 Railway CLI로 실행

SQL 파일을 만들어서 한 번에 실행할 수 있습니다.

### 1단계: SQL 파일 생성

프로젝트에 `database/cleanup.sql` 파일 생성:

```sql
-- 테이블 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- 오래된 데이터 삭제
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- VACUUM 실행
VACUUM FULL;
```

### 2단계: Railway CLI로 실행

PowerShell에서:

```powershell
# 프로젝트 디렉토리로 이동
cd D:\Website\cursor\ncssearch2026

# SQL 파일 실행
railway run psql -f database/cleanup.sql
```

또는 직접 SQL 실행:

```powershell
railway run psql -c "VACUUM FULL;"
```

---

## 방법 4: pgAdmin4 연결 재시도 (문제 해결)

pgAdmin4를 사용하고 싶다면:

### 1단계: Railway CLI 터널링

PowerShell에서:

```powershell
# Railway CLI 설치 확인
railway --version

# 로그인 (필요한 경우)
railway login

# 프로젝트 연결 (필요한 경우)
railway link

# PostgreSQL 터널링 시작
railway connect postgres
```

**중요**: 이 PowerShell 창을 **열어두어야** 합니다!

### 2단계: pgAdmin4 연결 설정

1. **pgAdmin4 실행**
2. **서버 Properties 열기**
   - 기존 서버 우클릭 → "Properties"
   - 또는 새 서버 생성
3. **Connection 탭 설정**
   - **Host name/address**: `localhost` (정확히!)
   - **Port**: `5432`
   - **Maintenance database**: `railway`
   - **Username**: `postgres`
   - **Password**: Railway Variables 탭의 `PGPASSWORD` 값
4. **SSL 탭 설정**
   - **SSL mode**: `Prefer` 또는 `Allow`
5. **Save 후 연결**

### 문제 해결

**"Connection timeout" 오류:**
- PowerShell에서 `railway connect postgres`가 실행 중인지 확인
- 터미널 창을 닫지 마세요!

**"Host not found" 오류:**
- Host를 정확히 `localhost`로 설정했는지 확인
- 공백이나 특수 문자가 없는지 확인

**비밀번호 오류:**
- Railway Variables 탭에서 `PGPASSWORD` 값을 정확히 복사
- 앞뒤 공백 제거

---

## 추천 방법 순서

1. **Railway 대시보드 Data 탭** (가장 간단, 별도 도구 불필요)
2. **Railway CLI 직접 접속** (PowerShell에서 `railway connect postgres`)
3. **SQL 파일 실행** (여러 쿼리를 한 번에 실행)
4. **pgAdmin4** (GUI가 필요한 경우)

---

## 빠른 시작: Railway 대시보드에서 바로 시작

1. **Railway 대시보드 → PostgreSQL 서비스 → Data 탭**
2. **다음 SQL 복사하여 붙여넣기:**

```sql
-- 테이블 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

3. **"Run" 버튼 클릭**
4. **결과 확인 후 큰 테이블에서 데이터 삭제**

---

## 데이터 정리 SQL 모음

Railway Data 탭이나 psql에서 사용할 수 있는 SQL:

```sql
-- 1. 전체 데이터베이스 크기
SELECT pg_size_pretty(pg_database_size('railway')) AS database_size;

-- 2. 테이블별 크기
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size('public.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size('public.'||tablename) - pg_relation_size('public.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- 3. 삭제될 데이터 개수 확인 (실행 전 확인!)
SELECT COUNT(*) FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

SELECT COUNT(*) FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 4. 오래된 데이터 삭제
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 5. 디스크 공간 회수
VACUUM FULL;
```

---

## 주의사항

1. **DELETE는 되돌릴 수 없습니다**
   - 실행 전에 SELECT로 확인하세요

2. **VACUUM FULL은 시간이 오래 걸립니다**
   - 데이터베이스가 잠길 수 있습니다
   - 작업 중에는 다른 작업을 하지 마세요

3. **중요한 데이터는 먼저 백업**
   - Railway Data 탭에서 Export 가능
   - 또는 `pg_dump` 사용

