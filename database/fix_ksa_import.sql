-- ksa 테이블 Import 오류 수정 스크립트
-- 오류: 중복된 키 값이 "ksa_pkey" 고유 제약 조건을 위반함

-- ============================================
-- Step 1: 기존 데이터 확인 및 삭제 (필요시)
-- ============================================
-- 기존 데이터를 확인합니다
SELECT COUNT(*) as existing_rows FROM ksa;

-- 기존 데이터를 모두 삭제하고 id 시퀀스를 리셋하려면 아래 주석을 해제하세요
-- TRUNCATE TABLE ksa RESTART IDENTITY CASCADE;

-- ============================================
-- Step 2: 올바른 COPY 명령어 (id 제외)
-- ============================================
-- ⚠️ 중요: id 컬럼은 포함하지 않습니다!
-- CSV 파일 경로를 실제 경로로 변경하세요

COPY ksa (
    unit_code,
    unit_element_code,
    type,
    content
    -- id는 SERIAL이므로 자동 생성 (제외!)
    -- created_at과 updated_at은 자동 설정됨 (제외!)
)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색프로그램/PoatgreSQL 업로드 데이터/ksa.csv'
WITH (
    FORMAT csv, 
    HEADER true, 
    ENCODING 'UTF8', 
    DELIMITER ',',
    QUOTE '"',
    NULL 'NULL'
);

-- ============================================
-- Step 3: Import 결과 확인
-- ============================================
SELECT 
    COUNT(*) as total_rows,
    MIN(id) as min_id,
    MAX(id) as max_id,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM ksa;

-- 샘플 데이터 확인
SELECT 
    id,
    unit_code,
    unit_element_code,
    type,
    LEFT(content, 50) as content_preview,
    created_at,
    updated_at
FROM ksa
ORDER BY id
LIMIT 10;

-- 타입별 통계
SELECT 
    type,
    COUNT(*) as count
FROM ksa
GROUP BY type
ORDER BY type;


