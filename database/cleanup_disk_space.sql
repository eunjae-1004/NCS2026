-- Railway PostgreSQL 디스크 공간 정리 스크립트
-- PowerShell에서 Railway CLI로 실행: railway run psql -f database/cleanup_disk_space.sql

-- ============================================
-- 1단계: 현재 디스크 사용량 확인
-- ============================================

-- 전체 데이터베이스 크기
SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size;

-- 테이블별 크기 확인 (큰 테이블부터)
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size('public.'||tablename)) AS table_size,
    pg_size_pretty(pg_total_relation_size('public.'||tablename) - pg_relation_size('public.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- ============================================
-- 2단계: 삭제될 데이터 개수 확인 (실행 전 확인!)
-- ============================================

-- 선택 이력 (30일 이상)
SELECT 
    'selection_history' AS table_name,
    COUNT(*) AS records_to_delete,
    MIN(selected_at) AS oldest_record,
    MAX(selected_at) AS newest_record
FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

-- 장바구니 아이템 (90일 이상)
SELECT 
    'cart_items' AS table_name,
    COUNT(*) AS records_to_delete,
    MIN(added_at) AS oldest_record,
    MAX(added_at) AS newest_record
FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 장바구니 세트 (90일 이상, 아이템이 없는 경우)
SELECT 
    'cart_sets (empty)' AS table_name,
    COUNT(*) AS records_to_delete
FROM cart_sets cs
WHERE NOT EXISTS (
    SELECT 1 FROM cart_set_items csi 
    WHERE csi.cart_set_id = cs.id
)
AND created_at < NOW() - INTERVAL '90 days';

-- ============================================
-- 3단계: 오래된 데이터 삭제
-- ============================================

-- 선택 이력 삭제 (30일 이상)
-- 주의: 실행 전에 위의 SELECT로 개수 확인하세요!
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

-- 장바구니 아이템 삭제 (90일 이상)
-- 주의: 실행 전에 위의 SELECT로 개수 확인하세요!
DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 빈 장바구니 세트 삭제 (90일 이상, 아이템이 없는 경우)
-- 주의: 실행 전에 위의 SELECT로 개수 확인하세요!
DELETE FROM cart_sets
WHERE NOT EXISTS (
    SELECT 1 FROM cart_set_items csi 
    WHERE csi.cart_set_id = cart_sets.id
)
AND created_at < NOW() - INTERVAL '90 days';

-- ============================================
-- 4단계: WAL 파일 정리 (PostgreSQL 로그 파일)
-- ============================================

-- Checkpoint 강제 실행 (WAL 파일 정리)
CHECKPOINT;

-- ============================================
-- 5단계: VACUUM 실행 (디스크 공간 회수)
-- ============================================

-- 일반 VACUUM (빠름, 테이블 잠금 없음)
VACUUM;

-- 특정 테이블만 VACUUM (선택사항)
VACUUM selection_history;
VACUUM cart_items;
VACUUM cart_sets;
VACUUM cart_set_items;

-- ============================================
-- 6단계: 최종 디스크 사용량 확인
-- ============================================

-- 전체 데이터베이스 크기 (정리 후)
SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size_after_cleanup;

-- 테이블별 크기 (정리 후)
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;


