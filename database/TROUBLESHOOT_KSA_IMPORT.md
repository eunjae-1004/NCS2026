# ksa 테이블 Import 오류 해결 가이드 (고급)

## 문제: CSV에서 id를 삭제했는데도 동일한 오류 발생

```
오류: 중복된 키 값이 "ksa_pkey" 고유 제약 조건을 위반함
DETAIL: (id)=(1) 키가 이미 있습니다.
```

## 가능한 원인들

### 원인 1: 기존 테이블에 데이터가 남아있음

테이블에 이미 `id=1`인 데이터가 존재하는 경우, 새로운 데이터를 import할 때 충돌이 발생합니다.

**해결 방법:**
```sql
-- 기존 데이터 모두 삭제 및 시퀀스 리셋
TRUNCATE TABLE ksa RESTART IDENTITY CASCADE;
```

### 원인 2: 시퀀스가 잘못된 값으로 설정됨

시퀀스가 1보다 큰 값으로 설정되어 있거나, 기존 데이터의 최대 id 값과 맞지 않는 경우.

**해결 방법:**
```sql
-- 시퀀스를 0으로 리셋 (다음 값이 1이 됨)
SELECT setval('ksa_id_seq', 0, false);
```

### 원인 3: pgAdmin Import 설정에서 id 컬럼이 여전히 매핑됨

CSV 파일에서 id를 삭제했어도, pgAdmin의 "Columns" 탭에서 id 컬럼이 자동으로 매핑되어 있을 수 있습니다.

**해결 방법:**
1. pgAdmin에서 Import 창 열기
2. **"Columns" 탭 클릭**
3. **`id` 컬럼의 매핑을 제거** (매핑되지 않도록 설정)
4. 다음 4개 컬럼만 매핑:
   - `unit_code` → CSV의 `unit_code`
   - `unit_element_code` → CSV의 `unit_element_code`
   - `type` → CSV의 `type`
   - `content` → CSV의 `content`

### 원인 4: CSV 파일에 숨겨진 id 컬럼이 있음

CSV 파일을 열어보면 id가 없어 보이지만, 실제로는 빈 컬럼이나 공백이 있을 수 있습니다.

**해결 방법:**
1. CSV 파일을 텍스트 에디터(메모장 등)로 열기
2. 첫 번째 줄(헤더) 확인: `unit_code,unit_element_code,type,content` (4개만 있어야 함)
3. 각 데이터 행도 4개 값만 있는지 확인

### 원인 5: CSV 파일 인코딩 문제

인코딩이 잘못되어 데이터가 제대로 파싱되지 않는 경우.

**해결 방법:**
1. CSV 파일을 UTF-8 인코딩으로 저장
2. Excel에서 저장 시 "CSV UTF-8(쉼표로 분리)(*.csv)" 형식 선택

## 단계별 해결 절차

### Step 1: 현재 상태 확인

```sql
-- database/check_ksa_table.sql 실행
-- 또는 직접 실행:
SELECT COUNT(*) FROM ksa;
SELECT MAX(id) FROM ksa;
```

### Step 2: 테이블 완전 초기화

```sql
-- database/reset_ksa_table.sql 실행
-- 또는 직접 실행:
TRUNCATE TABLE ksa RESTART IDENTITY CASCADE;
SELECT setval('ksa_id_seq', 0, false);
```

### Step 3: CSV 파일 재확인

**올바른 CSV 형식:**
```csv
unit_code,unit_element_code,type,content
0101010101_17v2,0101010101_17v2.1,지식,국제기구 및 양자원조기구...
0101010101_17v2,0101010101_17v2.1,기술,외국어 의사소통 능력
```

**확인 사항:**
- ✅ 헤더에 4개 컬럼만 있음
- ✅ 각 데이터 행에 4개 값만 있음
- ✅ `id` 컬럼이 전혀 없음
- ✅ UTF-8 인코딩

### Step 4: pgAdmin Import 재설정

1. **테이블 우클릭** → "Import/Export Data"
2. **Import 탭**
3. **파일 선택**: 수정된 CSV 파일
4. **옵션:**
   - Format: CSV
   - Header: Yes
   - Encoding: UTF8
   - Delimiter: `,`
5. **Columns 탭 (중요!):**
   - 왼쪽(테이블 컬럼): `id`는 **매핑하지 않음**
   - 왼쪽(테이블 컬럼): `created_at`, `updated_at`도 **매핑하지 않음**
   - 오른쪽(CSV 컬럼)과 왼쪽(테이블 컬럼) 매핑:
     - CSV `unit_code` → 테이블 `unit_code`
     - CSV `unit_element_code` → 테이블 `unit_element_code`
     - CSV `type` → 테이블 `type`
     - CSV `content` → 테이블 `content`
6. **Import 실행**

### Step 5: SQL COPY 명령어로 직접 Import (대안)

pgAdmin에서 계속 문제가 발생하면, SQL로 직접 실행:

```sql
-- 먼저 테이블 초기화
TRUNCATE TABLE ksa RESTART IDENTITY CASCADE;

-- CSV 파일 경로를 실제 경로로 변경
COPY ksa (
    unit_code,
    unit_element_code,
    type,
    content
)
FROM 'D:/프로그램개발/postgreSQL 사용 NCS검색프로그램/PoatgreSQL 업로드 데이터/ksa.csv'
WITH (
    FORMAT csv, 
    HEADER true, 
    ENCODING 'UTF8', 
    DELIMITER ',',
    QUOTE '"'
);
```

## 확인 쿼리

Import 후 확인:

```sql
-- 데이터 확인
SELECT 
    id,
    unit_code,
    unit_element_code,
    type,
    LEFT(content, 30) as content_preview,
    created_at
FROM ksa
ORDER BY id
LIMIT 10;

-- id가 1부터 시작하는지 확인
SELECT MIN(id), MAX(id), COUNT(*) FROM ksa;
```

## 체크리스트

Import 전 확인:

- [ ] 테이블이 비어있거나 초기화됨 (`TRUNCATE TABLE ksa RESTART IDENTITY CASCADE`)
- [ ] CSV 파일에 `id` 컬럼이 없음 (헤더와 데이터 모두)
- [ ] CSV 파일이 UTF-8 인코딩
- [ ] CSV 파일에 4개 컬럼만 있음: `unit_code`, `unit_element_code`, `type`, `content`
- [ ] pgAdmin Import 시 `id` 컬럼을 매핑하지 않음
- [ ] pgAdmin Import 시 `created_at`, `updated_at`도 매핑하지 않음

## 여전히 문제가 발생하는 경우

1. **에러 메시지 전체 복사** (특히 CONTEXT 부분)
2. **CSV 파일의 첫 5줄 확인** (텍스트 에디터로)
3. **테이블 상태 확인** (`database/check_ksa_table.sql` 실행)
4. **위의 체크리스트 다시 확인**


