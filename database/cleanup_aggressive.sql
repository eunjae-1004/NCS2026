-- Railway PostgreSQL 공격적인 디스크 공간 정리 스크립트
-- ⚠️ 주의: 이 스크립트는 더 많은 데이터를 삭제합니다!
-- PowerShell에서 Railway CLI로 실행: railway run psql -f database/cleanup_aggressive.sql

-- ============================================
-- 1단계: 현재 상태 확인
-- ============================================

SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size_before;

-- ============================================
-- 2단계: 공격적인 데이터 삭제
-- ============================================

-- 선택 이력 삭제 (7일 이상) - 더 짧은 기간
DELETE FROM selection_history 
WHERE selected_at < NOW() - INTERVAL '7 days';

-- 장바구니 아이템 삭제 (30일 이상) - 더 짧은 기간
DELETE FROM cart_items 
WHERE added_at < NOW() - INTERVAL '30 days';

-- 빈 장바구니 세트 삭제 (30일 이상)
DELETE FROM cart_sets
WHERE NOT EXISTS (
    SELECT 1 FROM cart_set_items csi 
    WHERE csi.cart_set_id = cart_sets.id
)
AND created_at < NOW() - INTERVAL '30 days';

-- Guest 사용자의 모든 데이터 삭제 (테스트 데이터)
DELETE FROM cart_items 
WHERE user_id IN (
    SELECT id FROM users WHERE role = 'guest'
);

DELETE FROM selection_history 
WHERE user_id IN (
    SELECT id FROM users WHERE role = 'guest'
);

DELETE FROM cart_sets
WHERE user_id IN (
    SELECT id FROM users WHERE role = 'guest'
);

-- ============================================
-- 3단계: WAL 파일 정리
-- ============================================

CHECKPOINT;

-- ============================================
-- 4단계: VACUUM FULL (완전 정리, 시간 오래 걸림)
-- ============================================

-- ⚠️ 주의: VACUUM FULL은 테이블을 잠그고 시간이 오래 걸립니다!
-- 큰 테이블부터 하나씩 실행하는 것을 권장합니다.

-- 작은 테이블부터 정리
VACUUM FULL selection_history;
VACUUM FULL cart_items;
VACUUM FULL cart_sets;
VACUUM FULL cart_set_items;

-- 큰 테이블은 주의해서 실행
-- VACUUM FULL ncs_main;  -- 이 테이블이 매우 크면 시간이 오래 걸립니다!

-- ============================================
-- 5단계: 최종 확인
-- ============================================

SELECT 
    pg_size_pretty(pg_database_size('railway')) AS database_size_after;


