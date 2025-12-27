# pgAdmin4로 Railway PostgreSQL 설정 가이드

pgAdmin4를 사용하여 Railway PostgreSQL 데이터베이스를 설정하는 방법입니다.

## 1단계: Railway에서 연결 정보 확인

### PostgreSQL 서비스에서 연결 정보 가져오기

1. **Railway 대시보드 접속**
   - https://railway.app → 프로젝트 선택

2. **PostgreSQL 서비스 선택**
   - 프로젝트에서 PostgreSQL 서비스 클릭

3. **Variables 탭에서 연결 정보 확인**
   - ⚠️ **중요**: `PGHOST`가 `postgres.railway.internal`인 경우
     - 이것은 **내부 네트워크 주소**로 외부 접속 불가
     - **Public Networking을 활성화**해야 합니다 (아래 참고)
   - `PGHOST`: 호스트 주소 (예: `containers-us-west-xxx.railway.app`)
   - `PGPORT`: 포트 번호 (보통 `5432`)
   - `PGDATABASE`: 데이터베이스 이름 (보통 `railway`)
   - `PGUSER`: 사용자 이름 (보통 `postgres`)
   - `PGPASSWORD`: 비밀번호

   또는 `DATABASE_URL` 전체 연결 문자열 확인:
   - 예: `postgresql://postgres:password@host:port/railway`

### ⚠️ Public Networking 활성화 (필수!)

**`postgres.railway.internal`은 외부 접속 불가!**

1. **PostgreSQL 서비스 → Settings 탭**
2. **"Networking" 또는 "Public Networking" 섹션 찾기**
3. **"Generate Domain" 버튼 클릭** 또는 **"Public Networking" 토글 ON**
4. **생성된 Public 도메인 확인**
   - 예: `containers-us-west-123.railway.app`
   - 이 도메인을 pgAdmin4에서 사용하세요!

## 2단계: pgAdmin4에서 서버 등록

### 새 서버 등록

1. **pgAdmin4 실행**

2. **서버 추가**
   - 왼쪽 트리에서 "Servers" 우클릭
   - "Create" → "Server..." 선택

3. **General 탭 설정**
   - **Name**: `Railway PostgreSQL` (원하는 이름)
   - **Server group**: `Servers` (기본값)
   - **Comments**: (선택사항) Railway 프로덕션 데이터베이스

4. **Connection 탭 설정** ⭐ 중요
   - **Host name/address**: Railway의 `PGHOST` 값
   - **Port**: Railway의 `PGPORT` 값 (보통 `5432`)
   - **Maintenance database**: Railway의 `PGDATABASE` 값 (보통 `railway`)
   - **Username**: Railway의 `PGUSER` 값 (보통 `postgres`)
   - **Password**: Railway의 `PGPASSWORD` 값
   - **Save password**: ✅ 체크 (선택사항, 편의를 위해)

5. **SSL 탭 설정** (중요!)
   - Railway는 SSL 연결을 요구할 수 있습니다
   - **SSL mode**: `Require` 또는 `Prefer` 선택
   - 또는 `Allow` 선택 (연결 테스트 후 조정)

6. **Advanced 탭** (선택사항)
   - **DB restriction**: 특정 데이터베이스만 보이게 하려면 입력

7. **Save** 클릭

## 3단계: 연결 테스트

1. **서버 연결**
   - 등록한 서버를 더블클릭하거나 우클릭 → "Connect Server"
   - 비밀번호를 입력하라는 창이 나오면 Railway의 `PGPASSWORD` 입력

2. **연결 성공 확인**
   - 서버 아이콘이 열린 상태로 변경됨
   - 왼쪽 트리에서 데이터베이스 목록이 보임

## 4단계: 스키마 생성

### Query Tool 사용

1. **Query Tool 열기**
   - Railway PostgreSQL 서버 → Databases → `railway` (또는 데이터베이스 이름) 우클릭
   - "Query Tool" 선택

2. **스키마 파일 열기**
   - Query Tool에서 "Open File" 버튼 클릭 (또는 Ctrl+O)
   - `database/schema.sql` 파일 선택

3. **스키마 실행**
   - "Execute" 버튼 클릭 (F5)
   - 또는 전체 SQL 선택 후 F5

