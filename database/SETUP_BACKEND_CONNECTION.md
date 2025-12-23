# 백엔드 API 서버와 데이터베이스 연결 설정 가이드

## 1. 환경 변수 파일 생성

`server` 디렉토리에 `.env` 파일을 생성하세요:

```bash
cd server
```

`.env` 파일 생성 (Windows PowerShell):
```powershell
Copy-Item .env.example .env
```

또는 직접 생성:

### `.env` 파일 내용

```env
# PostgreSQL 데이터베이스 연결 설정
DB_HOST=localhost
DB_PORT=5432
DB_NAME=NCS_2026
DB_USER=postgres
DB_PASSWORD=your_password_here

# 서버 포트
PORT=3000
```

**중요:** `DB_PASSWORD`를 실제 PostgreSQL 비밀번호로 변경하세요!

## 2. 데이터베이스 연결 테스트

### 방법 1: SQL 쿼리로 테스트

pgAdmin Query Tool에서 `database/test_connection.sql` 파일을 실행:

```sql
-- 연결 확인
SELECT current_database(), current_user;

-- 테이블 목록 확인
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public';

-- 데이터 개수 확인
SELECT COUNT(*) FROM ncs_main;
SELECT COUNT(*) FROM ksa;
```

### 방법 2: Node.js 스크립트로 테스트

`server` 디렉토리에서:

```bash
node -e "import('./db.js').then(db => db.default.query('SELECT NOW()').then(r => console.log('✅ 연결 성공:', r.rows[0])).catch(e => console.error('❌ 연결 실패:', e.message)))"
```

## 3. 백엔드 서버 실행

```bash
cd server
npm install  # 아직 설치하지 않았다면
npm run dev
```

서버가 시작되면 다음과 같은 메시지가 표시됩니다:

```
✅ PostgreSQL 데이터베이스 연결 성공
🚀 서버가 http://localhost:3000 에서 실행 중입니다
```

## 4. API 테스트

### 브라우저에서 테스트

1. **기본 연결 확인:**
   ```
   http://localhost:3000
   ```

2. **능력단위 검색:**
   ```
   http://localhost:3000/api/ability-units?keyword=품질
   ```

3. **기관 목록:**
   ```
   http://localhost:3000/api/organizations
   ```

### curl로 테스트 (PowerShell)

```powershell
# 기본 연결 확인
Invoke-WebRequest -Uri http://localhost:3000

# 능력단위 검색
Invoke-WebRequest -Uri "http://localhost:3000/api/ability-units?keyword=품질" | Select-Object -ExpandProperty Content
```

## 5. 프론트엔드와 연동

프론트엔드에서 실제 API를 사용하도록 설정:

### `.env` 파일 생성 (프로젝트 루트)

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_USE_MOCK_DATA=false
```

### 프론트엔드 재시작

```bash
npm run dev
```

## 6. 문제 해결

### 오류: "데이터베이스 연결 실패"

1. **PostgreSQL이 실행 중인지 확인:**
   ```powershell
   # PostgreSQL 서비스 확인
   Get-Service -Name postgresql*
   ```

2. **환경 변수 확인:**
   - `.env` 파일이 `server` 디렉토리에 있는지
   - `DB_NAME`, `DB_USER`, `DB_PASSWORD`가 올바른지

3. **데이터베이스가 존재하는지 확인:**
   ```sql
   SELECT datname FROM pg_database WHERE datname = 'NCS_2026';
   ```

4. **연결 권한 확인:**
   ```sql
   -- PostgreSQL에 연결하여 확인
   \l  -- 데이터베이스 목록
   \c NCS_2026  -- 데이터베이스 연결
   ```

### 오류: "relation does not exist"

테이블이 생성되지 않았습니다. `database/schema.sql`을 실행하세요:

```sql
-- pgAdmin Query Tool에서 실행
\i database/schema.sql
```

### 오류: "password authentication failed"

1. PostgreSQL 비밀번호 확인
2. `.env` 파일의 `DB_PASSWORD` 수정
3. `pg_hba.conf` 파일 확인 (필요시)

## 7. 확인 체크리스트

- [ ] `.env` 파일이 `server` 디렉토리에 생성됨
- [ ] `DB_PASSWORD`가 실제 비밀번호로 설정됨
- [ ] PostgreSQL 서비스가 실행 중
- [ ] 데이터베이스 `NCS_2026`가 존재함
- [ ] 테이블들이 생성됨 (`ncs_main`, `ksa`, `organizations` 등)
- [ ] 데이터가 import됨
- [ ] 백엔드 서버가 정상적으로 시작됨
- [ ] API 엔드포인트가 응답함

## 8. 다음 단계

데이터베이스 연결이 완료되면:

1. ✅ 프론트엔드에서 실제 API 사용
2. ✅ 검색 기능 테스트
3. ✅ 상세 페이지에서 KSA 데이터 확인
4. ✅ 장바구니 기능 테스트
5. ✅ 선택 이력 저장 기능 테스트

## 참고 파일

- `server/.env.example` - 환경 변수 예시
- `database/test_connection.sql` - 연결 테스트 쿼리
- `server/db.js` - 데이터베이스 연결 설정
- `server/routes/abilityUnits.js` - API 라우트 (KSA 포함)


