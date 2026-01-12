-- ============================================
-- users 테이블에 산업분야, 부서명, 직무명 컬럼 추가
-- ============================================

-- 1. users 테이블에 컬럼 추가
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS industry_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS department_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS job_code VARCHAR(50);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_industry_code ON users(industry_code);
CREATE INDEX IF NOT EXISTS idx_users_department_code ON users(department_code);
CREATE INDEX IF NOT EXISTS idx_users_job_code ON users(job_code);

-- 3. 외래키 제약조건 추가 (standard_codes 참조)
-- 주의: 기존 데이터에 유효하지 않은 코드가 있을 수 있으므로, 먼저 데이터 정리 필요
-- ALTER TABLE users
-- ADD CONSTRAINT fk_users_industry_code 
--   FOREIGN KEY (industry_code) REFERENCES standard_codes(code) 
--   WHERE industry_code IS NOT NULL AND EXISTS (SELECT 1 FROM standard_codes WHERE code = users.industry_code AND type = 'industries');

-- ALTER TABLE users
-- ADD CONSTRAINT fk_users_department_code 
--   FOREIGN KEY (department_code) REFERENCES standard_codes(code) 
--   WHERE department_code IS NOT NULL AND EXISTS (SELECT 1 FROM standard_codes WHERE code = users.department_code AND type = 'departments');

-- ALTER TABLE users
-- ADD CONSTRAINT fk_users_job_code 
--   FOREIGN KEY (job_code) REFERENCES standard_codes(code) 
--   WHERE job_code IS NOT NULL AND EXISTS (SELECT 1 FROM standard_codes WHERE code = users.job_code AND type = 'jobs');

-- 4. 마이그레이션 완료 확인 쿼리
-- SELECT 
--   COUNT(*) as total_users,
--   COUNT(industry_code) as users_with_industry,
--   COUNT(department_code) as users_with_department,
--   COUNT(job_code) as users_with_job
-- FROM users;
