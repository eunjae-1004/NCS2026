-- CSV 파일 Import 전 검증 쿼리
-- CSV 파일의 데이터를 확인하는 데 사용

-- ============================================
-- 1. 테이블 구조 확인
-- ============================================
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'ncs_main'
ORDER BY ordinal_position;

-- ============================================
-- 2. 현재 데이터 확인
-- ============================================
SELECT COUNT(*) as current_row_count FROM ncs_main;

-- ============================================
-- 3. 샘플 데이터 확인
-- ============================================
SELECT * FROM ncs_main LIMIT 5;

-- ============================================
-- 4. 데이터 타입 확인
-- ============================================
SELECT 
    COUNT(*) as total,
    COUNT(id_ncs) as has_id,
    COUNT(unit_code) as has_unit_code,
    COUNT(unit_level) as has_unit_level,
    COUNT(unit_element_level) as has_unit_element_level
FROM ncs_main;

-- ============================================
-- 5. 중복 확인
-- ============================================
SELECT id_ncs, COUNT(*) as count
FROM ncs_main
GROUP BY id_ncs
HAVING COUNT(*) > 1;

-- ============================================
-- 6. NULL 값 확인
-- ============================================
SELECT 
    COUNT(*) FILTER (WHERE id_ncs IS NULL) as null_id_ncs,
    COUNT(*) FILTER (WHERE unit_code IS NULL) as null_unit_code,
    COUNT(*) FILTER (WHERE unit_level IS NULL) as null_unit_level
FROM ncs_main;

-- ============================================
-- 7. 데이터 범위 확인
-- ============================================
SELECT 
    MIN(unit_level) as min_level,
    MAX(unit_level) as max_level,
    MIN(unit_element_level) as min_element_level,
    MAX(unit_element_level) as max_element_level
FROM ncs_main;