4. **실행 결과 확인**
   - 하단 "Messages" 탭에서 오류 확인
   - 성공 메시지 확인

### 또는 SQL 직접 실행

1. **Query Tool 열기**

2. **schema.sql 내용 복사**
   - `database/schema.sql` 파일을 열어서 전체 내용 복사

3. **Query Tool에 붙여넣기**

4. **Execute (F5)**

## 5단계: 인증 마이그레이션

1. **Query Tool에서 새 쿼리 실행**

2. **migrate_add_auth.sql 내용 실행**
   - `database/migrate_add_auth.sql` 파일 내용을 복사하여 실행
   - 또는 다음 SQL 실행:

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

-- role 컬럼 설정
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

-- 기존 데이터 업데이트
UPDATE users 
SET role = 'guest' 
WHERE role IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

3. **Execute (F5)**

## 6단계: 초기 데이터 삽입 (선택사항)

1. **Query Tool에서 새 쿼리 실행**

2. **init.sql 내용 실행**
   - `database/init.sql` 파일 내용을 복사하여 실행

3. **Execute (F5)**

## 7단계: 테이블 확인

### 테이블 목록 확인

1. **데이터베이스 확장**
   - Railway PostgreSQL → Databases → `railway` → Schemas → `public` → Tables

2. **생성된 테이블 확인**
   - 다음 테이블들이 보여야 합니다:
     - `ncs_main`
     - `unit_definition`
     - `performance_criteria`
     - `ksa`
     - `subcategory`
     - `users`
     - `organizations`
     - `selection_history`
     - `cart_items`
     - `cart_sets`
     - `cart_set_items`
     - `alias_mapping`
     - `standard_codes`

### 테이블 구조 확인

1. **테이블 선택**
   - 확인하고 싶은 테이블 우클릭
   - "Properties" 선택

2. **Columns 탭에서 컬럼 확인**
   - 모든 컬럼이 올바르게 생성되었는지 확인

### 데이터 확인

1. **테이블 우클릭 → "View/Edit Data" → "All Rows"**

2. **또는 Query Tool에서:**
```sql
-- 테이블 목록 확인
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- users 테이블 구조 확인
\d users

-- 데이터 개수 확인
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM organizations;
SELECT COUNT(*) FROM standard_codes;
```

## 8단계: 백엔드 환경 변수 확인

Railway 백엔드 서비스의 환경 변수가 pgAdmin4에서 사용한 연결 정보와 일치하는지 확인:

1. **Railway → 백엔드 서비스 → Variables**

2. **다음 변수 확인:**
   ```
   DB_HOST=xxx.railway.app  (pgAdmin4의 Host와 동일)
   DB_PORT=5432             (pgAdmin4의 Port와 동일)
   DB_NAME=railway          (pgAdmin4의 Database와 동일)
   DB_USER=postgres         (pgAdmin4의 Username과 동일)
   DB_PASSWORD=xxx         (pgAdmin4의 Password와 동일)
   ```

## 9단계: 백엔드 재시작

1. **Railway → 백엔드 서비스 → "Redeploy"**

2. **로그 확인**
   - Deployments → 최신 배포 → Logs
   - 다음 메시지 확인:
     ```
     ✅ PostgreSQL 데이터베이스 연결 성공
     📊 데이터베이스 모드로 API 서버 실행 중
     ```

## 문제 해결

### 연결 실패: [Errno 11001] getaddrinfo failed ⚠️

**증상:**
- pgAdmin4에서 "Unable to connect to server: [Errno 11001] getaddrinfo failed" 오류
- DNS 조회 실패 또는 호스트 주소 문제

**해결 방법:**

#### 1. Railway 연결 정보 재확인 (가장 중요!)

1. **Railway 대시보드 → PostgreSQL 서비스 → Variables 탭**
2. **`PGHOST` 값 확인:**
   - 올바른 형식: `containers-us-west-xxx.railway.app` 또는 `xxx.up.railway.app`
   - ❌ 잘못된 형식: `localhost`, `127.0.0.1`, IP 주소만
   - ✅ 올바른 형식: 전체 도메인 이름

