# ksa 테이블 Import 오류 해결 가이드

## 오류 메시지

```
오류: 중복된 키 값이 "ksa_pkey" 고유 제약 조건을 위반함
DETAIL: (id)=(1) 키가 이미 있습니다.
CONTEXT: COPY ksa, 2번째 줄
```

## 원인

1. **COPY 명령어에 `id` 컬럼이 포함됨**
   - 잘못된 예: `COPY ksa(id, unit_code, unit_element_code, type, content)`
   - `id`는 `SERIAL PRIMARY KEY`이므로 자동 생성되어야 함

2. **CSV 파일에 `id` 컬럼이 포함됨**
   - CSV 파일의 첫 번째 줄(헤더)에 `id`가 있음
   - CSV 파일의 데이터 행에 `id` 값이 있음

## 해결 방법

### 방법 1: pgAdmin에서 Import 설정 수정 (권장)

1. **테이블 우클릭** → "Import/Export Data"
2. **Import 탭** 선택
3. **CSV 파일 선택**
4. **옵션 설정:**
   - Format: CSV
   - Header: Yes
   - Encoding: UTF8
   - Delimiter: `,`

5. **중요: Columns 탭에서 컬럼 매핑**
   - **`id` 컬럼은 매핑하지 않음** ⚠️
   - 다음 4개 컬럼만 매핑:
     - `unit_code`
     - `unit_element_code`
     - `type`
     - `content`
   - `created_at`, `updated_at`도 매핑하지 않음

6. **Import 실행**

### 방법 2: CSV 파일 수정 후 Import

#### Step 1: CSV 파일에서 `id` 컬럼 제거

**원본 CSV (잘못된 형식):**
```csv
id,unit_code,unit_element_code,type,content
1,0101010101_17v2,0101010101_17v2.1,지식,국제기구 및 양자원조기구...
```

**수정된 CSV (올바른 형식):**
```csv
unit_code,unit_element_code,type,content
0101010101_17v2,0101010101_17v2.1,지식,국제기구 및 양자원조기구...
```

#### Step 2: Excel에서 수정하는 방법

1. CSV 파일을 Excel로 열기
2. 첫 번째 열(`id` 컬럼) 전체 삭제
3. CSV 형식으로 저장 (UTF-8 인코딩)

#### Step 3: pgAdmin에서 Import

1. 수정된 CSV 파일 선택
2. Columns 탭에서 4개 컬럼만 매핑
3. Import 실행

### 방법 3: 기존 데이터 삭제 후 재import

기존 데이터를 모두 삭제하고 새로 import하려면:

```sql
-- 1. 기존 데이터 모두 삭제 (id 시퀀스도 리셋)
TRUNCATE TABLE ksa RESTART IDENTITY CASCADE;

-- 2. 수정된 CSV로 Import (id 컬럼 제외)
-- pgAdmin에서 Import 실행 또는 COPY 명령어 사용
```

## 올바른 COPY 명령어

```sql
-- ✅ 올바른 방법: id 제외
COPY ksa (
    unit_code,
    unit_element_code,
    type,
    content
)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색프로그램/PoatgreSQL 업로드 데이터/ksa.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');

-- ❌ 잘못된 방법: id 포함 (오류 발생!)
COPY ksa (
    id,              -- ❌ 이 줄을 제거해야 함!
    unit_code,
    unit_element_code,
    type,
    content
)
FROM '...'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
```

## CSV 파일 형식 확인

### 올바른 CSV 파일 형식

```csv
unit_code,unit_element_code,type,content
0101010101_17v2,0101010101_17v2.1,지식,국제기구 및 양자원조기구, NGO 등 협력대상국 개발정책
0101010101_17v2,0101010101_17v2.1,기술,외국어 의사소통 능력
0101010101_17v2,0101010101_17v2.1,태도,객관적이고 논리적으로 사고하려는 의지
```

**4개 컬럼만 포함:**
1. `unit_code`
2. `unit_element_code`
3. `type` (지식/기술/태도)
4. `content`

### 잘못된 CSV 파일 형식

```csv
id,unit_code,unit_element_code,type,content
1,0101010101_17v2,0101010101_17v2.1,지식,...
2,0101010101_17v2,0101010101_17v2.1,기술,...
```

**`id` 컬럼이 포함되어 있으면 오류 발생!**

## Import 후 확인

```sql
-- 데이터 확인
SELECT 
    id,  -- 자동 생성됨
    unit_code,
    unit_element_code,
    type,
    LEFT(content, 50) as content_preview,
    created_at,  -- 자동 설정됨
    updated_at   -- 자동 설정됨
FROM ksa
ORDER BY id
LIMIT 10;

-- id가 자동으로 1부터 시작하는지 확인
SELECT MIN(id), MAX(id), COUNT(*) FROM ksa;
```

## 요약

✅ **CSV 파일에서 `id` 컬럼 제거**
✅ **COPY 명령어에서 `id` 제외**
✅ **pgAdmin Import 시 `id` 컬럼 매핑하지 않음**
✅ **4개 컬럼만 포함: unit_code, unit_element_code, type, content**
✅ **`id`는 자동으로 1부터 순차적으로 생성됨**


