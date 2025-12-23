-- ksa 테이블 데이터 Import
-- created_at과 updated_at은 자동으로 설정되므로 CSV에 포함하지 않음

-- ============================================
-- 방법 1: COPY 명령어 (컬럼 명시) - id 제외 필수!
-- ============================================
-- ⚠️ 중요: id 컬럼은 포함하지 않습니다!
-- CSV 파일 경로를 실제 경로로 변경하세요
COPY ksa (
    unit_code,
    unit_element_code,
    type,
    content
    -- id는 SERIAL이므로 자동 생성 (CSV에 포함하지 않음!)
    -- created_at과 updated_at은 자동 설정됨
)
FROM 'C:/path/to/your/ksa.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');

-- ============================================
-- 기존 데이터 삭제 후 재import (필요시)
-- ============================================
-- 기존 데이터를 모두 삭제하고 새로 import하려면:
-- TRUNCATE TABLE ksa RESTART IDENTITY CASCADE;
-- 그 다음 위의 COPY 명령 실행

-- ============================================
-- 방법 2: pgAdmin 사용 시
-- ============================================
-- 1. ksa 테이블 우클릭
-- 2. "Import/Export Data" 선택
-- 3. Import 탭 선택
-- 4. 파일 경로 지정
-- 5. 옵션:
--    - Format: CSV
--    - Header: Yes
--    - Encoding: UTF8
--    - Delimiter: ,
-- 6. Columns 탭에서:
--    - unit_code, unit_element_code, type, content만 매핑
--    - id, created_at, updated_at은 매핑하지 않음
-- 7. Import 실행

-- ============================================
-- CSV 파일 형식 예시
-- ============================================
-- unit_code,unit_element_code,type,content
-- 0101010101_17v2,0101010101_17v2.1,지식,국제기구 및 양자원조기구, NGO 등 협력대상국 개발정책
-- 0101010101_17v2,0101010101_17v2.1,기술,외국어 의사소통 능력
-- 0101010101_17v2,0101010101_17v2.1,태도,객관적이고 논리적으로 사고하려는 의지

-- ============================================
-- Import 후 확인
-- ============================================
SELECT 
    COUNT(*) as total_rows,
    MIN(created_at) as first_created,
    MAX(created_at) as last_created
FROM ksa;

-- 샘플 데이터 확인 (created_at 자동 설정 확인)
SELECT 
    id,
    unit_code,
    unit_element_code,
    type,
    LEFT(content, 50) as content_preview,
    created_at,
    updated_at
FROM ksa
ORDER BY created_at DESC
LIMIT 5;

