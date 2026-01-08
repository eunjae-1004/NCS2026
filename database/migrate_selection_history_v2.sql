-- ============================================
-- selection_history 테이블 마이그레이션 v2
-- standard_codes 테이블 구조에 맞춰 변경
-- industry, department 컬럼을 code 기반으로 변경
-- ============================================

-- 1. 기존 컬럼이 있다면 삭제 (이전 마이그레이션에서 추가된 경우)
ALTER TABLE selection_history 
DROP COLUMN IF EXISTS industry,
DROP COLUMN IF EXISTS department;

-- 2. 새로운 컬럼 추가 (standard_codes 구조에 맞춤)
ALTER TABLE selection_history 
ADD COLUMN IF NOT EXISTS industry_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS department_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS job_code VARCHAR(50);

-- 3. 기존 인덱스 삭제 (있다면)
DROP INDEX IF EXISTS idx_selection_history_industry;
DROP INDEX IF EXISTS idx_selection_history_department;
DROP INDEX IF EXISTS idx_selection_history_industry_department;

-- 4. 새로운 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_selection_history_industry_code 
ON selection_history(industry_code);

CREATE INDEX IF NOT EXISTS idx_selection_history_department_code 
ON selection_history(department_code);

CREATE INDEX IF NOT EXISTS idx_selection_history_job_code 
ON selection_history(job_code);

CREATE INDEX IF NOT EXISTS idx_selection_history_industry_department 
ON selection_history(industry_code, department_code);

-- 5. 기존 데이터 마이그레이션 (선택사항)
-- ncs_main 테이블의 데이터를 standard_codes와 매칭하여 code로 변환
-- 주의: 이 쿼리는 standard_codes 테이블에 해당 데이터가 있어야 작동합니다.

-- 산업분야 코드 매핑 (major_category_name을 standard_codes에서 찾아서 code로 변환)
UPDATE selection_history sh
SET industry_code = (
  SELECT sc.code
  FROM ncs_main n
  JOIN standard_codes sc ON sc.name = n.major_category_name AND sc.type = 'industries'
  WHERE n.unit_code = sh.unit_code
  LIMIT 1
)
WHERE sh.industry_code IS NULL;

-- 부서 코드 매핑 (sub_category_name을 standard_codes에서 찾아서 code로 변환)
UPDATE selection_history sh
SET department_code = (
  SELECT sc.code
  FROM ncs_main n
  JOIN standard_codes sc ON sc.name = n.sub_category_name AND sc.type = 'departments'
  WHERE n.unit_code = sh.unit_code
  LIMIT 1
)
WHERE sh.department_code IS NULL;

-- 6. 마이그레이션 완료 확인 쿼리
-- SELECT 
--   COUNT(*) as total_records,
--   COUNT(industry_code) as records_with_industry_code,
--   COUNT(department_code) as records_with_department_code,
--   COUNT(job_code) as records_with_job_code,
--   COUNT(CASE WHEN industry_code IS NOT NULL AND department_code IS NOT NULL THEN 1 END) as records_with_both
-- FROM selection_history;

