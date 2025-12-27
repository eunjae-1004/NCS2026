-- Railway PostgreSQL 디스크 공간 안전 정리 스크립트
-- ⚠️ 주의: 실행 전에 백업을 권장합니다
-- Railway CLI로 실행: railway run psql -f database/cleanup_railway_safe.sql

-- ============================================
-- 1단계: 현재 상태 확인
-- ============================================

SELECT 
    '=== 현재 데이터베이스 상태 ===' AS info;

-- 전체 데이터베이스 크기
SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size;

-- 테이블별 크기 확인
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

SELECT 
    '=== 삭제될 데이터 개수 확인 ===' AS info;

-- 오래된 선택 이력 (30일 이상)
SELECT 
    COUNT(*) AS old_selection_history_count
FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

-- 오래된 장바구니 아이템 (90일 이상)
SELECT 
    COUNT(*) AS old_cart_items_count
FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 오래된 장바구니 세트 (90일 이상)
SELECT 
    COUNT(*) AS old_cart_sets_count
FROM cart_sets
WHERE created_at < NOW() - INTERVAL '90 days';

-- Guest 사용자 데이터
SELECT 
    COUNT(*) AS guest_users_count
FROM users 
WHERE role = 'guest';

-- Guest 사용자의 장바구니 아이템
SELECT 
    COUNT(*) AS guest_cart_items_count
FROM cart_items 
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- Guest 사용자의 선택 이력
SELECT 
    COUNT(*) AS guest_selection_history_count
FROM selection_history 
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- ============================================
-- 3단계: 안전한 데이터 삭제
-- ============================================

-- ⚠️ 주의: 아래 명령어들은 실제로 데이터를 삭제합니다!
-- 실행 전에 위의 SELECT 문으로 삭제될 데이터를 확인하세요!

BEGIN;

-- 1. 오래된 선택 이력 삭제 (30일 이상)
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

-- 2. 오래된 장바구니 아이템 삭제 (90일 이상)
DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 3. 오래된 장바구니 세트 삭제 (90일 이상, 아이템이 없는 경우)
DELETE FROM cart_sets
WHERE NOT EXISTS (
    SELECT 1 FROM cart_set_items csi 
    WHERE csi.cart_set_id = cart_sets.id
)
AND created_at < NOW() - INTERVAL '90 days';

-- 4. Guest 사용자의 모든 데이터 삭제 (테스트 데이터)
DELETE FROM cart_items 
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

DELETE FROM selection_history 
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

DELETE FROM cart_sets
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 5. Guest 사용자 삭제 (선택사항 - 주석 해제하여 사용)
-- DELETE FROM users WHERE role = 'guest';

-- 삭제 결과 확인
SELECT 
    '=== 삭제 완료 ===' AS info,
    (SELECT COUNT(*) FROM selection_history) AS remaining_selection_history,
    (SELECT COUNT(*) FROM cart_items) AS remaining_cart_items,
    (SELECT COUNT(*) FROM cart_sets) AS remaining_cart_sets;

COMMIT;

-- ============================================
-- 4단계: 디스크 공간 회수
-- ============================================

-- WAL 파일 정리
CHECKPOINT;

-- VACUUM 실행 (디스크 공간 회수)
-- ⚠️ 주의: VACUUM은 시간이 걸릴 수 있습니다
VACUUM ANALYZE;

-- 큰 테이블은 개별적으로 VACUUM (선택사항)
-- VACUUM FULL ncs_main;
-- VACUUM FULL cart_items;
-- VACUUM FULL selection_history;

-- ============================================
-- 5단계: 정리 후 상태 확인
-- ============================================

SELECT 
    '=== 정리 후 데이터베이스 크기 ===' AS info;

SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size_after;

-- 테이블별 크기 재확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

