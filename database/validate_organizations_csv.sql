-- organizations CSV 파일 검증 스크립트
-- Import 전에 CSV 파일의 데이터를 검증합니다

-- ============================================
-- Step 1: 임시 테이블 생성
-- ============================================
CREATE TEMP TABLE temp_orgs (
    id VARCHAR(255),
    name VARCHAR(255),
    type VARCHAR(50)
);

-- ============================================
-- Step 2: CSV 파일을 임시 테이블로 Import
-- ============================================
-- CSV 파일 경로를 실제 경로로 변경하세요
COPY temp_orgs (id, name, type)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색 프로그램/PoatgreSQL 업로드 데이터/organizations.csv'
WITH (
    FORMAT csv, 
    HEADER true, 
    ENCODING 'UTF8', 
    DELIMITER ',',
    QUOTE '"'
);

-- ============================================
-- Step 3: 데이터 검증
-- ============================================

-- 1. 전체 데이터 확인
SELECT '=== 전체 데이터 ===' as check_type;
SELECT * FROM temp_orgs ORDER BY id;

-- 2. 잘못된 type 값 확인
SELECT '=== 잘못된 type 값 ===' as check_type;
SELECT 
    id,
    name,
    type,
    LENGTH(type) as type_length,
    CASE 
        WHEN type NOT IN ('public', 'enterprise') THEN '허용되지 않는 값'
        WHEN type != LOWER(TRIM(type)) THEN '대문자 또는 공백 포함'
        ELSE '정상'
    END as issue
FROM temp_orgs
WHERE type NOT IN ('public', 'enterprise')
   OR type != LOWER(TRIM(type));

-- 3. type 값 통계
SELECT '=== type 값 통계 ===' as check_type;
SELECT 
    type,
    COUNT(*) as count
FROM temp_orgs
GROUP BY type
ORDER BY type;

-- 4. NULL 값 확인
SELECT '=== NULL 값 확인 ===' as check_type;
SELECT 
    COUNT(*) FILTER (WHERE id IS NULL) as null_ids,
    COUNT(*) FILTER (WHERE name IS NULL) as null_names,
    COUNT(*) FILTER (WHERE type IS NULL) as null_types
FROM temp_orgs;

-- 5. 중복 id 확인
SELECT '=== 중복 id 확인 ===' as check_type;
SELECT 
    id,
    COUNT(*) as count
FROM temp_orgs
GROUP BY id
HAVING COUNT(*) > 1;

-- ============================================
-- Step 4: 검증 통과 시 실제 테이블로 Import
-- ============================================
-- 위의 검증 결과가 모두 정상이면 아래 주석을 해제하여 실행

/*
-- 기존 데이터 삭제 (필요시)
TRUNCATE TABLE organizations CASCADE;

-- 실제 테이블로 Import
INSERT INTO organizations (id, name, type)
SELECT id, name, type
FROM temp_orgs
WHERE type IN ('public', 'enterprise')
  AND type = LOWER(TRIM(type));

-- 확인
SELECT * FROM organizations ORDER BY id;
*/

-- ============================================
-- Step 5: 임시 테이블 정리
-- ============================================
-- 세션 종료 시 자동으로 삭제됨
-- 또는 수동으로: DROP TABLE temp_orgs;

