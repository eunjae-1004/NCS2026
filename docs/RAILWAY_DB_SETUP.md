# Railway 데이터베이스 설정 가이드

이 가이드는 Railway에 배포된 PostgreSQL 데이터베이스를 설정하는 방법을 안내합니다.

## 1단계: Railway에서 데이터베이스 확인

### PostgreSQL 서비스 확인

1. **Railway 대시보드 접속**
   - https://railway.app 접속
   - 프로젝트 선택

2. **PostgreSQL 서비스 확인**
   - 프로젝트에 PostgreSQL 서비스가 있는지 확인
   - 없으면 "New" → "Database" → "PostgreSQL" 추가

3. **데이터베이스 연결 정보 확인**
   - PostgreSQL 서비스 클릭
   - "Variables" 탭에서 연결 정보 확인:
     - `PGHOST`
     - `PGPORT`
     - `PGDATABASE`
     - `PGUSER`
     - `PGPASSWORD`
     - 또는 `DATABASE_URL` (전체 연결 문자열)

## 2단계: 데이터베이스에 접속

### 방법 1: Railway CLI 사용 (권장)

1. **Railway CLI 설치**
   ```bash
   npm i -g @railway/cli
   ```

2. **로그인**
   ```bash
   railway login
   ```

3. **프로젝트 연결**
   ```bash
   railway link
   ```

4. **PostgreSQL 서비스에 연결**
   ```bash
   railway connect postgres
   ```
   - 이 명령어는 psql 세션을 시작합니다

### 방법 2: Railway 대시보드에서 제공하는 명령어 사용

1. **PostgreSQL 서비스 → "Data" 탭**
2. **"Connect" 버튼 클릭**
3. **제공되는 psql 명령어 복사**
   - 예: `psql $DATABASE_URL`
   - 또는 개별 변수를 사용한 명령어

### 방법 3: 로컬 psql 사용

Railway에서 제공하는 연결 정보를 사용:

```bash
psql -h $PGHOST -p $PGPORT -U $PGUSER -d $PGDATABASE
```

또는 `DATABASE_URL` 사용:

```bash
psql $DATABASE_URL
```

## 3단계: 스키마 생성

데이터베이스에 접속한 후:

### 1. 기본 스키마 생성

```sql
-- 프로젝트 루트의 schema.sql 파일 실행
\i database/schema.sql
```

**주의**: Railway CLI로 접속한 경우, 파일 경로는 로컬 파일 시스템 경로를 사용합니다.

### 2. 또는 SQL 파일 내용을 직접 복사

`database/schema.sql` 파일의 내용을 복사하여 psql에서 실행:

```sql
-- schema.sql의 전체 내용을 복사하여 실행
```

### 3. 스키마 생성 확인

```sql
-- 테이블 목록 확인
\dt

-- 특정 테이블 구조 확인
\d ncs_main
\d users
\d cart_items
```

## 4단계: 인증 관련 마이그레이션 (필수)

사용자 인증 기능을 사용하려면:

```sql
-- migrate_add_auth.sql 실행
\i database/migrate_add_auth.sql
```

또는 파일 내용을 직접 실행:

```sql
-- email 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'email'
    ) THEN
        ALTER TABLE users ADD COLUMN email VARCHAR(255);
        ALTER TABLE users ADD CONSTRAINT users_email_unique UNIQUE(email);
    END IF;
END $$;

-- password_hash 컬럼 추가
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'password_hash'
    ) THEN
        ALTER TABLE users ADD COLUMN password_hash VARCHAR(255);
    END IF;
END $$;

-- role 컬럼 기본값 설정
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'guest';
    ELSE
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'guest';
    END IF;
END $$;

-- 기존 데이터의 role이 NULL이면 'guest'로 설정
UPDATE users 
SET role = 'guest' 
WHERE role IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## 5단계: 초기 데이터 Import (선택사항)

### NCS 데이터 Import

실제 NCS 데이터가 있다면:

```sql
-- CSV 파일이 있는 경우
COPY ncs_main FROM '/path/to/ncs_main.csv' WITH CSV HEADER;
```

**주의**: Railway에서는 로컬 파일 시스템에 직접 접근할 수 없으므로, SQL 스크립트를 사용하거나 Railway CLI를 통해 파일을 업로드해야 합니다.

### 샘플 데이터 (테스트용)

테스트를 위한 샘플 데이터:

```sql
-- database/init.sql 실행
\i database/init.sql
```

## 6단계: 백엔드 환경 변수 확인

Railway 백엔드 서비스의 환경 변수가 올바르게 설정되어 있는지 확인:

1. **백엔드 서비스 → Variables 탭**
2. **다음 변수들이 설정되어 있는지 확인:**
   ```
   DB_HOST=your-postgres-host
   DB_PORT=5432
   DB_NAME=railway (또는 실제 데이터베이스 이름)
   DB_USER=postgres
   DB_PASSWORD=your-password
   ```

3. **PostgreSQL 서비스와 동일한 값인지 확인**
   - PostgreSQL 서비스의 Variables와 백엔드 서비스의 Variables가 일치해야 합니다

## 7단계: 데이터베이스 연결 테스트

### 백엔드 로그 확인

1. **Railway → 백엔드 서비스 → Deployments**
2. **최신 배포의 로그 확인**
3. **다음 메시지가 보이는지 확인:**
   ```
   ✅ PostgreSQL 데이터베이스 연결 성공
   📊 데이터베이스 모드로 API 서버 실행 중
   ```

### API 테스트

프론트엔드에서:
1. 검색 기능 테스트
2. 회원가입/로그인 테스트
3. 선택목록 추가 테스트

## 문제 해결

### 연결 실패

**증상:**
- 백엔드 로그에 "데이터베이스 연결 실패" 메시지

**해결:**
1. 환경 변수 확인 (대소문자 주의)
2. PostgreSQL 서비스가 실행 중인지 확인
3. 방화벽 설정 확인 (Railway는 자동 처리)

### 테이블이 없다는 오류

**증상:**
- "relation does not exist" 오류

**해결:**
1. 스키마가 제대로 생성되었는지 확인:
   ```sql
   \dt
   ```
2. `schema.sql` 파일을 다시 실행

### 권한 오류

**증상:**
- "permission denied" 오류

**해결:**
1. PostgreSQL 서비스의 사용자 권한 확인
2. Railway는 기본적으로 모든 권한을 제공하므로, 문제가 지속되면 서비스 재생성

## 빠른 체크리스트

- [ ] PostgreSQL 서비스가 Railway 프로젝트에 추가됨
- [ ] 데이터베이스 연결 정보 확인
- [ ] Railway CLI로 데이터베이스 접속 성공
- [ ] `schema.sql` 실행 완료
- [ ] `migrate_add_auth.sql` 실행 완료
- [ ] 백엔드 환경 변수 설정 확인
- [ ] 백엔드 로그에서 연결 성공 메시지 확인
- [ ] API 테스트 성공

## 다음 단계

데이터베이스 설정 완료 후:
1. 실제 NCS 데이터 import (필요시)
2. 사용자 데이터 확인
3. API 기능 테스트
4. 모니터링 설정



