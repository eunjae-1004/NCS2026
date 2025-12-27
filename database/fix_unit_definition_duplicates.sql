-- ============================================
-- unit_definition 테이블 중복 데이터 정리
-- ⚠️ 주의: 실행 전에 백업을 권장합니다!
-- ============================================

-- ============================================
-- 1단계: 정리 전 상태 확인
-- ============================================

SELECT 
    '=== 정리 전 상태 ===' AS info;

SELECT 
    COUNT(*) AS total_rows_before,
    COUNT(DISTINCT unit_code) AS unique_unit_codes,
    pg_size_pretty(pg_total_relation_size('public.unit_definition')) AS size_before
FROM unit_definition;

-- ============================================
-- 2단계: 중복 데이터 확인
-- ============================================

-- 중복된 unit_code 확인
SELECT 
    unit_code,
    COUNT(*) AS duplicate_count,
    MIN(id) AS keep_id,
    ARRAY_AGG(id ORDER BY id) AS all_ids
FROM unit_definition
GROUP BY unit_code
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- ============================================
-- 3단계: 중복 데이터 정리
-- ============================================

-- 방법 1: 최신 정의만 유지 (updated_at 기준)
-- ⚠️ 주의: 이 방법은 최신 정의를 유지합니다

BEGIN;

-- 중복된 행 중 최신 것만 유지하고 나머지 삭제
DELETE FROM unit_definition ud1
WHERE EXISTS (
    SELECT 1 FROM unit_definition ud2
    WHERE ud1.unit_code = ud2.unit_code
    AND ud1.id < ud2.id  -- 더 큰 ID (더 최신)를 유지
);

-- 또는 updated_at 기준으로 최신 것만 유지 (선택사항)
-- DELETE FROM unit_definition ud1
-- WHERE EXISTS (
--     SELECT 1 FROM unit_definition ud2
--     WHERE ud1.unit_code = ud2.unit_code
--     AND (ud2.updated_at > ud1.updated_at 
--          OR (ud2.updated_at = ud1.updated_at AND ud2.id > ud1.id))
-- );

COMMIT;

-- ============================================
-- 4단계: NULL 정의 정리 (선택사항)
-- ============================================

-- unit_definition이 NULL인 행 삭제 (선택사항)
-- BEGIN;
-- DELETE FROM unit_definition WHERE unit_definition IS NULL;
-- COMMIT;

-- ============================================
-- 5단계: 고아 데이터 정리 (선택사항)
-- ============================================

-- ncs_main에 없는 unit_code의 정의 삭제 (선택사항)
-- ⚠️ 주의: 이 작업은 ncs_main과 연결되지 않은 정의를 삭제합니다
-- BEGIN;
-- DELETE FROM unit_definition ud
-- WHERE NOT EXISTS (
--     SELECT 1 FROM ncs_main nm 
--     WHERE nm.unit_code = ud.unit_code
-- );
-- COMMIT;

-- ============================================
-- 6단계: 디스크 공간 회수
-- ============================================

-- VACUUM 실행
VACUUM ANALYZE unit_definition;

-- ============================================
-- 7단계: 정리 후 상태 확인
-- ============================================

SELECT 
    '=== 정리 후 상태 ===' AS info;

SELECT 
    COUNT(*) AS total_rows_after,
    COUNT(DISTINCT unit_code) AS unique_unit_codes,
    pg_size_pretty(pg_total_relation_size('public.unit_definition')) AS size_after
FROM unit_definition;

-- 정리 통계
SELECT 
    '=== 정리 통계 ===' AS info,
    (SELECT COUNT(*) FROM unit_definition) AS remaining_rows,
    (SELECT COUNT(DISTINCT unit_code) FROM unit_definition) AS unique_unit_codes,
    pg_size_pretty(pg_total_relation_size('public.unit_definition')) AS final_size;

