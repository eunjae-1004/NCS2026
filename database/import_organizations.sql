-- organizations 테이블 데이터 Import
-- created_at과 updated_at은 자동으로 설정되므로 CSV에 포함하지 않음

-- ============================================
-- Step 1: 기존 데이터 확인 (필요시)
-- ============================================
SELECT COUNT(*) as existing_rows FROM organizations;

-- 기존 데이터를 모두 삭제하려면 아래 주석을 해제하세요
-- TRUNCATE TABLE organizations CASCADE;

-- ============================================
-- Step 2: 올바른 COPY 명령어 (3개 컬럼만)
-- ============================================
-- ⚠️ 중요: created_at과 updated_at은 제외합니다!
-- CSV 파일 경로를 실제 경로로 변경하세요

COPY organizations (
    id,
    name,
    type
    -- created_at과 updated_at은 자동 설정됨 (제외!)
)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색 프로그램/PoatgreSQL 업로드 데이터/organizations.csv'
WITH (
    FORMAT csv, 
    HEADER true, 
    ENCODING 'UTF8', 
    DELIMITER ',',
    QUOTE '"'
);

-- ============================================
-- Step 3: Import 결과 확인
-- ============================================
SELECT 
    COUNT(*) as total_rows,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM organizations;

-- 샘플 데이터 확인
SELECT 
    id,
    name,
    type,
    created_at,
    updated_at
FROM organizations
ORDER BY id
LIMIT 10;

-- type 값 통계
SELECT 
    type,
    COUNT(*) as count
FROM organizations
GROUP BY type
ORDER BY type;

-- ============================================
-- CSV 파일 형식 예시
-- ============================================
-- id,name,type
-- org_101,의료기기 제조업체 D,enterprise
-- org_102,공공기관 A,public
-- org_103,기업 B,enterprise
--
-- 주의사항:
-- 1. type 값은 반드시 'public' 또는 'enterprise' (소문자)
-- 2. 공백 없음
-- 3. created_at, updated_at 컬럼 없음


