-- 실제 NCS 데이터 Import 가이드
-- CSV 파일에서 데이터를 import하는 방법

-- ============================================
-- 방법 1: COPY 명령어 사용 (권장)
-- ============================================

-- 1. CSV 파일 준비
-- - Excel 파일을 CSV로 변환
-- - UTF-8 인코딩으로 저장
-- - 헤더 행 포함

-- 2. ncs_main 테이블 import
-- 주의: created_at과 updated_at은 자동으로 설정되므로 CSV에 포함하지 않음
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
    -- created_at과 updated_at은 제외 (자동 설정됨)
)
FROM 'D:/path/to/ncs_main.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 3. unit_definition 테이블 import
COPY unit_definition (unit_code, unit_name, unit_definition)
FROM 'D:/path/to/unit_definition.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 4. performance_criteria 테이블 import
COPY performance_criteria (unit_code, unit_element_code, performance_criteria)
FROM 'D:/path/to/performance_criteria.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- 5. subcategory 테이블 import
COPY subcategory (sub_category_code, sub_category_name, sub_category_definition)
FROM 'D:/path/to/subcategory.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8');

-- ============================================
-- 방법 2: INSERT 문 사용 (소량 데이터)
-- ============================================

-- 예시: ncs_main 데이터 삽입
INSERT INTO ncs_main (
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
) VALUES
('25-00001', '010101', '01010101', '0101010101_17v2', '0101010101_17v2.1', 
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 개발전략수립', 7, '협력대상국 개발환경 분석하기', 7),
('25-00002', '010101', '01010101', '0101010101_17v2', '0101010101_17v2.2',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 개발전략수립', 7, '자국협력환경 분석하기', 7);

-- ============================================
-- 방법 3: pgAdmin 사용
-- ============================================

-- 1. pgAdmin에서 테이블 우클릭
-- 2. "Import/Export Data" 선택
-- 3. CSV 파일 선택
-- 4. 옵션 설정:
--    - Format: CSV
--    - Header: Yes
--    - Encoding: UTF8
--    - Delimiter: ,

-- ============================================
-- 데이터 검증
-- ============================================

-- 데이터 개수 확인
SELECT COUNT(*) as total_rows FROM ncs_main;
SELECT COUNT(DISTINCT unit_code) as unique_units FROM ncs_main;
SELECT COUNT(DISTINCT unit_element_code) as unique_elements FROM ncs_main;

-- 샘플 데이터 확인
SELECT * FROM ncs_main LIMIT 10;
SELECT * FROM unit_definition LIMIT 5;
SELECT * FROM performance_criteria LIMIT 5;

-- 데이터 무결성 확인
SELECT 
    COUNT(*) as total,
    COUNT(DISTINCT unit_code) as unique_units,
    COUNT(DISTINCT sub_category_code) as unique_categories
FROM ncs_main;

