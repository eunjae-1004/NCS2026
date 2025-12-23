-- 사용자 인증을 위한 마이그레이션 스크립트
-- 기존 users 테이블에 email, password_hash 컬럼 추가

-- email 컬럼 추가 (UNIQUE 제약 조건)
-- PostgreSQL은 IF NOT EXISTS를 직접 지원하지 않으므로 DO 블록 사용
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
    -- role 컬럼이 없으면 추가
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'role'
    ) THEN
        ALTER TABLE users ADD COLUMN role VARCHAR(50) DEFAULT 'guest';
    ELSE
        -- role 컬럼이 있으면 기본값만 설정
        ALTER TABLE users ALTER COLUMN role SET DEFAULT 'guest';
    END IF;
END $$;

-- 기존 데이터의 role이 NULL이면 'guest'로 설정
UPDATE users 
SET role = 'guest' 
WHERE role IS NULL;

-- 인덱스 추가 (이메일 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- 완료 메시지
DO $$
BEGIN
    RAISE NOTICE '마이그레이션 완료: users 테이블에 email, password_hash 컬럼이 추가되었습니다.';
END $$;

