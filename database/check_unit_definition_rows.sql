-- ============================================
-- unit_definition 테이블 행 개수 및 중복 확인
-- ============================================

-- 1. 행 개수 및 중복 확인 (가장 중요!)
SELECT 
    COUNT(*) AS total_rows,
    COUNT(DISTINCT unit_code) AS unique_unit_codes,
    COUNT(*) - COUNT(DISTINCT unit_code) AS duplicate_rows,
    CASE 
        WHEN COUNT(*) > 0 THEN 
            ROUND((COUNT(*) - COUNT(DISTINCT unit_code))::numeric / COUNT(*)::numeric * 100, 2)
        ELSE 0
    END AS duplicate_percentage
FROM unit_definition;

-- 2. 중복된 unit_code 상세 확인
SELECT 
    unit_code,
    COUNT(*) AS duplicate_count,
    MIN(id) AS first_id,
    MAX(id) AS last_id
FROM unit_definition
GROUP BY unit_code
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 20;

-- 3. 테이블 전체 크기
SELECT 
    pg_size_pretty(pg_total_relation_size('public.unit_definition')) AS total_size,
    pg_size_pretty(pg_relation_size('public.unit_definition')) AS table_size,
    pg_size_pretty(pg_total_relation_size('public.unit_definition') - pg_relation_size('public.unit_definition')) AS index_size;

-- 4. 행당 평균 크기
SELECT 
    COUNT(*) AS total_rows,
    pg_size_pretty(pg_relation_size('public.unit_definition')) AS table_size,
    pg_size_pretty(
        pg_relation_size('public.unit_definition') / NULLIF(COUNT(*), 0)
    ) AS avg_row_size
FROM unit_definition;

