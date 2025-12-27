# Railway 데이터베이스 빠른 설정 가이드

## 🚀 5분 안에 데이터베이스 설정하기

### 1단계: Railway에서 PostgreSQL 확인 (30초)

1. **Railway 대시보드 접속**
   - https://railway.app → 프로젝트 선택

2. **PostgreSQL 서비스 확인**
   - 프로젝트에 PostgreSQL이 있는지 확인
   - 없으면: "New" → "Database" → "PostgreSQL" 클릭

### 2단계: 데이터베이스 접속 (1분)

#### 방법 A: Railway CLI 사용 (권장) ⭐

```bash
# Railway CLI 설치 (한 번만)
npm i -g @railway/cli

# 로그인
railway login

# 프로젝트 연결
railway link

# PostgreSQL에 접속
railway connect postgres
```

#### 방법 B: Railway 대시보드 사용

1. **PostgreSQL 서비스 → "Data" 탭**
2. **"Connect" 버튼 클릭**
3. **제공되는 명령어 복사하여 실행**

### 3단계: 스키마 생성 (2분)

데이터베이스에 접속한 후:

```sql
-- 1. 스키마 파일 내용 확인 (로컬에서)
-- database/schema.sql 파일을 열어서 전체 내용 복사

-- 2. psql에서 실행
-- 복사한 SQL을 붙여넣고 Enter
```

**또는 Railway CLI로 파일 실행:**

```bash
# Railway CLI로 접속한 상태에서
# schema.sql 파일의 전체 내용을 복사하여 psql에 붙여넣기
```

### 4단계: 인증 마이그레이션 (1분)

```sql
-- migrate_add_auth.sql 파일 내용 복사하여 실행
-- 또는 다음 SQL 실행:

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
UPDATE users SET role = 'guest' WHERE role IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

### 5단계: 초기 데이터 (선택사항, 30초)

```sql
-- database/init.sql 파일 내용 복사하여 실행
-- 또는 다음 SQL 실행:

-- 기관 데이터
INSERT INTO organizations (id, name, type) VALUES
('org_001', '공공기관 A', 'public'),
('org_002', '기업 B', 'enterprise'),
('org_003', '기관 C', 'public')
ON CONFLICT (id) DO NOTHING;

-- 표준 코드 데이터
INSERT INTO standard_codes (code, name, type) VALUES
('dept_001', '품질관리', 'departments'),
('dept_002', '생산관리', 'departments'),
('dept_003', '인사관리', 'departments'),
('ind_001', '제조업', 'industries'),
('ind_002', '서비스업', 'industries'),
('job_001', '품질관리사', 'jobs'),
('job_002', '생산관리사', 'jobs')
ON CONFLICT (code, type) DO NOTHING;
```

### 6단계: 확인 (30초)

```sql
-- 테이블 목록 확인
\dt

-- users 테이블 구조 확인
\d users

-- ncs_main 테이블 확인
\d ncs_main

-- 데이터 개수 확인
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM organizations;
```

### 7단계: 백엔드 환경 변수 확인 (1분)

1. **Railway → 백엔드 서비스 → Variables**
2. **다음 변수들이 PostgreSQL 서비스와 일치하는지 확인:**
   ```
   DB_HOST=xxx.railway.app
   DB_PORT=5432
   DB_NAME=railway
   DB_USER=postgres
   DB_PASSWORD=xxx
   ```

3. **PostgreSQL 서비스의 Variables와 비교**
   - PostgreSQL → Variables 탭에서 동일한 값인지 확인

### 8단계: 백엔드 재시작 (30초)

1. **백엔드 서비스 → "Redeploy" 클릭**
2. **또는 새 커밋 푸시하여 자동 재배포**

### 9단계: 연결 테스트

1. **백엔드 로그 확인**
   - Railway → 백엔드 서비스 → Deployments → 최신 배포 → Logs
   - 다음 메시지 확인:
     ```
     ✅ PostgreSQL 데이터베이스 연결 성공
     📊 데이터베이스 모드로 API 서버 실행 중
     ```

2. **프론트엔드에서 테스트**
   - 회원가입/로그인 테스트
   - 검색 기능 테스트

## ⚠️ 문제 해결

### 연결 실패

**확인 사항:**
1. 환경 변수가 올바른지 확인
2. PostgreSQL 서비스가 실행 중인지 확인
3. 백엔드 서비스를 재시작

### 테이블이 없다는 오류

**해결:**
```sql
-- 스키마가 생성되었는지 확인
\dt

-- 없으면 schema.sql 다시 실행
```

### 권한 오류

**해결:**
- Railway는 자동으로 권한을 설정하므로, 문제가 지속되면 PostgreSQL 서비스를 재생성

## 📋 체크리스트

- [ ] PostgreSQL 서비스 추가됨
- [ ] 데이터베이스 접속 성공
- [ ] schema.sql 실행 완료
- [ ] migrate_add_auth.sql 실행 완료
- [ ] init.sql 실행 완료 (선택사항)
- [ ] 백엔드 환경 변수 확인
- [ ] 백엔드 재시작
- [ ] 연결 성공 메시지 확인
- [ ] API 테스트 성공

## 🎉 완료!

데이터베이스 설정이 완료되었습니다. 이제 애플리케이션이 실제 데이터베이스를 사용합니다!



