-- ============================================
-- 로그 정보 및 불필요한 데이터 정리 스크립트
-- Railway PostgreSQL 디스크 공간 정리
-- ⚠️ 주의: 실행 전에 백업을 권장합니다!
-- ============================================

-- ============================================
-- 1단계: 현재 상태 확인
-- ============================================

SELECT 
    '=== 현재 데이터베이스 상태 ===' AS info;

-- 전체 데이터베이스 크기
SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size_before;

-- 테이블별 크기 확인
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size,
    pg_size_pretty(pg_relation_size('public.'||tablename)) AS table_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- ============================================
-- 2단계: 삭제될 데이터 개수 확인 (실행 전 확인!)
-- ============================================

SELECT 
    '=== 삭제될 데이터 개수 확인 ===' AS info;

-- 1. 오래된 선택 이력 (30일 이상)
SELECT 
    'selection_history (30일 이상)' AS table_name,
    COUNT(*) AS records_to_delete,
    MIN(selected_at) AS oldest_record,
    MAX(selected_at) AS newest_record
FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

-- 2. 오래된 장바구니 아이템 (90일 이상)
SELECT 
    'cart_items (90일 이상)' AS table_name,
    COUNT(*) AS records_to_delete,
    MIN(added_at) AS oldest_record,
    MAX(added_at) AS newest_record
FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 3. 오래된 장바구니 세트 (90일 이상)
SELECT 
    'cart_sets (90일 이상)' AS table_name,
    COUNT(*) AS records_to_delete,
    MIN(created_at) AS oldest_record,
    MAX(created_at) AS newest_record
FROM cart_sets
WHERE created_at < NOW() - INTERVAL '90 days';

-- 4. 빈 장바구니 세트 (아이템이 없는 세트)
SELECT 
    'cart_sets (빈 세트)' AS table_name,
    COUNT(*) AS records_to_delete
FROM cart_sets cs
WHERE NOT EXISTS (
    SELECT 1 FROM cart_set_items csi 
    WHERE csi.cart_set_id = cs.id
);

-- 5. Guest 사용자 데이터
SELECT 
    'users (guest)' AS table_name,
    COUNT(*) AS guest_users_count
FROM users 
WHERE role = 'guest';

-- 6. Guest 사용자의 선택 이력
SELECT 
    'selection_history (guest users)' AS table_name,
    COUNT(*) AS records_to_delete
FROM selection_history 
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 7. Guest 사용자의 장바구니 아이템
SELECT 
    'cart_items (guest users)' AS table_name,
    COUNT(*) AS records_to_delete
FROM cart_items 
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 8. Guest 사용자의 장바구니 세트
SELECT 
    'cart_sets (guest users)' AS table_name,
    COUNT(*) AS records_to_delete
FROM cart_sets
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 9. 중복된 선택 이력 (같은 사용자가 같은 능력단위를 여러 번 선택)
SELECT 
    'selection_history (중복)' AS table_name,
    COUNT(*) - COUNT(DISTINCT (user_id, unit_code)) AS duplicate_records
FROM selection_history;

-- ============================================
-- 3단계: 로그 및 불필요한 데이터 삭제
-- ============================================

-- ⚠️ 주의: 아래 명령어들은 실제로 데이터를 삭제합니다!
-- 실행 전에 위의 SELECT 문으로 삭제될 데이터를 확인하세요!

BEGIN;

-- 1. 오래된 선택 이력 삭제 (30일 이상) - 로그 데이터
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '30 days';

-- 2. 오래된 장바구니 아이템 삭제 (90일 이상) - 불필요한 데이터
DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '90 days';

-- 3. 빈 장바구니 세트 삭제 (아이템이 없는 세트)
DELETE FROM cart_sets
WHERE NOT EXISTS (
    SELECT 1 FROM cart_set_items csi 
    WHERE csi.cart_set_id = cart_sets.id
);

-- 4. 오래된 장바구니 세트 삭제 (90일 이상, 아이템이 있는 경우도)
DELETE FROM cart_sets
WHERE created_at < NOW() - INTERVAL '90 days'
AND NOT EXISTS (
    SELECT 1 FROM cart_set_items csi 
    WHERE csi.cart_set_id = cart_sets.id
    AND csi.cart_set_id IN (
        SELECT id FROM cart_sets 
        WHERE created_at >= NOW() - INTERVAL '90 days'
    )
);

