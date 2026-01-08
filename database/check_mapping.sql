-- ============================================
-- 매핑 확인 스크립트
-- ncs_main의 이름이 standard_codes에 있는지 확인
-- ============================================

-- 1. ncs_main에서 사용되는 고유한 major_category_name 목록
SELECT DISTINCT 
  major_category_name,
  COUNT(*) as count
FROM ncs_main
WHERE major_category_name IS NOT NULL
GROUP BY major_category_name
ORDER BY count DESC
LIMIT 20;

-- 2. ncs_main의 major_category_name이 standard_codes에 있는지 확인
SELECT DISTINCT
  n.major_category_name as ncs_name,
  sc.code as standard_code,
  sc.name as standard_name,
  CASE 
    WHEN sc.code IS NULL THEN '❌ 매핑 없음'
    ELSE '✅ 매핑 있음'
  END as mapping_status
FROM ncs_main n
LEFT JOIN standard_codes sc 
  ON n.major_category_name = sc.name 
  AND sc.type = 'industries'
WHERE n.major_category_name IS NOT NULL
GROUP BY n.major_category_name, sc.code, sc.name
ORDER BY mapping_status, n.major_category_name
LIMIT 30;

-- 3. ncs_main에서 사용되는 고유한 sub_category_name 목록
SELECT DISTINCT 
  sub_category_name,
  COUNT(*) as count
FROM ncs_main
WHERE sub_category_name IS NOT NULL
GROUP BY sub_category_name
ORDER BY count DESC
LIMIT 20;

-- 4. ncs_main의 sub_category_name이 standard_codes에 있는지 확인
SELECT DISTINCT
  n.sub_category_name as ncs_name,
  sc.code as standard_code,
  sc.name as standard_name,
  CASE 
    WHEN sc.code IS NULL THEN '❌ 매핑 없음'
    ELSE '✅ 매핑 있음'
  END as mapping_status
FROM ncs_main n
LEFT JOIN standard_codes sc 
  ON n.sub_category_name = sc.name 
  AND sc.type = 'departments'
WHERE n.sub_category_name IS NOT NULL
GROUP BY n.sub_category_name, sc.code, sc.name
ORDER BY mapping_status, n.sub_category_name
LIMIT 30;

-- 5. selection_history에서 null인 코드 필드 확인
SELECT 
  COUNT(*) as total_records,
  COUNT(industry_code) as records_with_industry_code,
  COUNT(department_code) as records_with_department_code,
  COUNT(job_code) as records_with_job_code,
  COUNT(*) - COUNT(industry_code) as null_industry_code,
  COUNT(*) - COUNT(department_code) as null_department_code,
  COUNT(*) - COUNT(job_code) as null_job_code
FROM selection_history;

-- 6. 최근 저장된 selection_history 중 null인 것 확인
SELECT 
  id,
  unit_code,
  industry_code,
  department_code,
  job_code,
  selected_at
FROM selection_history
WHERE industry_code IS NULL 
   OR department_code IS NULL 
   OR job_code IS NULL
ORDER BY selected_at DESC
LIMIT 10;

-- 7. standard_codes에 실제로 있는 값 확인
SELECT 
  type,
  COUNT(*) as count,
  STRING_AGG(DISTINCT name, ', ' ORDER BY name) as sample_names
FROM standard_codes
GROUP BY type;

