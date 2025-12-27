-- ============================================
-- CSV 파일에서 데이터 Import 가이드
-- 실제 대량 데이터를 CSV 파일로 import할 때 사용
-- ============================================

-- ============================================
-- 방법 1: COPY 명령어 사용 (권장)
-- ============================================
-- 주의: COPY 명령어는 PostgreSQL 서버에서 직접 파일에 접근해야 하므로
-- Railway에서는 사용할 수 없습니다. 대신 Railway 대시보드의 Data 탭에서
-- 직접 SQL을 실행하거나, 애플리케이션 코드에서 데이터를 삽입하세요.

-- ============================================
-- 방법 2: Railway 대시보드에서 직접 실행
-- ============================================
-- 1. Railway 대시보드 → PostgreSQL 서비스 → Data 탭
-- 2. CSV 파일 내용을 SQL INSERT 문으로 변환하여 실행
-- 3. 또는 애플리케이션 코드에서 CSV를 읽어서 INSERT 실행

-- ============================================
-- 방법 3: pgAdmin 사용 (로컬에서)
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
-- CSV 파일 형식 예시
-- ============================================

-- ncs_main.csv 예시:
-- id_ncs,small_category_code,sub_category_code,unit_code,unit_element_code,major_category_name,middle_category_name,small_category_name,sub_category_name,unit_name,unit_level,unit_element_name,unit_element_level
-- 25-00001,010101,01010101,0101010101_17v2,0101010101_17v2.1,사업관리,사업관리,프로젝트관리,공적개발원조사업관리,공적개발원조사업 개발전략수립,7,협력대상국 개발환경 분석하기,7

-- unit_definition.csv 예시:
-- unit_code,unit_name,unit_definition
-- 0101010101_17v2,공적개발원조사업 개발전략수립,공적개발원조사업 개발전략 수립이란...

-- standard_codes.csv 예시:
-- code,name,type
-- dept_001,품질관리,departments
-- ind_001,제조업,industries

-- organizations.csv 예시:
-- id,name,type
-- org_001,공공기관 A,public
-- org_002,기업 B,enterprise

-- ============================================
-- 주의사항
-- ============================================
-- 1. CSV 파일은 UTF-8 인코딩으로 저장
-- 2. 헤더 행 포함
-- 3. 자동 생성 컬럼 제외 (id, created_at, updated_at 등)
-- 4. 날짜/시간 컬럼은 자동 설정되므로 제외
-- 5. Railway에서는 COPY 명령어가 작동하지 않으므로
--    애플리케이션 코드에서 데이터 삽입 권장

-- ============================================
-- 데이터 검증 쿼리
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

-- type별 통계 (standard_codes)
SELECT 
    type,
    COUNT(*) as count
FROM standard_codes
GROUP BY type
ORDER BY type;

-- 중복 확인 (standard_codes)
SELECT 
    code,
    type,
    COUNT(*) as count
FROM standard_codes
GROUP BY code, type
HAVING COUNT(*) > 1;


