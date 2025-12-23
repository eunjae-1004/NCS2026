-- ksa 테이블에 created_at과 updated_at 컬럼 추가
-- 이미 테이블이 존재하는 경우 사용

-- 1. created_at 컬럼 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ksa' AND column_name = 'created_at'
    ) THEN
        ALTER TABLE ksa 
        ADD COLUMN created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 2. updated_at 컬럼 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'ksa' AND column_name = 'updated_at'
    ) THEN
        ALTER TABLE ksa 
        ADD COLUMN updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
    END IF;
END $$;

-- 3. 기존 데이터의 created_at과 updated_at을 현재 시간으로 설정
UPDATE ksa 
SET 
    created_at = CURRENT_TIMESTAMP,
    updated_at = CURRENT_TIMESTAMP
WHERE created_at IS NULL OR updated_at IS NULL;

-- 4. updated_at 트리거 추가 (없는 경우에만)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger 
        WHERE tgname = 'update_ksa_updated_at'
    ) THEN
        CREATE TRIGGER update_ksa_updated_at BEFORE UPDATE ON ksa
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- 확인
SELECT 
    column_name,
    data_type,
    column_default
FROM information_schema.columns
WHERE table_name = 'ksa'
ORDER BY ordinal_position;

