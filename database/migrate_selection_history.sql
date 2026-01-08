-- ============================================
-- selection_history 테이블 마이그레이션
-- 산업분야(industry)와 부서명(department) 컬럼 추가
-- ============================================

-- 1. 기존 테이블에 컬럼 추가
ALTER TABLE selection_history 
ADD COLUMN IF NOT EXISTS industry VARCHAR(255),
ADD COLUMN IF NOT EXISTS department VARCHAR(255);

-- 2. 인덱스 생성 (산업분야/부서별 조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_selection_history_industry 
ON selection_history(industry);

CREATE INDEX IF NOT EXISTS idx_selection_history_department 
ON selection_history(department);

CREATE INDEX IF NOT EXISTS idx_selection_history_industry_department 
ON selection_history(industry, department);

-- 3. 기존 데이터 업데이트 (선택사항)
-- ncs_main 테이블과 JOIN하여 기존 데이터에 산업분야/부서명 채우기
-- 주의: 이 쿼리는 기존 데이터가 많은 경우 시간이 걸릴 수 있습니다.
UPDATE selection_history sh
SET 
  industry = (
    SELECT DISTINCT n.major_category_name 
    FROM ncs_main n 
    WHERE n.unit_code = sh.unit_code 
    LIMIT 1
  ),
  department = (
    SELECT DISTINCT n.sub_category_name 
    FROM ncs_main n 
    WHERE n.unit_code = sh.unit_code 
    LIMIT 1
  )
WHERE sh.industry IS NULL OR sh.department IS NULL;

-- 4. 마이그레이션 완료 확인 쿼리
-- SELECT 
--   COUNT(*) as total_records,
--   COUNT(industry) as records_with_industry,
--   COUNT(department) as records_with_department
-- FROM selection_history;

