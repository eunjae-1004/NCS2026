-- "품질" 키워드 검색 테스트

-- 1. 각 필드별로 "품질"이 몇 개나 있는지 확인
SELECT '세분류명' as 필드, COUNT(DISTINCT unit_code) as 개수 
FROM ncs_main 
WHERE small_category_name ILIKE '%품질%'
UNION ALL
SELECT '능력단위명', COUNT(DISTINCT unit_code) 
FROM ncs_main 
WHERE unit_name ILIKE '%품질%'
UNION ALL
SELECT '능력단위요소명', COUNT(DISTINCT unit_code) 
FROM ncs_main 
WHERE unit_element_name ILIKE '%품질%';

-- 2. 실제 검색 결과 확인 (GROUP BY 포함, 실제 API와 동일)
SELECT
  n.unit_code,
  n.unit_name,
  n.small_category_name,
  n.sub_category_name,
  COALESCE(ud.unit_definition, '') as definition,
  STRING_AGG(DISTINCT n.unit_element_name, ', ') FILTER (WHERE n.unit_element_name IS NOT NULL) as element_names
FROM ncs_main n
LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
WHERE 1=1
  AND (
    (n.small_category_name IS NOT NULL AND n.small_category_name ILIKE '%품질%') OR
    (n.unit_name IS NOT NULL AND n.unit_name ILIKE '%품질%') OR
    EXISTS (
      SELECT 1 FROM ncs_main n_elem
      WHERE n_elem.unit_code = n.unit_code
        AND n_elem.unit_element_name IS NOT NULL
        AND n_elem.unit_element_name ILIKE '%품질%'
    ) OR
    (ud.unit_definition IS NOT NULL AND ud.unit_definition ILIKE '%품질%') OR
    EXISTS (
      SELECT 1 FROM performance_criteria pc
      WHERE pc.unit_code = n.unit_code
        AND pc.performance_criteria IS NOT NULL
        AND pc.performance_criteria ILIKE '%품질%'
    )
  )
GROUP BY n.unit_code, n.unit_name, n.unit_level, n.sub_category_code,
         n.sub_category_name, n.small_category_code, n.small_category_name, n.middle_category_name,
         n.major_category_name, ud.unit_definition
ORDER BY 
  CASE 
    WHEN n.unit_name IS NOT NULL AND n.unit_name ILIKE '%품질%' THEN 1
    WHEN n.small_category_name IS NOT NULL AND n.small_category_name ILIKE '%품질%' THEN 2
    WHEN EXISTS (
      SELECT 1 FROM ncs_main n2 
      WHERE n2.unit_code = n.unit_code 
        AND n2.unit_element_name IS NOT NULL 
        AND n2.unit_element_name ILIKE '%품질%'
    ) THEN 3
    ELSE 4
  END,
  n.unit_code;

-- 3. COUNT 쿼리
SELECT COUNT(DISTINCT n.unit_code) as total
FROM ncs_main n
LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
WHERE 1=1
  AND (
    (n.small_category_name IS NOT NULL AND n.small_category_name ILIKE '%품질%') OR
    (n.unit_name IS NOT NULL AND n.unit_name ILIKE '%품질%') OR
    EXISTS (
      SELECT 1 FROM ncs_main n_elem
      WHERE n_elem.unit_code = n.unit_code
        AND n_elem.unit_element_name IS NOT NULL
        AND n_elem.unit_element_name ILIKE '%품질%'
    ) OR
    (ud.unit_definition IS NOT NULL AND ud.unit_definition ILIKE '%품질%') OR
    EXISTS (
      SELECT 1 FROM performance_criteria pc
      WHERE pc.unit_code = n.unit_code
        AND pc.performance_criteria IS NOT NULL
        AND pc.performance_criteria ILIKE '%품질%'
    )
  );
