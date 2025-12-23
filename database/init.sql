-- 초기 데이터 삽입 스크립트
-- 예시 데이터 (실제 데이터는 별도로 import 필요)

-- ============================================
-- 1. 기관 데이터
-- ============================================
INSERT INTO organizations (id, name, type) VALUES
('org_001', '공공기관 A', 'public'),
('org_002', '기업 B', 'enterprise'),
('org_003', '기관 C', 'public')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. 표준 코드 데이터
-- ============================================
-- 부서
INSERT INTO standard_codes (code, name, type) VALUES
('dept_001', '품질관리', 'departments'),
('dept_002', '생산관리', 'departments'),
('dept_003', '인사관리', 'departments'),
('dept_004', '재무관리', 'departments'),
('dept_005', '마케팅', 'departments')
ON CONFLICT (code, type) DO NOTHING;

-- 산업
INSERT INTO standard_codes (code, name, type) VALUES
('ind_001', '제조업', 'industries'),
('ind_002', '서비스업', 'industries'),
('ind_003', 'IT', 'industries'),
('ind_004', '건설업', 'industries'),
('ind_005', '금융업', 'industries')
ON CONFLICT (code, type) DO NOTHING;

-- 직무
INSERT INTO standard_codes (code, name, type) VALUES
('job_001', '품질관리사', 'jobs'),
('job_002', '생산관리사', 'jobs'),
('job_003', '인사담당자', 'jobs'),
('job_004', '회계사', 'jobs'),
('job_005', '마케터', 'jobs')
ON CONFLICT (code, type) DO NOTHING;

-- ============================================
-- 3. 별칭 매핑 데이터
-- ============================================
INSERT INTO alias_mapping (alias, standard_code, mapping_type, confidence) VALUES
('qa', 'dept_001', 'department', 0.95),
('품질관리팀', 'dept_001', 'department', 0.9),
('품질팀', 'dept_001', 'department', 0.9),
('qc', 'dept_001', 'department', 0.95),
('hr', 'dept_003', 'department', 0.95),
('인사팀', 'dept_003', 'department', 0.9),
('인사부', 'dept_003', 'department', 0.9),
('생산팀', 'dept_002', 'department', 0.9),
('생산부', 'dept_002', 'department', 0.9)
ON CONFLICT (alias, mapping_type) DO UPDATE
SET standard_code = EXCLUDED.standard_code,
    confidence = EXCLUDED.confidence,
    updated_at = CURRENT_TIMESTAMP;

