-- ============================================
-- standard_codes 테이블의 industries 타입 데이터를 24개로 완전 교체
-- 주의: 기존 industries 데이터가 모두 삭제되고 24개로 교체됩니다
-- ============================================

-- 1. 기존 industries 타입 데이터 삭제
DELETE FROM standard_codes WHERE type = 'industries';

-- 2. 24개 산업분야 데이터 삽입
INSERT INTO standard_codes (code, name, type) VALUES
  ('ind_001', '사업관리', 'industries'),
  ('ind_002', '경영·회계·사무', 'industries'),
  ('ind_003', '금융·보험', 'industries'),
  ('ind_004', '교육·자연·사회과학', 'industries'),
  ('ind_005', '법률·경찰·소방·교도·국방', 'industries'),
  ('ind_006', '보건·의료', 'industries'),
  ('ind_007', '사회복지·종교', 'industries'),
  ('ind_008', '문화·예술·디자인·방송', 'industries'),
  ('ind_009', '운전·운송', 'industries'),
  ('ind_010', '영업판매', 'industries'),
  ('ind_011', '경비·청소', 'industries'),
  ('ind_012', '이용·숙박·여행·오락·스포츠', 'industries'),
  ('ind_013', '음식서비스', 'industries'),
  ('ind_014', '건설', 'industries'),
  ('ind_015', '기계', 'industries'),
  ('ind_016', '재료', 'industries'),
  ('ind_017', '화학·바이오', 'industries'),
  ('ind_018', '섬유·의복', 'industries'),
  ('ind_019', '전기·전자', 'industries'),
  ('ind_020', '정보통신', 'industries'),
  ('ind_021', '식품가공', 'industries'),
  ('ind_022', '인쇄·목재·가구·공예', 'industries'),
  ('ind_023', '환경·에너지·안전', 'industries'),
  ('ind_024', '농림어업', 'industries');

-- 3. 삽입 결과 확인
SELECT 
  code,
  name,
  type,
  created_at
FROM standard_codes
WHERE type = 'industries'
ORDER BY code ASC;

-- 4. 총 개수 확인 (24개여야 함)
SELECT 
  COUNT(*) as total_industries
FROM standard_codes
WHERE type = 'industries';