3. **pgAdmin4 Connection 탭에서:**
   - **Host name/address**: Railway의 `PGHOST` 값을 **정확히** 복사하여 붙여넣기
   - 공백이나 특수 문자가 포함되지 않았는지 확인
   - 앞뒤 공백 제거

#### 2. Railway Public Network 확인

1. **PostgreSQL 서비스 → Settings 탭**
2. **"Public Networking" 확인**
   - Public Networking이 활성화되어 있어야 외부에서 접속 가능
   - 비활성화되어 있으면 활성화

#### 3. 연결 정보 형식 확인

**올바른 연결 정보 예시:**
```
Host: containers-us-west-123.railway.app
Port: 5432
Database: railway
Username: postgres
Password: (Railway에서 제공한 비밀번호)
```

**잘못된 연결 정보:**
```
Host: localhost  ❌
Host: 127.0.0.1  ❌
Host: railway.app  ❌ (서브도메인 없음)
```

#### 4. DATABASE_URL 사용 (대안)

Railway에서 `DATABASE_URL`을 제공하는 경우:

1. **DATABASE_URL 형식:**
   ```
   postgresql://postgres:password@containers-us-west-xxx.railway.app:5432/railway
   ```

2. **pgAdmin4에서 파싱:**
   - `postgresql://` 다음이 호스트
   - `:` 다음이 포트
   - `/` 다음이 데이터베이스 이름
   - `@` 앞이 사용자:비밀번호

#### 5. 네트워크 연결 테스트

**PowerShell에서 테스트:**
```powershell
# 호스트 연결 테스트
Test-NetConnection -ComputerName containers-us-west-xxx.railway.app -Port 5432
```

**또는 ping 테스트:**
```powershell
ping containers-us-west-xxx.railway.app
```

#### 6. 방화벽/프록시 확인

- 회사 네트워크나 방화벽이 PostgreSQL 포트(5432)를 차단할 수 있음
- VPN 사용 시 VPN 연결 확인
- 프록시 설정 확인

### 일반적인 연결 실패

**증상:**
- pgAdmin4에서 "could not connect to server" 오류

**해결:**
1. **SSL 설정 확인**
   - Connection 탭 → SSL mode를 `Require` 또는 `Prefer`로 변경

2. **방화벽 확인**
   - Railway는 자동으로 방화벽을 설정하지만, 확인 필요

3. **연결 정보 재확인**
   - Railway Variables에서 최신 정보 확인
   - 비밀번호가 변경되었을 수 있음

### SSL 오류

**증상:**
- "SSL connection required" 오류

**해결:**
- Connection 탭 → SSL mode를 `Require`로 변경

### 테이블이 없다는 오류

**증상:**
- 백엔드에서 "relation does not exist" 오류

**해결:**
1. **pgAdmin4에서 테이블 확인**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **없으면 schema.sql 다시 실행**

### 권한 오류

**증상:**
- "permission denied" 오류

**해결:**
- Railway는 기본적으로 모든 권한을 제공하므로, 문제가 지속되면 Railway 지원팀에 문의

## pgAdmin4 사용 팁

### 1. 쿼리 저장

- Query Tool에서 작성한 쿼리를 저장하여 나중에 재사용

### 2. 데이터 Export/Import

- 테이블 우클릭 → "Backup" 또는 "Restore"
- CSV 파일로 데이터 export/import 가능

### 3. 스키마 시각화

- Tools → "ERD Tool" 사용하여 테이블 관계 시각화

### 4. 쿼리 히스토리

- Query Tool → "History" 탭에서 이전 쿼리 확인

## 빠른 체크리스트

- [ ] Railway에서 PostgreSQL 연결 정보 확인
- [ ] pgAdmin4에 서버 등록 완료
- [ ] 연결 테스트 성공
- [ ] schema.sql 실행 완료
- [ ] migrate_add_auth.sql 실행 완료
- [ ] init.sql 실행 완료 (선택사항)
- [ ] 테이블 목록 확인
- [ ] 백엔드 환경 변수 확인
- [ ] 백엔드 재시작
- [ ] 연결 성공 메시지 확인

## 완료!

pgAdmin4를 사용하여 Railway PostgreSQL 데이터베이스 설정이 완료되었습니다! 🎉

