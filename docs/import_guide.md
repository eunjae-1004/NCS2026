# 데이터 Import 가이드

## 데이터베이스 이름 확인

이미지에서 보이는 데이터베이스 이름: `NCS_2026`

스키마 파일에서는 `ncs_search`를 사용했지만, 실제 데이터베이스 이름이 다를 수 있습니다.

## 데이터 Import 방법

### 방법 1: pgAdmin 사용 (GUI)

1. **pgAdmin에서 테이블 우클릭**
   - `ncs_main` 테이블 우클릭
   - "Import/Export Data" 선택

2. **Import 설정**
   - **Import/Export**: Import 선택
   - **Filename**: CSV 파일 경로 선택
   - **Format**: CSV
   - **Header**: Yes (헤더 행 포함)
   - **Encoding**: UTF8
   - **Delimiter**: `,` (쉼표)
   - **Quote**: `"` (따옴표)

3. **컬럼 매핑 확인**
   - CSV 파일의 컬럼 순서가 테이블 컬럼 순서와 일치하는지 확인

### 방법 2: SQL COPY 명령어 사용

```sql
-- PostgreSQL 접속
psql -U postgres -d NCS_2026

-- CSV 파일 import
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
)
FROM 'D:/path/to/ncs_main.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
```

### 방법 3: Excel → CSV 변환 후 Import

1. **Excel 파일을 CSV로 변환**
   - Excel 열기
   - "다른 이름으로 저장" → CSV UTF-8 형식 선택
   - 파일 저장

2. **CSV 파일 확인**
   - UTF-8 인코딩인지 확인
   - 헤더 행이 있는지 확인
   - 컬럼 순서가 스키마와 일치하는지 확인

3. **Import 실행**
   - 위의 방법 1 또는 2 사용

## 일반적인 오류 및 해결

### 오류 1: "extra data after last expected column"

**원인:** CSV 파일의 컬럼 수가 테이블 컬럼 수와 다름

**해결:**
- CSV 파일의 컬럼 수 확인
- 테이블 스키마와 일치하는지 확인

### 오류 2: "invalid input syntax for type integer"

**원인:** 숫자 컬럼에 텍스트가 들어감

**해결:**
- CSV 파일에서 해당 컬럼 확인
- 빈 값이나 잘못된 값 제거

### 오류 3: "duplicate key value violates unique constraint"

**원인:** PRIMARY KEY 중복

**해결:**
- `id_ncs` 값이 중복되지 않는지 확인
- CSV 파일에서 중복 제거

### 오류 4: "permission denied"

**원인:** 파일 접근 권한 문제

**해결:**
- 파일 경로가 올바른지 확인
- PostgreSQL 사용자에게 파일 읽기 권한 부여
- 파일을 PostgreSQL이 접근 가능한 위치로 이동

## 데이터 검증

Import 후 데이터 확인:

```sql
-- 데이터 개수 확인
SELECT COUNT(*) FROM ncs_main;

-- 샘플 데이터 확인
SELECT * FROM ncs_main LIMIT 10;

-- 중복 확인
SELECT id_ncs, COUNT(*) 
FROM ncs_main 
GROUP BY id_ncs 
HAVING COUNT(*) > 1;

-- NULL 값 확인
SELECT 
    COUNT(*) as total,
    COUNT(id_ncs) as has_id,
    COUNT(unit_code) as has_unit_code
FROM ncs_main;
```

## 단계별 Import 순서

1. **ncs_main** (메인 데이터)
2. **subcategory** (세부분류)
3. **unit_definition** (능력단위 정의)
4. **performance_criteria** (수행준거)

## CSV 파일 형식 예시

```csv
id_ncs,small_category_code,sub_category_code,unit_code,unit_element_code,major_category_name,middle_category_name,small_category_name,sub_category_name,unit_name,unit_level,unit_element_name,unit_element_level
25-00001,010101,01010101,0101010101_17v2,0101010101_17v2.1,사업관리,사업관리,프로젝트관리,공적개발원조사업관리,공적개발원조사업 개발전략수립,7,협력대상국 개발환경 분석하기,7
25-00002,010101,01010101,0101010101_17v2,0101010101_17v2.2,사업관리,사업관리,프로젝트관리,공적개발원조사업관리,공적개발원조사업 개발전략수립,7,자국협력환경 분석하기,7
```

## 빠른 해결

데이터 import가 계속 실패하면:

1. **CSV 파일 형식 확인**
   - UTF-8 인코딩
   - 헤더 행 포함
   - 컬럼 순서 일치

2. **작은 샘플로 테스트**
   - 먼저 10개 행만 import해서 테스트

3. **에러 메시지 확인**
   - pgAdmin의 "View Processes"에서 상세 에러 확인