-- 5. Guest 사용자의 모든 데이터 삭제 (테스트/임시 데이터)
-- 5-1. Guest 사용자의 선택 이력 삭제
DELETE FROM selection_history 
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 5-2. Guest 사용자의 장바구니 아이템 삭제
DELETE FROM cart_items 
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 5-3. Guest 사용자의 장바구니 세트 아이템 삭제
DELETE FROM cart_set_items
WHERE cart_set_id IN (
    SELECT id FROM cart_sets 
    WHERE user_id IN (SELECT id FROM users WHERE role = 'guest')
);

-- 5-4. Guest 사용자의 장바구니 세트 삭제
DELETE FROM cart_sets
WHERE user_id IN (SELECT id FROM users WHERE role = 'guest');

-- 5-5. Guest 사용자 삭제 (선택사항 - 주석 해제하여 사용)
-- ⚠️ 주의: Guest 사용자를 삭제하면 관련된 모든 데이터가 CASCADE로 삭제됩니다
-- DELETE FROM users WHERE role = 'guest';

-- 6. 중복된 선택 이력 정리 (같은 사용자가 같은 능력단위를 여러 번 선택한 경우, 최신 것만 유지)
-- 최신 선택 이력만 유지하고 나머지 삭제
DELETE FROM selection_history sh1
WHERE EXISTS (
    SELECT 1 FROM selection_history sh2
    WHERE sh1.user_id = sh2.user_id
    AND sh1.unit_code = sh2.unit_code
    AND sh1.selected_at < sh2.selected_at
);

-- 7. 오래된 업데이트 타임스탬프 정리 (선택사항)
-- updated_at이 created_at보다 오래된 경우 (데이터 변경이 없는 경우)
-- 이 부분은 데이터를 삭제하지 않고, 단순히 확인만 합니다

-- 삭제 결과 확인
SELECT 
    '=== 삭제 완료 ===' AS info,
    (SELECT COUNT(*) FROM selection_history) AS remaining_selection_history,
    (SELECT COUNT(*) FROM cart_items) AS remaining_cart_items,
    (SELECT COUNT(*) FROM cart_sets) AS remaining_cart_sets,
    (SELECT COUNT(*) FROM users WHERE role = 'guest') AS remaining_guest_users;

COMMIT;

-- ============================================
-- 4단계: 디스크 공간 회수
-- ============================================

-- WAL 파일 정리 (PostgreSQL 로그 파일)
CHECKPOINT;

-- VACUUM 실행 (디스크 공간 회수)
-- ⚠️ 주의: VACUUM은 시간이 걸릴 수 있습니다 (1-5분)
VACUUM ANALYZE;

-- 큰 테이블은 개별적으로 VACUUM (선택사항, 더 오래 걸림)
-- VACUUM FULL selection_history;
-- VACUUM FULL cart_items;
-- VACUUM FULL cart_sets;

-- ============================================
-- 5단계: 정리 후 상태 확인
-- ============================================

SELECT 
    '=== 정리 후 데이터베이스 크기 ===' AS info;

-- 전체 데이터베이스 크기 (정리 후)
SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size_after;

-- 테이블별 크기 (정리 후)
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size('public.'||tablename)) AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size('public.'||tablename) DESC;

-- 정리 통계
SELECT 
    '=== 정리 통계 ===' AS info,
    (SELECT COUNT(*) FROM selection_history) AS selection_history_count,
    (SELECT COUNT(*) FROM cart_items) AS cart_items_count,
    (SELECT COUNT(*) FROM cart_sets) AS cart_sets_count,
    (SELECT COUNT(*) FROM users) AS total_users_count,
    (SELECT COUNT(*) FROM users WHERE role = 'guest') AS guest_users_count;

-- ============================================
-- 완료 메시지
-- ============================================

SELECT 
    '✅ 로그 및 불필요한 데이터 정리가 완료되었습니다!' AS completion_message;

