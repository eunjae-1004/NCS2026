-- standard_codes 테이블 데이터 Import
-- id와 created_at은 자동으로 설정되므로 CSV에 포함하지 않음

-- ============================================
-- Step 1: 기존 데이터 확인 (필요시)
-- ============================================
SELECT COUNT(*) as existing_rows FROM standard_codes;

-- 기존 데이터를 모두 삭제하려면 아래 주석을 해제하세요
-- TRUNCATE TABLE standard_codes CASCADE;

-- ============================================
-- Step 2: CSV 파일 검증 (임시 테이블 사용)
-- ============================================
-- CSV 파일에 4번째 컬럼이 있는지 확인
CREATE TEMP TABLE temp_check (
    col1 TEXT,
    col2 TEXT,
    col3 TEXT,
    col4 TEXT
);

-- CSV 파일 경로를 실제 경로로 변경하세요
COPY temp_check FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색프로그램/PoatgreSQL 업로드 데이터/standard_codes.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');

-- 4번째 컬럼 확인
SELECT 
    '총 행 수: ' || COUNT(*)::text as check_result,
    '4번째 컬럼이 있는 행: ' || COUNT(col4)::text as rows_with_4th_col,
    '4번째 컬럼에 데이터가 있는 행: ' || COUNT(*) FILTER (WHERE col4 IS NOT NULL AND col4 != '')::text as rows_with_data
FROM temp_check;

-- 샘플 데이터 확인
SELECT * FROM temp_check LIMIT 5;

-- 임시 테이블 삭제
DROP TABLE temp_check;

-- ============================================
-- Step 3: 올바른 COPY 명령어 (3개 컬럼만)
-- ============================================
-- ⚠️ 중요: CSV 파일 끝의 쉼표를 제거했는지 확인하세요!
-- CSV 파일 경로를 실제 경로로 변경하세요

COPY standard_codes (
    code,
    name,
    type
    -- id는 SERIAL이므로 자동 생성 (제외!)
    -- created_at은 자동 설정됨 (제외!)
)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색프로그램/PoatgreSQL 업로드 데이터/standard_codes.csv'
WITH (
    FORMAT csv, 
    HEADER true, 
    ENCODING 'UTF8', 
    DELIMITER ',',
    QUOTE '"',
    FORCE_NOT_NULL (code, name, type)
);

-- ============================================
-- Step 4: Import 결과 확인
-- ============================================
SELECT 
    COUNT(*) as total_rows,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM standard_codes;

-- 샘플 데이터 확인
SELECT 
    id,
    code,
    name,
    type,
    created_at
FROM standard_codes
ORDER BY type, code
LIMIT 20;

-- type별 통계
SELECT 
    type,
    COUNT(*) as count
FROM standard_codes
GROUP BY type
ORDER BY type;

-- 중복 확인 (code, type 조합은 UNIQUE여야 함)
SELECT 
    code,
    type,
    COUNT(*) as count
FROM standard_codes
GROUP BY code, type
HAVING COUNT(*) > 1;

-- ============================================
-- CSV 파일 형식 예시
-- ============================================
-- code,name,type
-- dept_001,품질관리,departments
-- dept_002,생산관리,departments
-- dept_003,인사관리,departments
-- ind_001,제조업,industries
-- ind_002,서비스업,industries
-- job_001,품질관리사,jobs
--
-- 주의사항:
-- 1. 각 행 끝에 쉼표 없음
-- 2. 헤더 줄 끝에도 쉼표 없음
-- 3. 3개 컬럼만 포함
-- 4. type 값은 'departments', 'industries', 'jobs' 중 하나


