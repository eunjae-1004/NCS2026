# CSV Import 오류 메시지 해석 가이드

## pgAdmin에서 CSV Import 시 발생하는 주요 오류

### 1. 컬럼 관련 오류

#### "extra data after last expected column"
**의미:** CSV 파일의 컬럼 수가 테이블 컬럼 수보다 많음

**원인:**
- CSV 파일에 불필요한 컬럼이 있음
- 구분자(delimiter) 문제로 컬럼이 잘못 분리됨

**해결:**
- CSV 파일의 컬럼 수 확인 (13개여야 함)
- 테이블 스키마와 일치하는지 확인

#### "missing data for column"
**의미:** 필수 컬럼에 데이터가 없음

**원인:**
- CSV 파일에 빈 셀이 있음
- 컬럼 순서가 맞지 않음

**해결:**
- CSV 파일에서 빈 값 확인
- 모든 행에 데이터가 있는지 확인

### 2. 데이터 타입 오류

#### "invalid input syntax for type integer"
**의미:** 숫자 컬럼에 텍스트가 들어감

**원인:**
- `unit_level` 또는 `unit_element_level`에 숫자가 아닌 값
- 빈 값이나 공백

**해결:**
- CSV 파일에서 `unit_level`, `unit_element_level` 컬럼 확인
- 숫자만 있는지 확인
- 빈 값은 NULL로 처리

#### "invalid input syntax for type character varying"
**의미:** 텍스트 컬럼에 잘못된 형식

**원인:**
- 특수 문자나 인코딩 문제
- 따옴표 처리 문제

**해결:**
- UTF-8 인코딩 확인
- 특수 문자 이스케이프 확인

### 3. 제약 조건 오류

#### "duplicate key value violates unique constraint"
**의미:** PRIMARY KEY 중복

**원인:**
- `id_ncs` 값이 중복됨

**해결:**
- CSV 파일에서 `id_ncs` 중복 확인
- 중복된 행 제거 또는 수정

#### "violates check constraint"
**의미:** CHECK 제약 조건 위반

**원인:**
- 특정 컬럼에 허용되지 않는 값

**해결:**
- 제약 조건 확인
- 허용된 값만 입력

### 4. 인코딩 오류

#### "invalid byte sequence for encoding"
**의미:** 인코딩 불일치

**원인:**
- CSV 파일이 UTF-8이 아님
- 한글이 깨짐

**해결:**
- CSV 파일을 UTF-8로 저장
- Excel에서 "CSV UTF-8" 형식으로 저장

### 5. 파일 접근 오류

#### "could not open file"
**의미:** 파일을 읽을 수 없음

**원인:**
- 파일 경로가 잘못됨
- 권한 문제
- 파일이 다른 프로그램에서 열려있음

**해결:**
- 파일 경로 확인
- 파일이 닫혀있는지 확인
- PostgreSQL 사용자에게 읽기 권한 부여

### 6. 구분자 오류

#### "unterminated CSV quoted field"
**의미:** 따옴표가 제대로 닫히지 않음

**원인:**
- CSV 파일의 따옴표 처리 문제
- 구분자와 따옴표 충돌

**해결:**
- CSV 파일의 따옴표 확인
- 구분자 옵션 확인 (보통 `,`)

## 오류 메시지 확인 방법

### pgAdmin에서

1. **"View Processes" 버튼 클릭**
2. 실패한 프로세스 선택
3. 상세 에러 메시지 확인:
   - 어떤 행에서 실패했는지
   - 어떤 컬럼에서 문제가 발생했는지
   - 구체적인 에러 메시지

### 일반적인 오류 메시지 형식

```
ERROR: [오류 내용]
CONTEXT: COPY ncs_main, line [행 번호], column [컬럼명]
SQL state: [상태 코드]
```

## 빠른 진단

### Step 1: CSV 파일 확인

```sql
-- 테이블 구조 확인
\d ncs_main
```

필요한 컬럼 (13개):
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

### Step 2: 샘플 데이터로 테스트

먼저 5-10개 행만 import해서 테스트:
- CSV 파일에서 처음 10개 행만 복사
- 새 CSV 파일로 저장
- Import 시도

### Step 3: 에러 메시지 분석

오류 메시지에서 확인할 사항:
- **행 번호**: 몇 번째 행에서 실패했는지
- **컬럼명**: 어떤 컬럼에서 문제가 발생했는지
- **오류 내용**: 구체적인 문제

## 일반적인 해결 순서

1. **에러 메시지 전체 복사**
2. **행 번호 확인** → 해당 행의 데이터 확인
3. **컬럼명 확인** → 해당 컬럼의 데이터 형식 확인
4. **데이터 수정** → 문제가 있는 행/컬럼 수정
5. **재시도**

## 체크리스트

- [ ] CSV 파일이 UTF-8 인코딩인가?
- [ ] 헤더 행이 있는가?
- [ ] 컬럼 수가 13개인가?
- [ ] 컬럼 순서가 맞는가?
- [ ] 숫자 컬럼(unit_level, unit_element_level)에 숫자만 있는가?
- [ ] id_ncs가 중복되지 않는가?
- [ ] 빈 행이 없는가?
- [ ] 특수 문자가 올바르게 이스케이프되었는가?

## 도움 요청 시 포함할 정보

오류 해결을 위해 다음 정보를 알려주세요:

1. **전체 오류 메시지** (ERROR부터 SQL state까지)
2. **실패한 행 번호**
3. **문제가 된 컬럼명**
4. **CSV 파일의 해당 행 데이터** (일부만)


