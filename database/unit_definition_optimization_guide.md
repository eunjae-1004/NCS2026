# unit_definition 테이블 최적화 가이드

## 현재 상황

- **총 행 개수**: 13,308개
- **중복 데이터**: 없음 (0개)
- **TEXT 데이터 크기**: 평균 81자 (정상)
- **문제**: 행 개수가 많아서 메모리를 많이 차지

## 원인 분석

### 1. 행 개수가 많음
- 13,308개 행은 상당히 많은 편입니다
- 각 행이 약 100-200바이트라면 총 1.3-2.6MB 정도

### 2. 인덱스 크기
- `idx_unit_definition_name` (unit_name 인덱스)
- `idx_unit_definition_unit_code` (unit_code 인덱스)
- 인덱스가 테이블 크기의 50-100%를 차지할 수 있음

### 3. 고아 데이터 가능성
- `ncs_main`에 없는 `unit_code`의 정의가 있을 수 있음
- 불필요한 데이터가 남아있을 수 있음

## 최적화 방법

### 방법 1: 고아 데이터 삭제 (권장)

`ncs_main`에 없는 `unit_definition` 삭제:

```sql
-- 1. 삭제될 데이터 확인
SELECT 
    COUNT(*) AS orphaned_count
FROM unit_definition ud
WHERE NOT EXISTS (
    SELECT 1 FROM ncs_main nm 
    WHERE nm.unit_code = ud.unit_code
);

-- 2. 고아 데이터 삭제
BEGIN;
DELETE FROM unit_definition ud
WHERE NOT EXISTS (
    SELECT 1 FROM ncs_main nm 
    WHERE nm.unit_code = ud.unit_code
);
COMMIT;

-- 3. 디스크 공간 회수
VACUUM ANALYZE unit_definition;
```

### 방법 2: NULL 정의 삭제

`unit_definition`이 NULL이거나 빈 문자열인 행 삭제:

```sql
-- 1. 삭제될 데이터 확인
SELECT COUNT(*) AS null_count
FROM unit_definition
WHERE unit_definition IS NULL OR unit_definition = '';

-- 2. NULL 정의 삭제
BEGIN;
DELETE FROM unit_definition
WHERE unit_definition IS NULL OR unit_definition = '';
COMMIT;

-- 3. 디스크 공간 회수
VACUUM ANALYZE unit_definition;
```

### 방법 3: 인덱스 최적화

인덱스를 재구성하여 공간 회수:

```sql
-- 인덱스 재구성
REINDEX TABLE unit_definition;

-- 또는 VACUUM으로 인덱스 정리
VACUUM ANALYZE unit_definition;
```

### 방법 4: 불필요한 인덱스 제거 (선택사항)

사용하지 않는 인덱스가 있다면 제거:

```sql
-- 인덱스 사용 통계 확인
SELECT 
    indexname,
    idx_scan AS index_scans,
    idx_tup_read AS tuples_read,
    idx_tup_fetch AS tuples_fetched
FROM pg_stat_user_indexes
WHERE tablename = 'unit_definition';

-- 사용하지 않는 인덱스 제거 (예시)
-- DROP INDEX IF EXISTS idx_unit_definition_name;
```

## 단계별 실행 가이드

### 1단계: 고아 데이터 확인

```sql
SELECT 
    COUNT(*) AS orphaned_count
FROM unit_definition ud
WHERE NOT EXISTS (
    SELECT 1 FROM ncs_main nm 
    WHERE nm.unit_code = ud.unit_code
);
```

### 2단계: 고아 데이터 삭제 (있는 경우)

```sql
BEGIN;
DELETE FROM unit_definition ud
WHERE NOT EXISTS (
    SELECT 1 FROM ncs_main nm 
    WHERE nm.unit_code = ud.unit_code
);
COMMIT;
VACUUM ANALYZE unit_definition;
```

### 3단계: 결과 확인

```sql
SELECT 
    COUNT(*) AS total_rows,
    pg_size_pretty(pg_total_relation_size('public.unit_definition')) AS total_size
FROM unit_definition;
```

## 예상 결과

### 정리 전:
- 행 개수: 13,308개
- 크기: 예상 2-3MB

### 정리 후 (고아 데이터 삭제 시):
- 행 개수: ncs_main의 고유한 unit_code 개수만큼
- 크기: 약 30-50% 감소 예상

## 주의사항

1. **고아 데이터 삭제 전 확인**
   - `ncs_main`에 없는 정의가 정말 불필요한지 확인
   - 나중에 사용할 수 있는 데이터인지 확인

2. **백업 권장**
   - 삭제 전에 데이터 백업

3. **VACUUM 시간**
   - VACUUM은 시간이 걸릴 수 있음 (1-5분)

## 추가 최적화

### 인덱스 최적화

```sql
-- 인덱스 사용 통계 확인
SELECT 
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexname::regclass)) AS index_size
FROM pg_stat_user_indexes
WHERE tablename = 'unit_definition';
```

사용하지 않는 인덱스가 있다면 제거할 수 있습니다.

