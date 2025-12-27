-- ============================================
-- unit_definition 테이블 최적화
-- 행 개수가 많아서 메모리를 많이 차지하는 경우
-- ============================================

-- ============================================
-- 1단계: 현재 상태 확인
-- ============================================

SELECT 
    '=== 현재 상태 ===' AS info;

SELECT 
    COUNT(*) AS total_rows,
    pg_size_pretty(pg_total_relation_size('public.unit_definition')) AS total_size,
    pg_size_pretty(pg_relation_size('public.unit_definition')) AS table_size,
    pg_size_pretty(pg_total_relation_size('public.unit_definition') - pg_relation_size('public.unit_definition')) AS index_size
FROM unit_definition;

-- ============================================
-- 2단계: ncs_main과의 관계 확인
-- ============================================

SELECT 
    '=== ncs_main과의 관계 ===' AS info;

-- unit_definition에 있지만 ncs_main에 없는 unit_code (고아 데이터)
SELECT 
    COUNT(*) AS orphaned_definitions,
    'unit_definition에 있지만 ncs_main에 없는 데이터' AS description
FROM unit_definition ud
WHERE NOT EXISTS (
    SELECT 1 FROM ncs_main nm 
    WHERE nm.unit_code = ud.unit_code
);

-- ncs_main에 있는 고유한 unit_code 개수
SELECT 
    COUNT(DISTINCT unit_code) AS ncs_main_unique_codes,
    'ncs_main의 고유한 unit_code 개수' AS description
FROM ncs_main
WHERE unit_code IS NOT NULL;

-- unit_definition의 고유한 unit_code 개수
SELECT 
    COUNT(DISTINCT unit_code) AS unit_definition_unique_codes,
    'unit_definition의 고유한 unit_code 개수' AS description
FROM unit_definition;

-- ============================================
-- 3단계: 고아 데이터 확인 (삭제 가능한 데이터)
-- ============================================

SELECT 
    '=== 고아 데이터 상세 확인 ===' AS info;

-- ncs_main에 없는 unit_definition 확인
SELECT 
    ud.id,
    ud.unit_code,
    ud.unit_name,
    LENGTH(ud.unit_definition) AS definition_length,
    ud.created_at
FROM unit_definition ud
WHERE NOT EXISTS (
    SELECT 1 FROM ncs_main nm 
    WHERE nm.unit_code = ud.unit_code
)
ORDER BY ud.id
LIMIT 20;

-- 고아 데이터 개수 및 크기
SELECT 
    COUNT(*) AS orphaned_count,
    pg_size_pretty(SUM(LENGTH(unit_definition))) AS orphaned_text_size
FROM unit_definition ud
WHERE NOT EXISTS (
    SELECT 1 FROM ncs_main nm 
    WHERE nm.unit_code = ud.unit_code
);

-- ============================================
-- 4단계: NULL 정의 확인
-- ============================================

SELECT 
    '=== NULL 정의 확인 ===' AS info;

SELECT 
    COUNT(*) AS null_definition_count
FROM unit_definition
WHERE unit_definition IS NULL OR unit_definition = '';

-- ============================================
-- 5단계: 정리 실행 (선택사항)
-- ============================================

-- ⚠️ 주의: 아래 명령어들은 실제로 데이터를 삭제합니다!
-- 실행 전에 위의 SELECT 문으로 삭제될 데이터를 확인하세요!

-- 방법 1: 고아 데이터 삭제 (ncs_main에 없는 정의)
-- BEGIN;
-- DELETE FROM unit_definition ud
-- WHERE NOT EXISTS (
--     SELECT 1 FROM ncs_main nm 
--     WHERE nm.unit_code = ud.unit_code
-- );
-- COMMIT;

-- 방법 2: NULL 정의 삭제 (선택사항)
-- BEGIN;
-- DELETE FROM unit_definition
-- WHERE unit_definition IS NULL OR unit_definition = '';
-- COMMIT;

-- ============================================
-- 6단계: 인덱스 최적화 (선택사항)
-- ============================================

-- 인덱스 재구성 (fragmentation 제거)
-- VACUUM ANALYZE unit_definition;

-- ============================================
-- 7단계: 정리 후 상태 확인
-- ============================================

SELECT 
    '=== 정리 후 상태 ===' AS info;

SELECT 
    COUNT(*) AS total_rows_after,
    pg_size_pretty(pg_total_relation_size('public.unit_definition')) AS total_size_after
FROM unit_definition;

