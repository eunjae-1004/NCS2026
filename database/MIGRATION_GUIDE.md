# selection_history 테이블 마이그레이션 가이드

## 개요

`selection_history` 테이블을 `standard_codes` 테이블 구조에 맞춰 변경하여, 산업분야(`industries`), 부서(`departments`), 직무(`jobs`)별 능력단위 활용 빈도수를 추적할 수 있도록 개선했습니다.

## 변경 사항

### 1. 테이블 구조 변경

**기존 구조:**
```sql
CREATE TABLE selection_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    ability_unit_id VARCHAR(255) NOT NULL,
    unit_code VARCHAR(30),
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**변경 후 구조 (standard_codes 구조에 맞춤):**
```sql
CREATE TABLE selection_history (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    ability_unit_id VARCHAR(255) NOT NULL,
    unit_code VARCHAR(30),
    industry_code VARCHAR(50),      -- standard_codes(code, type='industries') 참조
    department_code VARCHAR(50),   -- standard_codes(code, type='departments') 참조
    job_code VARCHAR(50),           -- standard_codes(code, type='jobs') 참조
    selected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 인덱스 추가

- `idx_selection_history_industry_code`: 산업분야 코드별 조회 성능 향상
- `idx_selection_history_department_code`: 부서 코드별 조회 성능 향상
- `idx_selection_history_job_code`: 직무 코드별 조회 성능 향상
- `idx_selection_history_industry_department`: 산업분야+부서 복합 조회 성능 향상

## 마이그레이션 실행 방법

### 1. 데이터베이스 백업 (권장)

```bash
# PostgreSQL 백업
pg_dump -U postgres -d railway > backup_before_migration.sql
```

### 2. 마이그레이션 스크립트 실행

**주의**: 이전 마이그레이션(`migrate_selection_history.sql`)을 실행했다면, 먼저 해당 컬럼들을 제거해야 합니다.

```bash
# PostgreSQL 접속
psql -U postgres -d railway

# 마이그레이션 스크립트 실행
\i database/migrate_selection_history_v2.sql
```

또는 직접 SQL 실행:

```sql
-- 1. 기존 컬럼 삭제 (이전 마이그레이션에서 추가된 경우)
ALTER TABLE selection_history 
DROP COLUMN IF EXISTS industry,
DROP COLUMN IF EXISTS department;

-- 2. 새로운 컬럼 추가 (standard_codes 구조에 맞춤)
ALTER TABLE selection_history 
ADD COLUMN IF NOT EXISTS industry_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS department_code VARCHAR(50),
ADD COLUMN IF NOT EXISTS job_code VARCHAR(50);

-- 3. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_selection_history_industry_code 
ON selection_history(industry_code);

CREATE INDEX IF NOT EXISTS idx_selection_history_department_code 
ON selection_history(department_code);

CREATE INDEX IF NOT EXISTS idx_selection_history_job_code 
ON selection_history(job_code);

CREATE INDEX IF NOT EXISTS idx_selection_history_industry_department 
ON selection_history(industry_code, department_code);

-- 4. 기존 데이터 업데이트 (선택사항)
-- ncs_main의 데이터를 standard_codes와 매칭하여 code로 변환
UPDATE selection_history sh
SET industry_code = (
  SELECT sc.code
  FROM ncs_main n
  JOIN standard_codes sc ON sc.name = n.major_category_name AND sc.type = 'industries'
  WHERE n.unit_code = sh.unit_code
  LIMIT 1
)
WHERE sh.industry_code IS NULL;

UPDATE selection_history sh
SET department_code = (
  SELECT sc.code
  FROM ncs_main n
  JOIN standard_codes sc ON sc.name = n.sub_category_name AND sc.type = 'departments'
  WHERE n.unit_code = sh.unit_code
  LIMIT 1
)
WHERE sh.department_code IS NULL;
```

### 3. 마이그레이션 확인

```sql
-- 마이그레이션 결과 확인
SELECT 
  COUNT(*) as total_records,
  COUNT(industry_code) as records_with_industry_code,
  COUNT(department_code) as records_with_department_code,
  COUNT(job_code) as records_with_job_code,
  COUNT(CASE WHEN industry_code IS NOT NULL AND department_code IS NOT NULL THEN 1 END) as records_with_both
FROM selection_history;
```

## API 변경 사항

### 1. 선택 이력 저장 API (`POST /api/history/selections`)

**요청 본문 변경:**
```json
{
  "userId": "user123",
  "abilityUnitId": "0101010101_17v2",
  "industry": "제조업",        // 선택사항 - standard_codes의 name 또는 별칭
  "department": "품질관리",    // 선택사항 - standard_codes의 name 또는 별칭
  "job": "품질관리사"          // 선택사항 - standard_codes의 name 또는 별칭
}
```

**동작:**
- `industry`, `department`, `job`가 제공되면 `alias_mapping`을 통해 `standard_codes`의 `code`로 변환하여 저장
- 제공되지 않으면 `ncs_main` 테이블에서 자동으로 가져와서 `standard_codes`와 매칭하여 `code`로 저장
- 저장되는 값은 `standard_codes`의 `code` 값입니다

### 2. 선택 이력 조회 API (`GET /api/history/selections/:userId`)

**응답 변경:**
```json
{
  "success": true,
  "data": [
    {
      "abilityUnitId": "0101010101_17v2",
      "unitCode": "0101010101_17v2",
      "industryCode": "IND_001",
      "industryName": "제조업",
      "departmentCode": "DEPT_001",
      "departmentName": "품질관리",
      "jobCode": "JOB_001",
      "jobName": "품질관리사",
      "selectedAt": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### 3. 추천 API (`GET /api/recommendations`)

**개선 사항:**
- 입력된 `industry`, `department`, `job`를 `alias_mapping`을 통해 `standard_codes`의 `code`로 변환
- `selection_history`에서 산업분야/부서/직무별로 선택 이력을 집계하여 추천 (code 기반)

**예시:**
```
GET /api/recommendations?industry=제조업&department=품질관리&job=품질관리사
```

**동작:**
1. 입력값을 `alias_mapping`을 통해 `standard_codes`의 `code`로 변환
2. `code`로 `standard_codes`에서 이름 조회 (ncs_main 필터링용)
3. `selection_history`에서 해당 `code`와 일치하는 선택 이력 집계
4. 산업분야/부서/직무별 활용 빈도수 기반 추천

## alias_mapping 활용

### 별칭 매핑 테이블 구조

```sql
CREATE TABLE alias_mapping (
    id SERIAL PRIMARY KEY,
    alias VARCHAR(255) NOT NULL,           -- 사용자 입력값 (예: "QA", "품질팀")
    standard_code VARCHAR(50) NOT NULL,     -- 표준 코드
    mapping_type VARCHAR(50) NOT NULL,     -- 'department' | 'industry' | 'job'
    confidence DECIMAL(3,2) DEFAULT 0.8,   -- 신뢰도 (0.0 ~ 1.0)
    UNIQUE(alias, mapping_type)
);
```

### 별칭 매핑 데이터 예시

```sql
-- 부서명 매핑 예시
INSERT INTO alias_mapping (alias, standard_code, mapping_type, confidence) VALUES
('QA', 'DEPT_001', 'department', 0.95),
('품질팀', 'DEPT_001', 'department', 0.9),
('품질관리팀', 'DEPT_001', 'department', 0.9),
('QC', 'DEPT_001', 'department', 0.95),
('HR', 'DEPT_002', 'department', 0.95),
('인사팀', 'DEPT_002', 'department', 0.9);

-- 산업분야 매핑 예시
INSERT INTO alias_mapping (alias, standard_code, mapping_type, confidence) VALUES
('제조', 'IND_001', 'industry', 0.9),
('제조업', 'IND_001', 'industry', 0.95),
('IT', 'IND_002', 'industry', 0.95),
('정보통신', 'IND_002', 'industry', 0.9);
```

### 표준 코드 테이블

```sql
-- 표준 코드 예시
INSERT INTO standard_codes (code, name, type) VALUES
('DEPT_001', '품질관리', 'departments'),
('DEPT_002', '인사관리', 'departments'),
('IND_001', '제조업', 'industries'),
('IND_002', '정보통신업', 'industries');
```

## 롤백 방법

마이그레이션을 되돌리려면:

```sql
-- 인덱스 삭제
DROP INDEX IF EXISTS idx_selection_history_industry_department;
DROP INDEX IF EXISTS idx_selection_history_job_code;
DROP INDEX IF EXISTS idx_selection_history_department_code;
DROP INDEX IF EXISTS idx_selection_history_industry_code;

-- 컬럼 삭제
ALTER TABLE selection_history 
DROP COLUMN IF EXISTS job_code,
DROP COLUMN IF EXISTS department_code,
DROP COLUMN IF EXISTS industry_code;
```

## 주의사항

1. **standard_codes 테이블 필수**: 마이그레이션 전에 `standard_codes` 테이블에 산업분야, 부서, 직무 데이터가 있어야 합니다.
2. **기존 데이터**: 마이그레이션 후 기존 데이터의 `industry_code`, `department_code`, `job_code`는 `NULL`이거나 `ncs_main`과 `standard_codes`를 매칭하여 변환된 값입니다.
3. **성능**: 인덱스가 추가되어 조회 성능이 향상되지만, INSERT 성능은 약간 저하될 수 있습니다.
4. **데이터 일관성**: 새로운 선택 이력은 항상 `standard_codes`의 `code` 값으로 저장됩니다.
5. **code 참조**: `selection_history`의 `*_code` 컬럼은 `standard_codes` 테이블의 `code` 값을 참조합니다. 외래키 제약조건은 설정하지 않았지만, 데이터 일관성을 위해 `standard_codes`에 존재하는 `code`만 사용해야 합니다.

## 테스트

마이그레이션 후 다음을 테스트하세요:

1. 선택 이력 저장 API에 `industry`와 `department` 포함하여 호출
2. 추천 API에서 산업분야/부서별 추천이 정상 작동하는지 확인
3. `alias_mapping`을 통한 표준화가 정상 작동하는지 확인

