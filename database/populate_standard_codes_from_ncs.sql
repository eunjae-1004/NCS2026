-- ============================================
-- ncs_main의 이름을 standard_codes에 자동 추가
-- ============================================

-- 1. industries 타입: major_category_name을 standard_codes에 추가
-- 기존 코드와 충돌하지 않도록 MAX 값을 사용하여 새로운 코드 생성
WITH existing_max AS (
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 5) AS INTEGER)), 0) as max_num
  FROM standard_codes
  WHERE type = 'industries' AND code LIKE 'ind_%'
),
new_codes AS (
  SELECT DISTINCT
    major_category_name as name,
    ROW_NUMBER() OVER (ORDER BY major_category_name) as row_num
  FROM ncs_main
  WHERE major_category_name IS NOT NULL
    AND major_category_name != ''
    AND NOT EXISTS (
      SELECT 1 FROM standard_codes sc
      WHERE sc.name = ncs_main.major_category_name
        AND sc.type = 'industries'
    )
)
INSERT INTO standard_codes (code, name, type)
SELECT 
  'ind_' || LPAD((em.max_num + nc.row_num)::text, 3, '0') as code,
  nc.name,
  'industries' as type
FROM new_codes nc
CROSS JOIN existing_max em
ON CONFLICT (code, type) DO NOTHING;

-- 2. departments 타입: sub_category_name을 standard_codes에 추가
WITH existing_max AS (
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 6) AS INTEGER)), 0) as max_num
  FROM standard_codes
  WHERE type = 'departments' AND code LIKE 'dept_%'
),
new_codes AS (
  SELECT DISTINCT
    sub_category_name as name,
    ROW_NUMBER() OVER (ORDER BY sub_category_name) as row_num
  FROM ncs_main
  WHERE sub_category_name IS NOT NULL
    AND sub_category_name != ''
    AND NOT EXISTS (
      SELECT 1 FROM standard_codes sc
      WHERE sc.name = ncs_main.sub_category_name
        AND sc.type = 'departments'
    )
)
INSERT INTO standard_codes (code, name, type)
SELECT 
  'dept_' || LPAD((em.max_num + nc.row_num)::text, 3, '0') as code,
  nc.name,
  'departments' as type
FROM new_codes nc
CROSS JOIN existing_max em
ON CONFLICT (code, type) DO NOTHING;

-- 3. jobs 타입: small_category_name을 standard_codes에 추가 (선택사항)
WITH existing_max AS (
  SELECT COALESCE(MAX(CAST(SUBSTRING(code FROM 5) AS INTEGER)), 0) as max_num
  FROM standard_codes
  WHERE type = 'jobs' AND code LIKE 'job_%'
),
new_codes AS (
  SELECT DISTINCT
    small_category_name as name,
    ROW_NUMBER() OVER (ORDER BY small_category_name) as row_num
  FROM ncs_main
  WHERE small_category_name IS NOT NULL
    AND small_category_name != ''
    AND NOT EXISTS (
      SELECT 1 FROM standard_codes sc
      WHERE sc.name = ncs_main.small_category_name
        AND sc.type = 'jobs'
    )
)
INSERT INTO standard_codes (code, name, type)
SELECT 
  'job_' || LPAD((em.max_num + nc.row_num)::text, 3, '0') as code,
  nc.name,
  'jobs' as type
FROM new_codes nc
CROSS JOIN existing_max em
ON CONFLICT (code, type) DO NOTHING;

-- 4. 결과 확인
SELECT 
  type,
  COUNT(*) as count
FROM standard_codes
GROUP BY type
ORDER BY type;

-- 5. 추가된 데이터 샘플 확인
SELECT 
  code,
  name,
  type
FROM standard_codes
WHERE type IN ('industries', 'departments', 'jobs')
ORDER BY type, name
LIMIT 20;

