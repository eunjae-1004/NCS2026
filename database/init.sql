-- ============================================
-- NCS 능력단위 검색 시스템 초기 데이터 삽입 스크립트
-- 표준 데이터 및 샘플 데이터
-- ============================================

-- ============================================
-- 1. 기관 데이터 (organizations)
-- ============================================
INSERT INTO organizations (id, name, type) VALUES
('org_001', '공공기관 A', 'public'),
('org_002', '기업 B', 'enterprise'),
('org_003', '기관 C', 'public')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. 표준 코드 데이터 (standard_codes)
-- ============================================

-- 부서 (departments)
INSERT INTO standard_codes (code, name, type) VALUES
('dept_001', '품질관리', 'departments'),
('dept_002', '생산관리', 'departments'),
('dept_003', '인사관리', 'departments'),
('dept_004', '재무관리', 'departments'),
('dept_005', '마케팅', 'departments')
ON CONFLICT (code, type) DO NOTHING;

-- 산업 (industries)
INSERT INTO standard_codes (code, name, type) VALUES
('ind_001', '제조업', 'industries'),
('ind_002', '서비스업', 'industries'),
('ind_003', 'IT', 'industries'),
('ind_004', '건설업', 'industries'),
('ind_005', '금융업', 'industries')
ON CONFLICT (code, type) DO NOTHING;

-- 직무 (jobs)
INSERT INTO standard_codes (code, name, type) VALUES
('job_001', '품질관리사', 'jobs'),
('job_002', '생산관리사', 'jobs'),
('job_003', '인사담당자', 'jobs'),
('job_004', '회계사', 'jobs'),
('job_005', '마케터', 'jobs')
ON CONFLICT (code, type) DO NOTHING;

-- ============================================
-- 3. 별칭 매핑 데이터 (alias_mapping)
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

-- ============================================
-- 4. NCS 메인 데이터 샘플 (ncs_main)
-- ============================================
INSERT INTO ncs_main (
    id_ncs,
    small_category_code,
    sub_category_code,
    unit_code,
    unit_element_code,
    major_category_name,
    middle_category_name,
    small_category_name,
    sub_category_name,
    unit_name,
    unit_level,
    unit_element_name,
    unit_element_level
) VALUES
('25-00001', '010101', '01010101', '0101010101_17v2', '0101010101_17v2.1', 
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 개발전략수립', 7, '협력대상국 개발환경 분석하기', 7),
('25-00002', '010101', '01010101', '0101010101_17v2', '0101010101_17v2.2',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 개발전략수립', 7, '자국협력환경 분석하기', 7),
('25-00003', '010101', '01010101', '0101010101_17v2', '0101010101_17v2.3',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 개발전략수립', 7, '협력대상국 지원전략 수립하기', 7),
('25-00004', '010101', '01010101', '0101010102_17v2', '0101010102_17v2.1',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 사업기획', 6, '협력대상국 개발전략 분석하기', 6),
('25-00005', '010101', '01010101', '0101010102_17v2', '0101010102_17v2.2',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 사업기획', 6, '사업타당성 조사하기', 6),
('25-00006', '010101', '01010101', '0101010102_17v2', '0101010102_17v2.3',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 사업기획', 6, '사업 선정하기', 6),
('25-00007', '010101', '01010101', '0101010102_17v2', '0101010102_17v2.4',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 사업기획', 6, '협력대상국 사업합의하기', 6),
('25-00008', '010101', '01010101', '0101010103_17v2', '0101010103_17v2.1',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 PDM수립', 5, '목표 수립하기', 5),
('25-00009', '010101', '01010101', '0101010103_17v2', '0101010103_17v2.2',
 '사업관리', '사업관리', '프로젝트관리', '공적개발원조사업관리',
 '공적개발원조사업 PDM수립', 5, '리스크 식별하기', 5)
ON CONFLICT (id_ncs) DO NOTHING;

-- ============================================
-- 5. 능력단위 정의 샘플 데이터 (unit_definition)
-- ============================================
INSERT INTO unit_definition (unit_code, unit_name, unit_definition) VALUES
('0101010101_17v2', '공적개발원조사업 개발전략수립', 
 '공적개발원조사업 개발전략 수립이란 협력대상국의 정책, 제도, 법령, 현지 여건을 토대로 개발환경을 검토하고 자국의 협력환경 분석에 의한 비교우위를 도출하여 협력대상국의 경제·사회개발을 촉진하기 위한 종합적인 능력이다.')
ON CONFLICT (unit_code) DO UPDATE
SET unit_name = EXCLUDED.unit_name,
    unit_definition = EXCLUDED.unit_definition;

-- ============================================
-- 6. 수행준거 샘플 데이터 (performance_criteria)
-- ============================================
INSERT INTO performance_criteria (unit_code, unit_element_code, performance_criteria) VALUES
('0101010101_17v2', '0101010101_17v2.1', 
 '1_협력대상국의 정책, 제도, 법령 등을 검토하여 공적개발원조 추진에 대한 실현 가능성을 분석할 수 있다.'),
('0101010101_17v2', '0101010101_17v2.1', 
 '2_협력대상국을 지원하는 타 공여자들의 지원특성과 운영전략, 실행 방안 등을 파악하여 한국의 비교 우위를 분석할 수 있다.'),
('0101010101_17v2', '0101010101_17v2.1', 
 '3_한국과 협력대상국의 이해관계자를 분석하여 원활한 협력이 이루어 질 수 있는 방안을 제시할 수 있다.'),
('0101010101_17v2', '0101010101_17v2.1', 
 '4_공적개발원조에 대한 협력대상국의 국내외 환경, 기타 위험요소를 조사하여 사업수행 특이사항을 분석할 수 있다.'),
('0101010101_17v2', '0101010101_17v2.2', 
 '1_자국의 공적개발원조정책을 파악할 수 있다.'),
('0101010101_17v2', '0101010101_17v2.2', 
 '2_자국의 협력대상국에 대한 정책을 파악할 수 있다.'),
('0101010101_17v2', '0101010101_17v2.2', 
 '3_자국의 협력대상국에 대한 적합한 지원 분야와 방식을 파악할 수 있다.')
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. 세부분류 샘플 데이터 (subcategory)
-- ============================================
INSERT INTO subcategory (sub_category_code, sub_category_name, sub_category_definition) VALUES
('01010101', '공적개발원조사업관리', 
 '공적개발원조사업관리는 국가·지방자치단체 또는 공공기관이 개발도상국의 발전과 복지증진을 위하여 지원하는 사업을 관리하는 것으로서 사업개발 전략수립, 사업개발기획, PDM(사업설계모형)수립, 총괄운영관리, 프로젝트 집행, 성과관리, 사업평가관리 등의 직무를 포함한다.')
ON CONFLICT (sub_category_code) DO UPDATE
SET sub_category_name = EXCLUDED.sub_category_name,
    sub_category_definition = EXCLUDED.sub_category_definition;

-- ============================================
-- 데이터 삽입 완료 확인
-- ============================================
SELECT 'organizations' as table_name, COUNT(*) as row_count FROM organizations
UNION ALL
SELECT 'standard_codes', COUNT(*) FROM standard_codes
UNION ALL
SELECT 'alias_mapping', COUNT(*) FROM alias_mapping
UNION ALL
SELECT 'ncs_main', COUNT(*) FROM ncs_main
UNION ALL
SELECT 'unit_definition', COUNT(*) FROM unit_definition
UNION ALL
SELECT 'performance_criteria', COUNT(*) FROM performance_criteria
UNION ALL
SELECT 'subcategory', COUNT(*) FROM subcategory;
