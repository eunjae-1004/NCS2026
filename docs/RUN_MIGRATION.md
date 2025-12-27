# 인증 마이그레이션 실행 가이드

## 문제
회원가입 시 `"email" 이름의 칼럼은 없습니다` 오류가 발생하는 경우, 데이터베이스 마이그레이션이 필요합니다.

## 해결 방법

### 방법 1: psql 명령어로 실행 (권장)

```bash
# PostgreSQL에 접속하여 마이그레이션 실행
psql -U postgres -d ncs_search -f database/migrate_add_auth.sql
```

### 방법 2: pgAdmin 또는 다른 DB 도구에서 실행

1. `database/migrate_add_auth.sql` 파일을 열기
2. 전체 내용을 복사
3. PostgreSQL 클라이언트에서 실행

### 방법 3: 직접 SQL 실행

PostgreSQL 클라이언트에 접속하여 다음 SQL을 실행:

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

-- 기존 데이터 업데이트
UPDATE users SET role = 'guest' WHERE role IS NULL;

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

## 확인

마이그레이션 후 다음 쿼리로 확인:

```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

다음 컬럼들이 있어야 합니다:
- `id`
- `name`
- `email` (새로 추가됨)
- `password_hash` (새로 추가됨)
- `organization_id`
- `role`
- `created_at`
- `updated_at`

## 주의사항

- 마이그레이션은 한 번만 실행하면 됩니다 (중복 실행해도 안전함)
- 기존 사용자 데이터는 유지됩니다
- `email` 컬럼은 NULL을 허용합니다 (Guest 사용자용)


