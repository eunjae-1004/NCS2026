# standard_codes 테이블 Import 오류 해결 가이드

## 오류 메시지

```
오류: 마지막 칼럼을 초과해서 또 다른 데이터가 있음
CONTEXT: COPY standard_codes, 2번째 줄: "dept_001,품질관리,departments,"
```

## 원인 분석

### 스키마 정의

```sql
CREATE TABLE standard_codes (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('departments', 'industries', 'jobs')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code, type)
);
```

**COPY 명령어는 3개 컬럼만 지정:**
```sql
COPY standard_codes(code, name, type)
```

### 문제점

CSV 파일의 2번째 줄: `"dept_001,품질관리,departments,"`

- 끝에 **추가 쉼표(`,`)가 있음** → 4번째 빈 컬럼으로 인식됨
- 또는 CSV 파일에 실제로 4번째 컬럼이 있음

## 해결 방법

### 방법 1: CSV 파일에서 끝의 쉼표 제거

**잘못된 CSV 형식:**
```csv
code,name,type,
dept_001,품질관리,departments,
dept_002,생산관리,departments,
```

**올바른 CSV 형식:**
```csv
code,name,type
dept_001,품질관리,departments
dept_002,생산관리,departments
```

**Excel에서 수정:**
1. CSV 파일을 Excel로 열기
2. 마지막 열이 비어있는지 확인
3. 비어있는 열 삭제
4. 마지막 쉼표 제거
5. CSV 형식으로 저장 (UTF-8)

### 방법 2: 텍스트 에디터에서 수정

1. CSV 파일을 메모장이나 VS Code로 열기
2. 정규식으로 끝의 쉼표 제거:
   - 찾기: `,(\r?\n)` 또는 `,\n`
   - 바꾸기: `\n` 또는 `\r\n`
3. 헤더 줄도 확인: `code,name,type,` → `code,name,type`

### 방법 3: COPY 명령어에 FORCE_NOT_NULL 옵션 사용

빈 컬럼을 무시하도록 설정:

```sql
COPY standard_codes (
    code,
    name,
    type
)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색프로그램/PoatgreSQL 업로드 데이터/standard_codes.csv'
WITH (
    FORMAT csv, 
    HEADER true, 
    ENCODING 'UTF8', 
    DELIMITER ',',
    QUOTE '"',
    FORCE_NOT_NULL (code, name, type)
);
```

### 방법 4: pgAdmin Import 설정

1. **테이블 우클릭** → "Import/Export Data"
2. **Import 탭** 선택
3. **CSV 파일 선택**
4. **옵션 설정:**
   - Format: CSV
   - Header: Yes
   - Encoding: UTF8
   - Delimiter: `,`
5. **Columns 탭에서:**
   - `code` → CSV의 `code`
   - `name` → CSV의 `name`
   - `type` → CSV의 `type`
   - **4번째 컬럼(빈 컬럼)은 매핑하지 않음**
6. **Import 실행**

## CSV 파일 형식 확인

### 올바른 CSV 형식

```csv
code,name,type
dept_001,품질관리,departments
dept_002,생산관리,departments
dept_003,인사관리,departments
ind_001,제조업,industries
ind_002,서비스업,industries
job_001,품질관리사,jobs
```

**3개 컬럼만 포함:**
1. `code`
2. `name`
3. `type`

### 잘못된 CSV 형식

```csv
code,name,type,        ← 헤더 끝에 쉼표
dept_001,품질관리,departments,  ← 데이터 끝에 쉼표
dept_002,생산관리,departments,  ← 데이터 끝에 쉼표
```

또는

```csv
code,name,type,extra_column
dept_001,품질관리,departments,값
```

## 검증 스크립트

Import 전 CSV 파일 검증:

```sql
-- 임시 테이블로 Import하여 검증
CREATE TEMP TABLE temp_standard_codes (
    col1 TEXT,
    col2 TEXT,
    col3 TEXT,
    col4 TEXT  -- 4번째 컬럼이 있는지 확인
);

COPY temp_standard_codes FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색프로그램/PoatgreSQL 업로드 데이터/standard_codes.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');

-- 4번째 컬럼에 데이터가 있는지 확인
SELECT 
    COUNT(*) as total_rows,
    COUNT(col4) as rows_with_4th_column,
    COUNT(*) FILTER (WHERE col4 IS NOT NULL AND col4 != '') as rows_with_4th_column_data
FROM temp_standard_codes;
```

## Import 후 확인

```sql
-- 데이터 확인
SELECT 
    id,
    code,
    name,
    type,
    created_at
FROM standard_codes
ORDER BY type, code
LIMIT 20;

-- type별 통계
SELECT 
    type,
    COUNT(*) as count
FROM standard_codes
GROUP BY type
ORDER BY type;

-- 중복 확인 (code, type 조합)
SELECT 
    code,
    type,
    COUNT(*) as count
FROM standard_codes
GROUP BY code, type
HAVING COUNT(*) > 1;
```

## 요약

✅ **CSV 파일에 3개 컬럼만 포함: `code`, `name`, `type`**
✅ **각 행 끝에 쉼표 없음**
✅ **헤더 줄 끝에도 쉼표 없음**
✅ **`id`, `created_at`은 CSV에 포함하지 않음 (자동 설정)**
✅ **COPY 명령어에서 3개 컬럼만 명시**

## 빠른 수정 방법

1. CSV 파일을 텍스트 에디터로 열기
2. 모든 줄 끝의 쉼표 제거 (정규식: `,(\r?\n)` → `\n`)
3. 헤더 줄 확인: `code,name,type` (끝에 쉼표 없음)
4. 저장 후 다시 Import


