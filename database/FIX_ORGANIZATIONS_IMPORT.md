# organizations 테이블 Import 오류 해결 가이드

## 오류 메시지

```
오류: 새 자료가 "organizations" 릴레이션의 "organizations_type_check" 체크 제약 조건을 위반했습니다
DETAIL: 실패한 자료: (org_101, 의료기기 제조업체 D, enterprise, 2025-12-22 14:47:44.620854, 2025-12-22 14:47:44.620854)
CONTEXT: COPY organizations, 2번째 줄: "org_101, 의료기기 제조업체 D, enterprise"
```

## 원인 분석

### 스키마 정의

```sql
CREATE TABLE organizations (
    id VARCHAR(255) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('public', 'enterprise')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**`type` 컬럼은 반드시 `'public'` 또는 `'enterprise'`만 허용됩니다.**

### 가능한 원인들

1. **CSV 파일에 `created_at`, `updated_at` 컬럼이 포함됨**
   - COPY 명령어: `COPY organizations (id, name, type)`
   - 하지만 CSV 파일에 5개 컬럼이 있으면 오류 발생

2. **CSV 파일의 `type` 값이 정확하지 않음**
   - 대소문자 구분: `Enterprise`, `ENTERPRISE` 등은 허용되지 않음
   - 공백 포함: `'enterprise '`, `' enterprise'` 등은 허용되지 않음
   - 오타: `enterpris`, `enterpise` 등

3. **CSV 파일 형식 문제**
   - 따옴표 처리 문제
   - 인코딩 문제로 특수문자 포함

## 해결 방법

### 방법 1: CSV 파일 형식 확인 및 수정

**올바른 CSV 형식:**
```csv
id,name,type
org_101,의료기기 제조업체 D,enterprise
org_102,공공기관 A,public
```

**확인 사항:**
- ✅ `type` 값이 정확히 `'public'` 또는 `'enterprise'` (소문자)
- ✅ 공백 없음
- ✅ 따옴표 없음 (또는 올바르게 처리됨)
- ✅ `created_at`, `updated_at` 컬럼이 없음

### 방법 2: pgAdmin Import 설정

1. **테이블 우클릭** → "Import/Export Data"
2. **Import 탭** 선택
3. **CSV 파일 선택**
4. **옵션 설정:**
   - Format: CSV
   - Header: Yes
   - Encoding: UTF8
   - Delimiter: `,`

5. **Columns 탭에서 컬럼 매핑:**
   - `id` → CSV의 `id`
   - `name` → CSV의 `name`
   - `type` → CSV의 `type`
   - `created_at`, `updated_at`은 **매핑하지 않음** (자동 설정)

6. **Import 실행**

### 방법 3: SQL COPY 명령어 사용

```sql
-- 올바른 COPY 명령어 (3개 컬럼만)
COPY organizations (
    id,
    name,
    type
    -- created_at과 updated_at은 제외 (자동 설정)
)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색 프로그램/PoatgreSQL 업로드 데이터/organizations.csv'
WITH (
    FORMAT csv, 
    HEADER true, 
    ENCODING 'UTF8', 
    DELIMITER ',',
    QUOTE '"'
);
```

### 방법 4: CSV 파일의 type 값 검증 및 수정

Excel이나 텍스트 에디터에서 CSV 파일을 열어 확인:

**잘못된 예시:**
```csv
id,name,type
org_101,의료기기 제조업체 D,Enterprise  ← 대문자 E
org_102,공공기관 A, public  ← 앞에 공백
org_103,기업 B,enterpris  ← 오타
```

**올바른 예시:**
```csv
id,name,type
org_101,의료기기 제조업체 D,enterprise
org_102,공공기관 A,public
org_103,기업 B,enterprise
```

**Excel에서 수정하는 방법:**
1. CSV 파일을 Excel로 열기
2. `type` 컬럼 확인
3. 모든 값을 소문자로 변경: `=LOWER(C2)` (C2는 type 컬럼)
4. 공백 제거: `=TRIM(C2)`
5. CSV 형식으로 저장 (UTF-8)

## 데이터 검증 쿼리

Import 전 CSV 파일의 type 값을 확인하려면:

```sql
-- CSV 파일을 임시 테이블로 import하여 검증
CREATE TEMP TABLE temp_orgs (
    id VARCHAR(255),
    name VARCHAR(255),
    type VARCHAR(50)
);

COPY temp_orgs (id, name, type)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색 프로그램/PoatgreSQL 업로드 데이터/organizations.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');

-- 잘못된 type 값 확인
SELECT 
    id,
    name,
    type,
    LENGTH(type) as type_length,
    type != LOWER(TRIM(type)) as has_uppercase_or_spaces
FROM temp_orgs
WHERE type NOT IN ('public', 'enterprise')
   OR type != LOWER(TRIM(type));

-- 모든 데이터 확인
SELECT * FROM temp_orgs;
```

## Import 후 확인

```sql
-- 데이터 확인
SELECT 
    id,
    name,
    type,
    created_at,
    updated_at
FROM organizations
ORDER BY id;

-- type 값 통계
SELECT 
    type,
    COUNT(*) as count
FROM organizations
GROUP BY type;
```

## 요약

✅ **CSV 파일에 3개 컬럼만 포함: `id`, `name`, `type`**
✅ **`type` 값은 정확히 `'public'` 또는 `'enterprise'` (소문자, 공백 없음)**
✅ **`created_at`, `updated_at`은 CSV에 포함하지 않음 (자동 설정)**
✅ **COPY 명령어에서 3개 컬럼만 명시**
✅ **pgAdmin Import 시 `created_at`, `updated_at` 매핑하지 않음**

