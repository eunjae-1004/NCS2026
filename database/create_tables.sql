-- ============================================
-- NCS 능력단위 검색 시스템 데이터베이스 스키마
-- PostgreSQL
-- 모든 테이블 생성 스크립트 (통합 버전)
-- ============================================

-- 데이터베이스 생성 (필요시)
-- CREATE DATABASE ncs_search;

-- ============================================
-- 확장 기능 활성화
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. 메인 테이블: ncs_main
-- ============================================
CREATE TABLE IF NOT EXISTS ncs_main (
    id_ncs VARCHAR(20) PRIMARY KEY,
    small_category_code VARCHAR(10),
    sub_category_code VARCHAR(20),
    unit_code VARCHAR(30),
    unit_element_code VARCHAR(30),
    major_category_name VARCHAR(100),
    middle_category_name VARCHAR(100),
    small_category_name VARCHAR(100),
    sub_category_name VARCHAR(100),
    unit_name VARCHAR(255),
    unit_level INTEGER,
    unit_element_name VARCHAR(255),
    unit_element_level INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ncs_main_unit_code ON ncs_main(unit_code);
CREATE INDEX IF NOT EXISTS idx_ncs_main_sub_category_code ON ncs_main(sub_category_code);
CREATE INDEX IF NOT EXISTS idx_ncs_main_small_category_code ON ncs_main(small_category_code);
CREATE INDEX IF NOT EXISTS idx_ncs_main_unit_level ON ncs_main(unit_level);
CREATE INDEX IF NOT EXISTS idx_ncs_main_unit_element_level ON ncs_main(unit_element_level);

-- ============================================
-- 2. 능력단위 정의 테이블: unit_definition
-- ============================================
-- unit_code는 중복될 수 있으므로 UNIQUE 제약 조건 없음
CREATE TABLE IF NOT EXISTS unit_definition (
    id SERIAL PRIMARY KEY,
    unit_code VARCHAR(30) NOT NULL,
    unit_name VARCHAR(255) NOT NULL,
    unit_definition TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_unit_definition_name ON unit_definition(unit_name);
CREATE INDEX IF NOT EXISTS idx_unit_definition_unit_code ON unit_definition(unit_code);

-- ============================================
-- 3. 수행준거 테이블: performance_criteria
-- ============================================
CREATE TABLE IF NOT EXISTS performance_criteria (
    id SERIAL PRIMARY KEY,
    unit_code VARCHAR(30) NOT NULL,
    unit_element_code VARCHAR(30),
    performance_criteria TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_performance_criteria_unit_code ON performance_criteria(unit_code);
CREATE INDEX IF NOT EXISTS idx_performance_criteria_unit_element_code ON performance_criteria(unit_element_code);

-- ============================================
-- 4. 지식/기술/태도 테이블: ksa
-- ============================================
CREATE TABLE IF NOT EXISTS ksa (
    id SERIAL PRIMARY KEY,
    unit_code VARCHAR(30) NOT NULL,
    unit_element_code VARCHAR(30),
    type VARCHAR(20) NOT NULL CHECK (type IN ('지식', '기술', '태도')),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_ksa_unit_code ON ksa(unit_code);
CREATE INDEX IF NOT EXISTS idx_ksa_unit_element_code ON ksa(unit_element_code);
CREATE INDEX IF NOT EXISTS idx_ksa_type ON ksa(type);

-- ============================================
-- 5. 세부분류 테이블: subcategory
-- ============================================
CREATE TABLE IF NOT EXISTS subcategory (
    sub_category_code VARCHAR(20) PRIMARY KEY,
    sub_category_name VARCHAR(255) NOT NULL,
    sub_category_definition TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_subcategory_name ON subcategory(sub_category_name);

-- ============================================
-- 6. 기관 테이블: organizations
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('public', 'enterprise')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 7. 사용자 테이블: users
-- ============================================
-- 인증 기능 포함 (email, password_hash)
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    organization_id VARCHAR(255),
    role VARCHAR(50) DEFAULT 'guest',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- ============================================
-- 8. 선택 이력 테이블: selection_history
-- ============================================
CREATE TABLE IF NOT EXISTS selection_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    ability_unit_id VARCHAR(255) NOT NULL,
    unit_code VARCHAR(30),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_selection_history_user_id ON selection_history(user_id);
CREATE INDEX IF NOT EXISTS idx_selection_history_unit_code ON selection_history(unit_code);
CREATE INDEX IF NOT EXISTS idx_selection_history_selected_at ON selection_history(selected_at);

-- ============================================
-- 9. 선택목록 아이템 테이블: cart_items
-- ============================================
-- (장바구니 → 선택목록으로 변경)
CREATE TABLE IF NOT EXISTS cart_items (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    unit_code VARCHAR(30) NOT NULL,
    memo TEXT,
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, unit_code)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id ON cart_items(user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_unit_code ON cart_items(unit_code);

-- ============================================
-- 10. 선택목록 세트 테이블: cart_sets
-- ============================================
CREATE TABLE IF NOT EXISTS cart_sets (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================
-- 11. 선택목록 세트 아이템 테이블: cart_set_items
-- ============================================
CREATE TABLE IF NOT EXISTS cart_set_items (
    id SERIAL PRIMARY KEY,
    cart_set_id VARCHAR(255) NOT NULL,
    unit_code VARCHAR(30) NOT NULL,
    memo TEXT,
    FOREIGN KEY (cart_set_id) REFERENCES cart_sets(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_cart_set_items_cart_set_id ON cart_set_items(cart_set_id);

-- ============================================
-- 12. 별칭 매핑 테이블: alias_mapping
-- ============================================
CREATE TABLE IF NOT EXISTS alias_mapping (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(255) NOT NULL,
    standard_code VARCHAR(50) NOT NULL,
    mapping_type VARCHAR(50) NOT NULL CHECK (mapping_type IN ('department', 'industry', 'job')),
    confidence DECIMAL(3,2) DEFAULT 0.8 CHECK (confidence >= 0 AND confidence <= 1),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(alias, mapping_type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_alias_mapping_alias ON alias_mapping(alias);
CREATE INDEX IF NOT EXISTS idx_alias_mapping_type ON alias_mapping(mapping_type);

-- ============================================
-- 13. 표준 코드 테이블: standard_codes
-- ============================================
CREATE TABLE IF NOT EXISTS standard_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('departments', 'industries', 'jobs')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, type)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_standard_codes_type ON standard_codes(type);

-- ============================================
-- 업데이트 트리거 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 업데이트 트리거 적용
CREATE TRIGGER update_ncs_main_updated_at BEFORE UPDATE ON ncs_main
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_unit_definition_updated_at BEFORE UPDATE ON unit_definition
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_performance_criteria_updated_at BEFORE UPDATE ON performance_criteria
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_ksa_updated_at BEFORE UPDATE ON ksa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_subcategory_updated_at BEFORE UPDATE ON subcategory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_alias_mapping_updated_at BEFORE UPDATE ON alias_mapping
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 뷰 생성 (조회 편의성)
-- ============================================

-- 능력단위 상세 정보 뷰
CREATE OR REPLACE VIEW ability_unit_detail AS
SELECT 
    n.unit_code,
    n.unit_name,
    n.unit_level,
    n.sub_category_code,
    n.sub_category_name,
    n.small_category_name,
    n.middle_category_name,
    n.major_category_name,
    ud.unit_definition,
    COUNT(DISTINCT n.unit_element_code) as element_count
FROM ncs_main n
LEFT JOIN unit_definition ud ON n.unit_code = ud.unit_code
GROUP BY n.unit_code, n.unit_name, n.unit_level, n.sub_category_code, 
         n.sub_category_name, n.small_category_name, n.middle_category_name, 
         n.major_category_name, ud.unit_definition;

-- 능력단위 요소 뷰
CREATE OR REPLACE VIEW ability_unit_elements AS
SELECT 
    n.unit_code,
    n.unit_element_code,
    n.unit_element_name,
    n.unit_element_level,
    COUNT(*) as performance_criteria_count
FROM ncs_main n
LEFT JOIN performance_criteria pc ON n.unit_element_code = pc.unit_element_code
GROUP BY n.unit_code, n.unit_element_code, n.unit_element_name, n.unit_element_level;

