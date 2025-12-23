-- ksa 테이블 상태 확인 스크립트

-- ============================================
-- 1. 테이블 구조 확인
-- ============================================
SELECT 
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'ksa'
ORDER BY ordinal_position;

-- ============================================
-- 2. 현재 데이터 확인
-- ============================================
SELECT 
    COUNT(*) as total_rows,
    MIN(id) as min_id,
    MAX(id) as max_id
FROM ksa;

-- 기존 데이터 샘플 확인
SELECT * FROM ksa ORDER BY id LIMIT 5;

-- ============================================
-- 3. 시퀀스 상태 확인
-- ============================================
SELECT 
    sequence_name,
    last_value,
    is_called
FROM information_schema.sequences
WHERE sequence_name LIKE 'ksa%';

-- 또는
SELECT 
    pg_get_serial_sequence('ksa', 'id') as sequence_name,
    currval(pg_get_serial_sequence('ksa', 'id')) as current_value;

-- ============================================
-- 4. 중복 id 확인
-- ============================================
SELECT id, COUNT(*) as count
FROM ksa
GROUP BY id
HAVING COUNT(*) > 1;


