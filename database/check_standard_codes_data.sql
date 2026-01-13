-- ============================================
-- standard_codes 테이블 데이터 확인 쿼리
-- ============================================

-- 1. 전체 데이터 개수 확인
SELECT 
  type,
  COUNT(*) as count
FROM standard_codes
GROUP BY type
ORDER BY type;

-- 2. industries 타입의 name 목록
SELECT 
  name
FROM standard_codes
WHERE type = 'industries'
ORDER BY name ASC;

-- 3. departments 타입의 name 목록
SELECT 
  name
FROM standard_codes
WHERE type = 'departments'
ORDER BY name ASC;

-- 4. jobs 타입의 name 목록
SELECT 
  name
FROM standard_codes
WHERE type = 'jobs'
ORDER BY name ASC;

-- 5. industries와 departments를 함께 조회 (하나의 결과셋)
SELECT 
  type,
  name
FROM standard_codes
WHERE type IN ('industries', 'departments')
ORDER BY type, name ASC;

-- 6. 데이터가 없는 경우 경고
DO $$
BEGIN
  IF (SELECT COUNT(*) FROM standard_codes WHERE type = 'industries') = 0 THEN
    RAISE NOTICE '⚠️ industries 타입 데이터가 없습니다. populate_24_industries.sql 또는 populate_standard_codes_from_ncs.sql을 실행하세요.';
  END IF;
  
  IF (SELECT COUNT(*) FROM standard_codes WHERE type = 'departments') = 0 THEN
    RAISE NOTICE '⚠️ departments 타입 데이터가 없습니다. populate_standard_codes_from_ncs.sql을 실행하세요.';
  END IF;
  
  IF (SELECT COUNT(*) FROM standard_codes WHERE type = 'jobs') = 0 THEN
    RAISE NOTICE '⚠️ jobs 타입 데이터가 없습니다. populate_standard_codes_from_ncs.sql을 실행하세요.';
  END IF;
END $$;
