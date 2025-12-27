-- ============================================
-- unit_definition 테이블 메모리 사용량 분석
-- 원인 파악을 위한 진단 쿼리
-- ============================================

-- ============================================
-- 1단계: 테이블 기본 정보 확인
-- ============================================

SELECT 
    '=== unit_definition 테이블 기본 정보 ===' AS info;

-- 테이블 크기 확인
SELECT 
    pg_size_pretty(pg_total_relation_size('public.unit_definition')) AS total_size,
    pg_size_pretty(pg_relation_size('public.unit_definition')) AS table_size,
    pg_size_pretty(pg_total_relation_size('public.unit_definition') - pg_relation_size('public.unit_definition')) AS index_size;

-- 행 개수 확인
SELECT 
    COUNT(*) AS total_rows,
    COUNT(DISTINCT unit_code) AS unique_unit_codes,
    COUNT(*) - COUNT(DISTINCT unit_code) AS duplicate_rows
FROM unit_definition;

-- ============================================
-- 2단계: 중복 데이터 확인
-- ============================================

SELECT 
    '=== 중복 데이터 확인 ===' AS info;

-- unit_code별 중복 개수 확인
SELECT 
    unit_code,
    COUNT(*) AS duplicate_count,
    STRING_AGG(id::text, ', ' ORDER BY id) AS duplicate_ids
FROM unit_definition
GROUP BY unit_code
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 20;

-- 중복된 전체 행 확인
SELECT 
    id,
    unit_code,
    unit_name,
    LENGTH(unit_definition) AS definition_length,
    created_at,
    updated_at
FROM unit_definition
WHERE unit_code IN (
    SELECT unit_code 
    FROM unit_definition 
    GROUP BY unit_code 
    HAVING COUNT(*) > 1
)
ORDER BY unit_code, id;

-- ============================================
-- 3단계: 데이터 크기 분석
-- ============================================

SELECT 
    '=== 데이터 크기 분석 ===' AS info;

-- unit_definition 컬럼의 평균/최대 길이 확인
SELECT 
    AVG(LENGTH(unit_definition)) AS avg_definition_length,
    MAX(LENGTH(unit_definition)) AS max_definition_length,
    MIN(LENGTH(unit_definition)) AS min_definition_length,
    SUM(LENGTH(unit_definition)) AS total_definition_size
FROM unit_definition
WHERE unit_definition IS NOT NULL;

-- 큰 정의(definition)를 가진 행 확인
SELECT 
    id,
    unit_code,
    unit_name,
    LENGTH(unit_definition) AS definition_length,
    LEFT(unit_definition, 100) AS definition_preview
FROM unit_definition
WHERE unit_definition IS NOT NULL
ORDER BY LENGTH(unit_definition) DESC
LIMIT 20;

-- ============================================
-- 4단계: 인덱스 확인
-- ============================================

SELECT 
    '=== 인덱스 정보 ===' AS info;

-- 인덱스 목록 및 크기
SELECT 
    indexname,
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size,
    indexdef
FROM pg_indexes
WHERE tablename = 'unit_definition'
ORDER BY pg_relation_size(indexname::regclass) DESC;

-- ============================================
-- 5단계: NULL 값 확인
-- ============================================

SELECT 
    '=== NULL 값 확인 ===' AS info;

SELECT 
    COUNT(*) AS total_rows,
    COUNT(unit_definition) AS rows_with_definition,
    COUNT(*) - COUNT(unit_definition) AS rows_without_definition,
    COUNT(DISTINCT unit_code) AS unique_unit_codes,
    COUNT(DISTINCT unit_name) AS unique_unit_names
FROM unit_definition;

-- unit_definition이 NULL인 행 확인
SELECT 
    id,
    unit_code,
    unit_name,
    created_at
FROM unit_definition
WHERE unit_definition IS NULL
LIMIT 20;

-- ============================================
-- 6단계: ncs_main과의 관계 확인
-- ============================================

SELECT 
    '=== ncs_main과의 관계 확인 ===' AS info;

-- unit_definition에 있지만 ncs_main에 없는 unit_code
SELECT 
    COUNT(*) AS orphaned_definitions
FROM unit_definition ud
WHERE NOT EXISTS (
    SELECT 1 FROM ncs_main nm 
    WHERE nm.unit_code = ud.unit_code
);

-- ncs_main에 있지만 unit_definition에 없는 unit_code
SELECT 
    COUNT(DISTINCT unit_code) AS missing_definitions
FROM ncs_main nm
WHERE NOT EXISTS (
    SELECT 1 FROM unit_definition ud 
    WHERE ud.unit_code = nm.unit_code
);

-- unit_code별 정의 개수 비교
SELECT 
    nm.unit_code,
    COUNT(DISTINCT nm.id_ncs) AS ncs_main_count,
    COUNT(DISTINCT ud.id) AS unit_definition_count
FROM ncs_main nm
LEFT JOIN unit_definition ud ON nm.unit_code = ud.unit_code
GROUP BY nm.unit_code
HAVING COUNT(DISTINCT ud.id) > 1
ORDER BY COUNT(DISTINCT ud.id) DESC
LIMIT 20;

-- ============================================
-- 7단계: 타임스탬프 확인
-- ============================================

SELECT 
    '=== 타임스탬프 확인 ===' AS info;

-- 생성일자별 분포
SELECT 
    DATE(created_at) AS creation_date,
    COUNT(*) AS row_count
FROM unit_definition
GROUP BY DATE(created_at)
ORDER BY creation_date DESC
LIMIT 30;

-- ============================================
-- 8단계: 메모리 사용량 상세 분석
-- ============================================

SELECT 
    '=== 메모리 사용량 상세 분석 ===' AS info;

-- 행당 평균 크기
SELECT 
    pg_size_pretty(pg_relation_size('public.unit_definition') / NULLIF((SELECT COUNT(*) FROM unit_definition), 0)) AS avg_row_size;

-- 테이블 통계
SELECT 
    schemaname,
    tablename,
    n_live_tup AS live_rows,
    n_dead_tup AS dead_rows,
    last_vacuum,
    last_autovacuum,
    last_analyze,
    last_autoanalyze
FROM pg_stat_user_tables
WHERE tablename = 'unit_definition';

-- ============================================
-- 9단계: 정리 권장사항
-- ============================================

SELECT 
    '=== 정리 권장사항 ===' AS info;

-- 중복 제거 시 예상 절감량
SELECT 
    COUNT(*) - COUNT(DISTINCT unit_code) AS duplicate_rows_to_delete,
    pg_size_pretty(
        (COUNT(*) - COUNT(DISTINCT unit_code)) * 
        (pg_relation_size('public.unit_definition') / NULLIF((SELECT COUNT(*) FROM unit_definition), 0))
    ) AS estimated_space_savings
FROM unit_definition;

