# pgAdmin4에서 데이터베이스 설정 완료 가이드

pgAdmin4 연결 성공 후 다음 단계입니다.

## ✅ 완료된 단계
- [x] Railway PostgreSQL 연결 성공

## 📋 다음 단계

### 1단계: 스키마 생성 (테이블 생성) - 필수

로컬에서 하듯이 테이블을 생성하면 됩니다!

#### 방법 A: Query Tool에서 SQL 파일 실행 (권장)

1. **Query Tool 열기**
   - pgAdmin4에서 연결된 서버 → Databases → `railway` (또는 데이터베이스 이름) 우클릭
   - "Query Tool" 선택

2. **스키마 파일 열기**
   - Query Tool 상단의 "Open File" 버튼 클릭 (또는 Ctrl+O)
   - 프로젝트의 `database/schema.sql` 파일 선택

3. **스키마 실행**
   - "Execute" 버튼 클릭 (F5)
   - 또는 전체 SQL 선택 후 F5

4. **실행 결과 확인**
   - 하단 "Messages" 탭에서 오류 확인
   - 성공 메시지 확인:
     ```
     Query returned successfully with no result in XXX ms.
     ```

#### 방법 B: SQL 직접 복사하여 실행

1. **Query Tool 열기**

2. **schema.sql 파일 열기**
   - 프로젝트 폴더에서 `database/schema.sql` 파일을 텍스트 에디터로 열기
   - 전체 내용 복사 (Ctrl+A, Ctrl+C)

3. **Query Tool에 붙여넣기**
   - Query Tool에 붙여넣기 (Ctrl+V)

4. **Execute (F5)**

### 2단계: 테이블 생성 확인

1. **테이블 목록 확인**
   - 왼쪽 트리에서: 서버 → Databases → `railway` → Schemas → `public` → Tables
   - 다음 테이블들이 생성되었는지 확인:
     - ✅ `ncs_main`
     - ✅ `unit_definition`
     - ✅ `performance_criteria`
     - ✅ `ksa`
     - ✅ `subcategory`
     - ✅ `users`
     - ✅ `organizations`
     - ✅ `selection_history`
     - ✅ `cart_items`
     - ✅ `cart_sets`
     - ✅ `cart_set_items`
     - ✅ `alias_mapping`
     - ✅ `standard_codes`

2. **또는 Query Tool에서 확인**
   ```sql
   -- 테이블 목록 확인
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   ORDER BY table_name;
   ```

### 3단계: 인증 마이그레이션 (필수)

사용자 인증 기능을 사용하려면 반드시 실행해야 합니다!

1. **Query Tool에서 새 쿼리 실행**

2. **migrate_add_auth.sql 파일 실행**
   - `database/migrate_add_auth.sql` 파일을 열어서 전체 내용 복사
   - Query Tool에 붙여넣기
   - Execute (F5)

3. **또는 직접 SQL 실행:**
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

4. **users 테이블 구조 확인**
   ```sql
   -- users 테이블 구조 확인
   \d users
   ```
   또는 pgAdmin4에서:
   - `users` 테이블 우클릭 → "Properties" → "Columns" 탭
   - 다음 컬럼이 있는지 확인:
     - ✅ `id`
     - ✅ `name`
     - ✅ `email` (새로 추가됨)
     - ✅ `password_hash` (새로 추가됨)
     - ✅ `role` (새로 추가됨)
     - ✅ `organization_id`
     - ✅ `created_at`
     - ✅ `updated_at`

### 4단계: 초기 데이터 삽입 (선택사항)

테스트를 위한 샘플 데이터를 삽입할 수 있습니다.

1. **Query Tool에서 새 쿼리 실행**

2. **init.sql 파일 실행**
   - `database/init.sql` 파일을 열어서 전체 내용 복사
   - Query Tool에 붙여넣기
   - Execute (F5)

3. **데이터 확인**
   ```sql
   -- 기관 데이터 확인
   SELECT * FROM organizations;

   -- 표준 코드 확인
   SELECT * FROM standard_codes LIMIT 10;
   ```

