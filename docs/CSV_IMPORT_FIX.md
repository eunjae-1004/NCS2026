# CSV Import 시 created_at/updated_at 처리 방법

## 문제

CSV 파일에 `created_at`, `updated_at` 컬럼이 없어서 import 오류가 발생합니다.

## 해결 방법

이 컬럼들은 **자동으로 설정**되므로 CSV 파일에 포함하지 않아도 됩니다.

## 방법 1: pgAdmin에서 Import 시

### 설정 방법

1. **테이블 우클릭** → "Import/Export Data"
2. **Import 탭** 선택
3. **CSV 파일 선택**
4. **옵션 설정:**
   - Format: CSV
   - Header: Yes
   - Encoding: UTF8
   - Delimiter: `,`

5. **중요: 컬럼 매핑 설정**
   - "Columns" 탭 클릭
   - `created_at`과 `updated_at` 컬럼은 **매핑하지 않음**
   - CSV 파일의 컬럼만 매핑:
     - id_ncs
     - small_category_code
     - sub_category_code
     - unit_code
     - unit_element_code
     - major_category_name
     - middle_category_name
     - small_category_name
     - sub_category_name
     - unit_name
     - unit_level
     - unit_element_name
     - unit_element_level

6. **Import 실행**

## 방법 2: SQL COPY 명령어 사용

### 올바른 COPY 명령어

```sql
-- 컬럼 목록을 명시하여 created_at, updated_at 제외
COPY ncs_main (
    id_ncs,
    small_category_code,
    sub_category_code,
    unit_code,
    unit_element_code,
    major_category_name,
    middle_category_name,
    small_category_name,
    sub_category_name,
    unit_name,
    unit_level,
    unit_element_name,
    unit_element_level
    -- created_at과 updated_at은 제외 (자동 설정)
)
FROM 'C:/path/to/ncs_main.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
```

### 잘못된 예시 (오류 발생)

```sql
-- ❌ 모든 컬럼을 포함하면 오류 발생
COPY ncs_main FROM 'file.csv' WITH CSV HEADER;
```

## CSV 파일 형식

### 올바른 CSV 파일 (13개 컬럼)

```csv
id_ncs,small_category_code,sub_category_code,unit_code,unit_element_code,major_category_name,middle_category_name,small_category_name,sub_category_name,unit_name,unit_level,unit_element_name,unit_element_level
25-00001,010101,01010101,0101010101_17v2,0101010101_17v2.1,사업관리,사업관리,프로젝트관리,공적개발원조사업관리,공적개발원조사업 개발전략수립,7,협력대상국 개발환경 분석하기,7
```

### 잘못된 CSV 파일 (15개 컬럼 - created_at, updated_at 포함)

```csv
id_ncs,...,unit_element_level,created_at,updated_at
25-00001,...,7,2024-01-01,2024-01-01
```

이 경우 오류가 발생합니다.

## 자동 설정 확인

스키마에서 확인:

```sql
-- 테이블 구조 확인
\d ncs_main
```

`created_at`과 `updated_at`은 다음과 같이 설정되어 있습니다:
- `DEFAULT CURRENT_TIMESTAMP` → 자동으로 현재 시간 설정
- `updated_at`은 트리거로 자동 업데이트

## 단계별 해결

### Step 1: CSV 파일 확인

CSV 파일이 **13개 컬럼**만 있는지 확인:
1. id_ncs
2. small_category_code
3. sub_category_code
4. unit_code
5. unit_element_code
6. major_category_name
7. middle_category_name
8. small_category_name
9. sub_category_name
10. unit_name
11. unit_level
12. unit_element_name
13. unit_element_level

**created_at, updated_at은 없어야 함**

### Step 2: pgAdmin Import 설정

1. Import 시 "Columns" 탭에서
2. CSV 컬럼만 매핑
3. `created_at`, `updated_at`은 매핑하지 않음

### Step 3: Import 실행

## 확인

Import 후 확인:

```sql
-- created_at이 자동으로 설정되었는지 확인
SELECT 
    id_ncs,
    unit_name,
    created_at,
    updated_at
FROM ncs_main
LIMIT 5;
```

`created_at`과 `updated_at`이 자동으로 현재 시간으로 설정되어 있어야 합니다.

## 요약

✅ **CSV 파일에는 13개 컬럼만 포함**
✅ **created_at, updated_at은 제외**
✅ **Import 시 컬럼 매핑에서 제외**
✅ **자동으로 현재 시간이 설정됨**


