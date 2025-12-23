-- ncs_main 테이블 데이터 Import
-- created_at과 updated_at은 자동으로 설정되므로 CSV에 포함하지 않음

-- ============================================
-- 방법 1: COPY 명령어 (컬럼 명시)
-- ============================================
-- CSV 파일 경로를 실제 경로로 변경하세요
COPY ncs_main (
    id_ncs,
    small_category_code,
    sub_category_code,
    unit_code,
    unit_element_code,
    major_category_name,
    middle_category_name,
    small_category_name,
    sub_category_name,
    unit_name,
    unit_level,
    unit_element_name,
    unit_element_level
)
FROM 'C:/path/to/your/ncs_main.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');

-- ============================================
-- 방법 2: pgAdmin 사용 시
-- ============================================
-- 1. ncs_main 테이블 우클릭
-- 2. "Import/Export Data" 선택
-- 3. Import 탭 선택
-- 4. 파일 경로 지정
-- 5. 옵션:
--    - Format: CSV
--    - Header: Yes
--    - Encoding: UTF8
--    - Delimiter: ,
-- 6. Columns 탭에서 created_at, updated_at은 매핑하지 않음
-- 7. Import 실행

-- ============================================
-- Import 후 확인
-- ============================================
SELECT 
    COUNT(*) as total_rows,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM ncs_main;

-- 샘플 데이터 확인 (created_at 자동 설정 확인)
SELECT 
    id_ncs,
    unit_name,
    created_at,
    updated_at
FROM ncs_main
ORDER BY created_at DESC
LIMIT 5;


