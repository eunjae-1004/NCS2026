# unit_definition 테이블에 ID 컬럼 추가 가이드

`unit_definition` 테이블에 일련번호 ID 컬럼을 추가하는 방법입니다.

## 변경 사항

### 이전 구조
- `unit_code VARCHAR(30) PRIMARY KEY` - 기본 키
- `unit_name VARCHAR(255) NOT NULL`
- `unit_definition TEXT`
- `created_at`, `updated_at`

### 변경 후 구조
- `id SERIAL PRIMARY KEY` - 새로운 기본 키 (일련번호)
- `unit_code VARCHAR(30) NOT NULL` - 중복 가능 (UNIQUE 제약 조건 없음)
- `unit_name VARCHAR(255) NOT NULL`
- `unit_definition TEXT`
- `created_at`, `updated_at`

## 실행 방법

### 방법 1: Railway 대시보드에서 실행 (권장)

1. **Railway 대시보드 → PostgreSQL 서비스 → Data 탭 (또는 Query 탭)**

2. **마이그레이션 스크립트 열기**
   - `database/migrate_add_unit_definition_id.sql` 파일 내용 복사

3. **SQL 실행**
   - 복사한 내용을 붙여넣고 "Run" 버튼 클릭

### 방법 2: Railway CLI 사용

```powershell
# 프로젝트 디렉토리로 이동
cd D:\Website\cursor\ncssearch2026

# 마이그레이션 실행
railway run psql -f database/migrate_add_unit_definition_id.sql
```

### 방법 3: 단계별 실행

Railway 대시보드에서 한 단계씩 실행:

#### 1단계: 현재 데이터 확인
```sql
SELECT COUNT(*) AS current_count FROM unit_definition;
```

#### 2단계: id 컬럼 추가
```sql
ALTER TABLE unit_definition ADD COLUMN id SERIAL;
```

#### 3단계: 기존 데이터에 ID 할당
```sql
-- unit_code가 중복될 수 있으므로 ctid(물리적 행 위치)를 사용
UPDATE unit_definition 
SET id = subquery.row_number
FROM (
    SELECT ctid, 
           ROW_NUMBER() OVER (ORDER BY created_at, ctid) AS row_number
    FROM unit_definition
) AS subquery
WHERE unit_definition.ctid = subquery.ctid;
```

#### 4단계: id를 NOT NULL로 설정
```sql
ALTER TABLE unit_definition ALTER COLUMN id SET NOT NULL;
```

#### 5단계: PRIMARY KEY 변경
```sql
-- 기존 PRIMARY KEY 제거
ALTER TABLE unit_definition DROP CONSTRAINT unit_definition_pkey;

-- id를 새로운 PRIMARY KEY로 설정
ALTER TABLE unit_definition ADD PRIMARY KEY (id);
```

#### 6단계: unit_code 인덱스 추가 (선택사항, 성능 향상용)
```sql
-- unit_code는 중복 가능하므로 UNIQUE 제약 조건 추가하지 않음
-- 대신 인덱스만 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_unit_definition_unit_code ON unit_definition(unit_code);
```

#### 7단계: 시퀀스 시작값 설정
```sql
DO $$
DECLARE
    max_id INTEGER;
BEGIN
    SELECT COALESCE(MAX(id), 0) INTO max_id FROM unit_definition;
    IF max_id > 0 THEN
        PERFORM setval('unit_definition_id_seq', max_id);
    END IF;
END $$;
```

#### 8단계: 결과 확인
```sql
-- 테이블 구조 확인
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'unit_definition'
ORDER BY ordinal_position;

-- 데이터 확인
SELECT id, unit_code, unit_name 
FROM unit_definition 
ORDER BY id 
LIMIT 10;
```

## 주의사항

### ⚠️ 기존 데이터 보존

- 마이그레이션 스크립트는 기존 데이터를 보존합니다
- 기존 데이터에 순차적으로 ID가 할당됩니다
- `unit_code`는 중복 가능하므로 UNIQUE 제약 조건이 없습니다

### ⚠️ 애플리케이션 코드 업데이트 필요

ID 컬럼 추가 후 애플리케이션 코드도 업데이트해야 할 수 있습니다:

1. **API 응답에 id 포함**
   ```javascript
   // 이전
   { unit_code: '0101010101_17v2', unit_name: '...' }
   
   // 이후
   { id: 1, unit_code: '0101010101_17v2', unit_name: '...' }
   ```

2. **쿼리 업데이트**
   - ID를 사용하는 쿼리 추가 가능
   - 기존 `unit_code` 기반 쿼리는 계속 작동

3. **TypeScript 타입 업데이트**
   ```typescript
   interface UnitDefinition {
     id: number;  // 추가
     unit_code: string;
     unit_name: string;
     unit_definition?: string;
     created_at: string;
     updated_at: string;
   }
   ```

## 롤백 방법

만약 문제가 발생하여 롤백이 필요하다면:

```sql
-- 1. PRIMARY KEY 제거
ALTER TABLE unit_definition DROP CONSTRAINT unit_definition_pkey;

-- 2. unit_code 인덱스 제거 (있는 경우)
DROP INDEX IF EXISTS idx_unit_definition_unit_code;

-- 3. unit_code를 PRIMARY KEY로 복원 (단, 중복이 없어야 함)
-- 주의: unit_code에 중복이 있으면 이 단계는 실패합니다
ALTER TABLE unit_definition ADD PRIMARY KEY (unit_code);

-- 4. id 컬럼 제거
ALTER TABLE unit_definition DROP COLUMN id;
```

## 확인 사항

마이그레이션 후 확인:

1. **테이블 구조 확인**
   ```sql
   \d unit_definition
   ```

2. **데이터 확인**
   ```sql
   SELECT id, unit_code, unit_name FROM unit_definition LIMIT 5;
   ```

3. **제약 조건 확인**
   ```sql
   SELECT constraint_name, constraint_type 
   FROM information_schema.table_constraints 
   WHERE table_name = 'unit_definition';
   ```

## 완료 확인

마이그레이션이 성공적으로 완료되면:

- ✅ `id` 컬럼이 PRIMARY KEY로 설정됨
- ✅ `unit_code`는 중복 가능 (UNIQUE 제약 조건 없음)
- ✅ 기존 데이터에 ID가 할당됨
- ✅ 새로운 데이터는 자동으로 ID가 생성됨
- ✅ `unit_code`에 인덱스가 생성되어 조회 성능 향상

