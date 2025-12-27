-- ============================================
-- 빠른 로그 정리 스크립트 (간단 버전)
-- pgAdmin4에서 한 번에 실행 가능
-- ============================================

-- 현재 크기 확인
SELECT pg_size_pretty(pg_database_size('railway')) AS database_size_before;

-- 로그 및 불필요한 데이터 삭제
BEGIN;

-- 1. 오래된 선택 이력 삭제 (30일 이상)
DELETE FROM selection_history WHERE selected_at < NOW() - INTERVAL '30 days';

-- 2. 오래된 장바구니 아이템 삭제 (90일 이상)
DELETE FROM cart_items WHERE added_at < NOW() - INTERVAL '90 days';

-- 3. 빈 장바구니 세트 삭제
DELETE FROM cart_sets
WHERE NOT EXISTS (
    SELECT 1 FROM cart_set_items WHERE cart_set_items.cart_set_id = cart_sets.id
);

-- 4. Guest 사용자 데이터 삭제
DELETE FROM cart_items WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');
DELETE FROM selection_history WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');
DELETE FROM cart_set_items WHERE cart_set_id IN (
    SELECT id FROM cart_sets WHERE user_id IN (SELECT id FROM users WHERE role = 'guest')
);
DELETE FROM cart_sets WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 5. 중복 선택 이력 정리 (최신 것만 유지)
DELETE FROM selection_history sh1
WHERE EXISTS (
    SELECT 1 FROM selection_history sh2
    WHERE sh1.user_id = sh2.user_id
    AND sh1.unit_code = sh2.unit_code
    AND sh1.selected_at < sh2.selected_at
);

COMMIT;

-- 디스크 공간 회수
CHECKPOINT;
VACUUM ANALYZE;

-- 정리 후 크기 확인
SELECT pg_size_pretty(pg_database_size('railway')) AS database_size_after;