### 5단계: 실제 NCS 데이터 Import (필요시)

실제 NCS 데이터가 있다면:

#### 방법 A: CSV 파일 Import

1. **CSV 파일 준비**
   - CSV 파일이 로컬에 있어야 함

2. **pgAdmin4에서 Import**
   - 테이블 우클릭 (예: `ncs_main`)
   - "Import/Export Data..." 선택
   - Import 탭:
     - **Filename**: CSV 파일 경로 선택
     - **Format**: `csv`
     - **Header**: ✅ 체크 (CSV에 헤더가 있는 경우)
     - **Delimiter**: `,` (쉼표)
   - **Options** 탭:
     - **Encoding**: `UTF8`
   - **OK** 클릭

#### 방법 B: SQL INSERT 문 사용

1. **데이터를 SQL INSERT 문으로 변환**
   - Excel이나 스크립트를 사용하여 SQL INSERT 문 생성

2. **Query Tool에서 실행**
   - INSERT 문을 복사하여 Query Tool에 붙여넣기
   - Execute (F5)

#### 방법 C: COPY 명령어 사용

```sql
-- CSV 파일이 Railway 서버에 있는 경우 (일반적으로 불가능)
COPY ncs_main FROM '/path/to/ncs_main.csv' WITH CSV HEADER;
```

**주의**: Railway에서는 로컬 파일 시스템에 직접 접근할 수 없으므로, pgAdmin4의 Import 기능을 사용하거나 SQL INSERT 문을 사용해야 합니다.

### 6단계: 백엔드 환경 변수 확인

1. **Railway → 백엔드 서비스 → Variables**

2. **다음 변수들이 PostgreSQL 서비스와 일치하는지 확인:**
   ```
   DB_HOST=postgres.railway.internal  (또는 Public 도메인)
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=(PostgreSQL 서비스의 PGPASSWORD와 동일)
   ```

3. **일치하지 않으면 수정**

### 7단계: 백엔드 재시작

1. **Railway → 백엔드 서비스 → "Redeploy"**

2. **로그 확인**
   - Deployments → 최신 배포 → Logs
   - 다음 메시지 확인:
     ```
     ✅ PostgreSQL 데이터베이스 연결 성공
     📊 데이터베이스 모드로 API 서버 실행 중
     ```

### 8단계: 연결 테스트

1. **프론트엔드에서 테스트**
   - 회원가입/로그인 테스트
   - 검색 기능 테스트
   - 선택목록 추가 테스트

2. **데이터 확인**
   - pgAdmin4에서 테이블 데이터 확인
   - 회원가입한 사용자가 `users` 테이블에 추가되었는지 확인

## 📝 주의사항

### 로컬과 동일하게 작업 가능

- ✅ 테이블 생성: 로컬과 동일
- ✅ 데이터 삽입: 로컬과 동일
- ✅ 쿼리 실행: 로컬과 동일
- ✅ 데이터 수정: 로컬과 동일

### 차이점

- ❌ 로컬 파일 경로 사용 불가: Railway 서버의 파일 시스템에 직접 접근 불가
- ✅ Import 기능 사용: pgAdmin4의 Import/Export 기능 사용
- ✅ SQL 문 사용: INSERT, UPDATE, DELETE 등 SQL 문 사용 가능

## 🎯 빠른 체크리스트

- [ ] schema.sql 실행 완료
- [ ] 테이블 목록 확인 (13개 테이블)
- [ ] migrate_add_auth.sql 실행 완료
- [ ] users 테이블에 email, password_hash, role 컬럼 확인
- [ ] init.sql 실행 완료 (선택사항)
- [ ] 백엔드 환경 변수 확인
- [ ] 백엔드 재시작
- [ ] 연결 성공 메시지 확인
- [ ] 프론트엔드에서 기능 테스트

## 🎉 완료!

데이터베이스 설정이 완료되었습니다. 이제 애플리케이션이 실제 데이터베이스를 사용합니다!

## 다음 단계

1. **실제 NCS 데이터 Import** (필요시)
2. **사용자 데이터 확인**
3. **API 기능 테스트**
4. **모니터링 설정**



