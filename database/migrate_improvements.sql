-- ============================================
-- 개선 사항 마이그레이션 스크립트
-- 1. 참조 무결성 검증 트리거
-- 2. 성능 최적화 뷰
-- ============================================

-- 1. 참조 무결성 검증 트리거 함수
CREATE OR REPLACE FUNCTION validate_selection_history_codes()
RETURNS TRIGGER AS $$
BEGIN
  -- industry_code 검증
  IF NEW.industry_code IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM standard_codes 
      WHERE code = NEW.industry_code AND type = 'industries'
    ) THEN
      RAISE EXCEPTION 'Invalid industry_code: %. Code does not exist in standard_codes (type=industries)', NEW.industry_code;
    END IF;
  END IF;
  
  -- department_code 검증
  IF NEW.department_code IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM standard_codes 
      WHERE code = NEW.department_code AND type = 'departments'
    ) THEN
      RAISE EXCEPTION 'Invalid department_code: %. Code does not exist in standard_codes (type=departments)', NEW.department_code;
    END IF;
  END IF;
  
  -- job_code 검증
  IF NEW.job_code IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM standard_codes 
      WHERE code = NEW.job_code AND type = 'jobs'
    ) THEN
      RAISE EXCEPTION 'Invalid job_code: %. Code does not exist in standard_codes (type=jobs)', NEW.job_code;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성 (이미 존재하면 교체)
DROP TRIGGER IF EXISTS validate_selection_history_codes_trigger ON selection_history;
CREATE TRIGGER validate_selection_history_codes_trigger
BEFORE INSERT OR UPDATE ON selection_history
FOR EACH ROW EXECUTE FUNCTION validate_selection_history_codes();

-- 2. 선택 이력 상세 뷰 (standard_codes와 JOIN하여 이름 포함)
CREATE OR REPLACE VIEW selection_history_detail AS
SELECT 
    sh.id,
    sh.user_id,
    sh.ability_unit_id,
    sh.unit_code,
    sh.industry_code,
    sh.department_code,
    sh.job_code,
    sh.selected_at,
    sc_i.name as industry_name,
    sc_d.name as department_name,
    sc_j.name as job_name
FROM selection_history sh
LEFT JOIN standard_codes sc_i 
    ON sh.industry_code = sc_i.code AND sc_i.type = 'industries'
LEFT JOIN standard_codes sc_d 
    ON sh.department_code = sc_d.code AND sc_d.type = 'departments'
LEFT JOIN standard_codes sc_j 
    ON sh.job_code = sc_j.code AND sc_j.type = 'jobs';

-- 3. 산업분야+부서별 능력단위 활용 통계 뷰 (추천 로직 최적화용)
CREATE OR REPLACE VIEW ability_unit_usage_stats AS
SELECT 
    sh.unit_code,
    sh.industry_code,
    sh.department_code,
    sh.job_code,
    COUNT(DISTINCT sh.id) as selection_count,
    COUNT(DISTINCT sh.user_id) as user_count,
    MAX(sh.selected_at) as last_selected_at
FROM selection_history sh
WHERE sh.industry_code IS NOT NULL OR sh.department_code IS NOT NULL
GROUP BY sh.unit_code, sh.industry_code, sh.department_code, sh.job_code;

-- 인덱스 추가 (뷰 성능 최적화를 위한 기반 테이블 인덱스)
-- 이미 생성되어 있을 수 있지만, 없으면 생성
CREATE INDEX IF NOT EXISTS idx_selection_history_industry_department_composite 
ON selection_history(industry_code, department_code) 
WHERE industry_code IS NOT NULL AND department_code IS NOT NULL;

-- 마이그레이션 완료 확인
SELECT 
  '트리거 생성 완료' as status,
  COUNT(*) as trigger_count
FROM pg_trigger 
WHERE tgname = 'validate_selection_history_codes_trigger'
UNION ALL
SELECT 
  '뷰 생성 완료' as status,
  COUNT(*) as view_count
FROM pg_views 
WHERE viewname IN ('selection_history_detail', 'ability_unit_usage_stats');

