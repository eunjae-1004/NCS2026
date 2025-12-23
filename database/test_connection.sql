-- 데이터베이스 연결 및 기본 테스트 쿼리

-- ============================================
-- 1. 연결 확인
-- ============================================
SELECT 
    '데이터베이스 연결 성공!' as status,
    current_database() as database_name,
    current_user as user_name,
    version() as postgresql_version;

-- ============================================
-- 2. 테이블 목록 확인
-- ============================================
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
ORDER BY table_name;

-- ============================================
-- 3. 각 테이블의 데이터 개수 확인
-- ============================================
SELECT 
    'ncs_main' as table_name,
    COUNT(*) as row_count
FROM ncs_main
UNION ALL
SELECT 
    'unit_definition' as table_name,
    COUNT(*) as row_count
FROM unit_definition
UNION ALL
SELECT 
    'performance_criteria' as table_name,
    COUNT(*) as row_count
FROM performance_criteria
UNION ALL
SELECT 
    'ksa' as table_name,
    COUNT(*) as row_count
FROM ksa
UNION ALL
SELECT 
    'organizations' as table_name,
    COUNT(*) as row_count
FROM organizations
UNION ALL
SELECT 
    'standard_codes' as table_name,
    COUNT(*) as row_count
FROM standard_codes
ORDER BY table_name;

-- ============================================
-- 4. 샘플 데이터 확인
-- ============================================
-- ncs_main 샘플
SELECT '=== ncs_main 샘플 ===' as info;
SELECT 
    id_ncs,
    unit_code,
    unit_name,
    unit_level
FROM ncs_main
LIMIT 5;

-- ksa 샘플
SELECT '=== ksa 샘플 ===' as info;
SELECT 
    id,
    unit_code,
    unit_element_code,
    type,
    LEFT(content, 50) as content_preview
FROM ksa
LIMIT 5;

-- organizations 샘플
SELECT '=== organizations 샘플 ===' as info;
SELECT * FROM organizations LIMIT 5;

-- standard_codes 샘플
SELECT '=== standard_codes 샘플 ===' as info;
SELECT * FROM standard_codes LIMIT 5;


