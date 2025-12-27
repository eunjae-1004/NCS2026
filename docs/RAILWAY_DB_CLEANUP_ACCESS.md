# Railway PostgreSQL 접속하여 데이터 정리하기

## 방법 1: Railway CLI 터널링 + pgAdmin4 (권장) ⭐

이전에 성공한 방법입니다. pgAdmin4의 GUI를 사용하여 편리하게 작업할 수 있습니다.

### 1단계: Railway CLI 터널링 시작

터미널에서 다음 명령어 실행:

```bash
# Railway CLI가 설치되어 있지 않다면
npm i -g @railway/cli

# 로그인 (이미 로그인되어 있으면 생략)
railway login

# 프로젝트 연결 (이미 연결되어 있으면 생략)
railway link

# PostgreSQL 터널링 시작
railway connect postgres
```

**중요**: 이 터미널 창을 **열어두어야** 합니다. 닫으면 터널이 끊어집니다.

### 2단계: pgAdmin4에서 연결

1. **pgAdmin4 실행**

2. **기존 서버 연결** (이미 등록되어 있다면)
   - 왼쪽 트리에서 "Railway PostgreSQL" 서버 우클릭
   - "Connect Server" 선택
   - 비밀번호 입력 (Railway의 `PGPASSWORD`)

3. **새 서버 등록** (처음이라면)
   - "Servers" 우클릭 → "Create" → "Server..."
   - **General 탭**:
     - Name: `Railway PostgreSQL`
   - **Connection 탭**:
     - Host name/address: `localhost`
     - Port: `5432`
     - Maintenance database: `railway`
     - Username: `postgres`
     - Password: Railway의 `PGPASSWORD` (Variables 탭에서 확인)
   - **SSL 탭**:
     - SSL mode: `Prefer` 또는 `Allow`
   - **Save**

### 3단계: 데이터 정리 작업

연결 성공 후 Query Tool에서 작업:

1. **Query Tool 열기**
   - 서버 → Databases → `railway` 우클릭
   - "Query Tool" 선택

2. **테이블 크기 확인**
   ```sql
   -- 테이블 크기 확인
   SELECT 
       tablename,
       pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size
   FROM pg_tables
   WHERE schemaname = 'public'
   ORDER BY pg_total_relation_size('public.'||tablename) DESC;
   ```

3. **불필요한 데이터 삭제**
   ```sql
   -- 오래된 선택 이력 삭제 (30일 이상)
   DELETE FROM selection_history 
   WHERE selected_at < NOW() - INTERVAL '30 days';

   -- 오래된 장바구니 아이템 삭제 (90일 이상)
   DELETE FROM cart_items 
   WHERE added_at < NOW() - INTERVAL '90 days';

   -- 오래된 사용자 세션 삭제
   DELETE FROM user_sessions 
   WHERE expires_at < NOW();
   ```

4. **VACUUM 실행** (디스크 공간 회수)
   ```sql
   -- 전체 데이터베이스 정리
   VACUUM FULL;
   ```

5. **실행 결과 확인**
   - 하단 "Messages" 탭에서 성공 메시지 확인

---

## 방법 2: Railway CLI 직접 접속 (psql)

터미널에서 직접 SQL을 실행하는 방법입니다.

### 1단계: Railway CLI로 접속

```bash
# Railway CLI 설치 (필요한 경우)
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# PostgreSQL에 직접 접속
railway connect postgres
```

이 명령어는 `psql` 세션을 시작합니다.

### 2단계: SQL 실행

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

### 3단계: 종료

```sql
-- psql 종료
\q
```

---

## 빠른 접속 체크리스트

### pgAdmin4 사용 시:
- [ ] Railway CLI 터널링 시작 (`railway connect postgres`)
- [ ] 터미널 창 열어두기
- [ ] pgAdmin4에서 `localhost:5432`로 연결
- [ ] Query Tool 열기
- [ ] SQL 실행

### psql 직접 사용 시:
- [ ] Railway CLI 설치 및 로그인
- [ ] `railway connect postgres` 실행
- [ ] SQL 명령어 실행
- [ ] `\q`로 종료

---

## 데이터 정리 SQL 모음

### 1. 테이블 크기 확인
```sql
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size('public.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size('public.'||tablename) - pg_relation_size('public.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;
```

### 2. 오래된 데이터 삭제
```sql
-- 선택 이력 (30일 이상)
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

-- 장바구니 아이템 (90일 이상)
DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 사용자 세션 (만료된 것)
DELETE FROM user_sessions 
WHERE expires_at < NOW();
```

### 3. 디스크 공간 회수
```sql
-- VACUUM (빠른 정리)
VACUUM;

-- VACUUM FULL (완전 정리, 시간 오래 걸림)
VACUUM FULL;

-- 특정 테이블만 정리
VACUUM FULL cart_items;
VACUUM FULL selection_history;
```

### 4. 인덱스 크기 확인
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

### 5. 전체 데이터베이스 크기 확인
```sql
SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size;
```

---

## 주의사항

1. **VACUUM FULL은 시간이 오래 걸립니다**
   - 데이터베이스가 잠길 수 있습니다
   - 작업 중에는 다른 작업을 하지 마세요

2. **중요한 데이터는 먼저 백업하세요**
   - pgAdmin4에서 Export 기능 사용
   - 또는 `pg_dump` 명령어 사용

3. **DELETE는 되돌릴 수 없습니다**
   - 실행 전에 WHERE 조건을 확인하세요
   - 테스트로 SELECT 먼저 실행해보세요:
   ```sql
   -- 삭제될 데이터 확인
   SELECT COUNT(*) FROM cart_items 
   WHERE added_at < NOW() - INTERVAL '90 days';
   
   -- 확인 후 삭제
   DELETE FROM cart_items 
   WHERE added_at < NOW() - INTERVAL '90 days';
   ```

---

## 문제 해결

### 터널링이 안 될 때
```bash
# Railway CLI 재설치
npm uninstall -g @railway/cli
npm i -g @railway/cli

# 다시 로그인
railway login
railway link
railway connect postgres
```

### pgAdmin4 연결 실패
- 터미널에서 `railway connect postgres`가 실행 중인지 확인
- `localhost:5432`로 연결하는지 확인
- 비밀번호가 올바른지 확인 (Railway Variables 탭에서)

### psql 명령어를 찾을 수 없을 때
- PostgreSQL 클라이언트 도구가 설치되어 있는지 확인
- Windows: PostgreSQL 설치 시 클라이언트 도구 포함

