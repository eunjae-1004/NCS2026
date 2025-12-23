# 데이터 Import 문제 해결

## 현재 상황

데이터베이스: `NCS_2026`
테이블: `ncs_main`
작업: 데이터 복사 (Copying table data)
결과: 실패 (Process failed)

## 문제 진단

### 1. 데이터베이스 이름 확인

스키마 파일에서는 `ncs_search`를 사용했지만, 실제 데이터베이스는 `NCS_2026`입니다.

**해결:**
- 기존 데이터베이스 `NCS_2026` 사용
- 또는 새로 `ncs_search` 데이터베이스 생성

### 2. 테이블 존재 확인

```sql
-- PostgreSQL 접속
psql -U postgres -d NCS_2026

-- 테이블 확인
\dt

-- ncs_main 테이블 구조 확인
\d ncs_main
```

### 3. 일반적인 Import 오류

#### 오류 1: 컬럼 수 불일치

**원인:** CSV 파일의 컬럼 수가 테이블 컬럼 수와 다름

**확인:**
```sql
-- 테이블 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'ncs_main'
ORDER BY ordinal_position;
```

**해결:**
- CSV 파일의 컬럼 수 확인
- 테이블 스키마와 일치하도록 CSV 수정

#### 오류 2: 데이터 타입 불일치

**원인:** 숫자 컬럼에 텍스트 입력

**확인:**
- `unit_level`은 INTEGER
- `unit_element_level`은 INTEGER
- 빈 값이나 텍스트가 있는지 확인

#### 오류 3: 인코딩 문제

**원인:** 한글 문자가 깨짐

**해결:**
- CSV 파일을 UTF-8 인코딩으로 저장
- Import 시 ENCODING 'UTF8' 지정

#### 오류 4: PRIMARY KEY 중복

**원인:** `id_ncs` 값이 중복

**확인:**
```sql
-- CSV 파일에서 중복 확인 (import 전)
-- 또는 import 후 확인
SELECT id_ncs, COUNT(*) 
FROM ncs_main 
GROUP BY id_ncs 
HAVING COUNT(*) > 1;
```

## 단계별 해결 방법

### Step 1: 테이블 구조 확인

```sql
\d ncs_main
```

예상되는 컬럼:
- id_ncs (PRIMARY KEY)
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

### Step 2: CSV 파일 준비

1. **컬럼 순서 확인**
   - 위의 컬럼 순서와 일치해야 함

2. **인코딩 확인**
   - UTF-8로 저장

3. **헤더 행 확인**
   - 첫 번째 행에 컬럼명 포함

4. **샘플 테스트**
   - 먼저 10개 행만 import해서 테스트

### Step 3: Import 실행

#### 방법 A: pgAdmin 사용

1. `ncs_main` 테이블 우클릭
2. "Import/Export Data" 선택
3. **Import** 탭 선택
4. 파일 경로 지정
5. 옵션 설정:
   - Format: CSV
   - Header: Yes
   - Encoding: UTF8
   - Delimiter: `,`
6. "OK" 클릭

#### 방법 B: SQL COPY 명령어

```sql
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
FROM 'C:/path/to/your/file.csv'
WITH (FORMAT csv, HEADER true, ENCODING 'UTF8', DELIMITER ',');
```

**주의:** 
- 파일 경로는 절대 경로 사용
- PostgreSQL 서버가 파일에 접근할 수 있어야 함
- Windows 경로: `C:/path/to/file.csv` (슬래시 사용)

### Step 4: 에러 메시지 확인

pgAdmin에서 "View Processes" 클릭하여 상세 에러 확인:
- 어떤 행에서 실패했는지
- 어떤 컬럼에서 문제가 발생했는지
- 구체적인 에러 메시지

## 빠른 테스트

먼저 샘플 데이터로 테스트:

```sql
-- database/import_sample.sql 실행
\i database/import_sample.sql
```

성공하면 실제 데이터 import 진행

## 대안 방법

### 방법 1: INSERT 문 사용 (소량 데이터)

```sql
INSERT INTO ncs_main (...) VALUES (...), (...), ...;
```

### 방법 2: Excel → SQL 변환

1. Excel에서 데이터 확인
2. SQL INSERT 문으로 변환
3. SQL 파일 실행

### 방법 3: Python 스크립트 사용

```python
import psycopg2
import csv

conn = psycopg2.connect(
    host="localhost",
    database="NCS_2026",
    user="postgres",
    password="your_password"
)
cur = conn.cursor()

with open('ncs_main.csv', 'r', encoding='utf-8') as f:
    reader = csv.DictReader(f)
    for row in reader:
        cur.execute("""
            INSERT INTO ncs_main (...) VALUES (...)
        """, (row['id_ncs'], ...))

conn.commit()
```

## 체크리스트

- [ ] 데이터베이스 이름 확인 (`NCS_2026`)
- [ ] 테이블 구조 확인 (`\d ncs_main`)
- [ ] CSV 파일 컬럼 순서 확인
- [ ] CSV 파일 인코딩 확인 (UTF-8)
- [ ] 샘플 데이터로 테스트
- [ ] 에러 메시지 확인
- [ ] 실제 데이터 import


