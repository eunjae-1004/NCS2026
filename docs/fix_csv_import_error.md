# CSV Import 오류 해결: unit_definition

## 오류 내용

```
ERROR: value "0101010101_17v2" is out of range for type integer
CONTEXT: COPY unit_definition, line 2, column id: "0101010101_17v2"
```

## 원인

- `unit_definition` 테이블의 `id` 컬럼은 `SERIAL` (자동 생성 정수) 타입입니다
- CSV 파일에 `id` 컬럼이 포함되어 있고, 그 값이 문자열("0101010101_17v2")입니다
- PostgreSQL이 문자열을 정수로 변환할 수 없어서 오류 발생

## 해결 방법

### 방법 1: CSV 파일에서 id 컬럼 제거 (권장) ⭐

CSV 파일을 열어서 `id` 컬럼을 삭제하세요.

**수정 전:**
```csv
id,unit_code,unit_name,unit_definition
0101010101_17v2,0101010101_17v2,공적개발원조사업 개발전략수립,...
```

**수정 후:**
```csv
unit_code,unit_name,unit_definition
0101010101_17v2,공적개발원조사업 개발전략수립,...
```

### 방법 2: COPY 명령어에서 id 컬럼 제외

pgAdmin에서 Import 시:

1. **"Columns" 탭 클릭**
2. **"id" 컬럼의 체크박스 해제**
3. **다시 Import 실행**

또는 SQL에서 직접 실행:

```sql
-- id 컬럼을 제외하고 import
COPY unit_definition (unit_code, unit_name, unit_definition)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색프로그램/PoatgreSQL 업로드 데이터/unit_definition.csv'
WITH (
    FORMAT csv, 
    HEADER true, 
    ENCODING 'UTF8',
    DELIMITER ',',
    QUOTE '"'
);
```

## 올바른 CSV 파일 형식

### unit_definition.csv

```csv
unit_code,unit_name,unit_definition
0101010101_17v2,공적개발원조사업 개발전략수립,공적개발원조사업 개발전략 수립이란...
0101010102_17v2,공적개발원조사업 사업기획,공적개발원조사업 사업기획이란...
```

**주의사항:**
- ✅ `id` 컬럼 **없음** (자동 생성됨)
- ✅ `created_at`, `updated_at` 컬럼 **없음** (자동 설정됨)
- ✅ `unit_code`, `unit_name`, `unit_definition`만 포함

## 다른 테이블도 확인

다음 테이블들도 `id`가 SERIAL이므로 CSV에서 제외해야 합니다:

- `performance_criteria` - `id` 제외
- `ksa` - `id` 제외
- `cart_items` - `id` 제외
- `cart_set_items` - `id` 제외
- `selection_history` - `id` 제외
- `alias_mapping` - `id` 제외
- `standard_codes` - `id` 제외

## CSV 파일 컬럼 체크리스트

### unit_definition.csv
- [ ] `id` 제거 (SERIAL 자동 생성)
- [ ] `unit_code` 포함
- [ ] `unit_name` 포함
- [ ] `unit_definition` 포함 (선택사항)
- [ ] `created_at`, `updated_at` 제거 (자동 설정)

### ncs_main.csv
- [ ] `id_ncs` 포함 (PRIMARY KEY)
- [ ] `created_at`, `updated_at` 제거 (자동 설정)

### performance_criteria.csv
- [ ] `id` 제거 (SERIAL 자동 생성)
- [ ] `unit_code` 포함
- [ ] `unit_element_code` 포함
- [ ] `performance_criteria` 포함
- [ ] `created_at`, `updated_at` 제거 (자동 설정)

## Import 후 확인

```sql
-- 데이터 확인
SELECT id, unit_code, unit_name 
FROM unit_definition 
ORDER BY id 
LIMIT 10;

-- id가 자동으로 생성되었는지 확인
SELECT 
    MIN(id) as min_id,
    MAX(id) as max_id,
    COUNT(*) as total_count
FROM unit_definition;
```

